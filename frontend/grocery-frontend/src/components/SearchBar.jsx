import React from "react";

function SearchBar({search,setSearch}) {

  return (

    <div style={{marginBottom:"20px"}}>

      <input
        type="text"
        placeholder="Search groceries..."
        value={search}
        onChange={(e)=>setSearch(e.target.value)}
        style={{
          width:"100%",
          padding:"12px",
          borderRadius:"8px",
          border:"1px solid #ddd",
          fontSize:"16px"
        }}
      />

    </div>

  );

}

export default SearchBar;