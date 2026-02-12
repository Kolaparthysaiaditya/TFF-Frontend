import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const Summery = ({ branchId }) => {
  const [branchSummary, setBranchSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!branchId) return;

    setLoading(true);
    api
      .get(`/TFF/branch/summary/?branch_id=${branchId}`)
      .then((res) => setBranchSummary(res.data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, [branchId]);

  const mapSummary = (d) => ({
    orders: d.total_orders,
    sales: d.total_sales,
    gst: d.total_gst,
  });

  if (loading) {
    return (
      <div className="text-center mt-5">
        <div className="spinner-border text-primary" />
      </div>
    );
  }

  if (!branchSummary) {
    return <div className="alert alert-warning">Branch data not found.</div>;
  }

  return (
    <div className="container p-4">
      <h3 className="mb-4">
        {branchSummary.branch.name} ({branchSummary.branch.code})
      </h3>

      {[
        ["Today", branchSummary.today],
        ["This Week", branchSummary.this_week],
        ["This Month", branchSummary.this_month],
        ["Previous Month", branchSummary.previous_month],
      ].map(([title, data]) => {
        const s = mapSummary(data); // ✅ fixed here
        return (
          <div className="card shadow-sm mb-4" key={title}>
            <div className="card-body">
              <h5 className="mb-3">{title}</h5>
              <div className="row g-3">
                <div className="col-md-4">
                  <div className="card bg-info text-white text-center">
                    <div className="card-body">
                      <h6>Orders</h6>
                      <h3>{s.orders}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-dark text-white text-center">
                    <div className="card-body">
                      <h6>Sales</h6>
                      <h3>₹ {s.sales}</h3>
                    </div>
                  </div>
                </div>
                <div className="col-md-4">
                  <div className="card bg-success text-white text-center">
                    <div className="card-body">
                      <h6>GST</h6>
                      <h3>₹ {s.gst}</h3>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default Summery;
