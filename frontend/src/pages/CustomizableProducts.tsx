import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import { apiFetch, toImageUrl } from "@/lib/api";
import { BackendProduct } from "@/lib/products";

export default function CustomizableProducts() {
  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchCustomizableProducts = async () => {
      try {
        setLoading(true);
        const response = await apiFetch<{ data: BackendProduct[] }>("/products");
        // Filter only customizable products
        const customizable = response.data.filter((p) => p.customizable);
        setProducts(customizable);
      } catch (err) {
        console.error("Error fetching customizable products:", err);
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Customizable Products</h1>
          <p className="text-muted-foreground">
            Choose a product to customize with your own photos and designs
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Loading customizable products...</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <p className="text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        {!loading && !error && products.length === 0 && (
          <div className="text-center py-12">
            <div className="bg-muted/50 rounded-lg p-8 max-w-md mx-auto">
              <h3 className="text-xl font-semibold mb-2">No Customizable Products Yet</h3>
              <p className="text-muted-foreground mb-4">
                Check back soon! We're adding products that you can customize with your own photos and designs.
              </p>
              <Link
                to="/"
                className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
              >
                Browse All Products
              </Link>
            </div>
          </div>
        )}

        {!loading && products.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {products.map((product) => (
              <Link
                key={product._id || product.id}
                to={`/customize-product/${product.slug}`}
                className="group"
              >
                <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-border">
                  {/* Product Image */}
                  <div className="aspect-square bg-muted relative overflow-hidden">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={toImageUrl(product.images[0]) || product.images[0]}
                        alt={product.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-muted-foreground">No image</span>
                      </div>
                    )}
                    {/* Customizable Badge */}
                    <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs font-semibold px-2 py-1 rounded">
                      Customizable
                    </div>
                  </div>

                  {/* Product Info */}
                  <div className="p-4">
                    <h3 className="font-semibold text-lg mb-1 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-muted-foreground text-sm mb-2 line-clamp-2">
                      {product.description || "Customize with your own photos and designs"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-primary">
                        ₹{product.price}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Starting price
                      </span>
                    </div>
                    {product.sizes && product.sizes.length > 0 && (
                      <div className="mt-2 flex gap-1 flex-wrap">
                        {product.sizes.slice(0, 5).map((size) => (
                          <span
                            key={size}
                            className="text-xs bg-muted px-2 py-0.5 rounded"
                          >
                            {size}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Customize Button */}
                  <div className="px-4 pb-4">
                    <div className="w-full bg-primary text-primary-foreground text-center py-2 rounded-md font-medium group-hover:opacity-90 transition-opacity">
                      Customize Now →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
