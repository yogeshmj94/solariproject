import type { Expectation } from "./types";

export function getLineage(all: Expectation[], leafId: string): Expectation[] {
  const byId = new Map(all.map((e) => [e.id, e]));
  const chain: Expectation[] = [];
  let current = byId.get(leafId);

  while (current) {
    chain.push(current);
    current = current.parentExpectationId
      ? byId.get(current.parentExpectationId)
      : undefined;
  }

  return chain.reverse();
}
