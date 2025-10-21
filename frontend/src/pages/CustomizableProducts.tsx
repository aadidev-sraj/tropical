import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { apiFetch, toImageUrl } from "@/lib/api";
import type { BackendProduct } from "@/lib/products";

export default function CustomizableProducts() {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomizableProducts = async () => {
      try {
        console.log('Fetching products from API...');
        const response = await apiFetch<{ data: BackendProduct[] }>("/products");
        console.log('API Response:', response);
        
        const allProducts = response.data || [];
        console.log('All products:', allProducts);
        console.log('Total products:', allProducts.length);
        
        // Filter only customizable products
        const customizable = allProducts.filter(p => {
          console.log(`Product ${p.name}: customizable =`, (p as any).customizable);
          return (p as any).customizable === true;
        });
        
        console.log('Customizable products:', customizable);
        console.log('Customizable count:', customizable.length);
        setProducts(customizable);
      } catch (err) {
        console.error("Error fetching products:", err);
        setError("Failed to load customizable products");
      } finally {
        setLoading(false);
      }
    };

    fetchCustomizableProducts();
  }, []);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Customize Your Products</h1>
          <p className="text-muted-foreground text-lg">
            Choose a product below to customize with admin-uploaded designs
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-lg">Loading customizable products...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive text-destructive rounded-lg p-4 mb-8">
            {error}
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-12">
            <h2 className="text-2xl font-semibold mb-2">No Customizable Products Yet</h2>
            <p className="text-muted-foreground mb-6">
              Check back soon! We're adding more products that you can customize.
            </p>
            <Button onClick={() => window.location.href = "/"}>
              Browse All Products
            </Button>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product._id || product.id}
                className="bg-card rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
              >
                <div className="aspect-square bg-muted relative overflow-hidden">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={toImageUrl(product.images[0]) || product.images[0]}
                      alt={product.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      No Image
                    </div>
                  )}
                  <div className="absolute top-2 right-2 bg-accent text-accent-foreground px-3 py-1 rounded-full text-sm font-semibold">
                    Customizable
                  </div>
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2">{product.name}</h3>
                  <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                    {product.description || "Customize this product with your own designs"}
                  </p>
                  
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <p className="text-sm text-muted-foreground">Starting from</p>
                      <p className="text-2xl font-bold">₹{product.price}</p>
                    </div>
                    <div className="text-xs text-muted-foreground text-right">
                      <div>✓ Admin Designs</div>
                      <div>✓ Color Options</div>
                    </div>
                  </div>
                  
                  <Link to={`/customize-v2/${product.slug}`}>
                    <Button className="w-full" size="lg">
                      Start Customizing →
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
