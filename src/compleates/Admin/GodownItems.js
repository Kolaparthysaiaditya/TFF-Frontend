import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { BACKEND_URL } from "../../api/axios";
import Itemalt from "../../images/item-alt.png";

function GodownItems() {
    const [godownStock, setGodownStock] = useState([]);
    const [search, setSearch] = useState("");
    const [unitFilter, setUnitFilter] = useState("all");
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState({
        item_name: "",
        item_type: "raw_material",
        category: "",
        price: "",
        quantity: "",
        expiry_date: "",
        unit: "kg",
        item_pic: null,
    });

    // -----------------------------
    // Fetch stock from backend
    // -----------------------------
    const fetchStock = async () => {
        try {
            const res = await axios.get(`${BACKEND_URL}/TFF/godown/stock/`);
            setGodownStock(res.data); // set stock
        } catch (err) {
            console.error("Failed to fetch stock:", err);
        }
    };

    useEffect(() => {
        fetchStock(); // load stock on mount
    }, []);

    // -----------------------------
    // Filtered stock
    // -----------------------------
    const units = useMemo(() => ["all", ...new Set(godownStock.map(i => i.unit).filter(Boolean))], [godownStock]);

    const filteredStock = useMemo(() => {
        return godownStock.filter(item => {
            const matchesSearch = item.item_name?.toLowerCase().includes(search.toLowerCase());
            const matchesUnit = unitFilter === "all" || item.unit === unitFilter;
            return matchesSearch && matchesUnit;
        });
    }, [godownStock, search, unitFilter]);

    // -----------------------------
    // Submit Add Item
    // -----------------------------
    const submitAddItem = async () => {
        try {
            const formData = new FormData();
            for (let key in form) {
                if (form[key] !== null) formData.append(key, form[key]);
            }

            const response = await axios.post(
                `${BACKEND_URL}/TFF/godown/create-item/`,
                formData,
                { headers: { "Content-Type": "multipart/form-data" } }
            );

            alert(response.data.message || "Item added successfully");
            setShowAdd(false);
            setForm({
                item_name: "",
                item_type: "raw_material",
                category: "",
                price: "",
                quantity: "",
                expiry_date: "",
                unit: "kg",
                item_pic: null,
            });

            fetchStock(); // ✅ refresh stock after adding

        } catch (err) {
            console.error("Add Item Error:", err);
            const message =
                err.response?.data?.error ||
                err.response?.data?.message ||
                err.message ||
                "Unknown error";
            alert(message);
        }
    };

    return (
        <div>
            {/* Header */}
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="brand-title text-dark">Godown Stock</h4>
                <button className="btn btn-sm btn-primary" onClick={() => setShowAdd(true)}>
                    + Add Item
                </button>
            </div>

            {/* Add Item Form */}
            {showAdd && (
                <div className="modal fade show d-block" style={{ background: "#00000066" }}>
                    <div className="modal-dialog modal-lg modal-dialog-centered m-auto">
                        <div className="modal-content p-4" style={{ background: "#00000066" }}>
                            <div>
                                <div className="mb-3 d-flex justify-content-between">
                                    <h6 className="brand-title text-light">Add New Item</h6>
                                    <button className="btn text-secondary fs-4 me-3" onClick={() => setShowAdd(false)}>X</button>
                                </div>

                                <div className="form-floating">
                                    <input
                                        type="text"
                                        className="form-control mb-2 ps-4 rounded-5 text-light"
                                        placeholder="Item name"
                                        value={form.item_name}
                                        onChange={e => setForm({ ...form, item_name: e.target.value })}
                                        style={{ backgroundColor: "rgba(240, 237, 230, 0.5)" }}
                                    />
                                    <label className="text-light ps-4">Item Name</label>
                                </div>

                                <div className="form-floating">
                                    <input
                                        type="text"
                                        className="form-control mb-2 ps-4 rounded-5 text-light"
                                        placeholder="Category"
                                        value={form.category}
                                        onChange={e => setForm({ ...form, category: e.target.value })}
                                        style={{ backgroundColor: "rgba(240, 237, 230, 0.5)" }}
                                    />
                                    <label className="text-light ps-4">Category</label>
                                </div>
                                <div className="form-floating mb-2">
                                    <input
                                        type="number"
                                        className="form-control ps-4 rounded-5 text-light"
                                        placeholder="Quantity"
                                        value={form.quantity}
                                        onChange={e => setForm({ ...form, quantity: e.target.value })}
                                        style={{ backgroundColor: "rgba(240, 237, 230, 0.5)" }}
                                    />
                                    <label className="text-light ps-4">Quantity</label>
                                </div>

                                <div className="mb-2">
                                    <select
                                        className="form-select ps-4 rounded-5 text-light"
                                        value={form.unit}
                                        onChange={e => setForm({ ...form, unit: e.target.value })}
                                        style={{ backgroundColor: "rgba(240, 237, 230, 0.5)" }}
                                    >
                                        <option className="text-light bg-dark" value="kg" >Kg</option>
                                        <option className="text-light bg-dark" value="ltr">Litre</option>
                                        <option className="text-light bg-dark" value="pcs">Pieces</option>
                                    </select>
                                </div>

                                <div className="form-floating mb-2">
                                    <input
                                        type="date"
                                        className="form-control ps-4 rounded-5 text-light"
                                        value={form.expiry_date}
                                        onChange={e => setForm({ ...form, expiry_date: e.target.value })}
                                        style={{ backgroundColor: "rgba(240, 237, 230, 0.5)" }}
                                    />
                                    <label className="text-light ps-4">Expiry Date</label>
                                </div>

                                <div className="form-floating mb-2">
                                    <input
                                        type="number"
                                        className="form-control ps-4 rounded-5 text-light"
                                        placeholder="Price"
                                        value={form.price}
                                        onChange={e => setForm({ ...form, price: e.target.value })}
                                        style={{ backgroundColor: "rgba(240, 237, 230, 0.5)" }}
                                    />
                                    <label className="text-light ps-4">Price</label>
                                </div>

                                <div className="">
                                    <input
                                        type="file"
                                        className="form-control ps-4 rounded-5 text-light"
                                        onChange={e => setForm({ ...form, item_pic: e.target.files[0] })}
                                        style={{ backgroundColor: "rgba(240, 237, 230, 0.5)" }}
                                    />
                                </div>

                                <div className="justify-content-end d-flex mt-4">
                                    <button className="w-25 btn btn-outline-danger me-3" onClick={() => setShowAdd(false)}>Cancel</button>
                                    <button className="w-25 btn btn-outline-success btn-sm" onClick={submitAddItem}>Save</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search & Filter */}
            <div className="row mb-3 g-2">
                <div className="col-md-8">
                    <input
                        type="text"
                        className="form-control"
                        placeholder="Search item..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="col-md-4">
                    <select className="form-select" value={unitFilter} onChange={e => setUnitFilter(e.target.value)}>
                        {units.map(unit => <option key={unit} value={unit}>{unit === "all" ? "All Units" : unit}</option>)}
                    </select>
                </div>
            </div>

            {/* Cards */}
            <div className="row g-3">
                {filteredStock.length > 0 ? (
                    filteredStock.map(item => (
                        <div className="col-sm-6 col-md-4 col-lg-3" key={item.id}>
                            <div className="card shadow-sm p-2 h-100">
                                <img
                                    src={item.item_image ? `${BACKEND_URL}${item.item_image}` : Itemalt}
                                    alt={item.item_name}
                                    className="card-img-top"
                                    style={{ maxHeight: "150px", objectFit: "cover" }}
                                />
                                <div className="card-body">
                                    <h6>{item.item_name}</h6>
                                    <p className="mb-1">Qty: {item.quantity}</p>
                                    <p className="mb-0">Unit: {item.unit}</p>
                                    {item.expiry_date && new Date(item.expiry_date) < new Date() && (
                                        <span className="badge bg-danger">Expired</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-muted">No stock found</p>
                )}
            </div>
        </div>
    );
}

export default GodownItems;
