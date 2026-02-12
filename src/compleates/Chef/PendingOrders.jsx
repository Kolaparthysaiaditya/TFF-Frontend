import api from "../../api/axios";

export default function PendingOrders({ Eid, orders, onAccept }) {

    const acceptOrder = async (orderId) => {
        try {
            await api.post("/TFF/chef/orders/accept/", {
                order_id: orderId,
                Eid
            });

            onAccept(); // refresh data
        } catch (error) {
            if (error.response) {
                alert(error.response.data.error || "Cannot accept order");
            } else {
                alert("Server error. Try again.");
            }
        }
    };



    return (
        <div className="card shadow-sm">
            <div className="card-header fw-bold">
                Pending Orders (First Come First Serve)
            </div>

            <div className="list-group list-group-flush">
                {orders.length === 0 && (
                    <div className="list-group-item text-muted text-center">
                        No pending orders
                    </div>
                )}

                {orders.map((order, index) => (
                    <div
                        key={order.order_id}
                        className="list-group-item d-flex justify-content-between align-items-center"
                    >
                        <div>
                            <b>#{order.order_code}</b><br />
                            <small className="text-muted">
                                {new Date(order.time).toLocaleTimeString()}
                            </small>
                        </div>

                        <button
                            className="btn btn-sm btn-primary"
                            disabled={!order.can_accept}
                            onClick={() => acceptOrder(order.order_id)}
                        >
                            Accept
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
}
