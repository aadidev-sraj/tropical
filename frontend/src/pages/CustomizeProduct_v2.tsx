import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { apiFetch, toImageUrl, getToken } from "@/lib/api";
import { HexColorPicker } from "react-colorful";

type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  images?: string[];
  customizable: boolean;
  category: string;
};

type Design = {
  _id: string;
  name: string;
  description?: string;
  imageUrl: string;
  category: string;
  tags: string[];
  isActive: boolean;
};

export default function CustomizeProductV2() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // Data state
  const [product, setProduct] = useState<Product | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Customization state
  const [view, setView] = useState<'front' | 'back'>('front');
  const [productColor, setProductColor] = useState("#ffffff");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [selectedFrontDesign, setSelectedFrontDesign] = useState<Design | null>(null);
  const [selectedBackDesign, setSelectedBackDesign] = useState<Design | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch product and designs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch product
        const productRes = await apiFetch<{ data: Product }>(`/products/${slug}`);
        const fetchedProduct = productRes.data;
        
        if (!fetchedProduct.customizable) {
          toast.error("This product is not available for customization");
          navigate('/products');
          return;
        }
        
        setProduct(fetchedProduct);
        
        // Fetch active designs
        const designsRes = await apiFetch<{ success: boolean; data: Design[] }>('/designs?isActive=true');
        setDesigns(designsRes.data || []);
        
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error("Failed to load product");
        navigate('/products');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) fetchData();
  }, [slug, navigate]);

  // Render preview on canvas
  useEffect(() => {
    if (!product || !canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw product base image
    const productImage = new Image();
    productImage.crossOrigin = "anonymous";
    productImage.onload = () => {
      ctx.drawImage(productImage, 0, 0, canvas.width, canvas.height);
      
      // Apply color tint
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = productColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.globalCompositeOperation = 'source-over';
      
      // Draw selected design
      const currentDesign = view === 'front' ? selectedFrontDesign : selectedBackDesign;
      if (currentDesign) {
        const designImage = new Image();
        designImage.crossOrigin = "anonymous";
        designImage.onload = () => {
          const designWidth = canvas.width * 0.5;
          const designHeight = canvas.height * 0.5;
          const x = (canvas.width - designWidth) / 2;
          const y = (canvas.height - designHeight) / 2;
          ctx.drawImage(designImage, x, y, designWidth, designHeight);
        };
        designImage.src = toImageUrl(currentDesign.imageUrl) || currentDesign.imageUrl;
      }
    };
    
    const baseImage = product.images?.[0];
    if (baseImage) {
      productImage.src = toImageUrl(baseImage) || baseImage;
    } else {
      // Fallback: draw colored rectangle
      ctx.fillStyle = productColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [product, productColor, view, selectedFrontDesign, selectedBackDesign]);

  const handleDesignSelect = (design: Design) => {
    if (view === 'front') {
      setSelectedFrontDesign(design);
    } else {
      setSelectedBackDesign(design);
    }
    toast.success(`Design "${design.name}" applied to ${view}`);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setIsProcessing(true);
      const isAuthed = !!getToken();
      if (!isAuthed) {
        toast.error("Please sign in to add items to cart");
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }
      
      // Capture canvas as preview
      let previewUrl = "";
      if (canvasRef.current) {
        previewUrl = canvasRef.current.toDataURL('image/png');
      }
      
      // Calculate price
      let price = product.price;
      if (selectedFrontDesign) price += 100;
      if (selectedBackDesign) price += 100;
      
      addToCart({
        id: parseInt(product._id) || 0,
        name: `${product.name} (Customized)`,
        price,
        quantity: 1,
        image: previewUrl || toImageUrl(product.images?.[0]) || "",
        customization: {
          color: productColor,
          frontDesign: selectedFrontDesign?._id,
          backDesign: selectedBackDesign?._id,
          previewUrl,
        },
      });
      
      toast.success("Custom product added to cart!");
      navigate("/cart");
      
    } catch (error: any) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
          <p>Product not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-2">Customize {product.name}</h1>
        <p className="text-muted-foreground mb-8">Select designs uploaded by admin</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg overflow-hidden shadow-lg p-8">
              {/* View Toggle */}
              <div className="flex gap-4 mb-6 justify-center">
                <Button
                  variant={view === 'front' ? 'default' : 'outline'}
                  onClick={() => setView('front')}
                  className="flex-1 max-w-xs"
                >
                  Front View
                </Button>
                <Button
                  variant={view === 'back' ? 'default' : 'outline'}
                  onClick={() => setView('back')}
                  className="flex-1 max-w-xs"
                >
                  Back View
                </Button>
              </div>

              {/* Canvas Preview */}
              <div className="flex justify-center items-center bg-muted/20 rounded-lg p-8" style={{ minHeight: "500px" }}>
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={700}
                  className="max-w-full h-auto border rounded"
                />
              </div>
              
              <p className="text-sm text-muted-foreground mt-4 text-center">
                {view === 'front' 
                  ? selectedFrontDesign ? `Front: ${selectedFrontDesign.name}` : 'No front design selected'
                  : selectedBackDesign ? `Back: ${selectedBackDesign.name}` : 'No back design selected'
                }
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Color Picker */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Product Color</h3>
              <div className="space-y-3">
                <div
                  className="w-full h-12 rounded border-2 cursor-pointer"
                  style={{ backgroundColor: productColor }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <div className="mt-2">
                    <HexColorPicker color={productColor} onChange={setProductColor} />
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {["#ffffff", "#000000", "#ff0000", "#0000ff", "#00ff00", "#ffff00", "#ff69b4", "#8b4513"].map((c) => (
                    <button
                      key={c}
                      className="w-8 h-8 rounded border-2 hover:scale-110 transition"
                      style={{ backgroundColor: c }}
                      onClick={() => setProductColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Design Selection */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Select Design for {view === 'front' ? 'Front' : 'Back'}</h3>
              {designs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No designs available</p>
              ) : (
                <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                  {designs.map((design) => (
                    <div
                      key={design._id}
                      className={`cursor-pointer border-2 rounded p-2 transition ${
                        (view === 'front' && selectedFrontDesign?._id === design._id) ||
                        (view === 'back' && selectedBackDesign?._id === design._id)
                          ? 'border-primary'
                          : 'border-transparent hover:border-gray-300'
                      }`}
                      onClick={() => handleDesignSelect(design)}
                    >
                      <img
                        src={toImageUrl(design.imageUrl) || design.imageUrl}
                        alt={design.name}
                        className="w-full h-20 object-cover rounded mb-1"
                      />
                      <p className="text-xs font-medium truncate">{design.name}</p>
                    </div>
                  ))}
                </div>
              )}
              {(view === 'front' && selectedFrontDesign) || (view === 'back' && selectedBackDesign) ? (
                <Button
                  size="sm"
                  variant="outline"
                  className="mt-3 w-full"
                  onClick={() => {
                    if (view === 'front') setSelectedFrontDesign(null);
                    else setSelectedBackDesign(null);
                  }}
                >
                  Remove {view} Design
                </Button>
              ) : null}
            </div>

            {/* Pricing & Add to Cart */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Base Product</span>
                  <span>₹{product.price}</span>
                </div>
                {selectedFrontDesign && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>+ Front Design</span>
                    <span>₹100</span>
                  </div>
                )}
                {selectedBackDesign && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>+ Back Design</span>
                    <span>₹100</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{product.price + (selectedFrontDesign ? 100 : 0) + (selectedBackDesign ? 100 : 0)}</span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={isProcessing || (!selectedFrontDesign && !selectedBackDesign)}
              >
                {isProcessing ? "Processing..." : "Add to Cart"}
              </Button>
              {!selectedFrontDesign && !selectedBackDesign && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Select at least one design to continue
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
