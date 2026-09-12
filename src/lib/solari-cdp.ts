type SolariSession = {
  id: string;
  cdpEndpoint: string;
};

type CdpReply = {
  id?: number;
  result?: any;
  error?: { message?: string };
};

class CdpConnection {
  private socket: WebSocket;
  private nextId = 1;
  private pending = new Map<number, { resolve: (value: any) => void; reject: (error: Error) => void }>();

  private constructor(socket: WebSocket) {
    this.socket = socket;

    socket.addEventListener("message", (event) => {
      try {
        const message = JSON.parse(String(event.data)) as CdpReply;
        if (!message.id) return;

        const waiter = this.pending.get(message.id);
        if (!waiter) return;

        this.pending.delete(message.id);

        if (message.error) {
          waiter.reject(new Error(message.error.message ?? "CDP command failed"));
        } else {
          waiter.resolve(message.result ?? {});
        }
      } catch {
        // Ignore malformed event payloads.
      }
    });

    socket.addEventListener("close", () => {
      for (const [, waiter] of this.pending) {
        waiter.reject(new Error("Solari CDP connection closed unexpectedly"));
      }
      this.pending.clear();
    });
  }

  static async connect(endpoint: string) {
    if (typeof WebSocket === "undefined") {
      throw new Error("This Node runtime does not provide WebSocket support");
    }

    const socket = new WebSocket(endpoint);

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new Error("Timed out connecting to Solari CDP")),
        10000,
      );

      socket.addEventListener(
        "open",
        () => {
          clearTimeout(timer);
          resolve();
        },
        { once: true },
      );

      socket.addEventListener(
        "error",
        () => {
          clearTimeout(timer);
          reject(new Error("Failed to connect to Solari CDP"));
        },
        { once: true },
      );
    });

    return new CdpConnection(socket);
  }

  async send(method: string, params: Record<string, unknown> = {}, sessionId?: string) {
    const id = this.nextId++;

    const reply = new Promise<any>((resolve, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`CDP command timed out: ${method}`));
      }, 15000);

      this.pending.set(id, {
        resolve: (value) => {
          clearTimeout(timer);
          resolve(value);
        },
        reject: (error) => {
          clearTimeout(timer);
          reject(error);
        },
      });
    });

    this.socket.send(
      JSON.stringify({
        id,
        method,
        params,
        ...(sessionId ? { sessionId } : {}),
      }),
    );

    return reply;
  }

  close() {
    try {
      this.socket.close();
    } catch {
      // Best-effort cleanup.
    }
  }
}

function deriveCdpEndpoint(wsEndpoint: string) {
  return wsEndpoint.replace("/ws/", "/cdp/");
}

export async function createSolariSession(apiKey: string): Promise<SolariSession> {
  const response = await fetch("https://api.getsolari.com/sessions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ recording: true }),
    cache: "no-store",
  });

  const raw = await response.text();
  let payload: any = {};

  try {
    payload = raw ? JSON.parse(raw) : {};
  } catch {
    throw new Error(
      `Solari session creation returned invalid JSON (HTTP ${response.status})`,
    );
  }

  if (!response.ok) {
    throw new Error(
      `Solari POST /sessions failed: ${response.status} ${raw || response.statusText}`,
    );
  }

  const id = payload.id ?? payload.sessionId;
  const cdpEndpoint =
    payload.cdpEndpoint ??
    (payload.wsEndpoint ? deriveCdpEndpoint(payload.wsEndpoint) : undefined);

  if (!id || !cdpEndpoint) {
    throw new Error(
      "Solari session response did not include a session id and CDP endpoint",
    );
  }

  return { id, cdpEndpoint };
}

export async function releaseSolariSession(apiKey: string, id: string) {
  try {
    await fetch(
      `https://api.getsolari.com/sessions/${encodeURIComponent(id)}`,
      {
        method: "DELETE",
        headers: { Authorization: `Bearer ${apiKey}` },
        cache: "no-store",
      },
    );
  } catch (error) {
    console.error("Failed to release Solari session", error);
  }
}

export async function extractWaybillFields(
  cdpEndpoint: string,
  url: string,
  waybill: string,
  fieldNames: string[],
) {
  const cdp = await CdpConnection.connect(cdpEndpoint);

  try {
    const { targetId } = await cdp.send("Target.createTarget", {
      url: "about:blank",
    });

    const attached = await cdp.send("Target.attachToTarget", {
      targetId,
      flatten: true,
    });

    const targetSessionId = attached.sessionId as string;

    await cdp.send("Page.enable", {}, targetSessionId);
    await cdp.send("Runtime.enable", {}, targetSessionId);
    await cdp.send("Page.navigate", { url }, targetSessionId);

    const deadline = Date.now() + 15000;
    const selector = `[data-waybill="${waybill}"]`;
    const selectorJson = JSON.stringify(selector);
    const fieldsJson = JSON.stringify(fieldNames);

    while (Date.now() < deadline) {
      const expression = [
        "(() => {",
        `const root = document.querySelector(${selectorJson});`,
        "if (!root) return null;",
        `const names = ${fieldsJson};`,
        'return Object.fromEntries(names.map((name) => [name, (root.querySelector(\'[data-field="\' + name + '\'"]\')?.textContent ?? "").trim()]));',
        "})()",
      ].join("\n");

      const evaluated = await cdp.send(
        "Runtime.evaluate",
        {
          expression,
          returnByValue: true,
          awaitPromise: true,
        },
        targetSessionId,
      );

      const value = evaluated?.result?.value;
      if (value) {
        return value as Record<string, string>;
      }

      await new Promise((resolve) => setTimeout(resolve, 250));
    }

    throw new Error(
      `Waybill ${waybill} was not found after navigating to ${url}`,
    );
  } finally {
    cdp.close();
  }
}
