import React, { useEffect, useState } from "react";
import api from "../../api/axios";

function OfferModal({ show, onClose, mode, offer, eid, refresh }) {

  const emptyForm = {
    title: "",
    description: "",
    menu_item: "",
    offer_type: "percentage",
    discount_value: "",
    start_date: "",
    end_date: "",
    is_active: true,
  };

  const [form, setForm] = useState(emptyForm);
  const [menuItems, setMenuItems] = useState([]);

  useEffect(() => {
    if (show) {
      api.get("/TFF/menu/offer-items/")
        .then(res => setMenuItems(res.data))
        .catch(console.error);
    }
  }, [show]);

  useEffect(() => {
    if (mode === "edit" && offer) {
      setForm({
        title: offer.title,
        description: offer.description,
        menu_item: offer.item_name, // ✅ FIX
        offer_type: offer.offer_type,
        discount_value: offer.discount_value,
        start_date: offer.start_date,
        end_date: offer.end_date,
        is_active: offer.is_active,
      });
    } else if (mode === "add") {
      setForm({ ...emptyForm, ...offer });
    }
  }, [mode, offer]);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async () => {
    try {
      if (mode === "edit") {
        await api.put(`/TFF/admin/offers/${offer.id}/update/`, {
          ...form,
          eid,
        });
      } else {
        await api.post("/TFF/offers/create/", {
          ...form,
          eid,
        });
      }
      refresh();
      onClose();
    } catch (err) {
      alert(JSON.stringify(err.response?.data || "Error", null, 2));
    }
  };

  if (!show) return null;

  return (
    <div className="modal fade show d-block bg-dark bg-opacity-50">
      <div className="modal-dialog">
        <div className="modal-content rounded-5" style={{ backgroundColor: "rgba(0,0,0,0.8)", }}>

          <div className="modal-header text-white border-0 brand-title pb-0">
            <h3>{mode === "edit" ? "Edit Offer" : "Add Offer"}</h3>
            <button className="btn-close fs-5 btn-close-white" onClick={onClose}></button>
          </div>

          <div className="modal-body">
            {mode === "edit" && <h6 className="text-light fs-4 m-auto mb-3">{form.menu_item}</h6>}
            <div className="form-floating mb-3">
              <input
                className="form-control rounded-5 mb-2 ps-5 text-light"
                name="title" value={form.title}
                onChange={handleChange}
                placeholder="Title"
                style={{ backgroundColor: "rgba(240, 237, 230, 0.2)" }}
              />
              <label htmlFor="floatingUsername" className="text-light">
                <i className="bi bi-caret-right-fill text-light ms-3"></i> Title
              </label>
            </div>

            {mode !== "edit" &&

              <select className="form-control mb-2 rounded-5 ps-4 text-light" name="menu_item" value={form.menu_item} onChange={handleChange} style={{ backgroundColor: "rgba(240, 237, 230, 0.2)" }}>
                <option value={form.menu_item} style={{ backgroundColor: "rgba(8, 6, 1, 0.7" }}>Select Menu Item</option>
                {menuItems.map(i => (
                  <option className="rounded-5" key={i.id} value={i.id} style={{ backgroundColor: "rgba(8, 6, 1, 0.7)" }}>
                    {i.name} – ₹{i.price}
                  </option>
                ))}
              </select>
            }

            <select className="form-control mb-2 rounded-5 text-light ps-4" name="offer_type" value={form.offer_type} onChange={handleChange} style={{ backgroundColor: "rgba(240, 237, 230, 0.2)" }}>
              <option style={{ backgroundColor: "rgba(20, 15, 3, 0.88)" }} value="percentage">Percentage</option>
              <option style={{ backgroundColor: "rgba(20, 15, 3, 0.88)" }} value="upto">Upto %</option>
              <option style={{ backgroundColor: "rgba(20, 15, 3, 0.88)" }} value="flat">Flat ₹</option>
            </select>


            <div className="form-floating mb-3">
              <input
                className="form-control mb-2 rounded-5 text-light ps-5"
                type="number" name="discount_value"
                value={form.discount_value}
                onChange={handleChange}
                placeholder="Discount"
                style={{ backgroundColor: "rgba(240, 237, 230, 0.2)" }}
              />
              <label htmlFor="floatingUsername" className="text-light">
                <i className="bi bi-currency-rupee text-light ms-3"></i> Dicount Value
              </label>
            </div>

            <div className="form-floating mb-3">
              <input className="form-control mb-2 rounded-5 ps-5 text-light" type="date" name="start_date" value={form.start_date} onChange={handleChange} style={{ backgroundColor: "rgba(240, 237, 230, 0.2)" }} />
              <label htmlFor="floatingUsername" className="text-light">
                <i className="bi bi-calendar-event-fill me-2 text-light ms-3"></i> Starting Date
              </label>
            </div>

            <div className="form-floating mb-3">
              <input className="form-control mb-2 rounded-5 ps-5 text-light" type="date" name="end_date" value={form.end_date} onChange={handleChange} style={{ backgroundColor: "rgba(240, 237, 230, 0.2)" }} />
              <label htmlFor="floatingUsername" className="text-light">
                <i className="bi bi-calendar-event-fill me-2 text-light ms-3"></i> Ending Date
              </label>
            </div>

            <div className="form-check">
              <input className="form-check-input" type="checkbox" name="is_active" checked={form.is_active} onChange={handleChange} />
              <label className="form-check-label text-light">Active</label>
            </div>
          </div>

          <div className="m-4 border-0 gap-2 row">
            <button className="btn btn-secondary col-5" onClick={onClose}>Cancel</button>
            <button className="btn btn-primary   col-6 ms-2a" onClick={handleSubmit}>
              {mode === "edit" ? "Update" : "Create"}
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

export default OfferModal;
