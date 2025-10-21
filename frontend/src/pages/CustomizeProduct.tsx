import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { useNavigate, useLocation, useParams } from "react-router-dom";
import { apiFetch, getToken } from "@/lib/api";

type Product = {
  _id: string;
  name: string;
  slug: string;
  price: number;
  description?: string;
  images?: string[];
  isCustomizable: boolean;
  customizationOptions?: {
    allowPhotoUpload: boolean;
    allowText: boolean;
    allowFrontCustomization: boolean;
    allowBackCustomization: boolean;
    baseCustomizationPrice: number;
    photoUploadPrice: number;
    textPrice: number;
  };
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

export default function CustomizeProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams<{ slug: string }>();
  const captureRef = useRef<HTMLDivElement>(null);
  
  // Product and designs state
  const [product, setProduct] = useState<Product | null>(null);
  const [designs, setDesigns] = useState<Design[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State
  const [view, setView] = useState<'front' | 'back'>('front');
  const [tshirtColor, setTshirtColor] = useState("#ffffff");
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(48);
  const [textRotation, setTextRotation] = useState(0);
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Text position state (percentage-based)
  const [frontTextPos, setFrontTextPos] = useState({ x: 50, y: 30 });
  const [backTextPos, setBackTextPos] = useState({ x: 50, y: 30 });
  
  // Image position and size state
  const [frontImagePos, setFrontImagePos] = useState({ x: 50, y: 50 });
  const [backImagePos, setBackImagePos] = useState({ x: 50, y: 50 });
  const [imageSize, setImageSize] = useState(150);
  
  // Dragging state
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);

  // Fetch product and designs
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch product
        const productRes = await apiFetch<{ data: Product }>(`/products/${slug}`);
        const fetchedProduct = productRes.data;
        
        if (!fetchedProduct.isCustomizable) {
          // Don't redirect, just set product to show message
          setProduct(fetchedProduct);
          setLoading(false);
          return;
        }
        
        setProduct(fetchedProduct);
        
        // Fetch active designs
        const designsRes = await apiFetch<{ data: Design[] }>('/designs?isActive=true');
        setDesigns(designsRes.data || []);
        
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Failed to load customization options");
        navigate('/');
      } finally {
        setLoading(false);
      }
    };
    
    if (slug) {
      fetchData();
    }
  }, [slug, navigate]);

  // Handle custom photo upload
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
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
      if (side === 'front') {
        setFrontImage(imageUrl);
      } else {
        setBackImage(imageUrl);
      }
      toast.success("Photo uploaded successfully!");
    };
    reader.readAsDataURL(file);
  };

  // Handle approved design selection
  const handleDesignSelect = (designUrl: string, side: 'front' | 'back') => {
    if (side === 'front') {
      setFrontImage(designUrl);
    } else {
      setBackImage(designUrl);
    }
    toast.success("Design applied!");
  };

  // Handle mouse move for dragging
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!captureRef.current) return;
    
    const rect = captureRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    
    if (isDraggingText) {
      if (view === 'front') {
        setFrontTextPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      } else {
        setBackTextPos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      }
    }
    
    if (isDraggingImage) {
      if (view === 'front') {
        setFrontImagePos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      } else {
        setBackImagePos({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
      }
    }
  };

  const handleMouseUp = () => {
    setIsDraggingText(false);
    setIsDraggingImage(false);
  };

  // Calculate price
  const calculatePrice = () => {
    if (!product) return 0;
    
    let total = product.price;
    const opts = product.customizationOptions;
    
    if (opts) {
      total += opts.baseCustomizationPrice;
      if ((frontImage || backImage) && opts.allowPhotoUpload) {
        total += opts.photoUploadPrice;
      }
      // Text feature is disabled, so no text pricing
    }
    
    return total;
  };

  // Add to cart
  const handleAddToCart = async () => {
    if (!product) return;
    
    try {
      setIsProcessing(true);
      const isAuthed = !!getToken();
      if (!isAuthed) {
        toast.error("Please sign in to add items to cart");
        const redirect = `${location.pathname}${location.search}`;
        navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
        return;
      }
      
      addToCart({
        id: parseInt(product._id, 36),
        name: `Custom ${product.name}`,
        price: calculatePrice(),
        quantity: 1,
        image: product.images?.[0] || "/placeholder-tshirt.png",
        customization: {
          color: tshirtColor,
          frontText,
          backText,
          textColor,
          fontSize,
          textRotation,
          frontImage,
          backImage,
          frontTextPos,
          backTextPos,
          frontImagePos,
          backImagePos,
          imageSize,
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
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg">Loading customization options...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <p className="text-lg">Product not found</p>
        </div>
      </div>
    );
  }

  // Show message if product is not customizable
  if (!product.isCustomizable) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="max-w-4xl mx-auto px-4 py-8 pt-24">
          <div className="bg-card rounded-lg shadow-lg p-8 text-center">
            <h1 className="text-3xl font-bold mb-4">Customization Not Available</h1>
            <p className="text-muted-foreground mb-6">
              Sorry, <strong>{product.name}</strong> is not available for customization at this time.
            </p>
            <div className="flex gap-4 justify-center">
              <Button onClick={() => navigate(`/products/${product.slug}`)}>
                View Product Details
              </Button>
              <Button variant="outline" onClick={() => navigate('/customize')}>
                Browse Customizable Products
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const opts = product.customizationOptions;
  const currentText = view === 'front' ? frontText : backText;
  const currentTextPos = view === 'front' ? frontTextPos : backTextPos;
  const currentImage = view === 'front' ? frontImage : backImage;
  const currentImagePos = view === 'front' ? frontImagePos : backImagePos;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-2">Customize {product.name}</h1>
        <p className="text-muted-foreground mb-8">{product.description}</p>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Product Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg overflow-hidden shadow-lg p-8">
              {/* View Toggle */}
              {opts?.allowFrontCustomization && opts?.allowBackCustomization && (
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
              )}

              {/* Zoom Controls */}
              <div className="flex items-center justify-center gap-4 mb-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
                  disabled={zoom <= 0.5}
                >
                  Zoom Out -
                </Button>
                <span className="text-sm font-medium min-w-[60px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(Math.min(2, zoom + 0.1))}
                  disabled={zoom >= 2}
                >
                  Zoom In +
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setZoom(1)}
                >
                  Reset
                </Button>
              </div>

              {/* Product Display */}
              <div 
                ref={captureRef}
                className="relative flex justify-center items-center bg-muted/20 rounded-lg p-8 select-none overflow-auto"
                style={{ minHeight: "600px" }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* Product Image with Color */}
                <div 
                  className="relative inline-block" 
                  style={{ 
                    maxHeight: "600px", 
                    pointerEvents: "none",
                    transform: `scale(${zoom})`,
                    transition: "transform 0.2s ease"
                  }}
                >
                  <img 
                    src={
                      view === 'back'
                        ? (product.images?.[1] || product.images?.[0] || "/placeholder-tshirt.png")
                        : (product.images?.[0] || "/placeholder-tshirt.png")
                    }
                    alt={product.name}
                    className="max-w-full h-auto"
                    style={{ 
                      maxHeight: "600px",
                      objectFit: "contain",
                      display: "block"
                    }}
                    draggable={false}
                  />
                </div>
                
                {/* Custom Image Overlay */}
                {currentImage && (
                  <img
                    src={currentImage}
                    alt="Custom design"
                    className="absolute cursor-move"
                    style={{
                      left: `${currentImagePos.x}%`,
                      top: `${currentImagePos.y}%`,
                      transform: 'translate(-50%, -50%)',
                      width: `${imageSize}px`,
                      height: 'auto',
                      pointerEvents: isDraggingImage ? 'none' : 'auto',
                      border: '2px dashed rgba(255,255,255,0.5)',
                      padding: '4px',
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsDraggingImage(true);
                    }}
                    draggable={false}
                  />
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-4 text-center">
                💡 Click and drag images to reposition them
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Designs */}
            {designs.length > 0 && (
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-4">Choose a Design</h3>
                <div className="grid grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {designs.map((design) => (
                    <div
                      key={design._id}
                      className="cursor-pointer border-2 border-transparent hover:border-accent rounded p-1 transition"
                      onClick={() => handleDesignSelect(design.imageUrl, view)}
                    >
                      <img
                        src={design.imageUrl}
                        alt={design.name}
                        className="w-full h-20 object-cover rounded"
                      />
                      <p className="text-xs text-center mt-1 truncate">{design.name}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Photo Upload */}
            {opts?.allowPhotoUpload && (
              <div className="bg-card p-6 rounded-lg shadow">
                <h3 className="font-semibold text-lg mb-4">Upload Your Photo</h3>
                <div className="space-y-3">
                  {opts.allowFrontCustomization && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Front Photo</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, 'front')}
                        disabled={isProcessing}
                      />
                      {frontImage && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="mt-2"
                          onClick={() => setFrontImage(null)}
                        >
                          Remove Front Photo
                        </Button>
                      )}
                    </div>
                  )}
                  {opts.allowBackCustomization && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Back Photo</label>
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handlePhotoUpload(e, 'back')}
                        disabled={isProcessing}
                      />
                      {backImage && (
                        <Button
                          size="sm"
                          variant="destructive"
                          className="mt-2"
                          onClick={() => setBackImage(null)}
                        >
                          Remove Back Photo
                        </Button>
                      )}
                    </div>
                  )}
                  {(frontImage || backImage) && (
                    <div>
                      <label className="block text-sm font-medium mb-2">Image Size: {imageSize}px</label>
                      <input
                        type="range"
                        min="50"
                        max="300"
                        value={imageSize}
                        onChange={(e) => setImageSize(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Max 5MB • PNG, JPG
                  </p>
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
                {opts && opts.baseCustomizationPrice > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>+ Customization</span>
                    <span>₹{opts.baseCustomizationPrice}</span>
                  </div>
                )}
                {(frontImage || backImage) && opts?.photoUploadPrice && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>+ Photo Upload</span>
                    <span>₹{opts.photoUploadPrice}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{calculatePrice()}</span>
                </div>
              </div>
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={isProcessing}
              >
                {isProcessing ? "Processing..." : "Add to Cart"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
