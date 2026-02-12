import { useEffect, useState } from "react";
import api from "../../api/axios";
import CurrentOrderCard from "./CurrentOrderCard";
import PendingOrders from "./PendingOrders";

export default function ChefOrders({ branchCode, Eid }) {
    const [currentOrder, setCurrentOrder] = useState(null);
    const [pendingOrders, setPendingOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    const loadData = async () => {
  if (!branchCode) return;

  setLoading(true);
  try {
    const current = await api.get(`/TFF/chef/current-order/?eid=${Eid}`);
    setCurrentOrder(current.data);

    const pending = await api.get(
      `/TFF/chef/pending-orders/?branch_id=${branchCode}`
    );
    setPendingOrders(pending.data);
  } catch (err) {
    console.error("Chef orders error", err);
  } finally {
    setLoading(false);
  }
};


    useEffect(() => {
        if (!branchCode) return;

        loadData();
    }, [branchCode]);


    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    return (
        <div className="row g-3">
            {/* CURRENT PREPARING ORDER */}
            <div className="col-12">
                <h3 className="text-info mb-4"><u>Preparing Order</u></h3>
                <CurrentOrderCard
                    Bid={branchCode}
                    Eid={Eid}
                    order={currentOrder}
                    onCompleted={loadData}
                />
            </div>

            {/* PENDING ORDERS */}
            <div className="col-12">
                <h3 className="text-info  mb-4"><u>Pending Oredrs</u></h3>
                <PendingOrders
                    Eid={Eid}
                    orders={pendingOrders}
                    onAccept={loadData}
                />
            </div>
        </div>
    );
}
