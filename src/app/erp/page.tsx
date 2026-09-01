const orders = [
  { order: "1421", line: "Line 3", qty: 420, completed: 360, status: "DELAYED" },
  { order: "1419", line: "Line 2", qty: 500, completed: 500, status: "COMPLETE" },
  { order: "1420", line: "Line 1", qty: 600, completed: 600, status: "COMPLETE" }
];

const maintenance = [
  { machine: "4", ticket: "M-8842", opened: "11:23", status: "OPEN", issue: "Bearing failure" },
  { machine: "7", ticket: "M-8829", opened: "08:15", status: "CLOSED", issue: "Sensor alignment" }
];

const inventory = [
  { part: "BR-204", description: "Drive bearing", qty: 0, reorder: 5 },
  { part: "BLT-90", description: "Timing belt", qty: 11, reorder: 4 },
  { part: "SNS-14", description: "Position sensor", qty: 7, reorder: 3 }
];

export default function ERP() {
  return (
    <div className="erp-shell">
      <div className="erp-window">
        <div className="erp-title">OMNIPRO Manufacturing ERP v7.4</div>
        <div className="erp-menu">File &nbsp; Production &nbsp; Maintenance &nbsp; Inventory &nbsp; Reports &nbsp; Help</div>
        <div className="erp-body">
          <div className="erp-section">
            <h3>Production Orders</h3>
            <div className="content">
              <table>
                <thead><tr><th>Order</th><th>Line</th><th>Qty</th><th>Completed</th><th>Status</th></tr></thead>
                <tbody>
                  {orders.map((o) => (
                    <tr key={o.order} data-order={o.order}>
                      <td>{o.order}</td><td>{o.line}</td><td>{o.qty}</td><td>{o.completed}</td>
                      <td data-field="status">{o.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-section">
            <h3>Maintenance Tickets</h3>
            <div className="content">
              <table>
                <thead><tr><th>Machine</th><th>Ticket</th><th>Opened</th><th>Status</th><th>Issue</th></tr></thead>
                <tbody>
                  {maintenance.map((m) => (
                    <tr key={m.ticket} data-machine={m.machine}>
                      <td>{m.machine}</td><td data-field="ticket">{m.ticket}</td><td>{m.opened}</td><td>{m.status}</td><td>{m.issue}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="erp-section">
            <h3>Inventory</h3>
            <div className="content">
              <table>
                <thead><tr><th>Part</th><th>Description</th><th>Available</th><th>Reorder point</th></tr></thead>
                <tbody>
                  {inventory.map((i) => (
                    <tr key={i.part} data-part={i.part}>
                      <td>{i.part}</td><td>{i.description}</td><td data-field="qty">{i.qty}</td><td>{i.reorder}</td>
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
