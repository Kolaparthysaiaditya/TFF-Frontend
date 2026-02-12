import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../../api/axios";

export default function CompletedOrders({ branchCode, Eid }) {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadCompletedOrders();
    }, [branchCode, Eid]);

    const loadCompletedOrders = async () => {
        setLoading(true);
        try {
            const res = await api.get(
                `/TFF/chef/completed-orders/?Eid=${Eid}`
            );
            setOrders(res.data || []);
        } catch (err) {
            console.error("Completed orders error", err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center my-4">
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="card shadow-sm">
                <div className="card-body text-center text-muted">
                    No completed orders yet 🍳
                </div>
            </div>
        );
    }

    return (
        <div className="row g-4">
            {orders.map((order) => (
                <div key={order.id} className="col-lg-6">
                    <div className="no-card-hover">
                        <div
                            className="card shadow-sm border-4 d-flex flex-column"
                            style={{ height: "320px" }}   // 🔒 Fixed height
                        >
                            {/* Header */}
                            <div className="card-header bg-light fw-bold d-flex justify-content-between">
                                <div>
                                    <div>{order.order_code}</div>
                                    <small className="text-muted">
                                        {new Date(order.created_at).toLocaleString()}
                                    </small>
                                </div>
                                <span className="badge bg-success p-2 my-auto">
                                    {order.status}
                                </span>
                            </div>

                            {/* Scrollable Items */}
                            <div
                                className="card-body"
                                style={{
                                    overflowY: "auto",
                                    flexGrow: 1,          // ⭐ fills available space
                                }}
                            >
                                {order.items.map((item, idx) => (
                                    <div
                                        key={idx}
                                        className="d-flex align-items-center mb-3 border-bottom pb-2"
                                    >
                                        <img
                                            src={`${BACKEND_URL}${item.image}`}
                                            alt={item.name}
                                            className="rounded"
                                            style={{
                                                width: "55px",
                                                height: "55px",
                                                objectFit: "cover",
                                                marginRight: "12px",
                                            }}
                                        />

                                        <div className="flex-grow-1">
                                            <div className="fw-semibold">{item.name}</div>
                                            <small className="text-muted">
                                                Qty: {item.quantity}
                                            </small>
                                        </div>

                                        <div className="fw-bold">₹{item.price}</div>
                                    </div>
                                ))}
                            </div>

                            {/* Footer */}
                            <div className="text-warning fw-bold p-3 border-top border-3">
                                ⭐ {order.rating ?? "N/A"}
                            </div>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}
