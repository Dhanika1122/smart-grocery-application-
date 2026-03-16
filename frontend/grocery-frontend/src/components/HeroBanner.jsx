import React from "react";

function HeroBanner() {

  return (

    <div style={{
      background: "linear-gradient(90deg,#27ae60,#2ecc71)",
      color: "white",
      padding: "40px",
      borderRadius: "12px",
      marginBottom: "30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>

      <div>
        <h1>Fresh Groceries Delivered Fast 🚚</h1>
        <p>Get fresh fruits, vegetables and essentials in minutes.</p>

        <button style={{
          marginTop:"10px",
          padding:"10px 18px",
          background:"white",
          color:"#27ae60",
          border:"none",
          borderRadius:"6px",
          cursor:"pointer",
          fontWeight:"bold"
        }}>
          Shop Now
        </button>

      </div>

      <img
        src="https://cdn-icons-png.flaticon.com/512/2922/2922510.png"
        alt="grocery"
        style={{width:"120px"}}
      />

    </div>

  );

}

export default HeroBanner;