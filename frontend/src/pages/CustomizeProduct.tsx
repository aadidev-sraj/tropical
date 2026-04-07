import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { apiFetch, toImageUrl, getToken, getFeeSettings, type FeeSettings } from "@/lib/api";
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
  // Keep a ref in sync with view so the non-reactive touchmove handler
  // can always see the current value without stale closures.
  const viewRef = useRef<'front' | 'back'>('front');
  const [selectedSize, setSelectedSize] = useState<string>('');
  
  // Front customization
  const [frontDesign, setFrontDesign] = useState<CustomDesign | null>(null);
  
  // Back customization
  const [backDesign, setBackDesign] = useState<CustomDesign | null>(null);
  
  // Dragging state
  // Using a ref (not state) for dragStart so the non-passive touch
  // listener can always read the latest value without stale closures.
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [feeSettings, setFeeSettings] = useState<FeeSettings>({ shippingFee: 0, customizationFee: 0 });
  const [isLoadingFees, setIsLoadingFees] = useState(true);
  const [feeError, setFeeError] = useState<string | null>(null);

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

  useEffect(() => {
    let isMounted = true;
    const loadFees = async () => {
      try {
        const settings = await getFeeSettings();
        if (isMounted) {
          setFeeSettings(settings);
          setFeeError(null);
        }
      } catch (error) {
        if (isMounted) {
          console.error('Failed to load fee settings', error);
          setFeeError('Unable to load customization fees. Using defaults.');
          setFeeSettings({ shippingFee: 0, customizationFee: 0 });
        }
      } finally {
        if (isMounted) setIsLoadingFees(false);
      }
    };

    loadFees();
    return () => {
      isMounted = false;
    };
  }, []);

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

  // ─── Shared drag utilities ───────────────────────────────────────────────

  /**
   * Convert a raw clientX/clientY into a percentage position relative to
   * the canvas element. This is the single source of truth for both mouse
   * and touch coordinate normalisation.
   */
  const getCanvasPercent = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  /**
   * Core move logic — called by both mouse move and touch move handlers.
   * Reads from refs so it is safe to call from a non-passive event listener
   * registered via addEventListener (where state closures would be stale).
   */
  const applyDrag = useCallback(
    (clientX: number, clientY: number) => {
      if (!isDraggingRef.current) return;

      const pos = getCanvasPercent(clientX, clientY);
      if (!pos) return;

      const deltaX = pos.x - dragStartRef.current.x;
      const deltaY = pos.y - dragStartRef.current.y;

      // Update whichever design is active.  We use the functional form of
      // setState so we always operate on the latest value.
      const update = (prev: CustomDesign | null): CustomDesign | null => {
        if (!prev) return prev;
        return {
          ...prev,
          x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
          y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY)),
        };
      };

      // We need to know the current view inside this callback.  Because
      // applyDrag is used inside a non-reactive addEventListener, we read
      // the view from a ref (added below) rather than closing over state.
      if (viewRef.current === 'front') {
        setFrontDesign(update);
      } else {
        setBackDesign(update);
      }

      dragStartRef.current = pos;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  // ─── Mouse handlers ──────────────────────────────────────────────────────

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const pos = getCanvasPercent(e.clientX, e.clientY);
    if (!pos) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = pos;
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    applyDrag(e.clientX, e.clientY);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  // ─── Touch handlers ──────────────────────────────────────────────────────

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    // Only start a drag when a single finger touches the canvas.
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    const pos = getCanvasPercent(touch.clientX, touch.clientY);
    if (!pos) return;
    isDraggingRef.current = true;
    setIsDragging(true);
    dragStartRef.current = pos;
  };

  const handleTouchEnd = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  /**
   * Attach a NON-PASSIVE touchmove listener to the canvas.
   *
   * React's synthetic onTouchMove is passive by default, which means
   * calling e.preventDefault() inside it has no effect — the browser
   * scrolls the page anyway.  By using addEventListener with
   * { passive: false } we can call preventDefault() to lock the scroll
   * while the user is actively repositioning the design.
   */
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      e.preventDefault(); // stops page scroll while dragging
      const touch = e.touches[0];
      applyDrag(touch.clientX, touch.clientY);
    };

    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    return () => canvas.removeEventListener('touchmove', onTouchMove);
  }, [applyDrag]);

  // Whether width & height sliders should move together (keep aspect ratio)
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  /**
   * Set width or height directly (in % of canvas).
   * If lockAspectRatio is true and the image has a known natural ratio,
   * the other axis is adjusted proportionally.
   */
  const setDesignDimension = (
    axis: 'width' | 'height',
    value: number
  ) => {
    const currentDesign = view === 'front' ? frontDesign : backDesign;
    if (!currentDesign) return;

    const clamped = Math.max(5, Math.min(100, value));
    let newWidth = currentDesign.width;
    let newHeight = currentDesign.height;

    if (axis === 'width') {
      newWidth = clamped;
      if (lockAspectRatio && currentDesign.height > 0) {
        const ratio = currentDesign.width / currentDesign.height;
        newHeight = Math.max(5, Math.min(100, clamped / ratio));
      }
    } else {
      newHeight = clamped;
      if (lockAspectRatio && currentDesign.width > 0) {
        const ratio = currentDesign.width / currentDesign.height;
        newWidth = Math.max(5, Math.min(100, clamped * ratio));
      }
    }

    const updated = { ...currentDesign, width: newWidth, height: newHeight };
    if (view === 'front') setFrontDesign(updated);
    else setBackDesign(updated);
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
      
      const customizationFee = hasAnyCustomization ? feeSettings.customizationFee : 0;
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
                  onClick={() => { setView('front'); viewRef.current = 'front'; }}
                  className="flex-1 max-w-xs"
                >
                  Front View
                </Button>
                <Button
                  variant={view === 'back' ? 'default' : 'outline'}
                  onClick={() => { setView('back'); viewRef.current = 'back'; }}
                  className="flex-1 max-w-xs"
                >
                  Back View
                </Button>
              </div>

              {/* Canvas Preview */}
              <div 
                ref={previewRef}
                className={`flex justify-center items-center bg-muted/20 rounded-lg p-8 relative ${currentDesign ? 'cursor-grab active:cursor-grabbing' : 'cursor-default'}`}
                style={{ minHeight: "500px" }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={700}
                  className="max-w-full h-auto border rounded shadow-sm touch-none"
                  onMouseDown={currentDesign ? handleMouseDown : undefined}
                  onTouchStart={currentDesign ? handleTouchStart : undefined}
                  onTouchEnd={currentDesign ? handleTouchEnd : undefined}
                />
                {currentDesign && (
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded text-sm flex items-center gap-2">
                    <Move className="h-4 w-4" />
                    <span className="hidden sm:inline">Drag</span>
                    <span className="sm:hidden">Touch &amp; drag</span>
                    <span className="hidden sm:inline">to position</span>
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
                    <div className="space-y-4 pt-2 border-t">

                      {/* ── Width ─────────────────────────────── */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Label className="text-xs">Width</Label>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {Math.round(currentDesign.width)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={100}
                          step={1}
                          value={Math.round(currentDesign.width)}
                          onChange={(e) => setDesignDimension('width', Number(e.target.value))}
                          className="w-full accent-primary"
                        />
                      </div>

                      {/* ── Height ────────────────────────────── */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Label className="text-xs">Height</Label>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {Math.round(currentDesign.height)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={100}
                          step={1}
                          value={Math.round(currentDesign.height)}
                          onChange={(e) => setDesignDimension('height', Number(e.target.value))}
                          className="w-full accent-primary"
                        />
                      </div>

                      {/* ── Lock aspect ratio ─────────────────── */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={lockAspectRatio}
                          onChange={(e) => setLockAspectRatio(e.target.checked)}
                          className="accent-primary"
                        />
                        <span className="text-xs text-muted-foreground">
                          Lock aspect ratio
                        </span>
                      </label>

                      {/* ── Rotation ──────────────────────────── */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Label className="text-xs">Rotation</Label>
                          <span className="text-xs text-muted-foreground tabular-nums">
                            {currentDesign.rotation}°
                          </span>
                        </div>
                        {/* Free-form slider: −180° → 180° */}
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          step={1}
                          value={currentDesign.rotation}
                          onChange={(e) => updateDesignRotation(
                            Number(e.target.value) - currentDesign.rotation
                          )}
                          className="w-full accent-primary mb-2"
                        />
                        {/* Step buttons for fine-tuning */}
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDesignRotation(-15)}
                            className="flex-1"
                          >
                            ↶ 15°
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDesignRotation(15)}
                            className="flex-1"
                          >
                            ↷ 15°
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateDesignRotation(-currentDesign.rotation)}
                            className="flex-1 text-xs"
                            title="Reset rotation to 0°"
                          >
                            ↺ Reset
                          </Button>
                        </div>
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
                  <span>₹{product.price.toFixed(2)}</span>
                </div>
                {hasAnyCustomization && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>+ Custom Design Fee</span>
                    <span>₹{feeSettings.customizationFee.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>
                    ₹{(product.price + (hasAnyCustomization ? feeSettings.customizationFee : 0)).toFixed(2)}
                  </span>
                </div>
              </div>
              {feeError && (
                <p className="text-xs text-amber-600 mb-2">{feeError}</p>
              )}
              <Button
                className="w-full"
                size="lg"
                onClick={handleAddToCart}
                disabled={
                  isProcessing ||
                  isLoadingFees ||
                  !hasAnyCustomization ||
                  (product.sizes && product.sizes.length > 0 && !selectedSize)
                }
              >
                {isProcessing ? "Processing..." : isLoadingFees ? "Loading fees..." : "Add to Cart"}
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
