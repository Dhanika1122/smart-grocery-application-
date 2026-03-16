import React from "react";

const categories = [
  {name:"All", icon:"🛒"},
  {name:"Fruits", icon:"🍎"},
  {name:"Vegetables", icon:"🥦"},
  {name:"Dairy", icon:"🥛"},
  {name:"Bakery", icon:"🍞"},
  {name:"Meat", icon:"🍗"},
  {name:"Drinks", icon:"🥤"}
];

function CategoryBar({setCategory}) {

  return (

    <div style={{
      display:"flex",
      gap:"15px",
      overflowX:"auto",
      padding:"10px 0",
      marginBottom:"25px"
    }}>

      {categories.map((cat)=>(
        
        <div
          key={cat.name}
          onClick={()=>setCategory(cat.name)}
          style={{
            minWidth:"90px",
            padding:"10px",
            borderRadius:"10px",
            background:"#f3f4f6",
            textAlign:"center",
            cursor:"pointer",
            transition:"0.2s"
          }}
        >

          <div style={{fontSize:"26px"}}>
            {cat.icon}
          </div>

          <div style={{fontSize:"14px"}}>
            {cat.name}
          </div>

        </div>

      ))}

    </div>

  );

}

export default CategoryBar;