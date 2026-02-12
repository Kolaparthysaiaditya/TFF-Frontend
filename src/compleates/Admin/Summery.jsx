import React, { useEffect, useState } from "react";
import api from "../../api/axios";

const Summery = () => {
    const [summaryData, setSummaryData] = useState(null);
    const [branches, setBranches] = useState([]);
    const [branchSummary, setBranchSummary] = useState(null);

    const [loading, setLoading] = useState(true);
    const [activeSummary, setActiveSummary] = useState(null);
    const [view, setView] = useState("summary");
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [showTotal, setShowTotal] = useState(false);

    /* ================= GLOBAL SUMMARY ================= */
    useEffect(() => {
        api.get("/TFF/global/summary/")
            .then(res => {
                setSummaryData(res.data);
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, []);

    /* ================= ACTIVE BRANCHES ================= */
    useEffect(() => {
        api.get("/TFF/branches/active/")
            .then(res => setBranches(res.data))
            .catch(err => console.error(err));
    }, []);

    /* ================= BRANCH SUMMARY ================= */
    const loadBranchSummary = (branch) => {
        setSelectedBranch(branch);
        setBranchSummary(null);
        setView("branchDetails");

        api.get(`/TFF/branch/summary/?branch_id=${branch.id}`)
            .then(res => setBranchSummary(res.data))
            .catch(err => console.error(err));
    };

    /* ================= HELPERS ================= */
    const mapSummary = (d) => ({
        orders: d.total_orders,
        sales: d.total_sales,
        gst: d.total_gst,
    });

    const activeGlobalSummary = (() => {
        if (!summaryData || !activeSummary) return null;
        if (activeSummary === "today") return mapSummary(summaryData.today);
        if (activeSummary === "week") return mapSummary(summaryData.this_week);
        if (activeSummary === "month") return mapSummary(summaryData.this_month);
        if (activeSummary === "previous_month")
            return mapSummary(summaryData.previous_month);
        return null;
    })();

    const totalSummary = summaryData && {
        orders:
            summaryData.today.total_orders +
            summaryData.this_week.total_orders +
            summaryData.this_month.total_orders +
            summaryData.previous_month.total_orders,
        sales:
            summaryData.today.total_sales +
            summaryData.this_week.total_sales +
            summaryData.this_month.total_sales +
            summaryData.previous_month.total_sales,
    };


    const handleBack = () => {
        if (view === "branchDetails") setView("branches");
        else if (view === "branches") {
            setView("summary");
            setShowTotal(false);
        }
    };

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary" />
            </div>
        );
    }

    return (
        <div className="container-fluid p-4 bg-light min-vh-100">

            {view !== "summary" && (
                <button className="btn btn-outline-dark mb-3" onClick={handleBack}>
                    ← Back
                </button>
            )}

            {/* ================= TOTAL SUMMARY ================= */}
            {view === "summary" && (
                <>
                    <div className="card text-center shadow mb-4 bg-info text-white"
                        role="button"
                        onClick={() => setShowTotal(!showTotal)}>
                        <div className="card-body">
                            <h4>Total Summary</h4>
                            <small>Tap to view overall performance</small>
                        </div>
                    </div>

                    {showTotal && totalSummary && (
                        <div className="row g-3 mb-4">
                            <div className="col-md-6">
                                <div className="card bg-dark text-white text-center">
                                    <div className="card-body">
                                        <h6>Total Sales</h6>
                                        <h3>₹ {totalSummary.sales}</h3>
                                    </div>
                                </div>
                            </div>
                            <div className="col-md-6">
                                <div className="card bg-info text-white text-center">
                                    <div className="card-body">
                                        <h6>Total Orders</h6>
                                        <h3>{totalSummary.orders}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ================= PERIOD SELECTION ================= */}
                    <div className="row g-3 mb-4">
                        {[
                            ["today", "Today"],
                            ["week", "This Week"],
                            ["month", "This Month"],
                            ["previous_month", "Previous Month"],
                        ].map(([key, label]) => (
                            <div className="col-md-3" key={key}>
                                <div className="card text-center shadow-sm"
                                    role="button"
                                    onClick={() =>
                                        setActiveSummary(activeSummary === key ? null : key)
                                    }>
                                    <div className="card-body">
                                        <h5>{label}</h5>
                                        <small>Click to view</small>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {activeGlobalSummary && (
                        <>
                            <div className="text-center mb-3">
                                <button
                                    className="btn btn-outline-primary px-5"
                                    onClick={() => setView("branches")}
                                >
                                    View Branches
                                </button>
                            </div>

                            <div className="card shadow p-4">
                                <h4 className="mb-4 text-capitalize">{activeSummary} Summary</h4>
                                <div className="row g-3">
                                    {[
                                        ["Orders", activeGlobalSummary.orders, "info"],
                                        ["Sales", `₹ ${activeGlobalSummary.sales}`, "dark"],
                                        ["GST", `₹ ${activeGlobalSummary.gst}`, "success"],
                                    ].map(([t, v, c]) => (
                                        <div className="col-md-4" key={t}>
                                            <div className={`card bg-${c} text-white text-center`}>
                                                <div className="card-body">
                                                    <h6>{t}</h6>
                                                    <h3>{v}</h3>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </>
                    )}
                </>
            )}

            {/* ================= BRANCH LIST ================= */}
            {view === "branches" && (
                <div className="card shadow p-4">
                    <h4 className="mb-4">Active Branches</h4>
                    <div className="row g-3">
                        {branches.map(b => (
                            <div className="col-md-4" key={b.id}>
                                <div className="card bg-primary text-white text-center shadow"
                                    role="button"
                                    onClick={() => loadBranchSummary(b)}>
                                    <div className="card-body">
                                        <h5>{b.branch_name}</h5>
                                        <small>{b.branch_code}</small>
                                        <hr />
                                        <p>City: {b.city}</p>
                                        <p>Sales: ₹ {b.sales}</p>
                                        <p>Staff: {b.total_staff}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ================= BRANCH DETAILS ================= */}
            {view === "branchDetails" && branchSummary && (
                <div className="card shadow p-4">
                    <h4 className="mb-4">
                        {branchSummary.branch.name} ({branchSummary.branch.code})
                    </h4>

                    {[
                        ["Today", branchSummary.today],
                        ["This Week", branchSummary.this_week],
                        ["This Month", branchSummary.this_month],
                        ["Previous Month", branchSummary.previous_month],
                    ].map(([title, d]) => {
                        const s = mapSummary(d);
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
            )}
        </div>
    );
};

export default Summery;
