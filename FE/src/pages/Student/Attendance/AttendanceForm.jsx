import React, { useState, useEffect } from "react";
import API from "@/api/axios";
import Swal from "sweetalert2";
import { MapPin, Loader2, Navigation } from "lucide-react";

export default function AttendanceForm() {
  const [type, setType] = useState("Class");
  const [attended, setAttended] = useState("Yes");
  const [reason, setReason] = useState("");
  const [location, setLocation] = useState(null);
  const [locationLoading, setLocationLoading] = useState(false);
  const [locationError, setLocationError] = useState("");

  const getLocation = () => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }
    setLocationLoading(true);
    setLocationError("");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocation({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
          locationName: `${pos.coords.latitude.toFixed(5)}, ${pos.coords.longitude.toFixed(5)}`,
        });
        setLocationLoading(false);
      },
      () => {
        setLocationError("Could not get location. Please allow location access.");
        setLocationLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  // Auto-request location on mount
  useEffect(() => {
    getLocation();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        type,
        attended,
        reason: attended === "No" ? reason : null,
        latitude: location?.latitude ?? null,
        longitude: location?.longitude ?? null,
        locationName: location?.locationName ?? null,
      };
      const res = await API.post("/attendance", payload);

      Swal.fire({
        icon: "success",
        title: "Attendance Submitted",
        text: res.data.message,
        timer: 2000,
        showConfirmButton: false,
      });

      setType("Class");
      setAttended("Yes");
      setReason("");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Oops!",
        text: err.response?.data?.error || "Failed to submit attendance",
      });
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Type */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Type</label>
          <div className="flex justify-between">
            {["Class", "Practicum"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setType(option)}
                className={`flex-1 mx-1 py-2 rounded-lg font-medium transition-all ${
                  type === option
                    ? "bg-indigo-600 text-white shadow"
                    : "bg-gray-100 text-gray-700 hover:bg-indigo-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Attended */}
        <div>
          <label className="block text-gray-700 mb-2 font-medium">Attended</label>
          <div className="flex justify-between">
            {["Yes", "No"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setAttended(option)}
                className={`flex-1 mx-1 py-2 rounded-lg font-medium transition-all ${
                  attended === option
                    ? option === "Yes"
                      ? "bg-green-500 text-white"
                      : "bg-red-500 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-50"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Reason */}
        {attended === "No" && (
          <div>
            <label className="block text-gray-700 mb-2 font-medium">Reason</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-indigo-500"
              required
            >
              <option value="">Select reason</option>
              <option value="Sick">🤒 Sick</option>
              <option value="At Work">💼 At Work</option>
              <option value="Other">📝 Other</option>
            </select>
          </div>
        )}

        {/* GPS Location */}
        <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-indigo-700 font-medium">
              <MapPin size={18} />
              <span>GPS Location</span>
            </div>
            <button
              type="button"
              onClick={getLocation}
              disabled={locationLoading}
              className="flex items-center gap-1 text-xs px-3 py-1.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition disabled:opacity-60"
            >
              {locationLoading ? <Loader2 size={13} className="animate-spin" /> : <Navigation size={13} />}
              {locationLoading ? "Locating..." : "Refresh"}
            </button>
          </div>

          {locationError && (
            <p className="text-red-500 text-sm mb-2">{locationError}</p>
          )}

          {location ? (
            <div className="space-y-2">
              <p className="text-sm text-gray-600 flex items-center gap-1">
                <MapPin size={13} className="text-indigo-400" />
                <span className="font-mono">{location.latitude.toFixed(5)}, {location.longitude.toFixed(5)}</span>
              </p>
              {/* OpenStreetMap embed */}
              <div className="rounded-xl overflow-hidden border border-indigo-200 mt-2" style={{ height: "200px" }}>
                <iframe
                  title="Attendance Location Map"
                  width="100%"
                  height="200"
                  style={{ border: 0 }}
                  loading="lazy"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${location.longitude - 0.005},${location.latitude - 0.005},${location.longitude + 0.005},${location.latitude + 0.005}&layer=mapnik&marker=${location.latitude},${location.longitude}`}
                />
              </div>
              <p className="text-xs text-gray-400 text-center mt-1">
                <a
                  href={`https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=16/${location.latitude}/${location.longitude}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-500 hover:underline"
                >
                  Open in OpenStreetMap ↗
                </a>
              </p>
            </div>
          ) : !locationLoading && (
            <p className="text-sm text-gray-400 italic">Location not captured yet. Click "Refresh" to try again.</p>
          )}
          {locationLoading && (
            <div className="flex items-center gap-2 text-indigo-400 text-sm">
              <Loader2 size={15} className="animate-spin" />
              Getting your location...
            </div>
          )}
        </div>

        <button
          type="submit"
          className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg hover:bg-indigo-700 transition-all"
        >
          Submit Attendance
        </button>
      </form>
    </div>
  );
}
