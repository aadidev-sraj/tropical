import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "./ui/button";

const categories = [
  { id: "tshirts", name: "T-Shirts", path: "/products/tshirts" },
  { id: "shirts", name: "Shirts", path: "/products/shirts" },
  { id: "jeans", name: "Jeans", path: "/products/jeans" },
  { id: "hoodies", name: "Hoodies", path: "/products/hoodies" },
  { id: "pants", name: "Pants", path: "/products/pants" },
];

const ProductSubNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  return (
    <div className="fixed top-16 w-full bg-background/95 backdrop-blur-sm border-b border-border z-40 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-center gap-1 py-1 overflow-x-auto">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={location.pathname === category.path ? "default" : "ghost"}
              size="sm"
              className="whitespace-nowrap h-8 px-2 text-sm"
              onClick={() => navigate(category.path)}
            >
              <span className="font-medium">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductSubNav;
