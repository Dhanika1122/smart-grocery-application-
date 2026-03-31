import React, { useEffect, useMemo, useState } from "react";
import API from "../services/api";
import { AnimatePresence, motion } from "framer-motion";

function CheckoutPage() {
  const [cartItems, setCartItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const cartRes = await API.get("/cart");
        const productRes = await API.get("/products");

        setCartItems(cartRes.data);
        setProducts(productRes.data);
        setLoading(false);
      } catch (error) {
        console.log(error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getProduct = (productId) => {
    return products.find((p) => p.id === productId);
  };

  const totalPrice = useMemo(() => {
    return cartItems.reduce((total, item) => {
      const product = getProduct(item.productId);
      if (!product) return total;
      return total + product.price * item.quantity;
    }, 0);
  }, [cartItems, products]);

  const placeOrder = async () => {
    try {
      for (let item of cartItems) {
        const product = getProduct(item.productId);
        if (!product) continue;

        await API.post("/orders", {
          productId: item.productId,
          quantity: item.quantity,
          totalPrice: product.price * item.quantity,
        });
      }

      alert("Order Placed Successfully 🎉");
      setCartItems([]);
      setStep(3);
    } catch (error) {
      console.log(error);
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

  return (
    <div className="px-4 sm:px-6 lg:px-10 py-10">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: "easeOut" }}
        className="rounded-3xl bg-white/55 backdrop-blur-xl border border-white/60
          shadow-[0_25px_70px_rgba(0,0,0,0.10)] p-6 sm:p-8 relative overflow-hidden"
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
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                Checkout
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                A premium, step-based checkout experience.
              </p>
            </div>
            <div className="rounded-2xl bg-white/55 border border-white/70 px-4 py-2">
              <div className="text-xs text-slate-500">Total</div>
              <div className="font-extrabold text-slate-900">
                ₹{totalPrice}
              </div>
            </div>
          </div>

          <div className="mt-6 flex gap-3 items-center">
            {[1, 2, 3].map((s) => {
              const active = step === s;
              const done = step > s;
              return (
                <div key={s} className="flex items-center gap-3 flex-1">
                  <div
                    className={`h-10 w-10 rounded-2xl flex items-center justify-center font-extrabold text-sm border transition ${
                      done
                        ? "bg-emerald-500 text-white border-emerald-400"
                        : active
                          ? "bg-white/60 text-emerald-700 border-white"
                          : "bg-white/30 text-slate-500 border-white/40"
                    }`}
                  >
                    {done ? "✓" : s}
                  </div>
                  {s < 3 && (
                    <div className="h-1 flex-1 bg-white/40 rounded-full" />
                  )}
                </div>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="review"
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.25 }}
                className="mt-6"
              >
                {cartItems.length === 0 ? (
                  <p className="mt-8 text-slate-600">Your cart is empty</p>
                ) : (
                  cartItems.map((item) => {
                    const product = getProduct(item.productId);
                    if (!product) return null;

                    return (
                      <div
                        key={item.id}
                        className="mt-4 rounded-2xl bg-white/55 border border-white/60 p-4"
                      >
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h3 className="font-bold text-slate-900">
                              {product.name}
                            </h3>
                            <p className="text-sm text-slate-600">
                              ₹{product.price} × {item.quantity}
                            </p>
                          </div>
                          <div className="font-extrabold text-emerald-700">
                            ₹{product.price * item.quantity}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}

                {cartItems.length > 0 && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={placeOrder}
                    className="mt-6 w-full rounded-2xl py-3 text-white font-extrabold
                      bg-gradient-to-r from-emerald-600 via-emerald-500 to-amber-400
                      shadow-md shadow-emerald-600/20"
                    type="button"
                  >
                    Place Order
                  </motion.button>
                )}
              </motion.div>
            )}

            {step === 3 && (
              <motion.div
                key="success"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.25 }}
                className="mt-8"
              >
                <div className="rounded-3xl bg-emerald-500/10 border border-emerald-400/30 p-6 text-center">
                  <div className="text-4xl">🎉</div>
                  <div className="mt-2 font-extrabold text-slate-900">
                    Order placed successfully
                  </div>
                  <div className="mt-2 text-sm text-slate-600">
                    Thanks for shopping with FreshKart.
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default CheckoutPage;

