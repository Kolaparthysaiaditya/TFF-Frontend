import { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../../api/axios";

export default function CartPage({ user, Bid }) {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(true);
    const [placingOrder, setPlacingOrder] = useState(false);

    // Floating form states
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [street, setStreet] = useState("");
    const [area, setArea] = useState("");
    const [city, setCity] = useState("");
    const [pincode, setPincode] = useState("");

    const [lat, setLat] = useState(null);
    const [lon, setLon] = useState(null);
    const [detectedBranch, setDetectedBranch] = useState(null);

    const [nearbyBranches, setNearbyBranches] = useState([]);
    const [selectiveBranch, setSelectiveBranch] = useState(null);

    const [error, setError] = useState("");
    const [loadingBranch, setLoadingBranch] = useState(false);

    useEffect(() => {
        if (user?.id) fetchCart();
    }, [user]);

    const fetchCart = async () => {
        try {
            const res = await api.get(`/TFF/cart/?customer_id=${user.id}`);
            setCart(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const updateQuantity = async (menu_item_id, newQty) => {
        if (newQty < 1) return;
        try {
            await api.patch("/TFF/cart/update-quantity/", {
                customer_id: user.id,
                menu_item_id,
                quantity: newQty,
            });
            fetchCart();
        } catch {
            alert("Failed to update quantity");
        }
    };

    const removeItem = async (menu_item_id) => {
        if (!window.confirm("Remove this item?")) return;
        try {
            await api.delete("/TFF/cart/remove-item/", {
                data: { customer_id: user.id, menu_item_id },
            });
            fetchCart();
        } catch {
            alert("Failed to remove item");
        }
    };

    const clearCart = async () => {
        if (!window.confirm("Clear entire cart?")) return;
        try {
            await api.delete("/TFF/cart/clear/", { data: { customer_id: user.id } });
            setCart(null);
        } catch {
            alert("Failed to clear cart");
        }
    };

    // ----------------- PLACE ORDER FLOW -----------------

    const handlePlaceOrder = () => {
        if (Bid) {
            placeOrder(Bid); // Bid exists, normal flow
        } else {
            setShowAddressForm(true); // Show floating address form
        }
    };

    const resetForm = () => {
        setStreet("");
        setArea("");
        setCity("");
        setPincode("");
        setLat(null);
        setLon(null);
        setDetectedBranch(null);
        setNearbyBranches([]);
        setSelectiveBranch(null);
        setError("");
    };

    const proceedAddress = async (e) => {
        e.preventDefault();
        setLoadingBranch(true);
        setError("");
        try {
            // Convert address → lat/lon using Nominatim
            const queries = [
                `${street}, ${area}, ${city}, ${pincode}, Andhra Pradesh, India`,
                `${area}, ${city}, ${pincode}, Andhra Pradesh, India`,
                `${city}, ${pincode}, Andhra Pradesh, India`,
                `${city}, Andhra Pradesh, India`,
            ];

            let location = null;
            for (const q of queries) {
                const res = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
                    { headers: { "User-Agent": "TheFoodForest/1.0" } }
                );
                const data = await res.json();
                if (data.length > 0) {
                    location = data[0];
                    break;
                }
            }

            if (!location) {
                setError("Address not found");
                return;
            }

            const latitude = Number(parseFloat(location.lat).toFixed(6));
            const longitude = Number(parseFloat(location.lon).toFixed(6));
            setLat(latitude);
            setLon(longitude);

            // Show options for Auto / Selective
            setDetectedBranch(null);
            setNearbyBranches([]);
            setSelectiveBranch(null);
        } catch (err) {
            console.error(err);
            setError("Failed to detect address");
        } finally {
            setLoadingBranch(false);
        }
    };

    const handleAutoAssign = async () => {
        if (!lat || !lon) return;
        setLoadingBranch(true);
        try {
            const res = await api.get(`/TFF/nearest-branch/?lat=${lat}&lon=${lon}`);
            if (res.data?.branch_name) setDetectedBranch(res.data);
            else setError("No nearby branch found");
        } catch (err) {
            console.error(err);
            setError("Failed to get branch");
        } finally {
            setLoadingBranch(false);
        }
    };

    const handleSelectiveBranch = async () => {
        if (!lat || !lon) return;
        setLoadingBranch(true);
        try {
            // Nearby branches within 15km
            const res = await api.get(
                `/TFF/nearest-branch-15/?lat=${lat}&lon=${lon}`
            );
            if (res.data?.branches) setNearbyBranches(res.data.branches);
            else setError("No branches found within 15km");
        } catch (err) {
            console.error(err);
            setError("Failed to fetch nearby branches");
        } finally {
            setLoadingBranch(false);
        }
    };

    const placeOrder = async (branchId) => {
        if (!branchId) {
            alert("Please select a branch first!");
            return;
        }
        setPlacingOrder(true);
        try {
            await api.post("/TFF/order/place/", { customer_id: user.id, Bid: branchId });
            alert("Order placed successfully 🎉");
            setCart(null);
            setShowAddressForm(false);
        } catch (err) {
            console.error(err);
            alert("Failed to place order");
        } finally {
            setPlacingOrder(false);
        }
    };

    // ----------------- RENDER -----------------
    if (loading)
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "75vh" }}>
                <div className="alert alert-info text-center mx-auto">Loading cart...</div>
            </div>
        );

    if (!cart || cart.items?.length === 0)
        return (
            <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "75vh" }}>
                <div className="alert alert-info text-center fs-4">Your cart is empty 🛒</div>
            </div>
        );

    return (
        <div className="container mt-4">
            <h1 className="mb-3 text-dark fw-bold">Cart</h1>

            {/* Cart Items */}
            <div className="list-group mb-4">
                {cart.items.map((item) => (
                    <div className="card px-4 py-3 mb-2" key={item.menu_item_id}>
                        <div className="d-flex justify-content-between align-items-center" style={{ position: "relative" }}>
                            <button onClick={() => removeItem(item.menu_item_id)}
                                className="btn btn-sm m-0 p-0 px-2 btn-danger"
                                style={{ position: "absolute", bottom: "90%", left:"100%" }}>x</button>
                            <div className="d-flex align-items-center">
                                <img
                                    src={item.image ? `${BACKEND_URL}${item.image}` : "/no-image.png"}
                                    alt={item.name}
                                    width="60"
                                    height="60"
                                    className="rounded me-3"
                                />
                                <div>
                                    <h6 className="mb-1">{item.name}</h6>
                                    <small className="text-muted">
                                        ₹{item.price} × {item.quantity}
                                    </small>
                                </div>
                            </div>
                            <div className="row">
                                <div className="d-flex align-items-center col-12">
                                    <button onClick={() => updateQuantity(item.menu_item_id, item.quantity - 1)} disabled={item.quantity <= 1} className="btn btn-sm btn-outline-secondary me-2 px-2 py-0 rounded-5">-</button>
                                    <span>{item.quantity}</span>
                                    <button onClick={() => updateQuantity(item.menu_item_id, item.quantity + 1)} className="btn btn-sm btn-outline-success ms-2 px-2 py-0 rounded-5">+</button>
                                </div>
                                <p className="mt-3 col-12 ps-3 my-auto"> ₹{item.price - item.discont} x {item.quantity}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Bill Summary */}
            <div className="card shadow-sm mb-4 p-3">
                <div className="d-flex justify-content-between"><span>Subtotal</span><span>₹{cart.subtotal}</span></div>
                <div className="d-flex justify-content-between"><span>CGST</span><span>₹{cart.cgst}</span></div>
                <div className="d-flex justify-content-between"><span>SGST</span><span>₹{cart.sgst}</span></div>
                <hr />
                <div className="d-flex justify-content-between fw-bold fs-5"><span>Total</span><span>₹{cart.total}</span></div>

                <div className="d-flex justify-content-between mt-3">
                    <button className="btn btn-outline-danger" onClick={clearCart}>Clear Cart</button>
                    <button className="btn btn-outline-success" onClick={handlePlaceOrder} disabled={placingOrder}>{placingOrder ? "Placing Order..." : "Place Order"}</button>
                </div>
            </div>

            {/* --------- FLOATING ADDRESS FORM --------- */}
            {showAddressForm && (
                <div className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ background: "rgba(0,0,0,0.5)", zIndex: 9999 }}>
                    <div className="card p-4 shadow-sm w-25">
                        <h5 className="mb-3">Enter Address</h5>
                        <form onSubmit={proceedAddress}>
                            <div className="row g-2 mb-2 ">
                                <input className="form-control" placeholder="Street" value={street} onChange={e => setStreet(e.target.value)} required />
                                <input className="form-control" placeholder="Area" value={area} onChange={e => setArea(e.target.value)} required />
                                <input className="form-control" placeholder="City" value={city} onChange={e => setCity(e.target.value)} required />
                                <input className="form-control" placeholder="Pincode" value={pincode} onChange={e => setPincode(e.target.value)} required />
                            </div>

                            <div className="d-flex justify-content-between mt-3">
                                <button className="btn btn-secondary" onClick={resetForm}>Reset</button>
                                <button type="Submit" className="btn btn-primary" disabled={loadingBranch}>{loadingBranch ? "Processing..." : "Proceed"}</button>
                            </div>
                        </form>

                        {lat && lon && !detectedBranch && (
                            <div className="mt-3">
                                <h6>Select Branch</h6>
                                <div className="d-flex gap-2">
                                    <button className="btn btn-outline-info" onClick={handleAutoAssign} disabled={loadingBranch}>{loadingBranch ? "Loading..." : "Auto Assign Branch"}</button>
                                    <button className="btn btn-outline-warning" onClick={handleSelectiveBranch} disabled={loadingBranch}>{loadingBranch ? "Loading..." : "Selective Branch"}</button>
                                </div>
                            </div>
                        )}

                        {detectedBranch && (
                            <div className="alert alert-success mt-3">
                                <strong>Branch:</strong> {detectedBranch.branch_name} ({detectedBranch.distance}m)
                                <div className="mt-2">
                                    <button className="btn btn-success" onClick={() => placeOrder(detectedBranch.branch_id)}>Place Order</button>
                                </div>
                            </div>
                        )}

                        {nearbyBranches.length > 0 && (
                            <div className="mt-3">
                                <h6>Select from nearby branches</h6>
                                {nearbyBranches.map(b => (
                                    <div key={b.branch_code} className="d-flex justify-content-between align-items-center mb-2">
                                        <span>{b.branch_name} ({b.distance} m)</span>
                                        <button className="btn btn-sm btn-primary" onClick={() => placeOrder(b.branch_id)}>Select</button>
                                    </div>
                                ))}
                            </div>
                        )}

                        {error && <p className="text-danger mt-2">{error}</p>}
                    </div>
                </div>
            )}
        </div>
    );
}
