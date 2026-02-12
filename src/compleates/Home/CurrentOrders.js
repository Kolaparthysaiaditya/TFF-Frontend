import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../../api/axios";

export default function CurrentOrders({ user }) {
  const [orders, setOrders] = useState([]);
  const customerId = user?.id; // TEMP (remove when JWT is back)

  useEffect(() => {
    api
      .get(`TFF/orders/current/?customer_id=${customerId}`)
      .then(res => {
        setOrders(res.data);
      })
      .catch(err => {
        console.error("ERROR:", err);
      });
  }, []);

  const cancelOrder = (orderId) => {
    if (!window.confirm("Cancle order?")) return;

    api.post("TFF/orders/cancel/", {
      customer_id: user.id,
      order_id: orderId
    })
      .then(() => {
        setOrders(prev => prev.filter(o => o.id !== orderId));
        alert('cancleed')
      })
      .catch(err => {
        console.error("Cancel failed", err.response || err);
      });
  };



  // SAFE status mapper (never fails)
  const getStatusConfig = (status) => {
    switch (status) {
      case "pending":
        return { label: "Order Placed", color: "warning" };
      case "accepted":
        return { label: "Order Accepted", color: "info" };
      case "preparing":
        return { label: "Being Prepared", color: "primary" };
      case "ready":
        return { label: "Ready to Serve", color: "success" };
      default:
        return { label: "Unknown Status", color: "secondary" };
    }
  };

  return (
    <div className="container mt-3" >
      <h3 className="mb-3 fw-semibold text-primary">Your Current Order</h3>

      {orders.length === 0 && (
        <div className="alert alert-info text-center">
          No active orders {user?.id}
        </div>
      )}
      <div className="row g-3 justify-content-center">
        {orders.map(order => {
          const status = getStatusConfig(order.status);

          return (
            <div key={order.id} className="border border-2 border-info  rounded mb-4 col-4 d-flex flex-column" style={{ height: "520px" }}>

              {/* STATUS SECTION */}
              <div className={`d-flex  justify-content-between p-3 `}>
                <div>
                  <div className="fw-bold fs-6">
                    {status.label}
                  </div>
                  <small>
                    Order ID : <b>{order.order_code}</b>
                  </small>
                </div>
                <p className={`my-auto bg-${status.color} p-2 px-4 rounded-5 `}>{order.status}</p>
              </div>

              {/* ITEMS */}
              <div
                className="p-3 flex-grow-1 overflow-auto"
                style={{ maxHeight: "260px" }}   // 👈 scroll area
              >
                {order.items.map((item, index) => (
                  <div
                    key={index}
                    className="d-flex align-items-center mb-3"
                  >
                    <img
                      src={`${BACKEND_URL}${item.image}`}
                      alt={item.name}
                      width="60"
                      height="60"
                      className="rounded me-3"
                    />

                    <div className="flex-grow-1">
                      <div className="fw-semibold">
                        {item.name}
                      </div>
                      <small className="text-muted">
                        Qty {item.quantity}
                      </small>
                    </div>

                    <div className="fw-semibold">
                      ₹{item.price}
                    </div>
                  </div>
                ))}
              </div>

              <hr className="m-0" />

              {/* BILL SUMMARY */}
              <div className="p-4 bg-light float-buttom">
                <div className="d-flex justify-content-between small">
                  <span>Item Total</span>
                  <span>₹{order.subtotal}</span>
                </div>
                <div className="d-flex justify-content-between small">
                  <span>GST</span>
                  <span>₹{order.gst_amount}</span>
                </div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-6">
                  <span>Grand Total</span>
                  <span>₹{order.total_amount}</span>
                </div>
                <hr />
                <div>
                  <div className="float-start">
                    <p className="small text-muted m-0">
                      <strong>Date : </strong>{new Date(order.created_at).toLocaleDateString("en-IN", {
                        day: "2-digit",
                        month: "short",
                        year: "numeric",
                      })}
                    </p>
                    <p className="small text-muted m-0">
                      <strong>Time : </strong>{new Date(order.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                  <div className="my-auto">
                    <button className="btn btn-danger float-end" onClick={() => cancelOrder(order.id)}>Cancle Order</button>
                  </div>
                </div>
              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
