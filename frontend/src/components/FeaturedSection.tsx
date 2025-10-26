import { useQuery } from "@tanstack/react-query";
import { listFeatured } from "@/lib/featured";
import { toImageUrl } from "@/lib/api";

const FeaturedSection = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["featured"],
    queryFn: () => listFeatured(),
    refetchOnWindowFocus: true,
    refetchOnMount: "always",
    staleTime: 0,
  });

  const items = data?.data || [];
  
  // Process and log image URLs for debugging
  const allImages = items.flatMap((item) => {
    const itemImages = item.images?.map(img => {
      const processedUrl = toImageUrl(img);
      console.log('Featured image URL:', { original: img, processed: processedUrl });
      return processedUrl;
    }) || [];
    return itemImages;
  }).filter(Boolean);

  if (isLoading) return <div className="text-center py-12">Loading featured items...</div>;
  if (error) return <div className="text-center py-12 text-red-500">Error loading featured items</div>;
  if (allImages.length === 0) return null;

  return (
    <section className="py-20 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Featured Collection</h2>
          <p className="text-muted-foreground text-lg">
            Handpicked styles just for you
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {allImages.map((imageUrl, idx) => (
            <div
              key={idx}
              className="group relative overflow-hidden rounded-lg aspect-square bg-background border border-border hover:shadow-xl transition-all duration-300"
            >
              <img
                src={imageUrl}
                onError={(e) => {
                  console.error('Failed to load featured image:', imageUrl);
                  // You could set a fallback image here if needed
                  // e.currentTarget.src = '/path/to/fallback-image.jpg';
                }}
                alt={`Featured ${idx + 1}`}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default FeaturedSection;
