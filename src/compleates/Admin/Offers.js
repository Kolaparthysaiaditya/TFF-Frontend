import React, { useEffect, useState } from "react";
import api, { BACKEND_URL } from "../../api/axios";
import OfferModal from "./OfferModal";

function Offers({ eid }) {
  const [offers, setOffers] = useState([]);
  const [status, setStatus] = useState("all");
  const [type, setType] = useState("all");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("add");
  const [selectedOffer, setSelectedOffer] = useState(null);

  const statusPriority = {
    upcoming: 2,
    active: 1,
    expired: 3,
  };


  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    if (!eid) return;
    setLoading(true);
    try {
      const res = await api.get("/TFF/admin/offers/", {
        params: { eid },
      });
      setOffers(res.data.offers || []);
    } catch (err) {
      console.error(err);
      setOffers([]);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- FILTERS ---------------- */

  const filteredOffers = offers
    .filter(o => {
      const statusMatch = status === "all" || o.offer_status === status;
      const typeMatch = type === "all" || o.offer_type === type;
      const searchMatch = o.item_name.toLowerCase().includes(search.toLowerCase());
      return statusMatch && typeMatch && searchMatch;
    })
    .sort((a, b) => {
      return statusPriority[a.offer_status] - statusPriority[b.offer_status];
    });

  const todayOffers = offers.filter(o => o.offer_status === "active");

  /* ---------------- ACTIONS ---------------- */

  const handleAddOffer = () => {
    setModalMode("add");
    setSelectedOffer(null);
    setShowModal(true);
  };

  const handleAddTodayOffer = () => {
    const today = new Date().toISOString().slice(0, 10);
    setModalMode("add");
    setSelectedOffer({
      start_date: today,
      end_date: today,
      is_active: true,
    });
    setShowModal(true);
  };

  const handleEdit = (offer) => {
    setModalMode("edit");
    setSelectedOffer(offer);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this offer?")) return;
    try {
      await api.delete(`/TFF/admin/offers/${id}/delete/`, {
        params: { eid },
      });
      fetchOffers();
    } catch (err) {
      alert(err.response?.data?.detail || "Delete failed");
    }
  };

  const TodayOfferCard = (o) => (
    <div className="mx-5">
      <div className="shadow-sm text-white overflow-hidden rounded-5">
        <div
          className="position-relative w-100"
          style={{
            minHeight: "340px",
            backgroundImage: `url(${BACKEND_URL}${o.image})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div
            className="position-absolute top-0 start-0 w-100 h-100"
            style={{ background: "rgba(0,0,0,0.35)" }}
          />

          <span
            className="badge rounded-pill position-absolute m-2 fs-4 p-3 fw-semibold text-warning bg-dark bg-opacity-75"
            style={{ zIndex: 2, top: "1vh", left: "1vh" }}
          >
            TODAY OFFER {o.start_date}
          </span>

          <span
            className="badge rounded-pill position-absolute m-2 p-3 fs-5"
            style={{ background: "rgba(220,184,6,0.8)", zIndex: 2, top: "1vh", right: "1vh" }}
          >
            {o.display_text}
          </span>

          <div
            className="position-absolute bottom-0 start-0 w-100 p-3 rounded-5"
            style={{
              zIndex: 2,
              background:
                "linear-gradient(to top, rgba(57,71,9,0.85), rgba(25,27,26,0.12))",
            }}
          >
            <h5 className="fw-bold fs-4 mb-2"><i>{o.item_name}</i></h5>
            <p className="mb-3 fs-6 small">{o.item_description}</p>
          </div>
        </div>
      </div>
    </div>
  );


  return (
    <div className="container-fluid py-3">

      {/* FILTER BAR */}
      <div className="mb-3">
        <div className="card-body row g-2 align-items-center">

          <div className="col-12 col-md-6 col-lg-3 btn-group">
            {["all", "active", "upcoming", "expired"].map(s => (
              <button
                key={s}
                className={`btn btn-sm ${status === s ? "btn-primary" : "btn-outline-primary"}`}
                onClick={() => setStatus(s)}
              >
                {s.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="col-12 col-md-6 col-lg-3 btn-group">
            {["all", "percentage", "upto", "flat"].map(t => (
              <button
                key={t}
                className={`btn btn-sm ${type === t ? "btn-success" : "btn-outline-success"}`}
                onClick={() => setType(t)}
              >
                {t.toUpperCase()}
              </button>
            ))}
          </div>

          <div className="col-12 col-lg-6 ms-auto">
            <input
              className="form-control form-control-sm"
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* TODAY OFFER */}
      <div className="mb-4">
        <div className="d-flex justify-content-between mb-2">
          {todayOffers.length === 0 && (
            <button className="btn btn-sm btn-primary" onClick={handleAddTodayOffer}>
              + Add Today Offer
            </button>
          )}
        </div>

        {todayOffers.length === 0 ? (
          <div className="text-muted">No active offer today</div>
        ) : (
          (todayOffers.length === 1 ?
            (todayOffers.length === 1 && TodayOfferCard(todayOffers[0]))
            :
            (
              todayOffers.length > 1 && (
                <div
                  id="todayOfferCarousel"
                  className="carousel slide"
                  data-bs-ride="carousel"
                >
                  <div className="carousel-inner">
                    {todayOffers.map((o, index) => (
                      <div
                        key={o.id}
                        className={`carousel-item ${index === 0 ? "active" : ""}`}
                      >
                        {TodayOfferCard(o)}
                      </div>
                    ))}
                  </div>

                  <button
                    className="carousel-control-prev"
                    type="button"
                    data-bs-target="#todayOfferCarousel"
                    data-bs-slide="prev"
                  >
                    <span className="carousel-control-prev-icon" />
                  </button>

                  <button
                    className="carousel-control-next"
                    type="button"
                    data-bs-target="#todayOfferCarousel"
                    data-bs-slide="next"
                  >
                    <span className="carousel-control-next-icon" />
                  </button>
                </div>
              )
            )

          )
        )}
      </div>

      {/* ALL OFFERS */}
      <div class="no-card-hover">
        <div className="card">
          <div className="card-header d-flex justify-content-between mb-2">
            <b>All Offers</b>
            <button className="btn btn-sm btn-primary" onClick={handleAddOffer}>
              + Add Offer
            </button>
          </div>

          <div className="list-group list-group-flush">
            {loading && <div className="list-group-item">Loading...</div>}

            {!loading && filteredOffers.length === 0 && (
              <div className="list-group-item">No offers found</div>
            )}

            {filteredOffers.map(o => (
              <div key={o.id} className="list-group-item d-flex gap-3">
                <div className="flex-grow-1 d-flex">

                  <img src={`${BACKEND_URL}${o.image}`} alt="" width="90" height="70" className="rounded-3 ms-2" />
                  <div className="ms-4">
                    <h5 className="text-center">{o.item_name}</h5>
                    <p className="my-auto">{o.display_text}</p>
                  </div>
                </div>
                <p className="flex-grow-1 m-auto me-5 pe-5">
                  <span className="bg-success text-light px-3 p-1 rounded-5 me-2">{o.start_date}</span>
                  <i class="bi bi-arrow-right text-warning fs-5 fw-bold me-2"></i>
                  <span className="bg-danger text-light px-3 p-1 rounded-5">{o.end_date}</span>
                </p>

                <div className="text-end m-auto">
                  <p className={`badge mb-2 p-2 w-100 
                  ${o.offer_status === "active"
                      ? "bg-success"
                      : o.offer_status === "expired"
                        ? "bg-danger"
                        : "bg-primary"
                    }`}>
                    {o.offer_status.toUpperCase()}
                  </p>

                  {o.can_edit && (
                    <div className="row gap-1">
                      <button className="btn btn-sm btn-outline-warning col-12" onClick={() => handleEdit(o)}>
                        Edit
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(o.id)}>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <OfferModal
        show={showModal}
        onClose={() => setShowModal(false)}
        mode={modalMode}
        offer={selectedOffer}
        eid={eid}
        refresh={fetchOffers}
      />
    </div >
  );
}

export default Offers;
