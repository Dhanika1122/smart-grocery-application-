import React, { useState } from "react";
import API from "../services/api";

function RecommendationPage() {

  const [type,setType] = useState("");
  const [value,setValue] = useState("");
  const [results,setResults] = useState([]);

  const getRecommendation = async () => {

    try {

      let res;

      if(type === "diet"){
        res = await API.get(`/recommend/diet?diet=${value}`);
      }

      if(type === "budget"){
        res = await API.get(`/recommend/budget?budget=${value}`);
      }

      if(type === "health"){
        res = await API.get(`/recommend/health?condition=${value}`);
      }

      if(type === "recipe"){
        res = await API.get(`/recommend/recipe?recipe=${value}`);
      }

      if(type === "purchase"){
        res = await API.get(`/recommend/purchase?product=${value}`);
      }

      setResults(res.data);

    } catch(error){
      console.log(error);
    }

  };

  return (
    <div style={{padding:"40px"}}>

      <h2>AI Smart Grocery Dashboard 🤖</h2>

      {/* Card Grid */}

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(2,200px)",
        gap:"20px",
        marginTop:"30px"
      }}>

        <button onClick={()=>setType("diet")}>🥗 Diet Plan</button>
        <button onClick={()=>setType("budget")}>💰 Budget Plan</button>
        <button onClick={()=>setType("health")}>❤️ Health Food</button>
        <button onClick={()=>setType("recipe")}>🍝 Recipe Ingredients</button>
        <button onClick={()=>setType("purchase")}>🛒 Smart Purchase</button>

      </div>

      {type && (
        <div style={{marginTop:"30px"}}>

          <input
            placeholder="Enter value"
            onChange={(e)=>setValue(e.target.value)}
            style={{padding:"8px"}}
          />

          <button
            onClick={getRecommendation}
            style={{marginLeft:"10px"}}
          >
            Get Recommendation
          </button>

        </div>
      )}

      <div style={{marginTop:"30px"}}>

        {results.map((item,index)=>(
          <div key={index} style={{
            border:"1px solid #ddd",
            padding:"10px",
            margin:"5px",
            borderRadius:"6px",
            width:"200px"
          }}>
            {item}
          </div>
        ))}

      </div>

    </div>
  );
}

export default RecommendationPage;