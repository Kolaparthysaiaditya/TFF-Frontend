import { local } from "../../Utilies/common";

export default function FoodCard({ item }) {
  return (
    <div className="col-sm-6 col-md-4 col-lg-3">
      <div className="card h-100 shadow-sm border-0 rounded-4 food-hover">
        {/* Image */}
        <div className="position-relative">
          <img
            src={item.image?.replace('127.0.0.1', local.ip) || "nont"}
            alt={item.name}
            className="card-img-top rounded-top-4"
            style={{ height: "180px", objectFit: "cover" }}
          />
          <span className="badge bg-success position-absolute top-0 end-0 m-2 px-3 py-2 rounded-pill">
            ₹{item.price}
          </span>
        </div>

        {/* Body */}
        <div className="card-body d-flex justify-content-between align-items-center p-3">
          <div>
            <h6 className="fw-semibold mb-1">{item.name}</h6>
            <small className="text-muted">Best Seller</small>
          </div>
          <button className="btn btn-outline-primary btn-sm rounded-pill px-3">
            <i className="bi bi-plus"></i>
          </button>
        </div>
      </div>
    </div>
  );
}
