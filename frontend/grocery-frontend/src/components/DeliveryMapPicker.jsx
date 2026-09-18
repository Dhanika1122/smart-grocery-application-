import React, { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { Navigation, MapPin, Check, X, Home, Briefcase, Store, Compass } from "lucide-react";

export default function DeliveryMapPicker({
  initialLat = 17.38504,
  initialLng = 78.48667,
  initialAddress = "",
  initialLandmark = "",
  initialLabel = "Home",
  showSaveOption = true,
  onConfirm,
  onCancel,
}) {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerInstanceRef = useRef(null);

  const [lat, setLat] = useState(initialLat || 17.38504);
  const [lng, setLng] = useState(initialLng || 78.48667);
  const [address, setAddress] = useState(initialAddress || "");
  const [landmark, setLandmark] = useState(initialLandmark || "");
  const [label, setLabel] = useState(initialLabel || "Home");
  const [saveLocation, setSaveLocation] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);
  const [geocoding, setGeocoding] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) return; // Prevent double init

    const L = window.L;
    if (!L) {
      console.error("Leaflet library not loaded");
      return;
    }

    const startLat = lat;
    const startLng = lng;

    const map = L.map(mapContainerRef.current, {
      center: [startLat, startLng],
      zoom: 15,
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors',
    }).addTo(map);

    const customIcon = L.divIcon({
      className: "custom-leaflet-pin",
      html: `<div style="background-color: #10b981; width: 36px; height: 36px; border-radius: 50%; border: 3px solid white; display: flex; items-center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); font-size: 18px; color: white; align-items: center; justify-content: center;">📍</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 36],
    });

    const marker = L.marker([startLat, startLng], {
      draggable: true,
      icon: customIcon,
    }).addTo(map);

    marker.on("dragend", (e) => {
      const position = e.target.getLatLng();
      setLat(position.lat);
      setLng(position.lng);
      reverseGeocode(position.lat, position.lng);
    });

    map.on("click", (e) => {
      const { lat: clickLat, lng: clickLng } = e.latlng;
      marker.setLatLng([clickLat, clickLng]);
      setLat(clickLat);
      setLng(clickLng);
      reverseGeocode(clickLat, clickLng);
    });

    mapInstanceRef.current = map;
    markerInstanceRef.current = marker;

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update map center when coordinates change programmatically
  const updateMapPosition = (newLat, newLng) => {
    setLat(newLat);
    setLng(newLng);
    if (mapInstanceRef.current && markerInstanceRef.current) {
      mapInstanceRef.current.setView([newLat, newLng], 16);
      markerInstanceRef.current.setLatLng([newLat, newLng]);
    }
    reverseGeocode(newLat, newLng);
  };

  // Reverse Geocoding with OpenStreetMap Nominatim
  const reverseGeocode = async (latitude, longitude) => {
    try {
      setGeocoding(true);
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`
      );
      if (response.ok) {
        const data = await response.json();
        if (data && data.display_name) {
          setAddress(data.display_name);
        }
      }
    } catch (err) {
      console.warn("Reverse geocode failed:", err);
    } finally {
      setGeocoding(false);
    }
  };

  // GPS Location Handler
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }

    setFetchingGps(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setFetchingGps(false);
        const { latitude, longitude } = position.coords;
        updateMapPosition(latitude, longitude);
        toast.success("Location acquired from GPS!");
      },
      (err) => {
        setFetchingGps(false);
        console.error("GPS Error:", err);
        let msg = "Could not get current location.";
        if (err.code === 1) {
          msg = "Location permission was denied. Please enable permission or select your location manually on the map.";
        } else if (err.code === 2) {
          msg = "Position unavailable. Please select your location manually on the map.";
        } else if (err.code === 3) {
          msg = "Location request timed out. Please try again or select manually.";
        }
        toast.warn(msg);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleConfirm = () => {
    if (!address.trim()) {
      toast.error("Please enter a valid delivery address.");
      return;
    }
    if (lat == null || lng == null || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      toast.error("Invalid coordinates selected on map.");
      return;
    }

    onConfirm({
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
      address: address.trim(),
      landmark: landmark.trim(),
      label: label.trim() || "Home",
      saveLocation,
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="text-emerald-600" size={20} /> Select Delivery Location on Map
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Click anywhere on the map or drag the pin to set your exact delivery point.
          </p>
        </div>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={fetchingGps}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition shadow-md shrink-0"
        >
          <Navigation size={14} className={fetchingGps ? "animate-spin" : ""} />
          {fetchingGps ? "Acquiring GPS..." : "📍 Use Current Location"}
        </button>
      </div>

      {/* Map Container */}
      <div className="relative w-full h-64 sm:h-72 rounded-3xl overflow-hidden border-2 border-emerald-500/30 shadow-inner z-0">
        <div ref={mapContainerRef} className="w-full h-full" />

        {geocoding && (
          <div className="absolute top-3 right-3 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-200 shadow z-10 flex items-center gap-1.5">
            <Compass size={14} className="animate-spin text-emerald-600" /> Fetching address...
          </div>
        )}
      </div>

      {/* Lat/Lng display pill */}
      <div className="flex items-center justify-between text-xs px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
        <span>Latitude: {lat ? lat.toFixed(6) : "—"}</span>
        <span>Longitude: {lng ? lng.toFixed(6) : "—"}</span>
      </div>

      {/* Address Form Inputs */}
      <div className="space-y-3 bg-white/50 dark:bg-slate-900/40 p-4 rounded-3xl border border-white/60 dark:border-white/10">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Location Label *
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {[
              { id: "Home", icon: Home, text: "Home" },
              { id: "Office", icon: Briefcase, text: "Office" },
              { id: "Shop", icon: Store, text: "Shop" },
              { id: "Other", icon: MapPin, text: "Other" },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = label === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setLabel(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition ${
                    isSelected
                      ? "bg-emerald-600 text-white border-emerald-600 shadow"
                      : "bg-white/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-emerald-500"
                  }`}
                >
                  <Icon size={14} /> {item.text}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Delivery Address *
          </label>
          <textarea
            rows={2}
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            placeholder="Door No, Street Name, Area, City..."
            className="w-full rounded-2xl px-3.5 py-2 text-xs bg-white/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
            Landmark (Optional)
          </label>
          <input
            type="text"
            value={landmark}
            onChange={(e) => setLandmark(e.target.value)}
            placeholder="e.g. Near ABC School, Opposite Water Tank"
            className="w-full rounded-2xl px-3.5 py-2 text-xs bg-white/80 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-700 outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>

        {showSaveOption && (
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="saveLocationCheck"
              checked={saveLocation}
              onChange={(e) => setSaveLocation(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
            <label htmlFor="saveLocationCheck" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Save this location to my profile for future orders
            </label>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-3 pt-2">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 rounded-2xl text-xs font-bold bg-slate-500/20 text-slate-700 dark:text-slate-300 hover:bg-slate-500/30 transition flex items-center gap-1"
          >
            <X size={14} /> Cancel
          </button>
        )}
        <button
          type="button"
          onClick={handleConfirm}
          className="px-5 py-2.5 rounded-2xl text-xs font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 text-white hover:shadow-lg transition flex items-center gap-1.5 shadow"
        >
          <Check size={16} /> Confirm & Use This Location
        </button>
      </div>
    </div>
  );
}
