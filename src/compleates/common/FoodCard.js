import { BACKEND_URL } from "../../api/axios";
import api from "../../api/axios";
import { useState } from "react";

export default function FoodCard({ item, branchId, user }) {
  const [loading, setLoading] = useState(false);
  

  const imageUrl = item.image
    ? `${BACKEND_URL}${item.image}`
    : "/no-image.png";

  const handleAddToCart = async () => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }

    setLoading(true);

    try {
      await api.post("/TFF/cart/add/", {
        id: user.id,
        menu_item_id: item.id,
        quantity: 1, // ✅ always 1
      });

      alert("Item added to cart 🛒");
    } catch (error) {
      console.error("Add to cart failed", error);
      alert("Failed to add item to cart");
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="col-sm-6 col-md-4 col-lg-3">
      <div className="card h-100 shadow-sm border-0 rounded-4 food-hover">

        {/* Image */}
        <div className="position-relative">
          <img
            src={imageUrl}
            alt={item.name}
            className="card-img-top rounded-top-4"
            style={{ height: "180px", objectFit: "cover" }}
          />

          {item.discontPrice < item.price && item.discontPrice !== 0 ? (
            <span className="badge bg-info position-absolute top-0 end-0 m-2 px-3 py-2 rounded-pill">
              <i>
                <del className="me-2 text-danger opacity-75">
                  ₹{item.price}
                </del>
                <strong className="text-dark">₹{item.discontPrice}</strong>
              </i>
            </span>
          ) : (
            <span className="badge bg-success position-absolute top-0 end-0 m-2 px-3 py-2 rounded-pill">
              <strong>₹{item.price}</strong>
            </span>
          )}


        </div>

        {/* Body */}
        <div className="card-body d-flex justify-content-between align-items-center p-3">
          <div>
            <h6 className="fw-semibold mb-1">{item.name}</h6>
            <small className="text-muted">
              Best Seller
            </small>
          </div>

          <button
            className="btn btn-outline-primary btn-sm rounded-pill px-3"
            onClick={handleAddToCart}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-border spinner-border-sm"></span>
            ) : (
              <i className="bi bi-cart-plus-fill"></i>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
