const waves = [
  { wave: "BLR-AM-05", feedline: "5", planned: 12400, processed: 10980, status: "AT_RISK" },
  { wave: "BLR-AM-04", feedline: "4", planned: 11800, processed: 11840, status: "COMPLETE" },
  { wave: "BLR-AM-03", feedline: "3", planned: 12100, processed: 12160, status: "COMPLETE" }
];

const jarvisTickets = [
  { feedline: "5", ticket: "JARVIS-8842", opened: "11:23", status: "OPEN", issue: "Feedline drive fault" },
  { feedline: "7", ticket: "JARVIS-8829", opened: "08:15", status: "CLOSED", issue: "Scanner alignment" }
];

const throughput = [
  { feedline: "5", metric: "Projected shipment loss", value: 1420, unit: "shipments" },
  { feedline: "4", metric: "Projected shipment loss", value: 0, unit: "shipments" },
  { feedline: "3", metric: "Projected shipment loss", value: 0, unit: "shipments" }
];

export default function ERP() {
  return (
    <div className="erp-shell">
      <div className="erp-window">
        <div className="erp-title">SORTOPS Control Center v7.4</div>
        <div className="erp-menu">File &nbsp; Waves &nbsp; Feedlines &nbsp; JARVIS &nbsp; Throughput &nbsp; Reports &nbsp; Help</div>
        <div className="erp-body">
          <div className="erp-section">
            <h3>Sortation Waves</h3>
            <div className="content">
              <table>
                <thead><tr><th>Wave</th><th>Feedline</th><th>Planned</th><th>Processed</th><th>Status</th></tr></thead>
                <tbody>
                  {waves.map((w) => (
                    <tr key={w.wave} data-wave={w.wave}>
                      <td>{w.wave}</td><td>{w.feedline}</td><td>{w.planned}</td><td>{w.processed}</td>
                      <td data-field="status">{w.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-section">
            <h3>JARVIS Equipment Tickets</h3>
            <div className="content">
              <table>
                <thead><tr><th>Feedline</th><th>Ticket</th><th>Opened</th><th>Status</th><th>Issue</th></tr></thead>
                <tbody>
                  {jarvisTickets.map((t) => (
                    <tr key={t.ticket} data-feedline={t.feedline}>
                      <td>{t.feedline}</td><td data-field="ticket">{t.ticket}</td><td>{t.opened}</td><td>{t.status}</td><td>{t.issue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-section">
            <h3>Throughput Impact</h3>
            <div className="content">
              <table>
                <thead><tr><th>Feedline</th><th>Metric</th><th>Impact</th><th>Unit</th></tr></thead>
                <tbody>
                  {throughput.map((t) => (
                    <tr key={t.feedline} data-impact-feedline={t.feedline}>
                      <td>{t.feedline}</td><td>{t.metric}</td><td data-field="impact">{t.value}</td><td>{t.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
