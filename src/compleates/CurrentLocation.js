import React, { useState } from "react";

const CurrentLocation = () => {
  const [location, setLocation] = useState({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const getLocation = () => {
    setLocation({ ...location, loading: true, error: null });

    if (!navigator.geolocation) {
      setLocation({
        latitude: null,
        longitude: null,
        loading: false,
        error: "Geolocation is not supported by your browser",
      });
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        });
      },
      (error) => {
        setLocation({
          latitude: null,
          longitude: null,
          loading: false,
          error: error.message,
        });
      },
      {
        enableHighAccuracy: true, // ✅ REQUIRED for mobile
        timeout: 15000,           // ✅ Prevent hanging
        maximumAge: 0,            // ✅ No cached location
      }
    );
  };

  return (
    <div className="container mt-5 text-center">
      <h3>📍 Current Location</h3>

      <button
        className="btn btn-primary mt-3"
        onClick={getLocation}
        disabled={location.loading}
      >
        {location.loading ? "Getting Location..." : "Get Location"}
      </button>

      {location.latitude && location.longitude && (
        <div className="mt-4">
          <p><strong>Latitude:</strong> {location.latitude}</p>
          <p><strong>Longitude:</strong> {location.longitude}</p>

          <a
            href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
            target="_blank"
            rel="noreferrer"
          >
            View on Google Maps
          </a>
        </div>
      )}

      {location.error && (
        <p className="text-danger mt-3">{location.error}</p>
      )}
    </div>
  );
};

export default CurrentLocation;
