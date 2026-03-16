import React, { useEffect, useState } from "react";
import API from "../services/api";

function OrderManagement() {

  const [orders,setOrders] = useState([]);

  useEffect(()=>{
    fetchOrders();
  },[]);

  const fetchOrders = async () => {
    const res = await API.get("/orders");
    setOrders(res.data);
  };

  const updateStatus = async (id,status) => {

    await API.put(`/orders/${id}/status?status=${status}`);

    fetchOrders();

  };

  return (

    <div style={{marginTop:"40px"}}>

      <h2>Customer Orders 📦</h2>

      <table style={{
        width:"100%",
        borderCollapse:"collapse",
        marginTop:"20px"
      }}>

        <thead>

          <tr style={{background:"#f3f4f6"}}>

            <th style={{padding:"10px"}}>Order ID</th>
            <th style={{padding:"10px"}}>Product</th>
            <th style={{padding:"10px"}}>Quantity</th>
            <th style={{padding:"10px"}}>Total</th>
            <th style={{padding:"10px"}}>Status</th>
            <th style={{padding:"10px"}}>Update</th>

          </tr>

        </thead>

        <tbody>

          {orders.map((o)=>(

            <tr key={o.id} style={{borderBottom:"1px solid #eee"}}>

              <td style={{padding:"10px"}}>{o.id}</td>
              <td style={{padding:"10px"}}>{o.productId}</td>
              <td style={{padding:"10px"}}>{o.quantity}</td>
              <td style={{padding:"10px"}}>₹{o.totalPrice}</td>
              <td style={{padding:"10px"}}>{o.status}</td>

              <td style={{padding:"10px"}}>

                <button
                onClick={()=>updateStatus(o.id,"Packed")}
                style={{
                  background:"#f59e0b",
                  color:"white",
                  border:"none",
                  padding:"6px 10px",
                  borderRadius:"6px",
                  marginRight:"5px"
                }}
                >
                Packed
                </button>

                <button
                onClick={()=>updateStatus(o.id,"Delivered")}
                style={{
                  background:"#16a34a",
                  color:"white",
                  border:"none",
                  padding:"6px 10px",
                  borderRadius:"6px"
                }}
                >
                Delivered
                </button>

              </td>

            </tr>

          ))}

        </tbody>

      </table>

    </div>

  );

}

export default OrderManagement;