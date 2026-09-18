import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "react-toastify";
import { MapPin, Navigation, Plus, Home, Briefcase, Store, CheckCircle, ShieldAlert } from "lucide-react";
import DeliveryMapPicker from "../components/DeliveryMapPicker";

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deliverySettings, setDeliverySettings] = useState({ deliveryFee: 40, freeDeliveryMinimum: 500 });

  // Checkout sequence state
  const [step, setStep] = useState(1);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  // Saved Locations & Map Picker State
  const [savedLocations, setSavedLocations] = useState([]);
  const [selectedLocationId, setSelectedLocationId] = useState(null);
  const [confirmedLocationData, setConfirmedLocationData] = useState(null);
  const [showMapPickerModal, setShowMapPickerModal] = useState(false);
  const [mapInitialData, setMapInitialData] = useState({});

  // Form State for Customer Info & Payment
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    paymentMethod: "COD",
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch Cart, Products, Saved Locations, and Delivery Settings
  const fetchCheckoutData = async () => {
    try {
      setLoading(true);
      const [cartRes, productRes, locationsRes, settingsRes] = await Promise.all([
        API.get("/cart"),
        API.get("/products"),
        API.get("/api/locations").catch(() => ({ data: [] })),
        API.get("/api/delivery-settings").catch(() => ({ data: { deliveryFee: 40, freeDeliveryMinimum: 500 } })),
      ]);
      setCartItems(cartRes.data || []);
      setProducts(productRes.data || []);

      if (settingsRes.data) {
        setDeliverySettings({
          deliveryFee: Number(settingsRes.data.deliveryFee ?? 40),
          freeDeliveryMinimum: Number(settingsRes.data.freeDeliveryMinimum ?? 500),
        });
      }

      const locs = locationsRes.data || [];
      setSavedLocations(locs);

      // Pre-fill user details from localStorage if available
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setFormData((prev) => ({
          ...prev,
          name: prev.name || storedUser.name || "",
          phone: prev.phone || storedUser.phone || "",
        }));
      } catch {
        /* ignore */
      }

      // Auto-select first saved location if available as convenient default, but requiring customer confirmation
      if (locs.length > 0) {
        setSelectedLocationId(locs[0].id);
      }

      setLoading(false);
    } catch (error) {
      console.error("Failed to load checkout data:", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCheckoutData();
  }, []);

  const getProduct = (productId) => {
    return products.find((p) => p.id === productId);
  };

  const subtotal = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const product = getProduct(item.productId);
      if (!product) return total;
      return total + product.price * item.quantity;
    }, 0);
  }, [cartItems, products]);

  const calculatedDeliveryFee = useMemo(() => {
    if (subtotal <= 0) return 0;
    return subtotal >= deliverySettings.freeDeliveryMinimum ? 0 : deliverySettings.deliveryFee;
  }, [subtotal, deliverySettings]);

  const totalPrice = useMemo(() => {
    return Math.max(0, subtotal + calculatedDeliveryFee);
  }, [subtotal, calculatedDeliveryFee]);

  const neededForFreeDelivery = useMemo(() => {
    return Math.max(0, deliverySettings.freeDeliveryMinimum - subtotal);
  }, [subtotal, deliverySettings]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleSelectSavedLocation = (loc) => {
    setSelectedLocationId(loc.id);
    setConfirmedLocationData(null); // Clear custom map data
  };

  const handleOpenMapForNew = () => {
    setMapInitialData({
      lat: 17.38504,
      lng: 78.48667,
      address: "",
      landmark: "",
      label: "Home",
    });
    setShowMapPickerModal(true);
  };

  const handleOpenMapForGps = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setMapInitialData({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          address: "",
          landmark: "",
          label: "Current Location",
        });
        setShowMapPickerModal(true);
      },
      (err) => {
        console.warn("GPS failed, opening map:", err);
        toast.info("Could not fetch GPS automatically. Please select on map.");
        handleOpenMapForNew();
      }
    );
  };

  const handleConfirmMapLocation = (locationData) => {
    setConfirmedLocationData(locationData);
    setSelectedLocationId(null); // Clear saved location radio
    setShowMapPickerModal(false);
    toast.success("Delivery location confirmed for this order!");
  };

  const validateCheckoutForm = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Full Name is required.";
    if (!formData.phone.trim()) errors.phone = "Phone number is required.";
    else if (!/^\d{10}$/.test(formData.phone.trim())) {
      errors.phone = "Phone must be exactly 10 digits.";
    }

    if (!selectedLocationId && !confirmedLocationData) {
      errors.location = "Please select or confirm a delivery location before placing your order.";
      toast.error(errors.location);
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const submitOrderToServer = async (paymentDetails = null) => {
    const items = cartItems
      .filter((item) => getProduct(item.productId))
      .map((item) => ({
        productId: item.productId,
        quantity: item.quantity,
      }));

    if (items.length === 0) {
      throw new Error("Cart is empty");
    }

    const orderData = {
      items,
      quantity: items.reduce((sum, item) => sum + item.quantity, 0),
      name: formData.name.trim(),
      phone: formData.phone.trim(),
      paymentMethod: formData.paymentMethod,
      paymentStatus: paymentDetails ? "PAID" : "PENDING",
    };

    if (selectedLocationId) {
      orderData.deliveryLocationId = selectedLocationId;
      const chosen = savedLocations.find((l) => l.id === selectedLocationId);
      if (chosen) {
        orderData.address = chosen.address;
      }
    } else if (confirmedLocationData) {
      orderData.deliveryLatitude = confirmedLocationData.latitude;
      orderData.deliveryLongitude = confirmedLocationData.longitude;
      orderData.deliveryAddress = confirmedLocationData.address;
      orderData.address = confirmedLocationData.address;
      orderData.deliveryLandmark = confirmedLocationData.landmark;
      orderData.deliveryLocationLabel = confirmedLocationData.label;
      orderData.saveLocation = Boolean(confirmedLocationData.saveLocation);
    }

    if (paymentDetails) {
      orderData.razorpayOrderId = paymentDetails.razorpay_order_id;
      orderData.razorpayPaymentId = paymentDetails.razorpay_payment_id;
    }

    console.log("Submitting Order Payload:", orderData);
    const orderResponse = await API.post("/orders", orderData);
    console.log("Order response:", orderResponse.data);

    setCartItems([]);
    setStep(3);
    setIsPlacingOrder(false);
  };

  const placeOrder = async () => {
    if (!validateCheckoutForm()) return;
    if (cartItems.length === 0) {
      toast.error("Your cart is empty.");
      return;
    }
    setIsPlacingOrder(true);

    try {
      if (formData.paymentMethod === "ONLINE") {
        const res = await loadRazorpayScript();
        if (!res) {
          toast.error("Failed to load Razorpay SDK. Are you online?");
          setIsPlacingOrder(false);
          return;
        }

        const keyRes = await API.get("/api/payment/key");
        const fetchedRazorpayKey = keyRes.data?.key;

        const createOrderRes = await API.post("/api/payment/create-order", {
          amount: Number(totalPrice.toFixed(2)),
        });

        const { orderId, order_id, amount, currency, key } = createOrderRes.data;
        const backendOrderId = order_id || orderId;
        const razorpayKey = key || fetchedRazorpayKey;

        if (!razorpayKey || !backendOrderId) {
          throw new Error("Missing Razorpay key or order_id from backend");
        }

        const options = {
          key: razorpayKey,
          amount: amount,
          currency: currency || "INR",
          name: "Dhanika",
          description: "Grocery Order Payment",
          order_id: backendOrderId,
          handler: async function (response) {
            try {
              const verifyRes = await API.post("/api/payment/verify", {
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              });

              if (verifyRes.data.status === "success") {
                toast.success("Payment Successful 🎉");
                await submitOrderToServer(response);
              }
            } catch (err) {
              toast.error(err?.response?.data?.message || "Payment Verification Failed");
              setIsPlacingOrder(false);
            }
          },
          prefill: {
            name: formData.name,
            contact: formData.phone,
          },
          theme: {
            color: "#10b981",
          },
          modal: {
            ondismiss: function () {
              toast.error("Payment Cancelled ❌");
              setIsPlacingOrder(false);
            },
          },
        };

        const paymentObject = new window.Razorpay(options);
        paymentObject.open();
      } else {
        // COD path
        await new Promise((resolve) => setTimeout(resolve, 600));
        await submitOrderToServer();
      }
    } catch (error) {
      console.error("Checkout flow failed:", error);
      toast.error(error?.response?.data?.message || error?.message || "Failed to place order. Try again.");
      setIsPlacingOrder(false);
    }
  };

  if (loading) {
    return (
      <div className="px-4 sm:px-6 lg:px-10 py-10">
        <div className="rounded-3xl bg-white/55 backdrop-blur-xl border border-white/60 p-6 sm:p-8 animate-pulse">
          <div className="h-6 w-40 bg-slate-200 rounded" />
          <div className="mt-4 h-4 w-64 bg-slate-200 rounded" />
          <div className="mt-6 h-10 w-full bg-slate-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  const activeConfirmedLocationText = selectedLocationId
    ? savedLocations.find((l) => l.id === selectedLocationId)?.address
    : confirmedLocationData?.address;

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-10 min-h-screen">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-3xl bg-white/55 dark:bg-slate-900/50 backdrop-blur-xl border border-white/60 dark:border-white/10
          shadow-[0_25px_70px_rgba(0,0,0,0.10)] p-6 sm:p-8 relative overflow-hidden max-w-4xl mx-auto"
      >
        <div
          className="absolute inset-0 opacity-70 pointer-events-none"
          style={{
            background:
              "radial-gradient(900px circle at 15% 0%, rgba(16,185,129,0.24), transparent 45%), radial-gradient(700px circle at 90% 40%, rgba(250,204,21,0.18), transparent 45%)",
          }}
        />

        <div className="relative z-10">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white">
                Checkout
              </h1>
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                Confirm your order items and select delivery location.
              </p>
            </div>

            {(step === 1 || step === 2) && (
              <div className="rounded-2xl bg-white/60 dark:bg-slate-800/60 border border-white/70 dark:border-white/10 px-5 py-3 flex flex-col items-end">
                <div className="text-xs text-slate-500 font-medium">To Pay</div>
                <div className="text-xl font-extrabold text-emerald-600">
                  ₹{totalPrice}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 flex gap-3 items-center">
            {[1, 2, 3].map((s) => {
              const active = step === s;
              const done = step > s;
              return (
                <div key={s} className="flex items-center gap-3 flex-1">
                  <motion.div
                    animate={active ? { scale: 1.1 } : { scale: 1 }}
                    className={`h-10 w-10 shrink-0 rounded-2xl flex items-center justify-center font-extrabold text-sm border-2 transition-colors duration-300 ${
                      done
                        ? "bg-emerald-500 text-white border-emerald-500"
                        : active
                          ? "bg-white/80 dark:bg-slate-800 text-emerald-600 border-emerald-500 ring-4 ring-emerald-500/20"
                          : "bg-white/30 dark:bg-slate-800/30 text-slate-400 border-white/40 dark:border-slate-700"
                    }`}
                  >
                    {done ? "✓" : s}
                  </motion.div>
                  {s < 3 && (
                    <div className={`h-1 flex-1 rounded-full transition-colors duration-500 ${done ? "bg-emerald-500/80" : "bg-black/5 dark:bg-white/5"}`} />
                  )}
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-8"
              >
                {cartItems.length === 0 ? (
                  <p className="mt-8 text-slate-600 text-center py-10 font-medium">Your cart is empty.</p>
                ) : (
                  <div className="flex flex-col gap-4">
                    {cartItems.map((item) => {
                      const product = getProduct(item.productId);
                      if (!product) return null;

                      return (
                        <div
                          key={item.id}
                          className="rounded-2xl bg-white/60 dark:bg-slate-800/40 border border-white/80 dark:border-white/10 p-4 flex items-center gap-4 hover:shadow-lg transition-shadow duration-300"
                        >
                          <div className="h-16 w-16 rounded-xl bg-slate-100 overflow-hidden shrink-0 shadow-inner">
                            <img src={product.image || "https://via.placeholder.com/150"} alt={product.name} className="w-full h-full object-cover" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-bold text-slate-900 dark:text-white">
                              {product.name}
                            </h3>
                            <p className="text-sm text-slate-500 font-medium tracking-tight mt-0.5">
                              Qty: {item.quantity}
                            </p>
                          </div>
                          <div className="font-extrabold text-emerald-600 min-w-0 text-right">
                            ₹{product.price * item.quantity}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {cartItems.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.01, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setStep(2)}
                    className="mt-8 w-full rounded-2xl py-4 text-white font-extrabold text-lg
                      bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-400
                      shadow-xl shadow-emerald-600/30 ring-1 ring-emerald-500/50"
                  >
                    Proceed to Delivery Location →
                  </motion.button>
                )}
              </motion.div>
            )}

            {step === 2 && (
              <motion.div
                key="details"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="mt-8 flex flex-col lg:flex-row gap-8"
              >
                {/* Delivery Location & Form Section */}
                <div className="flex-1 space-y-6">
                  {/* Customer Info */}
                  <div className="space-y-4 rounded-3xl bg-white/40 dark:bg-slate-800/40 p-6 border border-white/60 dark:border-white/10">
                    <h2 className="font-extrabold text-xl text-slate-900 dark:text-white mb-4">Recipient Info</h2>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Full Name *</label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          placeholder="John Doe"
                          className={`w-full rounded-2xl bg-white/80 dark:bg-slate-900/80 border ${formErrors.name ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-700'} px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium`}
                        />
                        {formErrors.name && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{formErrors.name}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Phone Number *</label>
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="9876543210"
                          maxLength="10"
                          className={`w-full rounded-2xl bg-white/80 dark:bg-slate-900/80 border ${formErrors.phone ? 'border-red-500 ring-2 ring-red-500/20' : 'border-slate-200 dark:border-slate-700'} px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all font-medium`}
                        />
                        {formErrors.phone && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{formErrors.phone}</p>}
                      </div>
                    </div>
                  </div>

                  {/* MANDATORY LOCATION SELECTION SECTION */}
                  <div className="space-y-4 rounded-3xl bg-white/40 dark:bg-slate-800/40 p-6 border border-white/60 dark:border-white/10">
                    <div className="flex items-center justify-between">
                      <h2 className="font-extrabold text-xl text-slate-900 dark:text-white flex items-center gap-2">
                        <MapPin className="text-emerald-600" size={22} /> Where should we deliver your order?
                      </h2>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Please confirm your delivery location for THIS order.
                    </p>

                    {/* Option Buttons for Map / GPS */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handleOpenMapForGps}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition shadow-md"
                      >
                        <Navigation size={16} /> 📍 Use Current GPS Location
                      </button>
                      <button
                        type="button"
                        onClick={handleOpenMapForNew}
                        className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl bg-amber-500 text-white font-bold text-xs hover:bg-amber-600 transition shadow-md"
                      >
                        <Plus size={16} /> + Select / Add New Location on Map
                      </button>
                    </div>

                    {/* Option A: Saved Locations List */}
                    {savedLocations.length > 0 && (
                      <div className="pt-3 border-t border-white/20">
                        <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">
                          Or pick from Saved Locations:
                        </label>
                        <div className="space-y-2">
                          {savedLocations.map((loc) => {
                            const isSelected = selectedLocationId === loc.id;
                            const Icon = loc.label === "Home" ? Home : loc.label === "Office" ? Briefcase : loc.label === "Shop" ? Store : MapPin;

                            return (
                              <div
                                key={loc.id}
                                onClick={() => handleSelectSavedLocation(loc)}
                                className={`flex items-start gap-3 p-3.5 rounded-2xl border cursor-pointer transition ${
                                  isSelected
                                    ? "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-500 ring-2 ring-emerald-500/20 shadow-md"
                                    : "bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300"
                                }`}
                              >
                                <input
                                  type="radio"
                                  name="savedLocRadio"
                                  checked={isSelected}
                                  onChange={() => handleSelectSavedLocation(loc)}
                                  className="mt-1 w-4 h-4 text-emerald-600"
                                />
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <Icon size={14} className="text-emerald-600" />
                                    <span className="font-bold text-sm text-slate-900 dark:text-white">
                                      {loc.label}
                                    </span>
                                  </div>
                                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">
                                    {loc.address}
                                  </p>
                                  {loc.landmark && (
                                    <p className="text-[11px] text-slate-500 mt-0.5">
                                      Landmark: {loc.landmark}
                                    </p>
                                  )}
                                  <div className="text-[10px] text-slate-400 font-mono mt-1">
                                    Pin: {loc.latitude?.toFixed(4)}, {loc.longitude?.toFixed(4)}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {/* Active Selected Location Confirmation Pill */}
                    {activeConfirmedLocationText && (
                      <div className="mt-4 p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-start gap-3">
                        <CheckCircle size={20} className="text-emerald-600 shrink-0 mt-0.5" />
                        <div>
                          <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 block">
                            Confirmed Location for THIS Order:
                          </span>
                          <span className="text-xs text-slate-700 dark:text-slate-200 font-medium">
                            {activeConfirmedLocationText}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Payment Section */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-4 rounded-3xl bg-white/40 dark:bg-slate-800/40 p-6 border border-white/60 dark:border-white/10">
                    <h2 className="font-extrabold text-xl text-slate-900 dark:text-white mb-4">Payment Method</h2>
                    
                    <div className="flex flex-col gap-3">
                      <label className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${formData.paymentMethod === 'ONLINE' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="paymentMethod" value="ONLINE" checked={formData.paymentMethod === 'ONLINE'} onChange={handleInputChange} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800 border-slate-300" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">Pay Online</span>
                        </div>
                        <span className="text-xl">💳</span>
                      </label>

                      <label className={`relative flex items-center justify-between p-4 rounded-2xl border-2 cursor-pointer transition-all duration-300 ${formData.paymentMethod === 'COD' ? 'bg-emerald-50/50 dark:bg-emerald-900/10 border-emerald-500 shadow-md ring-2 ring-emerald-500/20' : 'bg-white/60 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 hover:border-emerald-300'}`}>
                        <div className="flex items-center gap-3">
                          <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleInputChange} className="w-5 h-5 text-emerald-600 focus:ring-emerald-500 dark:bg-slate-800 border-slate-300" />
                          <span className="font-bold text-slate-800 dark:text-slate-200">Cash on Delivery</span>
                        </div>
                        <span className="text-xl">💵</span>
                      </label>
                    </div>
                  </div>

                  {/* Submit Box with Price Summary */}
                  <div className="rounded-3xl bg-white/70 dark:bg-slate-800/70 p-6 border border-white shadow-xl backdrop-blur-xl space-y-3">
                    <h3 className="text-base font-extrabold text-slate-900 dark:text-white pb-2 border-b border-slate-200 dark:border-slate-700">
                      Price Summary
                    </h3>
                    
                    <div className="flex justify-between items-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                      <span>Subtotal</span>
                      <span>₹{subtotal}</span>
                    </div>

                    <div className="flex justify-between items-center text-sm font-semibold text-slate-600 dark:text-slate-300">
                      <span>Delivery</span>
                      <span className={calculatedDeliveryFee === 0 ? "text-emerald-600 font-extrabold" : ""}>
                        {calculatedDeliveryFee === 0 ? "FREE" : `₹${calculatedDeliveryFee}`}
                      </span>
                    </div>

                    {subtotal > 0 && subtotal < deliverySettings.freeDeliveryMinimum && (
                      <div className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-2.5 rounded-xl border border-amber-200 dark:border-amber-800">
                        Add ₹{neededForFreeDelivery.toFixed(0)} more to get FREE delivery!
                      </div>
                    )}

                    <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                      <span className="font-extrabold text-slate-900 dark:text-white text-base">Total Amount</span>
                      <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{totalPrice}</span>
                    </div>

                     <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={placeOrder}
                        disabled={isPlacingOrder}
                        className={`w-full rounded-2xl py-4 flex items-center justify-center font-extrabold text-lg text-white transition-all shadow-xl
                          ${isPlacingOrder 
                            ? 'bg-slate-400 dark:bg-slate-600 cursor-not-allowed shadow-none' 
                            : 'bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400 shadow-emerald-500/30'}`}
                      >
                        {isPlacingOrder ? (
                           <div className="flex items-center gap-3">
                              <div className="w-5 h-5 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                              Processing...
                           </div>
                        ) : 'Confirm & Place Order'}
                      </motion.button>
                      <button onClick={() => setStep(1)} className="mt-4 w-full py-2 flex justify-center text-sm font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors">
                        ← Back to Cart
                      </button>
                  </div>

                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.5, type: "spring", bounce: 0.4 }}
                className="mt-12 max-w-md mx-auto"
              >
                <div className="rounded-[2rem] bg-emerald-50/80 dark:bg-emerald-900/20 border border-emerald-400/30 p-10 text-center shadow-2xl relative overflow-hidden backdrop-blur-md">
                   
                   <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 10 }}
                      className="mx-auto w-24 h-24 rounded-full bg-emerald-500 flex items-center justify-center text-5xl shadow-xl shadow-emerald-500/50 text-white z-10 relative"
                      style={{ textShadow: "0 2px 10px rgba(0,0,0,0.1)" }}
                   >
                     ✓
                   </motion.div>
                   
                  <h2 className="mt-8 text-2xl font-black text-slate-900 dark:text-white">Order Confirmed!</h2>
                  <p className="mt-3 text-slate-600 dark:text-slate-300 font-medium">
                    Your delicious groceries will arrive shortly.<br/> Thanks for choosing Dhanika.
                  </p>

                  <div className="mt-8 bg-white/50 dark:bg-slate-900/50 rounded-2xl p-4 border border-emerald-100 dark:border-emerald-800/30 text-left">
                    <p className="text-xs text-slate-500 mb-1">Delivering to:</p>
                    <p className="font-bold text-slate-800 dark:text-slate-200 text-sm">{formData.name}</p>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 line-clamp-2">{activeConfirmedLocationText}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* MAP PICKER MODAL */}
      {showMapPickerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl rounded-3xl bg-[var(--card)] border border-[var(--cardBorder)] p-6 shadow-2xl space-y-4 my-8 max-h-[90vh] overflow-y-auto">
            <DeliveryMapPicker
              initialLat={mapInitialData.lat}
              initialLng={mapInitialData.lng}
              initialAddress={mapInitialData.address}
              initialLandmark={mapInitialData.landmark}
              initialLabel={mapInitialData.label}
              showSaveOption={true}
              onConfirm={handleConfirmMapLocation}
              onCancel={() => setShowMapPickerModal(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
