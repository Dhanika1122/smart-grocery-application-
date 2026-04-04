  import React, { useEffect, useState } from "react";
  import { useNavigate } from "react-router-dom"; // ✅ FIX
  import API from "../services/api";
  import OrderManagement from "../components/OrderManagement";
  import UserManagement from "../components/UserManagement";
  import logo from "../assets/dhanika-logo.png";

  import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell
  } from "recharts";

  function AdminDashboard() {

    const navigate = useNavigate(); // ✅ FIX

    const [products, setProducts] = useState([]);
    const [name, setName] = useState("");
    const [price, setPrice] = useState("");
    const [category, setCategory] = useState("");
    const [image, setImage] = useState(null);

    const [stockUpdates, setStockUpdates] = useState({});

    // ✅ FIXED useEffect
    useEffect(() => {

    const admin = localStorage.getItem("admin");
    const token = localStorage.getItem("token");

    if (!admin || !token) {
      navigate("/login");
      return;
    }

    fetchProducts();

    }, [navigate]);

    const fetchProducts = async () => {
      try {
      const admin = JSON.parse(localStorage.getItem("admin"));
const res = await API.get(`/products?adminId=${admin.id}`);
        setProducts(res.data);
      } catch (error) {
        console.error(error);
        alert(error?.response?.data?.message || "Failed to load products");
      }
    };

    const addProduct = async () => {
      try {

        let imageUrl = "";

        if (image) {
          const formData = new FormData();
          formData.append("file", image);

        const uploadRes = await API.post("/upload", formData);
          imageUrl = uploadRes.data.secure_url;

          if (uploadRes.data.status !== "success") {
            alert(
              `Upload failed: ${uploadRes.data.error || "Unknown error"}`
            );
            return;
          }
        }

        const admin = JSON.parse(localStorage.getItem("admin"));

  await API.post("/products", {
  name,
  price,
  category,
  stock: 100,
  image: imageUrl,
  admin: {
    id: admin.id
  }
});

        setName("");
        setPrice("");
        setCategory("");
        setImage(null);

        fetchProducts();

      } catch (error) {
        console.error(error);
        alert(error?.response?.data?.message || "Failed to add product");
      }
    };

    const deleteProduct = async (id) => {
      try {
      await API.delete(`/products/${id}`);
        fetchProducts();
      } catch (error) {
        console.log(error);
      }
    };

    const updateStock = async (id) => {
      try {

        const newStock = stockUpdates[id];

        await API.put(`/products/${id}`, {
  stock: newStock
});

        fetchProducts();

      } catch (error) {
        console.log(error);
      }
    };

    const logout = () => {
      localStorage.removeItem("admin");
      navigate("/login"); // ✅ cleaner
    };

    const salesData = [
      { name: "Sun", sales: 400 },
      { name: "Mon", sales: 300 },
      { name: "Tue", sales: 500 },
      { name: "Wed", sales: 700 },
      { name: "Thu", sales: 450 },
      { name: "Fri", sales: 650 },
      { name: "Sat", sales: 550 }
    ];

    const categoryData = [
      { name: "Fruits", value: 35 },
      { name: "Dairy", value: 25 },
      { name: "Pantry", value: 20 },
      { name: "Beverages", value: 15 },
      { name: "Other", value: 5 }
    ];

    const colors = ["#22c55e", "#16a34a", "#4ade80", "#86efac", "#bbf7d0"];

    return (
      <div className="flex bg-gray-100 min-h-screen">

        {/* SIDEBAR */}
        <div className="w-64 bg-white shadow-lg p-6">

          <div className="flex items-center gap-3 mb-8">
            <img src={logo} alt="Dhanika" className="h-12 w-auto object-contain" />
            <h2 className="text-2xl font-bold text-green-600 m-0">Dhanika</h2>
          </div>

          <ul className="space-y-4">
            <li className="bg-green-100 p-3 rounded-lg">Dashboard</li>
            <li className="p-3 hover:bg-gray-100 rounded-lg">Sales</li>
            <li className="p-3 hover:bg-gray-100 rounded-lg">Inventory</li>
            <li className="p-3 hover:bg-gray-100 rounded-lg">Customers</li>
            <li className="p-3 hover:bg-gray-100 rounded-lg">Marketing</li>
            <li className="p-3 hover:bg-gray-100 rounded-lg">Settings</li>
          </ul>

        </div>

        {/* MAIN */}
        <div className="flex-1 p-8">

          {/* TOP BAR */}
          <div className="flex justify-between items-center mb-8">

            <input
              placeholder="Search..."
              className="border p-2 rounded-lg w-72"
            />

            <div className="flex items-center gap-4">
              <span className="bg-green-100 p-2 rounded-full">👤</span>

              <button
                onClick={logout}
                className="bg-red-500 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>

          </div>

          {/* CARDS */}
          <div className="grid grid-cols-4 gap-6 mb-10">

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Total Orders</p>
              <h2 className="text-2xl font-bold">$2,450</h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Revenue</p>
              <h2 className="text-2xl font-bold">$145,980</h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Customers</p>
              <h2 className="text-2xl font-bold">1,283</h2>
            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <p className="text-gray-500">Products</p>
              <h2 className="text-2xl font-bold">{products.length}</h2>
            </div>

          </div>

          {/* CHARTS */}
          <div className="grid grid-cols-2 gap-6 mb-10">

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-semibold mb-4">Weekly Sales</h3>

              <ResponsiveContainer width="100%" height={250}>
                <BarChart data={salesData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>

            </div>

            <div className="bg-white p-6 rounded-xl shadow">
              <h3 className="font-semibold mb-4">Category Breakdown</h3>

              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie data={categoryData} dataKey="value" outerRadius={80}>
                    {categoryData.map((entry, index) => (
                      <Cell key={index} fill={colors[index]} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>

            </div>

          </div>

          {/* ADD PRODUCT */}
          <div className="bg-white p-6 rounded-xl shadow mb-10">

            <h2 className="text-xl font-semibold mb-4">Add Product</h2>

            <div className="flex gap-4">

              <input
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border p-2 rounded w-full"
              />

              <input
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="border p-2 rounded w-full"
              />

              <input
                placeholder="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="border p-2 rounded w-full"
              />

              <input
                type="file"
                onChange={(e) => setImage(e.target.files[0])}
                className="border p-2 rounded w-full"
              />

              <button
                onClick={addProduct}
                className="bg-green-600 text-white px-6 rounded"
              >
                Add
              </button>

            </div>

          </div>

          {/* INVENTORY */}
          <div className="bg-white p-6 rounded-xl shadow">

            <h2 className="text-xl font-semibold mb-4">Inventory</h2>

            <table className="w-full">

              <thead>
                <tr className="border-b text-left">
                  <th className="p-2">Image</th>
                  <th className="p-2">Product</th>
                  <th className="p-2">Category</th>
                  <th className="p-2">Price</th>
                  <th className="p-2">Stock</th>
                  <th className="p-2">Action</th>
                </tr>
              </thead>

              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b">

                    <td className="p-2">
                      <img src={p.image} alt="" className="w-12 h-12 rounded" />
                    </td>

                    <td className="p-2">{p.name}</td>
                    <td className="p-2">{p.category}</td>
                    <td className="p-2">₹{p.price}</td>

                    <td className="p-2">
                      <input
                        type="number"
                        value={stockUpdates[p.id] ?? p.stock}
                        onChange={(e) =>
                          setStockUpdates({
                            ...stockUpdates,
                            [p.id]: e.target.value
                          })
                        }
                        className="border p-1 w-20"
                      />
                    </td>

                    <td className="p-2 space-x-2">

                      <button
                        onClick={() => updateStock(p.id)}
                        className="bg-green-500 text-white px-3 py-1 rounded"
                      >
                        Update
                      </button>

                      <button
                        onClick={() => deleteProduct(p.id)}
                        className="bg-red-500 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>

                    </td>
                  </tr>
                ))}
              </tbody>

            </table>

          </div>

          <OrderManagement />
          <UserManagement />

        </div>

      </div>
    );
  }

  export default AdminDashboard;