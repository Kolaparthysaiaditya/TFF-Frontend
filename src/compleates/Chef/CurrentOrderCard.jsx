import IngredientUsageForm from "./IngredientUsageForm";
import api, { BACKEND_URL } from "../../api/axios";

export default function CurrentOrderCard({ Eid, Bid, order, onCompleted }) {
    if (!order) {
        return (
            <div className="card shadow-sm">
                <div className="card-body text-center text-muted">
                    No active order. Accept a pending order.
                </div>
            </div>
        );
    }

    const submitIngredients = async (ingredients) => {
        await api.post("/TFF/chef/submit-ingredients/", {
            Eid,
            Bid,
            total: order.total_amount,
            order_id: order.id,
            ingredients
        });
        onCompleted();
    };

    return (
        <div className="card shadow-sm">
            <div className="card-header fw-bold">
                Current Preparing Order
            </div>

            <div className="card-body">
                <div className="mb-2">
                    <b>Order ID:</b> {order.order_code} <br />
                    <b>Customer:</b> {order.customer.Cid} <br />
                    <b>Ordered Time:</b>{" "}
                    {new Date(order.created_at).toLocaleTimeString()}
                </div>

                <hr />

                <h6>Ordered Items</h6>
                <ul className="mb-3">
                    <table className="table table-sm">
                        <thead>
                            <tr>
                                <th>Image</th>
                                <th>Item Name</th>
                                <th>Quantity</th>
                            </tr>
                        </thead>
                        <tbody>
                            {order.items.map((item, i) => (
                                <tr key={i}>
                                    <td>
                                        <img
                                            src={`${BACKEND_URL}${item.image}`}
                                            alt={item.name}
                                            width="50"
                                        />
                                    </td>
                                    <td>{item.name}</td>
                                    <td>{item.quantity}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                </ul>

                <IngredientUsageForm onSubmit={submitIngredients} Bid={Bid} />
            </div>
        </div>
    );
}
