import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { listFeatured } from "@/lib/featured";
import { toImageUrl } from "@/lib/api";
import productDress from "@/assets/product-dress-1.jpg";
import productBlazer from "@/assets/product-blazer.jpg";
import productJeans from "@/assets/product-jeans.jpg";
import productCoat from "@/assets/product-coat.jpg";
import productSweater from "@/assets/product-sweater.jpg";
import productTshirt from "@/assets/product-tshirt.jpg";

const defaultClothesItems = [
  { id: 1, name: "Elegant Dress", price: "$89", image: productDress },
  { id: 2, name: "Classic Blazer", price: "$129", image: productBlazer },
  { id: 3, name: "Denim Jeans", price: "$79", image: productJeans },
  { id: 4, name: "Trench Coat", price: "$199", image: productCoat },
  { id: 5, name: "Knit Sweater", price: "$69", image: productSweater },
  { id: 6, name: "Basic Tee", price: "$29", image: productTshirt },
];

const WheelOfClothes = () => {
  const [rotation, setRotation] = useState(0);
  const radius = 35; // percentage from center
  const centerX = 50;
  const centerY = 50;

  // Fetch featured images from backend
  const { data } = useQuery({
    queryKey: ["featured"],
    queryFn: () => listFeatured(),
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0,
  });

  // Use featured images if available, otherwise use defaults
  const featuredItems = data?.data || [];
  const allImages = featuredItems.flatMap((item) => item.images || []);
  
  const clothesItems = allImages.length > 0
    ? allImages.map((img, idx) => ({
        id: idx + 1,
        name: `Featured ${idx + 1}`,
        price: "",
        image: toImageUrl(img) || img,
      }))
    : defaultClothesItems;

  // Rotate the wheel continuously
  useEffect(() => {
    const interval = setInterval(() => {
      setRotation((prev) => (prev + 0.2) % 360);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-20 bg-secondary">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Styles</h2>
          <p className="text-muted-foreground text-lg">
            Explore our handpicked selection
          </p>
        </div>

        {/* Wheel Container */}
        <div className="relative w-full max-w-4xl mx-auto h-[600px] md:h-[700px]">
          <div className="absolute inset-0 flex items-center justify-center">
            {/* Center Circle */}
            <div className="absolute w-24 h-24 rounded-full bg-primary flex items-center justify-center z-10 shadow-lg">
              <span className="text-primary-foreground font-bold text-sm">
                NEW
              </span>
            </div>

            {/* Clothes Items in Circle */}
            {clothesItems.map((item, index) => {
              const angle = (index * 360) / clothesItems.length - 90 + rotation;
              const x = centerX + radius * Math.cos((angle * Math.PI) / 180);
              const y = centerY + radius * Math.sin((angle * Math.PI) / 180);

              return (
                <div
                  key={item.id}
                  className="absolute"
                  style={{
                    left: `${x}%`,
                    top: `${y}%`,
                    transform: "translate(-50%, -50%)",
                  }}
                >
                  <div
                    className="relative bg-card rounded-lg overflow-hidden shadow-lg"
                    style={{ width: "140px", height: "180px" }}
                  >
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};

export default WheelOfClothes;
