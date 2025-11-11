import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { apiFetch, toImageUrl, getToken } from "@/lib/api";

type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  images?: string[];
  customizable: boolean;
  category: string;
  sizes?: string[];
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
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  // Front customization
  const [frontDesign, setFrontDesign] = useState<Design | null>(null);
  const [frontDesignPos, setFrontDesignPos] = useState({ x: 50, y: 50 });
  const [frontDesignSize, setFrontDesignSize] = useState(150);
  
  // Back customization
  const [backDesign, setBackDesign] = useState<Design | null>(null);
  const [backDesignPos, setBackDesignPos] = useState({ x: 50, y: 50 });
  const [backDesignSize, setBackDesignSize] = useState(150);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  
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
          navigate(`/products/${slug}`);
          return;
        }
        
        setProduct(fetchedProduct);
        
        // Fetch active designs
        const designsRes = await apiFetch<{ success: boolean; data: Design[] }>('/designs?isActive=true');
        setDesigns(designsRes.data || []);
        
      } catch (error) {
        console.error('Fetch error:', error);
        toast.error("Failed to load product");
        navigate('/');
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
      
      // Get current view data
      const currentPhoto = view === 'front' ? frontPhoto : backPhoto;
      const currentDesign = view === 'front' ? frontDesign : backDesign;
      
      // Draw customer photo (background layer)
      if (currentPhoto) {
        const photoImage = new Image();
        photoImage.crossOrigin = "anonymous";
        photoImage.onload = () => {
          const photoWidth = canvas.width * 0.6;
          const photoHeight = canvas.height * 0.6;
          const x = (canvas.width - photoWidth) / 2;
          const y = (canvas.height - photoHeight) / 2;
          ctx.drawImage(photoImage, x, y, photoWidth, photoHeight);
          
          // Draw admin design on top of photo
          if (currentDesign) {
            const designImage = new Image();
            designImage.crossOrigin = "anonymous";
            designImage.onload = () => {
              const designWidth = canvas.width * 0.4;
              const designHeight = canvas.height * 0.4;
              const dx = (canvas.width - designWidth) / 2;
              const dy = (canvas.height - designHeight) / 2;
              ctx.drawImage(designImage, dx, dy, designWidth, designHeight);
            };
            designImage.src = toImageUrl(currentDesign.imageUrl) || currentDesign.imageUrl;
          }
        };
        photoImage.src = currentPhoto;
      } else if (currentDesign) {
        // Draw selected design only (no photo)
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
    
    // Use first image for front view, second image for back view
    const baseImage = view === 'front' ? product.images?.[0] : product.images?.[1] || product.images?.[0];
    if (baseImage) {
      productImage.src = toImageUrl(baseImage) || baseImage;
    } else {
      // Fallback: draw colored rectangle
      ctx.fillStyle = productColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  }, [product, productColor, view, frontPhoto, backPhoto, frontDesign, backDesign]);

  // Handle photo upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;
      if (view === 'front') {
        setFrontPhoto(imageUrl);
      } else {
        setBackPhoto(imageUrl);
      }
      toast.success(`Photo uploaded for ${view} side!`);
    };
    reader.readAsDataURL(file);
  };

  // Handle design selection
  const handleDesignSelect = (design: Design) => {
    if (view === 'front') {
      setFrontDesign(design);
    } else {
      setBackDesign(design);
    }
    toast.success(`Design "${design.name}" applied to ${view} side`);
  };

  // Handle add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    // Validate size selection if product has sizes
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    
    try {
      setIsProcessing(true);
      const isAuthed = !!getToken();
      if (!isAuthed) {
        toast.error("Please sign in to add items to cart");
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }
      
      // Capture canvas as preview
      
      // Fetch active designs
      const designsRes = await apiFetch<{ success: boolean; data: Design[] }>('/designs?isActive=true');
      setDesigns(designsRes.data || []);
      
    } catch (error) {
      console.error('Fetch error:', error);
      toast.error("Failed to load product");
      navigate('/');
        quantity: 1,
        image: previewUrl || toImageUrl(product.images?.[0]) || "",
        size: selectedSize || undefined,
        customization: {
          color: productColor,
          frontPhoto,
          backPhoto,
          frontDesign: frontDesign?._id,
          backDesign: backDesign?._id,
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
          <p>Loading customization options...</p>
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

  const hasAnyCustomization = frontPhoto || backPhoto || frontDesign || backDesign;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-2">Customize {product.name}</h1>
        <p className="text-muted-foreground mb-8">
          Upload your own photos and choose from admin-approved designs
        </p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Preview Section */}
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
                  className="max-w-full h-auto border rounded shadow-sm"
                />
              </div>
              
              {/* Status Info */}
              <div className="mt-4 text-sm text-muted-foreground text-center space-y-1">
                <p>
                  <strong>{view === 'front' ? 'Front' : 'Back'} Side:</strong>{' '}
                  {view === 'front' 
                    ? (frontPhoto ? '✓ Photo uploaded' : 'No photo') + ' • ' + (frontDesign ? `✓ ${frontDesign.name}` : 'No design')
                    : (backPhoto ? '✓ Photo uploaded' : 'No photo') + ' • ' + (backDesign ? `✓ ${backDesign.name}` : 'No design')
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            {/* Product Color */}
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

            {/* Size Selection */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-4">Select Size *</h3>
                <div className="flex gap-2 flex-wrap">
                  {product.sizes.map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 border-2 rounded-md transition-all ${
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

            {/* Photo Upload */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">
                📸 Upload Your Photo ({view === 'front' ? 'Front' : 'Back'})
              </h3>
              <div className="space-y-3">
                <div>
                  <Label>Upload Personal Photo (Optional)</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    disabled={isProcessing}
                    className="cursor-pointer"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Max 5MB • Your photo will appear as background
                  </p>
                </div>
                {(view === 'front' ? frontPhoto : backPhoto) && (
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-16 border rounded overflow-hidden">
                      <img 
                        src={view === 'front' ? frontPhoto! : backPhoto!} 
                        alt="Uploaded" 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => {
                        if (view === 'front') {
                          setFrontPhoto(null);
                          toast.success('Front photo removed');
                        } else {
                          setBackPhoto(null);
                          toast.success('Back photo removed');
                        }
                      }}
                    >
                      Remove Photo
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* Admin Design Selection */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">
                Admin Designs ({view === 'front' ? 'Front' : 'Back'})
              </h3>
              <p className="text-xs text-muted-foreground mb-3">
                Choose from approved designs (Optional)
              </p>
              {designs.length === 0 ? (
                <p className="text-sm text-muted-foreground">No designs available</p>
              ) : (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3 max-h-96 overflow-y-auto">
                    {designs.map((design) => (
                      <div
                        key={design._id}
                        className={`cursor-pointer border-2 rounded p-2 transition ${
                          (view === 'front' && frontDesign?._id === design._id) ||
                          (view === 'back' && backDesign?._id === design._id)
                            ? 'border-primary bg-primary/10'
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
                  {(view === 'front' && frontDesign) || (view === 'back' && backDesign) ? (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full"
                      onClick={() => {
                        if (view === 'front') {
                          setFrontDesign(null);
                          toast.success('Front design removed');
                        } else {
                          setBackDesign(null);
                          toast.success('Back design removed');
                        }
                      }}
                    >
                      Remove {view} Design
                    </Button>
                  ) : null}
                </div>
              )}
            </div>

            {/* Pricing & Add to Cart */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Base Product</span>
                  <span>₹{product.price}</span>
                </div>
                {hasAnyCustomization && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Customization</span>
                    <span>₹0</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{product.price}</span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={isProcessing || !hasAnyCustomization || (product.sizes && product.sizes.length > 0 && !selectedSize)}
              >
                {isProcessing ? "Processing..." : "Add to Cart"}
              </Button>
              {!hasAnyCustomization && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Upload a photo or select a design to continue
                </p>
              )}
              {product.sizes && product.sizes.length > 0 && !selectedSize && hasAnyCustomization && (
                <p className="text-xs text-red-500 mt-2 text-center">
                  Please select a size
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
