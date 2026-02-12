import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../../api/axios";

export default function BranchOrders({ branchId }) {
  const [orders, setOrders] = useState([]);

  const loadOrders = () => {
    if (!branchId) return;
    api
      .get(`/TFF/kitchen/orders/?branch_id=${branchId}`)
      .then(res => setOrders(res.data));
  };

  useEffect(() => {
    loadOrders();
    const interval = setInterval(loadOrders, 8000);
    return () => clearInterval(interval);
  }, [branchId]);

  return (
    <div className="container-fluid">
      <h5 className="fw-bold mb-3">
        📦 Branch Orders ({branchId})
      </h5>

      {orders.length === 0 && (
        <div className="alert alert-secondary text-center">
          No orders found
        </div>
      )}

      <div className="row g-3">
        {orders.map(order => (
          <div key={order.id} className="col-12">
            <div className="card shadow-sm">

              {/* ===== Order Header ===== */}
              <div className="card-header d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold">
                    Order ID: {order.order_code}
                  </div>
                  <small className="text-muted">
                    Customer ID: {order.customer.Cid}
                  </small>
                </div>

                <span className={`badge fs-6 ${
                  order.status === "pending"
                    ? "bg-warning text-dark"
                    : order.status === "preparing"
                    ? "bg-info"
                    : order.status === "ready"
                    ? "bg-success"
                    : "bg-secondary"
                }`}>
                  {order.status}
                </span>
              </div>

              {/* ===== Customer Info ===== */}
              <div className="card-body">

                {/* ===== Items Table ===== */}
                <div className="table-responsive">
                  <table className="table align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>Item</th>
                        <th>Name</th>
                        <th>Qty</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>

                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={index}>
                          <td>
                            {item.image && (
                              <img
                                src={`${BACKEND_URL}${item.image}`}
                                alt={item.name}
                                width="55"
                                height="55"
                                className="rounded"
                              />
                            )}
                          </td>

                          <td className="fw-semibold">
                            {item.name}
                          </td>

                          <td>
                            <span className="badge bg-secondary">
                              {item.quantity}
                            </span>
                          </td>

                          <td>
                            ₹{item.price}
                          </td>

                          <td className="fw-semibold">
                            ₹{(item.quantity * item.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  <div className="row w-75">
                    <p className="col-3">Summary</p>
                    <p className="col-3">Subtotal : {order.subtotal}</p>
                    <p className="col-3">GST(%) : {order.gst_amount}</p>
                    <p className="col-3">Total : {order.total_amount}</p>
                  </div>
                </div>
              </div>

            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
