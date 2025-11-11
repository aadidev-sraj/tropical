import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { apiFetch, toImageUrl, getToken } from "@/lib/api";
import { Upload, X, Move } from "lucide-react";

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

type CustomDesign = {
  imageUrl: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
};

export default function CustomizeProduct() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  
  // Data state
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Customization state
  const [view, setView] = useState<'front' | 'back'>('front');
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  // Front customization
  const [frontDesign, setFrontDesign] = useState<CustomDesign | null>(null);
  
  // Back customization
  const [backDesign, setBackDesign] = useState<CustomDesign | null>(null);
  
  // Dragging state
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  
  const [isProcessing, setIsProcessing] = useState(false);

  // Fetch product
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        const productRes = await apiFetch<{ data: Product }>(`/products/${slug}`);
        const fetchedProduct = productRes.data;
        
        if (!fetchedProduct.customizable) {
          toast.error("This product is not available for customization");
          navigate(`/products/${slug}`);
          return;
        }
        
        setProduct(fetchedProduct);
        
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
      
      // Get current view design
      const currentDesign = view === 'front' ? frontDesign : backDesign;
      
      // Draw customer design if exists
      if (currentDesign) {
        const designImage = new Image();
        designImage.crossOrigin = "anonymous";
        designImage.onload = () => {
          ctx.save();
          
          // Calculate position and size
          const x = (currentDesign.x / 100) * canvas.width;
          const y = (currentDesign.y / 100) * canvas.height;
          const width = (currentDesign.width / 100) * canvas.width;
          const height = (currentDesign.height / 100) * canvas.height;
          
          // Apply rotation
          ctx.translate(x + width / 2, y + height / 2);
          ctx.rotate((currentDesign.rotation * Math.PI) / 180);
          ctx.translate(-(x + width / 2), -(y + height / 2));
          
          // Draw design
          ctx.drawImage(designImage, x, y, width, height);
          
          ctx.restore();
        };
        designImage.src = currentDesign.imageUrl;
      }
    };
    
    // Use first image for front view, second image for back view
    const baseImage = view === 'front' ? product.images?.[0] : product.images?.[1] || product.images?.[0];
    if (baseImage) {
      productImage.src = toImageUrl(baseImage) || baseImage;
    }
  }, [product, view, frontDesign, backDesign]);

  // Handle design upload
  const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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
      const newDesign: CustomDesign = {
        imageUrl,
        x: 25, // Start at 25% from left
        y: 25, // Start at 25% from top
        width: 50, // 50% of canvas width
        height: 50, // 50% of canvas height
        rotation: 0,
      };
      
      if (view === 'front') {
        setFrontDesign(newDesign);
      } else {
        setBackDesign(newDesign);
      }
      toast.success(`Design uploaded for ${view} side! Drag to position it.`);
    };
    reader.readAsDataURL(file);
  };

  // Handle mouse down on design
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    setIsDragging(true);
    setDragStart({
      x: ((e.clientX - rect.left) / rect.width) * 100,
      y: ((e.clientY - rect.top) / rect.height) * 100,
    });
  };

  // Handle mouse move
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !previewRef.current) return;
    
    const currentDesign = view === 'front' ? frontDesign : backDesign;
    if (!currentDesign) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;
    
    const deltaX = currentX - dragStart.x;
    const deltaY = currentY - dragStart.y;
    
    const newX = Math.max(0, Math.min(100 - currentDesign.width, currentDesign.x + deltaX));
    const newY = Math.max(0, Math.min(100 - currentDesign.height, currentDesign.y + deltaY));
    
    const updatedDesign = {
      ...currentDesign,
      x: newX,
      y: newY,
    };
    
    if (view === 'front') {
      setFrontDesign(updatedDesign);
    } else {
      setBackDesign(updatedDesign);
    }
    
    setDragStart({ x: currentX, y: currentY });
  };

  // Handle mouse up
  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Update design size
  const updateDesignSize = (delta: number) => {
    const currentDesign = view === 'front' ? frontDesign : backDesign;
    if (!currentDesign) return;
    
    const newWidth = Math.max(20, Math.min(80, currentDesign.width + delta));
    const newHeight = Math.max(20, Math.min(80, currentDesign.height + delta));
    
    const updatedDesign = {
      ...currentDesign,
      width: newWidth,
      height: newHeight,
    };
    
    if (view === 'front') {
      setFrontDesign(updatedDesign);
    } else {
      setBackDesign(updatedDesign);
    }
  };

  // Update design rotation
  const updateDesignRotation = (delta: number) => {
    const currentDesign = view === 'front' ? frontDesign : backDesign;
    if (!currentDesign) return;
    
    const newRotation = (currentDesign.rotation + delta) % 360;
    
    const updatedDesign = {
      ...currentDesign,
      rotation: newRotation,
    };
    
    if (view === 'front') {
      setFrontDesign(updatedDesign);
    } else {
      setBackDesign(updatedDesign);
    }
  };

  // Remove design
  const removeDesign = () => {
    if (view === 'front') {
      setFrontDesign(null);
      toast.success('Front design removed');
    } else {
      setBackDesign(null);
      toast.success('Back design removed');
    }
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
      let previewUrl = "";
      if (canvasRef.current) {
        previewUrl = canvasRef.current.toDataURL('image/png');
      }
      
      // Calculate price (base price + customization fee)
      const customizationFee = 200;
      const price = product.price + customizationFee;
      
      addToCart({
        id: parseInt(product._id) || 0,
        name: `${product.name} (Custom Design)`,
        price,
        quantity: 1,
        image: previewUrl || toImageUrl(product.images?.[0]) || "",
        size: selectedSize || undefined,
        customization: {
          frontDesign: frontDesign ? {
            imageUrl: frontDesign.imageUrl,
            x: frontDesign.x,
            y: frontDesign.y,
            width: frontDesign.width,
            height: frontDesign.height,
            rotation: frontDesign.rotation,
          } : null,
          backDesign: backDesign ? {
            imageUrl: backDesign.imageUrl,
            x: backDesign.x,
            y: backDesign.y,
            width: backDesign.width,
            height: backDesign.height,
            rotation: backDesign.rotation,
          } : null,
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

  const currentDesign = view === 'front' ? frontDesign : backDesign;
  const hasAnyCustomization = frontDesign || backDesign;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-2">Customize {product.name}</h1>
        <p className="text-muted-foreground mb-8">
          Upload your own design and position it freely on the product
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
              <div 
                ref={previewRef}
                className="flex justify-center items-center bg-muted/20 rounded-lg p-8 relative cursor-move" 
                style={{ minHeight: "500px" }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={700}
                  className="max-w-full h-auto border rounded shadow-sm"
                  onMouseDown={currentDesign ? handleMouseDown : undefined}
                />
                {currentDesign && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm flex items-center gap-2">
                    <Move className="h-4 w-4" />
                    Drag to position
                  </div>
                )}
              </div>
              
              {/* Status Info */}
              <div className="mt-4 text-sm text-muted-foreground text-center space-y-1">
                <p>
                  <strong>{view === 'front' ? 'Front' : 'Back'} Side:</strong>{' '}
                  {currentDesign ? '✓ Design uploaded' : 'No design'}
                </p>
              </div>
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
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

            {/* Design Upload */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">
                Upload Your Design ({view === 'front' ? 'Front' : 'Back'})
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="design-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload your design</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PNG, JPG up to 5MB
                      </p>
                    </div>
                  </Label>
                  <Input
                    id="design-upload"
                    type="file"
                    accept="image/*"
                    onChange={handleDesignUpload}
                    disabled={isProcessing}
                    className="hidden"
                  />
                </div>
                
                {currentDesign && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-16 border rounded overflow-hidden">
                        <img 
                          src={currentDesign.imageUrl} 
                          alt="Uploaded design" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={removeDesign}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>
                    
                    {/* Design Controls */}
                    <div className="space-y-2 pt-2 border-t">
                      <div>
                        <Label className="text-xs">Size</Label>
                        <div className="flex gap-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDesignSize(-5)}
                          >
                            Smaller
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDesignSize(5)}
                          >
                            Larger
                          </Button>
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-xs">Rotation</Label>
                        <div className="flex gap-2 mt-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDesignRotation(-15)}
                          >
                            ↶ 15°
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDesignRotation(15)}
                          >
                            ↷ 15°
                          </Button>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Current: {currentDesign.rotation}°
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
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
                    <span>+ Custom Design</span>
                    <span>₹200</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{product.price + (hasAnyCustomization ? 200 : 0)}</span>
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
                  Upload a design to continue
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
