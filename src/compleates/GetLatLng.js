import { useState } from "react";
import api from "../api/axios";

export default function GetLatLng() {
  const [street, setStreet] = useState("");
  const [area, setArea] = useState("");
  const [city, setCity] = useState("");
  const [pincode, setPincode] = useState("");

  const [lat, setLat] = useState(null);
  const [lon, setLon] = useState(null);

  const [branch, setBranch] = useState(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const getLatLngAndBranch = async () => {
    setLoading(true);
    setError("");
    setLat(null);
    setLon(null);
    setBranch(null);

    const queries = [
      `${street}, ${area}, ${city}, ${pincode}, Andhra Pradesh, India`,
      `${area}, ${city}, ${pincode}, Andhra Pradesh, India`,
      `${city}, ${pincode}, Andhra Pradesh, India`,
      `${city}, Andhra Pradesh, India`,
    ];

    try {
      // 1️⃣ ADDRESS → LAT/LON
      let location = null;

      for (const q of queries) {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`,
          {
            headers: { "User-Agent": "TheFoodForest/1.0" },
          }
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

      // 2️⃣ CALL YOUR API
      const branchRes = await api.get(
        `/TFF/nearest-branch/?lat=${latitude}&lon=${longitude}`
      );

      if (branchRes.data?.branch_name) {
        setBranch(branchRes.data);
      } else {
        setError("No nearby branch found");
      }
    } catch (err) {
      console.error(err);
      setError("Failed to detect branch");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="card shadow-sm mb-3">
      <div className="card-header fw-semibold">
        Detect Branch by Address
      </div>

      <div className="card-body row g-2">
        <div className="col-md-3">
          <input className="form-control" placeholder="Street"
            value={street} onChange={(e) => setStreet(e.target.value)} />
        </div>

        <div className="col-md-3">
          <input className="form-control" placeholder="Area"
            value={area} onChange={(e) => setArea(e.target.value)} />
        </div>

        <div className="col-md-3">
          <input className="form-control" placeholder="City"
            value={city} onChange={(e) => setCity(e.target.value)} />
        </div>

        <div className="col-md-3">
          <input className="form-control" placeholder="Pincode"
            value={pincode} onChange={(e) => setPincode(e.target.value)} />
        </div>

        <div className="col-12">
          <button className="btn btn-primary w-100"
            onClick={getLatLngAndBranch}
            disabled={loading}>
            {loading ? "Detecting..." : "Get Branch"}
          </button>
        </div>

        {/* 📍 LAT / LON */}
        {lat && lon && (
          <div className="alert alert-success mt-2">
            <strong>Latitude:</strong> {lat}<br />
            <strong>Longitude:</strong> {lon}
          </div>
        )}

        {/* 🏪 BRANCH */}
        {branch && (
          <div className="alert alert-info mt-2">
            <strong>Nearest Branch:</strong> {branch.branch_name}<br />
            <strong>Code:</strong> {branch.branch_code}<br />
            <strong>Distance:</strong> {branch.distance} meters
          </div>
        )}

        {error && <p className="text-danger mt-2">{error}</p>}
      </div>
    </div>
  );
}
