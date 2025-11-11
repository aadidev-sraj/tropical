import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProduct, firstImageUrl, type BackendProduct } from "@/lib/products";
import { addToCart } from "@/lib/cart";
import { toImageUrl } from "@/lib/api";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { style: "currency", currency: "INR" }).format(p);
}

export default function Product() {
  const { slug } = useParams<{ slug: string }>();
  const [selectedSize, setSelectedSize] = useState<string>('');
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(0);

  const { data, isLoading, isError, error } = useQuery<BackendProduct | null>({
    queryKey: ["product", slug],
    queryFn: async () => {
      if (!slug) return null;
      return (await getProduct(slug)).data;
    },
    enabled: !!slug,
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const product = data || undefined;

  const handleAddToCart = (product?: BackendProduct) => {
    if (!product) return;

    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error('Please select a size');
      return;
    }

    addToCart({
      id: product._id ? parseInt(product._id) : product.id ? Number(product.id) : 0,
      name: product.name,
      price: product.price,
      image: firstImageUrl(product as any),
      quantity: 1,
      size: selectedSize || undefined,
    });

    toast.success(`${product.name} added to cart!`, {
      description: selectedSize ? `Size: ${selectedSize}` : undefined,
      action: {
        label: 'View Cart',
        onClick: () => {
          window.location.href = '/cart';
        },
      },
    });
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/" className="text-sm text-muted-foreground hover:underline">← Back to home</Link>
        </div>
        {isLoading && <p>Loading product...</p>}
        {isError && <p className="text-red-500">{(error as Error)?.message || "Failed to load"}</p>}
        {!isLoading && !product && <p>Product not found.</p>}
        {product && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              {/* Main Image */}
              {(() => {
                const images = product.images && product.images.length > 0 
                  ? product.images.map(img => toImageUrl(img)).filter(Boolean) as string[]
                  : [firstImageUrl(product as any)].filter(Boolean);
                
                const currentImage = images[selectedImageIndex] || images[0];
                
                return currentImage ? (
                  <div className="space-y-4">
                    <img
                      className="w-full h-auto rounded-md object-cover"
                      src={currentImage}
                      alt={`${product.name} - Image ${selectedImageIndex + 1}`}
                    />
                    
                    {/* Thumbnail Gallery */}
                    {images.length > 1 && (
                      <div className="grid grid-cols-4 gap-2">
                        {images.map((img, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedImageIndex(index)}
                            className={`relative aspect-square rounded-md overflow-hidden border-2 transition-all ${
                              selectedImageIndex === index 
                                ? 'border-primary' 
                                : 'border-transparent hover:border-gray-300'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`${product.name} thumbnail ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full aspect-square bg-muted rounded-md" />
                );
              })()}
            </div>
            <div>
              <h1 className="text-3xl font-semibold mb-2">{product.name}</h1>
              <p className="text-xl text-primary mb-4">{formatPrice(product.price)}</p>
              {typeof product.description === "string" && (
                <p className="text-muted-foreground mb-6 whitespace-pre-line">
                  {product.description as string}
                </p>
              )}

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2">Select Size</label>
                  <div className="flex gap-2 flex-wrap">
                    {product.sizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`px-4 py-2 border rounded-md transition-all ${
                          selectedSize === size
                            ? 'bg-primary text-primary-foreground border-primary'
                            : 'bg-background hover:border-primary'
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                  {selectedSize && (
                    <p className="text-sm text-muted-foreground mt-2">Selected: {selectedSize}</p>
                  )}
                </div>
              )}

              {/* Customization Notice */}
              {product.customizable && (
                <div className="mb-4 p-4 bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-md">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    This product is available for customization! You can add your own photos and designs.
                  </p>
                </div>
              )}

              <div className="flex items-center gap-3 flex-wrap">
                <button
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={product.sizes && product.sizes.length > 0 && !selectedSize}
                  onClick={() => handleAddToCart(product)}
                >
                  🛒 Add to Cart
                </button>
                {product.customizable && (
                  <Link
                    to={`/customize-product/${slug}`}
                    className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-accent"
                  >
                    🎨 Customize This Product
                  </Link>
                )}
                <Link
                  to="/cart"
                  className="inline-flex items-center rounded-md border px-4 py-2 hover:bg-accent"
                >
                  View Cart
                </Link>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
