import React, { useEffect, useState } from "react";
import API from "../services/api";
import ProductCard from "./ProductCard";

function RecommendedProducts() {

  const [recommended,setRecommended] = useState([]);

  useEffect(()=>{

    API.get("/recommend/products?keyword=healthy")
      .then(res => setRecommended(res.data))
      .catch(err => console.log(err));

  },[]);

  return (

    <div style={{marginBottom:"40px"}}>

      <h2 style={{marginBottom:"20px"}}>
        Recommended For You ⭐
      </h2>

      <div style={{
        display:"grid",
        gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",
        gap:"20px"
      }}>

        {recommended.map(product => (

          <ProductCard
            key={product.id}
            product={product}
            addToCart={()=>{}}
          />

        ))}

      </div>

    </div>

  );

}

export default RecommendedProducts;