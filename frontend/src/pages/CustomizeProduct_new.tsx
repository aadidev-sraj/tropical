import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
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
  const location = useLocation();
  const previewRef = useRef<HTMLDivElement>(null);
  
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
  const [frontDesignSize, setFrontDesignSize] = useState(200);
  
  // Back customization
  const [backDesign, setBackDesign] = useState<Design | null>(null);
  const [backDesignPos, setBackDesignPos] = useState({ x: 50, y: 50 });
  const [backDesignSize, setBackDesignSize] = useState(200);
  
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

  // Handle design selection
  const handleDesignSelect = (design: Design) => {
    if (view === 'front') {
      setFrontDesign(design);
    } else {
      setBackDesign(design);
    }
    toast.success(`Design "${design.name}" applied to ${view} side`);
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDragging || !previewRef.current) return;
    
    const rect = previewRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (view === 'front') {
      setFrontDesignPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    } else {
      setBackDesignPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Capture screenshot of current view
  const captureScreenshot = async (): Promise<string> => {
    if (!previewRef.current) return '';
    
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(previewRef.current, {
        backgroundColor: null,
        scale: 2,
        logging: false,
      });
      return canvas.toDataURL('image/png');
    } catch (error) {
      console.error('Screenshot capture error:', error);
      return '';
    }
  };

  // Upload screenshot to server
  const uploadScreenshot = async (dataUrl: string, viewType: 'front' | 'back'): Promise<string> => {
    try {
      // Convert data URL to blob
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      
      // Create form data
      const formData = new FormData();
      formData.append('image', blob, `customization-${viewType}-${Date.now()}.png`);
      
      // Upload to server using fetch directly (not apiFetch)
      const token = getToken();
      const headers: HeadersInit = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      
      const uploadRes = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'}/upload/customization`, {
        method: 'POST',
        body: formData,
        headers, // Don't set Content-Type - let browser handle it for FormData
      });
      
      if (!uploadRes.ok) {
        throw new Error('Upload failed');
      }
      
      const uploadData = await uploadRes.json();
      return uploadData.data.url;
    } catch (error) {
      console.error('Screenshot upload error:', error);
      throw error;
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
    
    // Validate at least one design is selected
    if (!frontDesign && !backDesign) {
      toast.error("Please select at least one design");
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
      
      toast.info("Capturing customization images...");
      
      // Capture screenshots for both views
      let frontImageUrl = '';
      let backImageUrl = '';
      
      // Capture front view if design exists
      if (frontDesign) {
        setView('front');
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render
        const frontDataUrl = await captureScreenshot();
        if (frontDataUrl) {
          frontImageUrl = await uploadScreenshot(frontDataUrl, 'front');
        }
      }
      
      // Capture back view if design exists
      if (backDesign) {
        setView('back');
        await new Promise(resolve => setTimeout(resolve, 100)); // Wait for render
        const backDataUrl = await captureScreenshot();
        if (backDataUrl) {
          backImageUrl = await uploadScreenshot(backDataUrl, 'back');
        }
      }
      
      // Calculate price
      let price = product.price;
      if (frontDesign) price += 0; // Front design
      if (backDesign) price += 0; // Back design
      
      addToCart({
        id: parseInt(product._id) || 0,
        name: `${product.name} (Customized)`,
        price,
        quantity: 1,
        image: frontImageUrl || backImageUrl || toImageUrl(product.images?.[0]) || "",
        size: selectedSize || undefined,
        customization: {
          frontDesign: frontDesign?._id,
          backDesign: backDesign?._id,
          frontDesignPos,
          backDesignPos,
          frontDesignSize,
          backDesignSize,
          frontImageUrl,
          backImageUrl,
          frontDesignImageUrl: frontDesign?.imageUrl,
          backDesignImageUrl: backDesign?.imageUrl,
          productImages: {
            front: toImageUrl(product.images?.[0]),
            back: toImageUrl(product.images?.[1] || product.images?.[0])
          }
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
  const currentDesignImage = currentDesign ? toImageUrl(currentDesign.imageUrl) : null;
  const currentDesignPos = view === 'front' ? frontDesignPos : backDesignPos;
  const currentDesignSize = view === 'front' ? frontDesignSize : backDesignSize;
  
  // Get product image - front (first image) or back (second image)
  const productImage = view === 'front' 
    ? (product.images?.[0] ? toImageUrl(product.images[0]) : null)
    : (product.images?.[1] ? toImageUrl(product.images[1]) : product.images?.[0] ? toImageUrl(product.images[0]) : null);

  // Reverse size order
  const reversedSizes = product.sizes ? [...product.sizes].reverse() : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-2">Customize {product.name}</h1>
        <p className="text-muted-foreground mb-8">
          Choose from admin-approved designs and position them on your product
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

              {/* Product Preview */}
              <div 
                ref={previewRef}
                className="relative flex justify-center items-center bg-muted/20 rounded-lg p-8 select-none"
                style={{ minHeight: "600px" }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Product Image */}
                {productImage && (
                  <img 
                    src={productImage} 
                    alt={`${product.name} ${view}`}
                    className="max-w-full h-auto"
                    style={{ 
                      maxHeight: "600px",
                      objectFit: "contain",
                      display: "block"
                    }}
                    draggable={false}
                  />
                )}
                
                {/* Design Overlay */}
                {currentDesignImage && (
                  <img
                    src={currentDesignImage}
                    alt="Design"
                    className="absolute cursor-move"
                    style={{
                      left: `${currentDesignPos.x}%`,
                      top: `${currentDesignPos.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: `${currentDesignSize}px`,
                      height: 'auto',
                      pointerEvents: isDragging ? 'none' : 'auto',
                      border: '2px dashed rgba(59, 130, 246, 0.5)',
                      padding: '4px',
                      zIndex: 10,
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsDragging(true);
                    }}
                    draggable={false}
                  />
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-4 text-center">
                💡 {currentDesign ? 'Click and drag the design to reposition it' : 'Select a design to get started'}
              </p>
            </div>
          </div>

          {/* Controls Section */}
          <div className="space-y-6">
            {/* Size Selection */}
            {reversedSizes.length > 0 && (
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-4">Select Size *</h3>
                <div className="flex gap-2 flex-wrap">
                  {reversedSizes.map((size) => (
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

            {/* Admin Design Selection */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">
                🎨 Select Design ({view === 'front' ? 'Front' : 'Back'})
              </h3>
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
                          className="w-full h-20 object-contain rounded mb-1 bg-white"
                        />
                        <p className="text-xs font-medium truncate">{design.name}</p>
                      </div>
                    ))}
                  </div>
                  {currentDesign && (
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
                  )}
                </div>
              )}
            </div>

            {/* Design Size Control */}
            {currentDesign && (
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-4">Design Size</h3>
                <div>
                  <Label>Size: {currentDesignSize}px</Label>
                  <input
                    type="range"
                    min="50"
                    max="400"
                    value={currentDesignSize}
                    onChange={(e) => {
                      const newSize = Number(e.target.value);
                      if (view === 'front') {
                        setFrontDesignSize(newSize);
                      } else {
                        setBackDesignSize(newSize);
                      }
                    }}
                    className="w-full"
                  />
                </div>
              </div>
            )}

            {/* Pricing & Add to Cart */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Base Product</span>
                  <span>₹{product.price}</span>
                </div>
                {frontDesign && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>+ Front Design</span>
                    <span>₹100</span>
                  </div>
                )}
                {backDesign && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>+ Back Design</span>
                    <span>₹100</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>
                    ₹{product.price + (frontDesign ? 100 : 0) + (backDesign ? 100 : 0)}
                  </span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={isProcessing || (!frontDesign && !backDesign) || (reversedSizes.length > 0 && !selectedSize)}
              >
                {isProcessing ? "Processing..." : "Add to Cart"}
              </Button>
              {!frontDesign && !backDesign && (
                <p className="text-xs text-muted-foreground mt-2 text-center">
                  Select at least one design to continue
                </p>
              )}
              {reversedSizes.length > 0 && !selectedSize && (frontDesign || backDesign) && (
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
