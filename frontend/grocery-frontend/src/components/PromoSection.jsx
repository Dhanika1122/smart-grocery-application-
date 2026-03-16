import React from "react";

function PromoSection() {

  const promos = [
    {
      title: "20% OFF Vegetables",
      desc: "Fresh farm vegetables delivered fast",
      color: "bg-green-100"
    },
    {
      title: "Summer Refreshers",
      desc: "Juices & cold drinks at great prices",
      color: "bg-blue-100"
    },
    {
      title: "Healthy Organic",
      desc: "Organic groceries for better health",
      color: "bg-yellow-100"
    }
  ];

  return (

    <div className="px-6 mt-10">

      <h2 className="text-2xl font-bold mb-6">
        🔥 Weekly Deals
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

        {promos.map((promo, index) => (

          <div
            key={index}
            className={`${promo.color} rounded-xl p-6 shadow hover:shadow-lg transition`}
          >

            <h3 className="text-xl font-semibold mb-2">
              {promo.title}
            </h3>

            <p className="text-gray-600">
              {promo.desc}
            </p>

            <button className="mt-4 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
              Shop Now
            </button>

          </div>

        ))}

      </div>

    </div>

  );
}

export default PromoSection;