import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../../api/axios";

export default function OrderHistory({ customerId }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    api
      .get(`TFF/orders/history/?customer_id=${customerId}`)
      .then((res) => setOrders(res.data))
      .catch((err) => console.error(err));
  }, [customerId]);

  return (
    <div className="container my-4">
      <h3 className="mb-4 text-primary">Order History</h3>

      {orders.length === 0 ? (
        <div className="alert alert-info">No past orders found.</div>
      ) : (
        orders.map((order) => (
          <div key={order.id} className="no-card-hover">
            <div className="card mb-3 shadow-sm border-0 bg-secondary">
              <div className="card-header bg-gradient text-white d-flex justify-content-between align-items-center">
                <p><strong>Order :</strong> {order.order_code}</p>
                <span
                  className={`badge ${order.status === "completed"
                    ? "bg-success"
                    : order.status === "cancelled"
                      ? "bg-danger"
                      : "bg-warning text-dark"
                    }`}
                >
                  {order.status.toUpperCase()}
                </span>
              </div>

              <div className="card-body">
                <div className="row">
                  {order.items.map((item, i) => (
                    <div
                      key={i}
                      className="col-md-4 d-flex align-items-center mb-3"
                    >
                      <img
                        src={`${BACKEND_URL}${item.image}`}
                        alt={item.name}
                        className="img-thumbnail me-2"
                        style={{ width: "80px", height: "80px", objectFit: "cover" }}
                      />
                      <div>
                        <div className="fw-bold">{item.name}</div>
                        <div>Qty: {item.quantity}</div>
                        <div>Price: ₹{item.price}</div>
                      </div>
                    </div>
                  ))}
                </div>

                <hr />
                <div className="d-flex justify-content-end gap-3">
                  <div>
                    <strong>Subtotal:</strong> ₹{order.subtotal}
                  </div>
                  <div>
                    <strong>GST:</strong> ₹{order.gst_amount}
                  </div>
                  <div>
                    <strong>Total:</strong> ₹{order.total_amount}
                  </div>
                </div>
                <div className="mt-2 text-muted">
                  Ordered on: {new Date(order.created_at).toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
