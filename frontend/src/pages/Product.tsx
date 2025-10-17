import { useParams, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { getProduct, firstImageUrl, type BackendProduct } from "@/lib/products";
import { addToCart } from "@/lib/cart";
import Navbar from "@/components/Navbar";

function formatPrice(p: number) {
  return new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(p);
}

export default function Product() {
  const { slug } = useParams<{ slug: string }>();

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
              {(() => {
                const img = firstImageUrl(product as any);
                return img ? (
                  <img
                    className="w-full h-auto rounded-md object-cover"
                    src={img}
                    alt={product.name}
                  />
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

              <div className="flex items-center gap-3">
                <button
                  className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90"
                  onClick={() =>
                    addToCart({
                      id: (product as any).strapiId || 0,
                      name: product.name,
                      price: product.price,
                      image: firstImageUrl(product as any),
                      quantity: 1,
                    })
                  }
                >
                  Add to Cart
                </button>
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
