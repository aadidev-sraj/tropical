import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { ShoppingCart } from "lucide-react";
import Navbar from "@/components/Navbar";
import ProductSubNav from "@/components/ProductSubNav";
import { apiFetch, toImageUrl } from "@/lib/api";

type BackendProduct = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  images?: string[];
  sizes?: string[];
  category?: string;
};

const categoryTitles: Record<string, string> = {
  tshirts: "T-Shirts",
  shirts: "Shirts",
  jeans: "Jeans",
  hoodies: "Hoodies",
  pants: "Pants",
};

const CategoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const category = useMemo(() => {
    const last = location.pathname.split("/").pop() || "tshirts";
    return last.toLowerCase();
  }, [location.pathname]);

  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState<BackendProduct[]>([]);

  const title = categoryTitles[category] || "Products";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiFetch<{ data: BackendProduct[] }>(`/products?category=${encodeURIComponent(category)}`)
      .then((res) => {
        if (!mounted) return;
        setProducts(res.data || []);
      })
      .catch(() => {
        if (!mounted) return;
        setProducts([]);
      })
      .finally(() => mounted && setLoading(false));
    return () => { mounted = false; };
  }, [category]);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <ProductSubNav />
      
      <div className="pt-32 pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
            <p className="text-muted-foreground text-lg">
              Browse our collection of {title.toLowerCase()}
            </p>
          </div>

          {loading ? (
            <div className="py-16 text-center text-muted-foreground">Loading products...</div>
          ) : products.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">No products in this category yet.</div>
          ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {products.map((product) => (
              <Card
                key={product._id}
                className="group overflow-hidden border-border hover:shadow-xl transition-all duration-300 cursor-pointer"
                onClick={() => navigate(`/products/${product.slug}`)}
              >
                <div className="relative overflow-hidden aspect-[3/4]">
                  <img
                    src={(product.images && product.images[0] && toImageUrl(product.images[0])) || "https://via.placeholder.com/600x800?text=Product"}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                  
                  <Button
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-accent hover:bg-accent/90 text-accent-foreground"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      // TODO: integrate add-to-cart for backend products
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
                  </div>
                </div>
              </Card>
            ))}
          </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
