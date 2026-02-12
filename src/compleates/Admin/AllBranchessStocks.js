import React, { useEffect, useState } from "react";
import api, {BACKEND_URL} from "../../api/axios";
import Itemalt from "../../images/item-alt.png"

function AllBranchessStocks() {
    const [branchesStock, setBranchesStock] = useState([]);
    const [selectedBranch, setSelectedBranch] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchBranchesStock = async () => {
        setLoading(true);
        try {
            const res = await api.get("/TFF/branches/stock-summary/");
            setBranchesStock(res.data);
        } catch (err) {
            console.error("Branches stock fetch error", err);
            setBranchesStock([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchBranchesStock();
    }, []);

    if (loading) {
        return (
            <div className="text-center mt-5">
                <div className="spinner-border text-primary"></div>
            </div>
        );
    }

    const fetchBranchStock = async (branchId) => {
        setLoading(true);
        try {
            const res = await api.get(`/TFF/branch/stock?branch_id=${branchId}`);
            setSelectedBranch({ id: branchId, stock: res.data });
        } catch (err) {
            console.error("Branch stock fetch error", err);
            setSelectedBranch({ id: branchId, stock: [] });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div>
            <h4 className="mb-3">Branches Stock</h4>

            {/* Branch Cards */}
            {!selectedBranch && (
                <div className="row g-3">
                    {branchesStock.length > 0 ? branchesStock.map(branch => (
                        <div className="col-sm-6 col-md-4 col-lg-3" key={branch.branch_id}>
                            <div className="card shadow-sm p-3 cursor-pointer" onClick={() => fetchBranchStock(branch.branch_id)}>
                                <h6>{branch.branch_name}</h6>
                                <p>Total Items: {branch.total_items}</p>
                            </div>
                        </div>
                    )) : <p className="text-muted">No branches found</p>}
                </div>
            )}

            {/* Selected Branch Stock */}
            {selectedBranch && (
                <div>
                    <button className="btn btn-sm btn-outline-primary mb-3" onClick={() => setSelectedBranch(null)}>← Back to Branches</button>
                    <h5>Stock in {branchesStock.find(b => b.branch_id === selectedBranch.id)?.branch_name}</h5>
                    <div className="row g-3">
                        {selectedBranch.stock.length > 0 ? selectedBranch.stock.map(item => (
                            <div className="col-sm-6 col-md-4 col-lg-3" key={item.id}>
                                <div className="card shadow-sm p-2 h-100">
                                    <img
                                        src={`${BACKEND_URL}${item.image}` || Itemalt}
                                        alt={item.item}
                                        className="card-img-top"
                                        style={{ maxHeight: "150px", objectFit: "cover" }}
                                    />
                                    <h6>{item.item}</h6>
                                    <p className="mb-1">Quantity: {item.quantity}</p>
                                    <p className="mb-0">Min Level: {item.min_level}</p>
                                    <p className="mb-0">Unit: {item.unit}</p>
                                </div>
                            </div>
                        )) : <p className="text-muted">No stock in this branch</p>}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AllBranchessStocks