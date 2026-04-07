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

  // ── Data ─────────────────────────────────────────────────────────────────
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // ── Customization state ───────────────────────────────────────────────────
  const [view, setView] = useState<"front" | "back">("front");
  // Mirror in a ref so the non-passive touchmove listener never sees stale state
  const viewRef = useRef<"front" | "back">("front");
  const [selectedSize, setSelectedSize] = useState<string>("");

  const [frontDesign, setFrontDesign] = useState<CustomDesign | null>(null);
  const [backDesign, setBackDesign] = useState<CustomDesign | null>(null);

  // ── Aspect-ratio lock ─────────────────────────────────────────────────────
  const [lockAspectRatio, setLockAspectRatio] = useState(true);

  // ── Drag state (refs to avoid stale closures in addEventListener) ─────────
  const [isDragging, setIsDragging] = useState(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const isDraggingRef = useRef(false);

  // ── Fees ──────────────────────────────────────────────────────────────────
  const [isProcessing, setIsProcessing] = useState(false);
  const [feeSettings, setFeeSettings] = useState<FeeSettings>({
    shippingFee: 0,
    shippingFeeType: "fixed",
    customizationFee: 0,
  });
  const [isLoadingFees, setIsLoadingFees] = useState(true);
  const [feeError, setFeeError] = useState<string | null>(null);

  // ── Fetch product ─────────────────────────────────────────────────────────
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
      } catch {
        toast.error("Failed to load product");
        navigate("/");
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchData();
  }, [slug, navigate]);

  // ── Fetch fees ────────────────────────────────────────────────────────────
  useEffect(() => {
    let isMounted = true;
    const loadFees = async () => {
      try {
        const settings = await getFeeSettings();
        if (isMounted) {
          setFeeSettings(settings);
          setFeeError(null);
        }
      } catch {
        if (isMounted) {
          setFeeError("Unable to load customization fees. Using defaults.");
          setFeeSettings({ shippingFee: 0, shippingFeeType: "fixed", customizationFee: 0 });
        }
      } finally {
        if (isMounted) setIsLoadingFees(false);
      }
    };
    loadFees();
    return () => { isMounted = false; };
  }, []);

  // ── Render canvas ─────────────────────────────────────────────────────────
  useEffect(() => {
    if (!product || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const productImage = new Image();
    productImage.crossOrigin = "anonymous";
    productImage.onload = () => {
      ctx.drawImage(productImage, 0, 0, canvas.width, canvas.height);

      const currentDesign = view === "front" ? frontDesign : backDesign;
      if (currentDesign) {
        const designImage = new Image();
        designImage.crossOrigin = "anonymous";
        designImage.onload = () => {
          ctx.save();
          const x = (currentDesign.x / 100) * canvas.width;
          const y = (currentDesign.y / 100) * canvas.height;
          const w = (currentDesign.width / 100) * canvas.width;
          const h = (currentDesign.height / 100) * canvas.height;
          ctx.translate(x + w / 2, y + h / 2);
          ctx.rotate((currentDesign.rotation * Math.PI) / 180);
          ctx.translate(-(x + w / 2), -(y + h / 2));
          ctx.drawImage(designImage, x, y, w, h);
          ctx.restore();
        };
        designImage.src = currentDesign.imageUrl;
      }
    };

    const baseImage =
      view === "front"
        ? product.images?.[0]
        : product.images?.[1] || product.images?.[0];
    if (baseImage) productImage.src = toImageUrl(baseImage) || baseImage;
  }, [product, view, frontDesign, backDesign]);

  // ── Upload handler ────────────────────────────────────────────────────────
  const handleDesignUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { toast.error("Please upload an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error("Image size should be less than 5MB"); return; }

    const reader = new FileReader();
    reader.onload = (event) => {
      const imageUrl = event.target?.result as string;

      // Detect natural aspect ratio so the lock works from the start
      const img = new Image();
      img.onload = () => {
        const aspectRatio = img.naturalWidth / img.naturalHeight;
        const startWidth = 40;
        const startHeight = startWidth / aspectRatio;
        const newDesign: CustomDesign = {
          imageUrl,
          x: 30,
          y: 20,
          width: startWidth,
          height: Math.max(5, Math.min(100, startHeight)),
          rotation: 0,
        };
        if (view === "front") setFrontDesign(newDesign);
        else setBackDesign(newDesign);
        toast.success(`Design uploaded for ${view} side! Drag or resize it below.`);
      };
      img.src = imageUrl;
    };
    reader.readAsDataURL(file);
  };

  // ── Shared drag utilities ─────────────────────────────────────────────────
  const getCanvasPercent = (clientX: number, clientY: number) => {
    if (!canvasRef.current) return null;
    const rect = canvasRef.current.getBoundingClientRect();
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    };
  };

  const applyDrag = useCallback((clientX: number, clientY: number) => {
    if (!isDraggingRef.current) return;
    const pos = getCanvasPercent(clientX, clientY);
    if (!pos) return;

    const deltaX = pos.x - dragStartRef.current.x;
    const deltaY = pos.y - dragStartRef.current.y;

    const update = (prev: CustomDesign | null): CustomDesign | null => {
      if (!prev) return prev;
      return {
        ...prev,
        x: Math.max(0, Math.min(100 - prev.width, prev.x + deltaX)),
        y: Math.max(0, Math.min(100 - prev.height, prev.y + deltaY)),
      };
    };

    if (viewRef.current === "front") setFrontDesign(update);
    else setBackDesign(update);

    dragStartRef.current = pos;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Mouse handlers ────────────────────────────────────────────────────────
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

  // ── Touch handlers ────────────────────────────────────────────────────────
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
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

  // Non-passive touchmove — must use addEventListener to call preventDefault
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const onTouchMove = (e: TouchEvent) => {
      if (!isDraggingRef.current || e.touches.length !== 1) return;
      e.preventDefault();
      const touch = e.touches[0];
      applyDrag(touch.clientX, touch.clientY);
    };
    canvas.addEventListener("touchmove", onTouchMove, { passive: false });
    return () => canvas.removeEventListener("touchmove", onTouchMove);
  }, [applyDrag]);

  // ── Design dimension setter (with optional aspect-ratio lock) ─────────────
  const setDesignDimension = (axis: "width" | "height", value: number) => {
    const currentDesign = view === "front" ? frontDesign : backDesign;
    if (!currentDesign) return;

    const clamped = Math.max(5, Math.min(100, value));
    let newWidth = currentDesign.width;
    let newHeight = currentDesign.height;

    if (axis === "width") {
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
    if (view === "front") setFrontDesign(updated);
    else setBackDesign(updated);
  };

  // ── Rotation setter ────────────────────────────────────────────────────────
  const setRotation = (degrees: number) => {
    const currentDesign = view === "front" ? frontDesign : backDesign;
    if (!currentDesign) return;
    const updated = { ...currentDesign, rotation: degrees % 360 };
    if (view === "front") setFrontDesign(updated);
    else setBackDesign(updated);
  };

  const rotateBy = (delta: number) => {
    const currentDesign = view === "front" ? frontDesign : backDesign;
    if (!currentDesign) return;
    setRotation(currentDesign.rotation + delta);
  };

  // ── Remove design ─────────────────────────────────────────────────────────
  const removeDesign = () => {
    if (view === "front") { setFrontDesign(null); toast.success("Front design removed"); }
    else { setBackDesign(null); toast.success("Back design removed"); }
  };

  // ── Add to cart ───────────────────────────────────────────────────────────
  const handleAddToCart = async () => {
    if (!product) return;
    if (product.sizes && product.sizes.length > 0 && !selectedSize) {
      toast.error("Please select a size");
      return;
    }
    try {
      setIsProcessing(true);
      if (!getToken()) {
        toast.error("Please sign in to add items to cart");
        navigate(`/login?redirect=${encodeURIComponent(location.pathname)}`);
        return;
      }
      let previewUrl = "";
      if (canvasRef.current) previewUrl = canvasRef.current.toDataURL("image/png");

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
          frontDesign: frontDesign
            ? { imageUrl: frontDesign.imageUrl, x: frontDesign.x, y: frontDesign.y, width: frontDesign.width, height: frontDesign.height, rotation: frontDesign.rotation }
            : null,
          backDesign: backDesign
            ? { imageUrl: backDesign.imageUrl, x: backDesign.x, y: backDesign.y, width: backDesign.width, height: backDesign.height, rotation: backDesign.rotation }
            : null,
          previewUrl,
        },
      });
      toast.success("Custom product added to cart!");
      navigate("/cart");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setIsProcessing(false);
    }
  };

  // ─────────────────────────────────────────────────────────────────────────
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

  const currentDesign = view === "front" ? frontDesign : backDesign;
  const hasAnyCustomization = !!(frontDesign || backDesign);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-2">Customize {product.name}</h1>
        <p className="text-muted-foreground mb-8">
          Upload your own design and position it freely on the product
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Preview ──────────────────────────────────────────────── */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg overflow-hidden shadow-lg p-8">

              {/* Front / Back toggle */}
              <div className="flex gap-4 mb-6 justify-center">
                <Button
                  variant={view === "front" ? "default" : "outline"}
                  onClick={() => { setView("front"); viewRef.current = "front"; }}
                  className="flex-1 max-w-xs"
                >
                  Front View
                </Button>
                <Button
                  variant={view === "back" ? "default" : "outline"}
                  onClick={() => { setView("back"); viewRef.current = "back"; }}
                  className="flex-1 max-w-xs"
                >
                  Back View
                </Button>
              </div>

              {/* Canvas */}
              <div
                ref={previewRef}
                className={`flex justify-center items-center bg-muted/20 rounded-lg p-8 relative ${currentDesign ? "cursor-grab active:cursor-grabbing" : "cursor-default"}`}
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
                    <span className="hidden sm:inline">Drag to position</span>
                    <span className="sm:hidden">Touch &amp; drag</span>
                  </div>
                )}
              </div>

              <div className="mt-4 text-sm text-muted-foreground text-center">
                <p>
                  <strong>{view === "front" ? "Front" : "Back"} Side:</strong>{" "}
                  {currentDesign ? "✓ Design uploaded" : "No design"}
                </p>
              </div>
            </div>
          </div>

          {/* ── Controls ─────────────────────────────────────────────── */}
          <div className="space-y-6">

            {/* Size selection */}
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
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background hover:border-primary"
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
                Upload Your Design ({view === "front" ? "Front" : "Back"})
              </h3>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="design-upload" className="cursor-pointer">
                    <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary transition-colors">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload your design</p>
                      <p className="text-xs text-muted-foreground mt-1">PNG, JPG up to 5MB</p>
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
                  <div className="space-y-4">
                    {/* Thumbnail + remove */}
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-16 border rounded overflow-hidden flex-shrink-0">
                        <img
                          src={currentDesign.imageUrl}
                          alt="Uploaded design"
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <Button size="sm" variant="destructive" onClick={removeDesign}>
                        <X className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    </div>

                    {/* ── Size & Rotation controls ── */}
                    <div className="space-y-4 pt-3 border-t">

                      {/* Width slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Label className="text-xs font-medium">Width</Label>
                          <span className="text-xs text-muted-foreground tabular-nums font-mono">
                            {Math.round(currentDesign.width)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={100}
                          step={1}
                          value={Math.round(currentDesign.width)}
                          onChange={(e) =>
                            setDesignDimension("width", Number(e.target.value))
                          }
                          className="w-full accent-primary h-2 cursor-pointer"
                        />
                      </div>

                      {/* Height slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Label className="text-xs font-medium">Height</Label>
                          <span className="text-xs text-muted-foreground tabular-nums font-mono">
                            {Math.round(currentDesign.height)}%
                          </span>
                        </div>
                        <input
                          type="range"
                          min={5}
                          max={100}
                          step={1}
                          value={Math.round(currentDesign.height)}
                          onChange={(e) =>
                            setDesignDimension("height", Number(e.target.value))
                          }
                          className="w-full accent-primary h-2 cursor-pointer"
                        />
                      </div>

                      {/* Lock aspect ratio */}
                      <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={lockAspectRatio}
                          onChange={(e) => setLockAspectRatio(e.target.checked)}
                          className="accent-primary w-4 h-4"
                        />
                        <span className="text-xs text-muted-foreground">
                          Lock aspect ratio
                        </span>
                      </label>

                      {/* Rotation slider */}
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <Label className="text-xs font-medium">Rotation</Label>
                          <span className="text-xs text-muted-foreground tabular-nums font-mono">
                            {currentDesign.rotation}°
                          </span>
                        </div>
                        <input
                          type="range"
                          min={-180}
                          max={180}
                          step={1}
                          value={currentDesign.rotation}
                          onChange={(e) => setRotation(Number(e.target.value))}
                          className="w-full accent-primary h-2 cursor-pointer mb-2"
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rotateBy(-15)}
                            className="flex-1"
                          >
                            ↶ 15°
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => rotateBy(15)}
                            className="flex-1"
                          >
                            ↷ 15°
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setRotation(0)}
                            className="flex-1 text-xs"
                            title="Reset rotation"
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
                  !!(product.sizes && product.sizes.length > 0 && !selectedSize)
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
