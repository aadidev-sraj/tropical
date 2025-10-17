import { useState } from "react";
import { Button } from "./ui/button";
import { Card } from "./ui/card";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getToken } from "@/lib/api";
import { addToCart } from "@/lib/cart";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { ShoppingCart } from "lucide-react";
import productDress from "@/assets/product-dress-1.jpg";
import productBlazer from "@/assets/product-blazer.jpg";
import productJeans from "@/assets/product-jeans.jpg";
import productCoat from "@/assets/product-coat.jpg";
import { useQuery } from "@tanstack/react-query";
import { listProducts, firstImageUrl, type BackendProduct } from "@/lib/products";

const products = [
  {
    id: 1,
    name: "Elegant Black Dress",
    price: "$89",
    image: productDress,
    rating: 5,
  },
  {
    id: 2,
    name: "Classic White Blazer",
    price: "$129",
    image: productBlazer,
    rating: 5,
  },
  {
    id: 3,
    name: "Modern Denim Jeans",
    price: "$79",
    image: productJeans,
    rating: 4,
  },
  {
    id: 4,
    name: "Timeless Trench Coat",
    price: "$199",
    image: productCoat,
    rating: 5,
  },
  {
    id: 5,
    name: "Elegant Black Dress",
    price: "$89",
    image: productDress,
    rating: 5,
  },
  {
    id: 6,
    name: "Classic White Blazer",
    price: "$129",
    image: productBlazer,
    rating: 5,
  },
  {
    id: 7,
    name: "Modern Denim Jeans",
    price: "$79",
    image: productJeans,
    rating: 4,
  },
  {
    id: 8,
    name: "Timeless Trench Coat",
    price: "$199",
    image: productCoat,
    rating: 5,
  },
];

const ProductsGrid = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [modalOpen, setModalOpen] = useState(false);
  const { data } = useQuery({
    queryKey: ["products"],
    queryFn: () => listProducts(),
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const liveProducts = (data?.data || [])
    .map((p: BackendProduct, i: number) => {
      if (!p) return null;
      const name = p.name || `Product #${i + 1}`;
      const price = typeof p.price === "number" ? p.price : Number(p.price) || 0;
      return {
        id: typeof p.strapiId === "number" ? p.strapiId : i + 1,
        name,
        price,
        image: firstImageUrl(p),
        rating: 5 as number,
        slug: p.slug,
      };
    })
    .filter(Boolean) as Array<{ id: number; name: string; price: number | string; image?: string; rating: number; slug?: string }>;

  // If backend responded (even with empty array), prefer it over static demo
  const items = data ? liveProducts : products;

  const handleAddToCart = (productId: number) => {
    const isAuthed = !!getToken();
    if (!isAuthed) {
      const redirect = `${location.pathname}${location.search}`;
      navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
      return;
    }
    const product = items.find(p => p.id === productId);
    if (!product) return;
    // Parse price like "$89" => 89
    const priceNum = typeof product.price === "number" ? product.price : Number(String(product.price).replace(/[^0-9.]/g, ""));
    addToCart({ id: product.id, name: product.name, price: priceNum, image: product.image, quantity: 1 });
    setModalOpen(true);
  };

  return (
    <section className="py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Shop the Collection</h2>
          <p className="text-muted-foreground text-lg">
            Curated pieces for every occasion
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {data && liveProducts.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground">No products yet.</div>
          )}
          {items.map((product) => (
            <Card
              key={product.id}
              className={`group overflow-hidden border-border hover:shadow-xl transition-all duration-300 ${product.slug ? "cursor-pointer" : ""}`}
              onClick={() => {
                if (product.slug) navigate(`/products/${product.slug}`);
                else if (product.id) navigate(`/products/${product.id}`);
              }}
            >
              <div className="relative overflow-hidden aspect-[3/4]">
                <img
                  src={product.image || productCoat}
                  alt={product.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                
                {/* Add to Cart Button - appears on hover */}
                <Button
                  className="absolute bottom-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300 bg-accent hover:bg-accent/90 text-accent-foreground"
                  size="sm"
                  onClick={(e) => { e.stopPropagation(); handleAddToCart(product.id); }}
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
                  <span className="text-xl font-bold">{typeof product.price === "number" ? `$${product.price}` : product.price}</span>
                  <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                      <svg
                        key={i}
                        className={`w-4 h-4 ${
                          i < product.rating
                            ? "text-accent fill-accent"
                            : "text-muted fill-muted"
                        }`}
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
        <Dialog open={modalOpen} onOpenChange={setModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Item added successfully</DialogTitle>
              <DialogDescription>
                Your item has been added to the cart.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter className="flex gap-2 sm:justify-end">
              <Button variant="outline" onClick={() => setModalOpen(false)}>Continue shopping</Button>
              <Button onClick={() => navigate('/cart')}>Go to cart</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
};

export default ProductsGrid;
