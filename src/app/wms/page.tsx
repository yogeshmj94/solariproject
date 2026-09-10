const shipments = [
  {
    waybill: "771238945",
    facility: "BLR-SC01",
    area: "Sorter Chute 17",
    time: "2026-09-10 07:03:51",
    operator: "EMP-783",
    camera: "CAM-S17",
    event: "SORTER_SCAN",
  },
  {
    waybill: "771238946",
    facility: "BLR-SC01",
    area: "Outbound Dock 21",
    time: "2026-09-10 07:18:12",
    operator: "EMP-214",
    camera: "CAM-D21",
    event: "OUTBOUND_SCAN",
  },
];

export default function WmsPage() {
  return (
    <main style={{ padding: 32 }}>
      <div className="kicker">Legacy operations system</div>
      <h1>Sort Center WMS</h1>
      <p className="muted">Shipment scan history used by the Solari investigation agent.</p>
      <section className="card" style={{ marginTop: 24 }}>
        <table>
          <thead><tr><th>Waybill</th><th>Facility</th><th>Last scan</th><th>Time</th><th>Operator</th><th>Camera</th><th>Event</th></tr></thead>
          <tbody>
            {shipments.map((s) => (
              <tr key={s.waybill} data-waybill={s.waybill}>
                <td><strong>{s.waybill}</strong></td>
                <td data-field="facility">{s.facility}</td>
                <td data-field="area">{s.area}</td>
                <td data-field="time">{s.time}</td>
                <td data-field="operator">{s.operator}</td>
                <td data-field="camera">{s.camera}</td>
                <td>{s.event}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </main>
  );
}
