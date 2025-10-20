import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import productTshirt from "@/assets/product-tshirt.jpg";
import productBlazer from "@/assets/product-blazer.jpg";
import productJeans from "@/assets/product-jeans.jpg";
import productSweater from "@/assets/product-sweater.jpg";
import productDress from "@/assets/product-dress-1.jpg";

// Sample products for each category
const categoryProducts = {
  tshirts: [
    { id: 101, name: "Classic White T-Shirt", price: 599, image: productTshirt },
    { id: 102, name: "Black Cotton Tee", price: 649, image: productTshirt },
    { id: 103, name: "Graphic Print T-Shirt", price: 799, image: productTshirt },
    { id: 104, name: "V-Neck T-Shirt", price: 699, image: productTshirt },
  ],
  shirts: [
    { id: 201, name: "Formal White Shirt", price: 1299, image: productBlazer },
    { id: 202, name: "Casual Denim Shirt", price: 1499, image: productBlazer },
    { id: 203, name: "Checked Flannel Shirt", price: 1399, image: productBlazer },
    { id: 204, name: "Linen Summer Shirt", price: 1599, image: productBlazer },
  ],
  jeans: [
    { id: 301, name: "Slim Fit Blue Jeans", price: 1999, image: productJeans },
    { id: 302, name: "Relaxed Fit Jeans", price: 2199, image: productJeans },
    { id: 303, name: "Black Skinny Jeans", price: 2299, image: productJeans },
    { id: 304, name: "Distressed Denim", price: 2499, image: productJeans },
  ],
  hoodies: [
    { id: 401, name: "Classic Pullover Hoodie", price: 1799, image: productSweater },
    { id: 402, name: "Zip-Up Hoodie", price: 1899, image: productSweater },
    { id: 403, name: "Oversized Hoodie", price: 2099, image: productSweater },
    { id: 404, name: "Tech Fleece Hoodie", price: 2299, image: productSweater },
  ],
  pants: [
    { id: 501, name: "Formal Trousers", price: 1599, image: productDress },
    { id: 502, name: "Chino Pants", price: 1799, image: productDress },
    { id: 503, name: "Cargo Pants", price: 1899, image: productDress },
    { id: 504, name: "Track Pants", price: 1299, image: productDress },
  ],
};

type CategoryKey = keyof typeof categoryProducts;

const ProductCategories = () => {
  const navigate = useNavigate();

  const CategorySection = ({ categoryId, title, emoji }: { categoryId: CategoryKey; title: string; emoji: string }) => {
    const products = categoryProducts[categoryId];

    return (
      <section id={categoryId} className="py-16 scroll-mt-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-8">
            <span className="text-4xl">{emoji}</span>
            <h2 className="text-3xl md:text-4xl font-bold">{title}</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product.id}
                className="group overflow-hidden border-border hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/products/${product.id}`)}
              >
                <div className="relative overflow-hidden aspect-[3/4]">
                  <img
                    src={product.image}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  
                  <Button
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-accent hover:bg-accent/90 text-accent-foreground"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Add to cart logic here
                    }}
                  >
                    <ShoppingCart className="h-4 w-4 mr-2" />
                    Add to Cart
                  </Button>
                </div>

                <div className="p-4">
                  <h3 className="font-semibold text-lg mb-2 line-clamp-1">
                    {product.name}
                  </h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold">₹{product.price}</span>
                    <div className="flex gap-1">
                      {[...Array(5)].map((_, i) => (
                        <svg
                          key={i}
                          className="w-4 h-4 text-accent fill-accent"
                          viewBox="0 0 20 20"
                        >
                          <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                        </svg>
                      ))}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>
    );
  };

  return (
    <div className="bg-background">
      <CategorySection categoryId="tshirts" title="T-Shirts" emoji="👕" />
      <div className="border-t border-border" />
      <CategorySection categoryId="shirts" title="Shirts" emoji="👔" />
      <div className="border-t border-border" />
      <CategorySection categoryId="jeans" title="Jeans" emoji="👖" />
      <div className="border-t border-border" />
      <CategorySection categoryId="hoodies" title="Hoodies" emoji="🧥" />
      <div className="border-t border-border" />
      <CategorySection categoryId="pants" title="Pants" emoji="👗" />
    </div>
  );
};

export default ProductCategories;
