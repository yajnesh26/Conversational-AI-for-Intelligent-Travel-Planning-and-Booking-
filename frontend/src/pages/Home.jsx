import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CategoryNav from "../components/CategoryNav.jsx";
import PlaceCard from "../components/PlaceCard.jsx";
import DetailsModal from "../components/DetailsModal.jsx";

export default function Home() {
  const [active, setActive] = useState("Hotels");
  const [selected, setSelected] = useState(null);
  const navigate = useNavigate();

  // 🧠 Mock data for now (can connect APIs later)
  const data = {
    Hotels: [
      { title: "Ocean View Resort", subtitle: "Goa", price: 4500, image: "https://th.bing.com/th/id/OIP.Tod1hzpiXu5JVekBxeWtbAHaFj?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", description: "Seaside resort with pool and breakfast." },
      { title: "Skyline Suites", subtitle: "Bangalore", price: 3500, image: "https://d2e5ushqwiltxm.cloudfront.net/wp-content/uploads/sites/179/2019/07/31082952/Skyline-Suite-Living-1024x683.jpg", description: "Luxury business suites with rooftop dining." },
      { title: "Ocean View Resort", subtitle: "Goa", price: 4500, image: "https://th.bing.com/th/id/OIP.Tod1hzpiXu5JVekBxeWtbAHaFj?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", description: "Seaside resort with pool and breakfast." },
      { title: "Skyline Suites", subtitle: "Bangalore", price: 3500, image: "https://d2e5ushqwiltxm.cloudfront.net/wp-content/uploads/sites/179/2019/07/31082952/Skyline-Suite-Living-1024x683.jpg", description: "Luxury business suites with rooftop dining." },
      { title: "Ocean View Resort", subtitle: "Goa", price: 4500, image: "https://th.bing.com/th/id/OIP.Tod1hzpiXu5JVekBxeWtbAHaFj?o=7rm=3&rs=1&pid=ImgDetMain&o=7&rm=3", description: "Seaside resort with pool and breakfast." },],
      
    Restaurants: [
      { title: "Spice Garden", subtitle: "Mangalore", price: 700, image: "https://blog.airpaz.com/wp-content/uploads/2018/06/Spice-garden.jpg", description: "Authentic coastal cuisine." },
      { title: "Tandoor Tales", subtitle: "Delhi", price: 600, image: "https://res.cloudinary.com/tf-lab/image/upload/w_520,h_520,c_fill,q_auto,f_auto/restaurant/5aab0e42-dcc1-4285-893a-2089e3074438/08851936-df52-409d-84b8-bbd1166b8806.png", description: "North Indian delights." },
       { title: "Spice Garden", subtitle: "Mangalore", price: 700, image: "https://blog.airpaz.com/wp-content/uploads/2018/06/Spice-garden.jpg", description: "Authentic coastal cuisine." },
      { title: "Tandoor Tales", subtitle: "Delhi", price: 600, image: "https://res.cloudinary.com/tf-lab/image/upload/w_520,h_520,c_fill,q_auto,f_auto/restaurant/5aab0e42-dcc1-4285-893a-2089e3074438/08851936-df52-409d-84b8-bbd1166b8806.png", description: "North Indian delights." },
       { title: "Spice Garden", subtitle: "Mangalore", price: 700, image: "https://blog.airpaz.com/wp-content/uploads/2018/06/Spice-garden.jpg", description: "Authentic coastal cuisine." },
     
    ],
    Flights: [
      { title: "IndiGo 6E-101", subtitle: "Mangalore → Goa", price: 1800, image: "https://wallpapercave.com/wp/wp10224707.jpg", description: "Morning direct flight with meal option." },
      { title: "Air India AI-408", subtitle: "Mumbai → Delhi", price: 2800, image: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/202311/untitled_design_-_2023-11-10t124529-sixteen_nine.jpg", description: "Evening flight with free baggage." },
      { title: "IndiGo 6E-101", subtitle: "Mangalore → Goa", price: 1800, image: "https://wallpapercave.com/wp/wp10224707.jpg", description: "Morning direct flight with meal option." },
      { title: "Air India AI-408", subtitle: "Mumbai → Delhi", price: 2800, image: "https://akm-img-a-in.tosshub.com/businesstoday/images/story/202311/untitled_design_-_2023-11-10t124529-sixteen_nine.jpg", description: "Evening flight with free baggage." },
    
    { title: "IndiGo 6E-101", subtitle: "Mangalore → Goa", price: 1800, image: "https://wallpapercave.com/wp/wp10224707.jpg", description: "Morning direct flight with meal option." },
    
    ],
    
    
    Offers: [
      { title: "Summer Sale 🌴", subtitle: "Up to 40% off Hotels", image: "https://static.vecteezy.com/system/resources/previews/011/669/884/original/summer-sale-banner-design-summer-sale-special-offer-text-in-beach-background-with-discount-for-seasonal-shopping-promotion-ads-vector.jpg", description: "Book now and save big on beach resorts!" },
      { title: "Festive Deal ✨", subtitle: "Flights starting ₹999", image: "https://png.pngtree.com/png-clipart/20220927/original/pngtree-limited-time-offer-label-png-image_8639105.png", description: "Limited time festive offers!" },
      { title: "Summer Sale 🌴", subtitle: "Up to 40% off Hotels", image: "https://static.vecteezy.com/system/resources/previews/011/669/884/original/summer-sale-banner-design-summer-sale-special-offer-text-in-beach-background-with-discount-for-seasonal-shopping-promotion-ads-vector.jpg", description: "Book now and save big on beach resorts!" },
      { title: "Festive Deal ✨", subtitle: "Flights starting ₹999", image: "https://png.pngtree.com/png-clipart/20220927/original/pngtree-limited-time-offer-label-png-image_8639105.png", description: "Limited time festive offers!" },{ title: "Summer Sale 🌴", subtitle: "Up to 40% off Hotels", image: "https://static.vecteezy.com/system/resources/previews/011/669/884/original/summer-sale-banner-design-summer-sale-special-offer-text-in-beach-background-with-discount-for-seasonal-shopping-promotion-ads-vector.jpg", description: "Book now and save big on beach resorts!" },
       { title: "Summer Sale 🌴", subtitle: "Up to 40% off Hotels", image: "https://static.vecteezy.com/system/resources/previews/011/669/884/original/summer-sale-banner-design-summer-sale-special-offer-text-in-beach-background-with-discount-for-seasonal-shopping-promotion-ads-vector.jpg", description: "Book now and save big on beach resorts!" },
      
    ],
  };

 const items = data[active] || [];

  return (
    <div style={{ position: "relative" }}>
      {/* 🏝️ Hero banner */}
      <div
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          color: "white",
          textAlign: "center",
          padding: "80px 20px",
          borderRadius: "12px",
          marginBottom: "20px",
        }}
      >
        <h1>Welcome to Travel AI 🌍</h1>
        <p>Discover, plan, and book your dream trip with ease.</p>
      </div>

      {/* 🧭 Category Navigation */}
      <CategoryNav active={active} onSelect={setActive} />

      {/* 🏨 Cards */}
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          marginTop: "20px",
        }}
      >
        {items.map((place, idx) => (
          <PlaceCard key={idx} {...place} onBook={() => setSelected(place)} />
        ))}
      </div>

      {/* 🪟 Modal for details */}
      <DetailsModal item={selected} onClose={() => setSelected(null)} />

      {/* 💬 Floating AI Assistant Button */}
      <button
        onClick={() => navigate("/chat")}
        style={{
          position: "fixed",
          bottom: "30px",
          right: "30px",
          background: "#2563eb",
          color: "white",
          border: "none",
          borderRadius: "50%",
          width: "60px",
          height: "60px",
          fontSize: "26px",
          fontWeight: "bold",
          cursor: "pointer",
          boxShadow: "0 6px 14px rgba(0,0,0,0.25)",
          transition: "transform 0.25s ease, box-shadow 0.25s ease",
        }}
        onMouseEnter={(e) => {
          e.target.style.transform = "scale(1.1)";
          e.target.style.boxShadow = "0 8px 16px rgba(0,0,0,0.3)";
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "scale(1)";
          e.target.style.boxShadow = "0 6px 14px rgba(0,0,0,0.25)";
        }}
        title="Chat with Assistant"
      >
        💬
      </button>
    </div>
  );
}