import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { useNavigate, useLocation } from "react-router-dom";
import { HexColorPicker } from "react-colorful";
import regTshirtFront from "@/assets/reg tshirt front.png";
import regTshirtBack from "@/assets/reg tshirt back.png";
import oversizedTshirtFront from "@/assets/oversized tshirt front.png";
import oversizedTshirtBack from "@/assets/oversized tshirt back.png";
import { getToken } from "@/lib/api";

export default function Customize2D() {
  const navigate = useNavigate();
  const location = useLocation();
  const captureRef = useRef<HTMLDivElement>(null);
  
  // State
  const [view, setView] = useState<'front' | 'back'>('front');
  const [tshirtFit, setTshirtFit] = useState<'regular' | 'oversized'>('regular');
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

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, side: 'front' | 'back') => {
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
      toast.success("Image uploaded successfully!");
    };
    reader.readAsDataURL(file);
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

  // Capture preview - simplified version
  const capturePreview = async (): Promise<string> => {
    // For now, return a placeholder
    // In production, you'd want to use a proper screenshot library
    return "/placeholder-tshirt.png";
  };

  // Add to cart
  const handleAddToCart = async () => {
    try {
      setIsProcessing(true);
      const isAuthed = !!getToken();
      if (!isAuthed) {
        toast.error("Please sign in to add items to cart");
        const redirect = `${location.pathname}${location.search}`;
        navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
        return;
      }
      
      const previewUrl = await capturePreview();
      
      let price = 599;
      if (frontImage || backImage) price += 100;
      if (frontText || backText) price += 50;
      
      addToCart({
        id: 999002,
        name: `Custom ${tshirtFit === 'regular' ? 'Regular' : 'Oversized'} T-Shirt`,
        price,
        quantity: 1,
        image: previewUrl || "/placeholder-tshirt.png",
        customization: {
          fit: tshirtFit,
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
          previewUrl,
        },
      });
      
      toast.success("Custom T-shirt added to cart!");
      navigate("/cart");
      
    } catch (error: any) {
      console.error("Add to cart error:", error);
      toast.error("Failed to add to cart");
    } finally {
      setIsProcessing(false);
    }
  };

  const currentText = view === 'front' ? frontText : backText;
  const currentTextPos = view === 'front' ? frontTextPos : backTextPos;
  const currentImage = view === 'front' ? frontImage : backImage;
  const currentImagePos = view === 'front' ? frontImagePos : backImagePos;
  
  // Get the appropriate T-shirt image based on fit and view
  const getTshirtImage = () => {
    if (tshirtFit === 'regular') {
      return view === 'front' ? regTshirtFront : regTshirtBack;
    } else {
      return view === 'front' ? oversizedTshirtFront : oversizedTshirtBack;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-8">Customize Your T-Shirt</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* T-Shirt Viewer */}
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

              {/* T-Shirt Display */}
              <div 
                ref={captureRef}
                className="relative flex justify-center items-center bg-muted/20 rounded-lg p-8 select-none overflow-auto"
                style={{ minHeight: "600px" }}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                {/* T-Shirt Image with Color */}
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
                    src={getTshirtImage()} 
                    alt={`${tshirtFit} t-shirt ${view}`}
                    className="max-w-full h-auto"
                    style={{ 
                      maxHeight: "600px",
                      objectFit: "contain",
                      display: "block"
                    }}
                    draggable={false}
                  />
                  {/* Color overlay - only affects the T-shirt pixels */}
                  <div 
                    className="absolute inset-0"
                    style={{
                      backgroundColor: tshirtColor,
                      mixBlendMode: "multiply",
                      pointerEvents: "none",
                      WebkitMaskImage: `url(${getTshirtImage()})`,
                      maskImage: `url(${getTshirtImage()})`,
                      WebkitMaskSize: "contain",
                      maskSize: "contain",
                      WebkitMaskRepeat: "no-repeat",
                      maskRepeat: "no-repeat",
                      WebkitMaskPosition: "center",
                      maskPosition: "center"
                    }}
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
                
                {/* Text Overlay */}
                {currentText && (
                  <div
                    className="absolute cursor-move select-none"
                    style={{
                      left: `${currentTextPos.x}%`,
                      top: `${currentTextPos.y}%`,
                      transform: `translate(-50%, -50%) rotate(${textRotation}deg)`,
                      color: textColor,
                      fontSize: `${fontSize}px`,
                      fontWeight: 'bold',
                      fontFamily: 'Arial, sans-serif',
                      textShadow: '2px 2px 4px rgba(0,0,0,0.3)',
                      pointerEvents: isDraggingText ? 'none' : 'auto',
                      whiteSpace: 'nowrap',
                      border: '2px dashed rgba(255,255,255,0.3)',
                      padding: '8px',
                    }}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setIsDraggingText(true);
                    }}
                  >
                    {currentText}
                  </div>
                )}
              </div>
              
              <p className="text-sm text-muted-foreground mt-4 text-center">
                💡 Click and drag text or images to reposition them
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Fit Selector */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">T-Shirt Fit</h3>
              <div className="flex gap-3">
                <Button
                  variant={tshirtFit === 'regular' ? 'default' : 'outline'}
                  onClick={() => setTshirtFit('regular')}
                  className="flex-1"
                >
                  Regular Fit
                </Button>
                <Button
                  variant={tshirtFit === 'oversized' ? 'default' : 'outline'}
                  onClick={() => setTshirtFit('oversized')}
                  className="flex-1"
                >
                  Oversized
                </Button>
              </div>
            </div>

            {/* T-Shirt Color Picker */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">T-Shirt Color</h3>
              <div className="space-y-3">
                <div
                  className="w-full h-12 rounded border-2 cursor-pointer"
                  style={{ backgroundColor: tshirtColor }}
                  onClick={() => setShowColorPicker(!showColorPicker)}
                />
                {showColorPicker && (
                  <div className="mt-2">
                    <HexColorPicker color={tshirtColor} onChange={setTshirtColor} />
                  </div>
                )}
                <div className="flex gap-2 flex-wrap">
                  {["#ffffff", "#000000", "#ff0000", "#0000ff", "#00ff00", "#ffff00", "#ff69b4", "#800080", "#ffa500", "#8b4513"].map((c) => (
                    <button
                      key={c}
                      className="w-8 h-8 rounded border-2 hover:scale-110 transition"
                      style={{ backgroundColor: c }}
                      onClick={() => setTshirtColor(c)}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Text */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Add Text</h3>
              <div className="space-y-3">
                <div>
                  <Label>Front Text</Label>
                  <Input
                    value={frontText}
                    onChange={(e) => setFrontText(e.target.value)}
                    placeholder="Enter front text"
                    maxLength={30}
                  />
                </div>
                <div>
                  <Label>Back Text</Label>
                  <Input
                    value={backText}
                    onChange={(e) => setBackText(e.target.value)}
                    placeholder="Enter back text"
                    maxLength={30}
                  />
                </div>
                <div>
                  <Label>Text Color</Label>
                  <Input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-full h-10"
                  />
                </div>
                <div>
                  <Label>Font Size: {fontSize}px</Label>
                  <input
                    type="range"
                    min="24"
                    max="72"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Text Rotation: {textRotation}°</Label>
                  <input
                    type="range"
                    min="0"
                    max="360"
                    value={textRotation}
                    onChange={(e) => setTextRotation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Add Design</h3>
              <div className="space-y-3">
                <div>
                  <Label>Front Design</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'front')}
                    disabled={isProcessing}
                  />
                  {frontImage && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="mt-2"
                      onClick={() => setFrontImage(null)}
                    >
                      Remove Front Image
                    </Button>
                  )}
                </div>
                <div>
                  <Label>Back Design</Label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleImageUpload(e, 'back')}
                    disabled={isProcessing}
                  />
                  {backImage && (
                    <Button
                      size="sm"
                      variant="destructive"
                      className="mt-2"
                      onClick={() => setBackImage(null)}
                    >
                      Remove Back Image
                    </Button>
                  )}
                </div>
                <div>
                  <Label>Image Size: {imageSize}px</Label>
                  <input
                    type="range"
                    min="50"
                    max="300"
                    value={imageSize}
                    onChange={(e) => setImageSize(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Max 5MB • PNG, JPG, SVG
                </p>
              </div>
            </div>

            {/* Pricing & Add to Cart */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Summary</h3>
              <div className="space-y-2 text-sm mb-4">
                <div className="flex justify-between">
                  <span>Base T-Shirt</span>
                  <span>₹599</span>
                </div>
                {(frontImage || backImage) && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>+ Custom Design</span>
                    <span>₹100</span>
                  </div>
                )}
                {(frontText || backText) && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>+ Custom Text</span>
                    <span>₹50</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{599 + ((frontImage || backImage) ? 100 : 0) + ((frontText || backText) ? 50 : 0)}</span>
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
