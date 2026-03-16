import React, { useEffect, useState } from "react";
import API from "../services/api";
import OrderManagement from "../components/OrderManagement";

function AdminDashboard() {

  const [products,setProducts] = useState([]);
  const [name,setName] = useState("");
  const [price,setPrice] = useState("");
  const [category,setCategory] = useState("");
  const [stockUpdates,setStockUpdates] = useState({});

  useEffect(()=>{
    fetchProducts();
  },[]);

  const fetchProducts = async () => {
    const res = await API.get("/products");
    setProducts(res.data);
  };

  const addProduct = async () => {

   await API.post("/products",{
  name,
  price,
  category,
  stock:100
});

setName("");
setPrice("");
setCategory("");

    fetchProducts();
  };

  const deleteProduct = async(id)=>{
    await API.delete(`/products/${id}`);
    fetchProducts();
  };

  const updateStock = async (id) => {

  const newStock = stockUpdates[id];

  await API.put(`/products/${id}`, {
    stock: newStock
  });

  fetchProducts();

};

  return (

    <div style={{padding:"30px"}}>

      <h1>Admin Dashboard 🛠</h1>

      <h2>Add Product</h2>

      <input
        placeholder="Product Name"
        onChange={(e)=>setName(e.target.value)}
      />

      <input
        placeholder="Price"
        onChange={(e)=>setPrice(e.target.value)}
      />

      <input
        placeholder="Category"
        onChange={(e)=>setCategory(e.target.value)}
      />

      <button onClick={addProduct}>
        Add Product
      </button>

      <h2 style={{marginTop:"30px"}}>Inventory</h2>

<table style={{
  width:"100%",
  borderCollapse:"collapse",
  marginTop:"20px"
}}>

<thead>

<tr style={{background:"#f3f4f6"}}>

<th style={{padding:"10px"}}>Product</th>
<th style={{padding:"10px"}}>Category</th>
<th style={{padding:"10px"}}>Price</th>
<th style={{padding:"10px"}}>Stock</th>
<th style={{padding:"10px"}}>Action</th>

</tr>

</thead>

<tbody>

{products.map((p)=>(

<tr key={p.id} style={{borderBottom:"1px solid #eee"}}>

<td style={{padding:"10px"}}>{p.name}</td>

<td style={{padding:"10px"}}>{p.category}</td>

<td style={{padding:"10px"}}>₹{p.price}</td>

<td style={{padding:"10px"}}>

<input
type="number"
value={stockUpdates[p.id] ?? p.stock}
onChange={(e)=>setStockUpdates({
  ...stockUpdates,
  [p.id]:e.target.value
})}
style={{
width:"70px",
padding:"4px"
}}
/>

</td>

<td style={{padding:"10px"}}>

<button
onClick={()=>updateStock(p.id)}
style={{
background:"#16a34a",
color:"white",
border:"none",
padding:"6px 10px",
borderRadius:"6px",
marginRight:"8px",
cursor:"pointer"
}}
>
Update
</button>

<button
onClick={()=>deleteProduct(p.id)}
style={{
background:"red",
color:"white",
border:"none",
padding:"6px 10px",
borderRadius:"6px",
cursor:"pointer"
}}
>
Delete
</button>

</td>

</tr>

))}

</tbody>

</table>
<OrderManagement />

    </div>

  );

}

export default AdminDashboard;