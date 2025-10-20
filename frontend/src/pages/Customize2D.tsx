import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Navbar from "@/components/Navbar";
import { HexColorPicker } from "react-colorful";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { useNavigate } from "react-router-dom";
import regularTshirt from "@/assets/regular tshirt.jpg";
import oversizedTshirt from "@/assets/oversized tshirt.jpg";

export default function Customize2D() {
  const navigate = useNavigate();
  const frontCanvasRef = useRef<HTMLCanvasElement>(null);
  const backCanvasRef = useRef<HTMLCanvasElement>(null);
  
  // State
  const [view, setView] = useState<'front' | 'back'>('front');
  const [tshirtFit, setTshirtFit] = useState<'regular' | 'oversized'>('regular');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [frontText, setFrontText] = useState("");
  const [backText, setBackText] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(48);
  const [textRotation, setTextRotation] = useState(0);
  const [textAlignment, setTextAlignment] = useState<'left' | 'center' | 'right'>('center');
  const [frontImage, setFrontImage] = useState<string | null>(null);
  const [backImage, setBackImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Text position state
  const [frontTextPos, setFrontTextPos] = useState({ x: 50, y: 30 });
  const [backTextPos, setBackTextPos] = useState({ x: 50, y: 30 });
  
  // Image position state
  const [frontImagePos, setFrontImagePos] = useState({ x: 50, y: 50 });
  const [backImagePos, setBackImagePos] = useState({ x: 50, y: 50 });
  const [imageSize, setImageSize] = useState(150);
  
  // Dragging state
  const [isDraggingText, setIsDraggingText] = useState(false);
  const [isDraggingImage, setIsDraggingImage] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

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
    };
    reader.readAsDataURL(file);
  };

  // Render T-shirt on canvas
  const renderTshirt = (canvas: HTMLCanvasElement, text: string, image: string | null) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw T-shirt shape based on fit
    ctx.fillStyle = tshirtColor;
    
    if (tshirtFit === 'regular') {
      // Regular fit T-shirt
      ctx.beginPath();
      // Neck
      ctx.moveTo(200, 80);
      ctx.quadraticCurveTo(220, 70, 250, 80);
      ctx.lineTo(280, 80);
      ctx.quadraticCurveTo(280, 70, 300, 80);
      // Right shoulder and sleeve
      ctx.lineTo(320, 90);
      ctx.lineTo(360, 110);
      ctx.lineTo(370, 140);
      ctx.lineTo(350, 150);
      ctx.lineTo(340, 140);
      // Right side
      ctx.lineTo(330, 180);
      ctx.lineTo(320, 450);
      ctx.quadraticCurveTo(320, 470, 310, 480);
      // Bottom
      ctx.lineTo(190, 480);
      ctx.quadraticCurveTo(180, 470, 180, 450);
      // Left side
      ctx.lineTo(170, 180);
      ctx.lineTo(160, 140);
      ctx.lineTo(150, 150);
      ctx.lineTo(130, 140);
      ctx.lineTo(140, 110);
      ctx.lineTo(180, 90);
      ctx.closePath();
    } else {
      // Oversized fit T-shirt
      ctx.beginPath();
      // Neck
      ctx.moveTo(180, 90);
      ctx.quadraticCurveTo(210, 75, 250, 90);
      ctx.lineTo(290, 90);
      ctx.quadraticCurveTo(290, 75, 320, 90);
      // Right shoulder and sleeve
      ctx.lineTo(350, 105);
      ctx.lineTo(400, 130);
      ctx.lineTo(410, 170);
      ctx.lineTo(385, 185);
      ctx.lineTo(370, 170);
      // Right side
      ctx.lineTo(360, 220);
      ctx.lineTo(350, 480);
      ctx.quadraticCurveTo(350, 500, 335, 510);
      // Bottom
      ctx.lineTo(165, 510);
      ctx.quadraticCurveTo(150, 500, 150, 480);
      // Left side
      ctx.lineTo(140, 220);
      ctx.lineTo(130, 170);
      ctx.lineTo(115, 185);
      ctx.lineTo(90, 170);
      ctx.lineTo(100, 130);
      ctx.lineTo(150, 105);
      ctx.closePath();
    }
    
    ctx.fill();
    // Add shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 5;
    ctx.shadowOffsetY = 5;
    ctx.fill();
    ctx.shadowColor = 'transparent';
    
    // Outline
    ctx.strokeStyle = '#333';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Draw image if exists
    if (image) {
      const img = new Image();
      img.onload = () => {
        const imgWidth = 150;
        const imgHeight = 150;
        const x = (canvas.width - imgWidth) / 2;
        const y = tshirtFit === 'regular' ? 220 : 250;
        ctx.drawImage(img, x, y, imgWidth, imgHeight);
      };
      img.src = image;
    }

    // Draw text with rotation and alignment
    if (text) {
      ctx.save();
      const centerX = canvas.width / 2;
      const centerY = tshirtFit === 'regular' ? 180 : 200;
      
      ctx.translate(centerX, centerY);
      ctx.rotate((textRotation * Math.PI) / 180);
      
      ctx.fillStyle = textColor;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.textAlign = textAlignment;
      ctx.textBaseline = 'middle';
      
      // Add text shadow for better visibility
      ctx.shadowColor = 'rgba(0, 0, 0, 0.3)';
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      ctx.fillText(text, 0, 0);
      ctx.restore();
    }
  };

  // Update front canvas when state changes
  useEffect(() => {
    if (frontCanvasRef.current) {
      renderTshirt(frontCanvasRef.current, frontText, frontImage);
    }
  }, [tshirtColor, tshirtFit, frontText, textColor, fontSize, textRotation, textAlignment, frontImage]);

  // Update back canvas when state changes
  useEffect(() => {
    if (backCanvasRef.current) {
      renderTshirt(backCanvasRef.current, backText, backImage);
    }
  }, [tshirtColor, tshirtFit, backText, textColor, fontSize, textRotation, textAlignment, backImage]);

  // Capture preview
  const capturePreview = async (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = view === 'front' ? frontCanvasRef.current : backCanvasRef.current;
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append("file", blob, "preview.png");
            
            fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'}/upload`, {
              method: "POST",
              body: formData,
            })
              .then((res) => res.json())
              .then((data) => resolve(data.url))
              .catch(() => resolve(""));
          } else {
            resolve("");
          }
        });
      } else {
        resolve("");
      }
    });
  };

  // Add to cart
  const handleAddToCart = async () => {
    try {
      setIsProcessing(true);
      
      const previewUrl = await capturePreview();
      
      let price = 599;
      if (frontImage || backImage) price += 100;
      if (frontText || backText) price += 50;
      
      addToCart({
        id: 999002,
        name: "Custom 2D T-Shirt",
        price,
        quantity: 1,
        image: previewUrl || "/placeholder-tshirt.png",
        customization: {
          color: tshirtColor,
          frontText,
          backText,
          textColor,
          fontSize,
          frontImage,
          backImage,
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

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 py-8 pt-24">
        <h1 className="text-4xl font-bold mb-8">Customize Your T-Shirt (2D)</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 2D Viewer */}
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

              {/* Canvas Display */}
              <div className="flex justify-center items-center bg-muted/20 rounded-lg p-8" style={{ minHeight: "500px" }}>
                <canvas
                  ref={frontCanvasRef}
                  width={500}
                  height={600}
                  className={view === 'front' ? 'block' : 'hidden'}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
                <canvas
                  ref={backCanvasRef}
                  width={500}
                  height={600}
                  className={view === 'back' ? 'block' : 'hidden'}
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="space-y-6">
            {/* Color Picker */}
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
                <div className="flex gap-2">
                  {["#ffffff", "#000000", "#ff0000", "#0000ff", "#00ff00", "#ffff00"].map((c) => (
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
                    min="-45"
                    max="45"
                    value={textRotation}
                    onChange={(e) => setTextRotation(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                <div>
                  <Label>Text Alignment</Label>
                  <div className="flex gap-2">
                    <Button
                      variant={textAlignment === 'left' ? 'default' : 'outline'}
                      onClick={() => setTextAlignment('left')}
                      className="flex-1"
                      size="sm"
                    >
                      Left
                    </Button>
                    <Button
                      variant={textAlignment === 'center' ? 'default' : 'outline'}
                      onClick={() => setTextAlignment('center')}
                      className="flex-1"
                      size="sm"
                    >
                      Center
                    </Button>
                    <Button
                      variant={textAlignment === 'right' ? 'default' : 'outline'}
                      onClick={() => setTextAlignment('right')}
                      className="flex-1"
                      size="sm"
                    >
                      Right
                    </Button>
                  </div>
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
