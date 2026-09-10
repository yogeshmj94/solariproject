const evidence = [
  {
    waybill: "771238945",
    camera: "CAM-E12",
    time: "2026-09-10 07:41:18",
    area: "Exception Cage E2 beside Dock 12",
    observation: "Parcel is stationary beside the exception cage barrier and remains inside the facility.",
    confidence: "0.96",
    state: "inside",
  },
  {
    waybill: "771238946",
    camera: "CAM-D21",
    time: "2026-09-10 07:22:04",
    area: "Outbound Dock 21",
    observation: "Parcel was last observed entering the outbound loading area.",
    confidence: "0.93",
    state: "loaded",
  },
];

export default function CctvPage() {
  return (
    <main style={{ padding: 32 }}>
      <div className="kicker">Security evidence system</div>
      <h1>CCTV Search Console</h1>
      <p className="muted">Mock visual evidence. Production will connect this step to the facility CCTV/VMS and vision pipeline.</p>
      <div className="grid" style={{ marginTop: 24 }}>
        {evidence.map((item) => (
          <section className="card span-6" key={item.waybill} data-waybill={item.waybill}>
            <div className="kicker">Waybill {item.waybill}</div>
            <img src="/mock-cctv-frame.svg" alt="Mock CCTV frame showing a shipment near an exception cage" style={{ width: "100%", marginTop: 16, borderRadius: 12 }} />
            <h2 data-field="area">{item.area}</h2>
            <div className="chips"><span data-field="camera">{item.camera}</span><span data-field="time">{item.time}</span></div>
            <p data-field="observation" className="muted">{item.observation}</p>
            <span style={{ display: "none" }} data-field="confidence">{item.confidence}</span>
            <span style={{ display: "none" }} data-field="state">{item.state}</span>
          </section>
        ))}
      </div>
    </main>
  );
}
