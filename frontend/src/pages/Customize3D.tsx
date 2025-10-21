import { Suspense, useRef, useState, useEffect } from "react";
import * as THREE from "three";
import { Canvas, useFrame, ThreeEvent } from "@react-three/fiber";
import { OrbitControls, Center, Environment, useFBX, TransformControls, Decal } from "@react-three/drei";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import Navbar from "@/components/Navbar";
import { HexColorPicker } from "react-colorful";
import { toast } from "sonner";
import { addToCart } from "@/lib/cart";
import { useNavigate, useLocation } from "react-router-dom";
import { apiFetch, getToken, toImageUrl } from "@/lib/api";

// Draggable element component
function DraggableElement({ position, onDrag, children, scale = 1 }: any) {
  const [isDragging, setIsDragging] = useState(false);
  const meshRef = useRef<THREE.Mesh>(null);

  const handlePointerDown = (e: ThreeEvent<PointerEvent>) => {
    e.stopPropagation();
    setIsDragging(true);
  };

  const handlePointerMove = (e: ThreeEvent<PointerEvent>) => {
    if (isDragging) {
      e.stopPropagation();
      const newX = Math.max(-0.6, Math.min(0.6, e.point.x));
      const newY = Math.max(-0.8, Math.min(0.8, e.point.y));
      onDrag([newX, newY, position[2]]);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
  };

  return (
    <mesh
      ref={meshRef}
      position={position}
      scale={scale}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerLeave={handlePointerUp}
    >
      {children}
    </mesh>
  );
}

// T-shirt mesh component with FBX model
function TShirt({
  color,
  fit,
  imageTexture,
  imagePosition,
  imageRotation,
  imageScale,
  textTexture,
  textPosition,
  textRotation,
  textScale,
  snappingTarget,
  onSnapToSurface,
  useProjection,
}: any) {
  const groupRef = useRef<THREE.Group>(null);
  
  // Load FBX models - useFBX handles errors internally
  const regularModel = useFBX('/models/regular/FBX.fbx');
  const oversizedModel = useFBX('/models/oversized/fbx.fbx');
  
  const model = fit === 'oversized' ? oversizedModel : regularModel;
  
  useEffect(() => {
    if (model) {
      console.log('FBX Model loaded:', fit);
      console.log('Model structure:', model);
      console.log('Model scale:', model.scale);
      console.log('Model position:', model.position);
      
      let meshCount = 0;
      model.traverse((child: any) => {
        if (child.isMesh) {
          meshCount++;
          console.log(`Mesh ${meshCount}:`, child.name, 'Material:', child.material);
          child.castShadow = true;
          child.receiveShadow = true;
          
          // Apply color to material - handle both single material and array of materials
          if (child.material) {
            const materials = Array.isArray(child.material) ? child.material : [child.material];
            materials.forEach((mat: any) => {
              if (mat && mat.color) {
                mat.color.set(color);
                mat.roughness = 0.8;
                mat.metalness = 0.05;
                mat.needsUpdate = true;
              }
            });
          }
        }
      });
      console.log(`Total meshes found: ${meshCount}`);
    }
  }, [model, color]);

  const handlePointerDown = (e: any) => {
    if (!snappingTarget) return;
    e.stopPropagation();
    const point: THREE.Vector3 = e.point.clone();
    // face normal may be in local space; transform to world space
    const normal = e.face?.normal
      ? e.face.normal.clone().applyMatrix3(new THREE.Matrix3().getNormalMatrix(e.object.matrixWorld)).normalize()
      : new THREE.Vector3(0, 0, 1);
    // offset a bit along normal to avoid z-fighting
    const pos = point.clone().add(normal.clone().multiplyScalar(0.02));
    // compute rotation aligning plane's forward (0,0,1) to surface normal
    const quat = new THREE.Quaternion().setFromUnitVectors(new THREE.Vector3(0, 0, 1), normal);
    const euler = new THREE.Euler().setFromQuaternion(quat);
    onSnapToSurface(snappingTarget, pos, euler);
  };

  return (
    <Center>
      <group ref={groupRef} onPointerDown={handlePointerDown}>
        {/* FBX T-shirt model */}
        {model && (
          <primitive object={model.clone()} scale={0.05} rotation={[0, Math.PI, 0]} position={[0, 0, 0]} />
        )}
        
        {/* Image overlay */}
        {imageTexture && (
          useProjection ? (
            <Decal
              position={[imagePosition[0], imagePosition[1], imagePosition[2]]}
              rotation={[imageRotation[0], imageRotation[1], imageRotation[2]]}
              scale={[imageScale, imageScale, 1]}
            >
              <meshStandardMaterial
                map={imageTexture}
                transparent
                polygonOffset
                polygonOffsetFactor={-1}
                depthTest
                depthWrite
              />
            </Decal>
          ) : (
            <mesh position={[imagePosition[0], imagePosition[1], imagePosition[2]]} rotation={[imageRotation[0], imageRotation[1], imageRotation[2]]} renderOrder={999}>
              <planeGeometry args={[imageScale, imageScale]} />
              <meshBasicMaterial 
                map={imageTexture} 
                transparent 
                side={THREE.DoubleSide} 
                depthTest={false}
                depthWrite={false}
                opacity={1}
                toneMapped={false}
              />
            </mesh>
          )
        )}
        
        {/* Text overlay */}
        {textTexture && (
          useProjection ? (
            <Decal
              position={[textPosition[0], textPosition[1], textPosition[2]]}
              rotation={[textRotation[0], textRotation[1], textRotation[2]]}
              scale={[2 * textScale, 0.6 * textScale, 1]}
            >
              <meshStandardMaterial
                map={textTexture}
                transparent
                polygonOffset
                polygonOffsetFactor={-1}
                depthTest
                depthWrite
              />
            </Decal>
          ) : (
            <mesh position={[textPosition[0], textPosition[1], textPosition[2]]} rotation={[textRotation[0], textRotation[1], textRotation[2]]} renderOrder={1000}>
              <planeGeometry args={[2 * textScale, 0.6 * textScale]} />
              <meshBasicMaterial 
                map={textTexture} 
                transparent 
                side={THREE.DoubleSide}
                depthTest={false}
                depthWrite={false}
                opacity={1}
                toneMapped={false}
              />
            </mesh>
          )
        )}
      </group>
    </Center>
  );
}

// Scene component
function Scene({
  color,
  fit,
  imageTexture,
  imagePosition,
  imageRotation,
  imageScale,
  textTexture,
  textPosition,
  textRotation,
  textScale,
  snappingTarget,
  onSnapToSurface,
  selectedOverlay,
  transformMode,
  onTransformChange,
  useProjection,
}: any) {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[5, 5, 5]} intensity={1} castShadow />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <pointLight position={[0, -5, 5]} intensity={0.4} />
      <TShirt 
        color={color}
        fit={fit}
        imageTexture={imageTexture} 
        imagePosition={imagePosition}
        imageRotation={imageRotation}
        imageScale={imageScale}
        textTexture={textTexture} 
        textPosition={textPosition}
        textRotation={textRotation}
        textScale={textScale}
        snappingTarget={snappingTarget}
        onSnapToSurface={onSnapToSurface}
        useProjection={useProjection}
      />
      <OrbitControls enableZoom={true} enablePan={false} minDistance={3} maxDistance={8} />
      <Environment preset="city" />
    </>
  );
}

export default function Customize3D() {
  const navigate = useNavigate();
  const location = useLocation();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  // State
  const [tshirtColor, setTshirtColor] = useState("#ffffff");
  const [tshirtFit, setTshirtFit] = useState<'regular' | 'oversized'>('regular');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [text, setText] = useState("");
  const [textColor, setTextColor] = useState("#000000");
  const [fontSize, setFontSize] = useState(48);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [imageTexture, setImageTexture] = useState<THREE.Texture | null>(null);
  const [imagePosition, setImagePosition] = useState<[number, number, number]>([0, 1.5, 0.5]);
  const [imageScale, setImageScale] = useState(0.5);
  const [imageRotation, setImageRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [textTexture, setTextTexture] = useState<THREE.Texture | null>(null);
  const [textPosition, setTextPosition] = useState<[number, number, number]>([0, 0.8, 0.5]);
  const [textRotation, setTextRotation] = useState<[number, number, number]>([0, 0, 0]);
  const [textScale, setTextScale] = useState(1.0);
  const [isProcessing, setIsProcessing] = useState(false);

  const [selectedOverlay, setSelectedOverlay] = useState<'image' | 'text' | null>('image');
  const [transformMode, setTransformMode] = useState<'translate' | 'rotate' | 'scale'>('translate');
  const [snappingTarget, setSnappingTarget] = useState<'image' | 'text' | null>(null);
  const [useProjection, setUseProjection] = useState<boolean>(false);

  // Generate text texture from canvas
  const generateTextTexture = (textContent: string, color: string, size: number) => {
    if (!textContent.trim()) {
      setTextTexture(null);
      return;
    }

    const canvas = document.createElement("canvas");
    canvas.width = 2048;
    canvas.height = 512;
    const ctx = canvas.getContext("2d");
    
    if (ctx) {
      // Clear with transparent background
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Set text properties
      ctx.fillStyle = color;
      ctx.font = `bold ${size * 2}px Arial, sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      
      // Add text shadow for better visibility
      ctx.shadowColor = "rgba(0, 0, 0, 0.3)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 2;
      
      // Draw text
      ctx.fillText(textContent, canvas.width / 2, canvas.height / 2);
      
      const texture = new THREE.CanvasTexture(canvas);
      texture.needsUpdate = true;
      texture.minFilter = THREE.LinearFilter;
      texture.magFilter = THREE.LinearFilter;
      console.log('Text texture created:', textContent, 'Size:', canvas.width, 'x', canvas.height);
      setTextTexture(texture);
    }
  };

  // Handle text change
  const handleTextChange = (value: string) => {
    setText(value);
    generateTextTexture(value, textColor, fontSize);
  };

  const handleSnapToSurface = (
    target: 'image' | 'text',
    pos: THREE.Vector3,
    rotEuler: THREE.Euler,
  ) => {
    if (target === 'image') {
      setImagePosition([pos.x, pos.y, pos.z]);
      setImageRotation([rotEuler.x, rotEuler.y, rotEuler.z]);
    } else {
      setTextPosition([pos.x, pos.y, pos.z]);
      setTextRotation([rotEuler.x, rotEuler.y, rotEuler.z]);
    }
    setSnappingTarget(null);
  };

  const handleTextColorChange = (color: string) => {
    setTextColor(color);
    generateTextTexture(text, color, fontSize);
  };

  const handleFontSizeChange = (size: number) => {
    setFontSize(size);
    generateTextTexture(text, textColor, size);
  };

  // Handle image upload
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create local preview first
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageUrl = event.target?.result as string;
        
        // Create texture from data URL immediately
        const loader = new THREE.TextureLoader();
        loader.setCrossOrigin("anonymous");
        loader.load(
          imageUrl,
          (texture) => {
            texture.minFilter = THREE.LinearFilter;
            texture.magFilter = THREE.LinearFilter;
            texture.needsUpdate = true;
            setImageTexture(texture);
            toast.success("Image loaded successfully!");
          },
          undefined,
          (error) => {
            console.error("Texture load error:", error);
            toast.error("Failed to load image texture");
          }
        );
      };
      reader.readAsDataURL(file);
      
      // Upload to backend for storage
      const formData = new FormData();
      formData.append("image", file);
      
      const response = await fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'}/upload/single`, {
        method: "POST",
        headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
        body: formData,
      });

      if (!response.ok) throw new Error("Upload failed");
      
      const data = await response.json();
      setUploadedImage(toImageUrl(data.url) || data.url);
      
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error("Failed to upload image");
    } finally {
      setIsProcessing(false);
    }
  };

  // Capture preview from canvas
  const capturePreview = async (): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.querySelector("canvas");
      if (canvas) {
        canvas.toBlob((blob) => {
          if (blob) {
            const formData = new FormData();
            formData.append("file", blob, "preview.png");
            
            fetch(`${import.meta.env.VITE_API_BASE || 'http://localhost:5000/api'}/upload/single`, {
              method: "POST",
              headers: getToken() ? { Authorization: `Bearer ${getToken()}` } : undefined,
              body: formData,
            })
              .then((res) => res.json())
              .then((data) => resolve(toImageUrl(data.url) || data.url))
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
      const isAuthed = !!getToken();
      if (!isAuthed) {
        toast.error("Please sign in to add items to cart");
        const redirect = `${location.pathname}${location.search}`;
        navigate(`/login?redirect=${encodeURIComponent(redirect)}`);
        return;
      }
      
      // Capture preview
      const previewUrl = await capturePreview();
      
      // Calculate price (base + additions)
      let price = 599; // Base price
      if (uploadedImage) price += 100;
      if (text) price += 50;
      
      // Add to cart
      addToCart({
        id: 999001, // Virtual product ID for custom T-shirt
        name: "Custom 3D T-Shirt",
        price,
        quantity: 1,
        image: previewUrl || "/placeholder-tshirt.png",
        customization: {
          color: tshirtColor,
          text,
          textColor,
          fontSize,
          uploadedImage,
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
        <h1 className="text-4xl font-bold mb-8">Customize Your T-Shirt</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* 3D Viewer */}
          <div className="lg:col-span-2">
            <div className="bg-card rounded-lg overflow-hidden shadow-lg" style={{ height: "600px" }}>
              <Canvas
                ref={canvasRef}
                shadows
                camera={{ position: [0, 0, 4], fov: 45 }}
                gl={{ preserveDrawingBuffer: true }}
              >
                <Suspense fallback={
                  <mesh>
                    <boxGeometry args={[1, 1, 1]} />
                    <meshStandardMaterial color="#cccccc" />
                  </mesh>
                }>
                  <Scene 
                    color={tshirtColor}
                    fit={tshirtFit}
                    imageTexture={imageTexture} 
                    imagePosition={imagePosition}
                    imageRotation={imageRotation}
                    imageScale={imageScale}
                    textTexture={textTexture} 
                    textPosition={textPosition}
                    textRotation={textRotation}
                    snappingTarget={snappingTarget}
                    onSnapToSurface={handleSnapToSurface}
                    selectedOverlay={selectedOverlay}
                    transformMode={transformMode}
                    onTransformChange={setTransformMode}
                    useProjection={useProjection}
                  />
                </Suspense>
              </Canvas>
            </div>
            <p className="text-sm text-muted-foreground mt-2 text-center">
              Drag to rotate • Scroll to zoom • Use sliders to position text/image (X, Y, Z)
            </p>
            <p className="text-xs text-muted-foreground mt-1 text-center">
              {isProcessing ? "Loading model..." : "Model ready"}
            </p>
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

            {/* Text */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Add Text</h3>
              <div className="space-y-3">
                <div>
                  <Label>Text</Label>
                  <Input
                    value={text}
                    onChange={(e) => handleTextChange(e.target.value)}
                    placeholder="Enter your text"
                    maxLength={30}
                  />
                </div>
                <div>
                  <Label>Text Color</Label>
                  <div className="flex gap-2 items-center">
                    <div
                      className="w-10 h-10 rounded border-2 cursor-pointer"
                      style={{ backgroundColor: textColor }}
                      onClick={() => {}}
                    />
                    <Input
                      type="color"
                      value={textColor}
                      onChange={(e) => handleTextColorChange(e.target.value)}
                      className="w-20"
                    />
                  </div>
                </div>
                <div>
                  <Label>Font Size: {fontSize}px</Label>
                  <input
                    type="range"
                    min="24"
                    max="480"
                    value={fontSize}
                    onChange={(e) => handleFontSizeChange(Number(e.target.value))}
                    className="w-full"
                  />
                </div>
                {text && (
                  <>
                    <div>
                      <Label>Text Position X: {textPosition[0].toFixed(2)}</Label>
                      <input
                        type="range"
                        min="-2"
                        max="100"
                        step="0.05"
                        value={textPosition[0]}
                        onChange={(e) => setTextPosition([Number(e.target.value), textPosition[1], textPosition[2]])}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label>Text Position Y: {textPosition[1].toFixed(2)}</Label>
                      <input
                        type="range"
                        min="-2"
                        max="100"
                        step="0.1"
                        value={textPosition[1]}
                        onChange={(e) => setTextPosition([textPosition[0], Number(e.target.value), textPosition[2]])}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label>Text Depth (Z): {textPosition[2].toFixed(2)}</Label>
                      <input
                        type="range"
                        min="-1"
                        max="100"
                        step="0.05"
                        value={textPosition[2]}
                        onChange={(e) => setTextPosition([textPosition[0], textPosition[1], Number(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Image Upload */}
            <div className="bg-card p-6 rounded-lg shadow">
              <h3 className="font-semibold text-lg mb-4">Add Design</h3>
              <div className="space-y-3">
                <Input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={isProcessing}
                />
                {uploadedImage && (
                  <div className="relative">
                    <img src={uploadedImage} alt="Uploaded" className="w-full rounded" />
                    <Button
                      size="sm"
                      variant="destructive"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setUploadedImage(null);
                        setImageTexture(null);
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Max 5MB • PNG, JPG, SVG
                </p>
                {uploadedImage && (
                  <>
                    <div>
                      <Label>Image Position X: {imagePosition[0].toFixed(2)}</Label>
                      <input
                        type="range"
                        min="-2"
                        max="100"
                        step="0.05"
                        value={imagePosition[0]}
                        onChange={(e) => setImagePosition([Number(e.target.value), imagePosition[1], imagePosition[2]])}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label>Image Position Y: {imagePosition[1].toFixed(2)}</Label>
                      <input
                        type="range"
                        min="-2"
                        max="100"
                        step="0.1"
                        value={imagePosition[1]}
                        onChange={(e) => setImagePosition([imagePosition[0], Number(e.target.value), imagePosition[2]])}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label>Image Depth (Z): {imagePosition[2].toFixed(2)}</Label>
                      <input
                        type="range"
                        min="-1"
                        max="100"
                        step="0.05"
                        value={imagePosition[2]}
                        onChange={(e) => setImagePosition([imagePosition[0], imagePosition[1], Number(e.target.value)])}
                        className="w-full"
                      />
                    </div>
                    <div>
                      <Label>Image Size: {imageScale.toFixed(2)}</Label>
                      <input
                        type="range"
                        min="0.2"
                        max="1.5"
                        step="0.05"
                        value={imageScale}
                        onChange={(e) => setImageScale(Number(e.target.value))}
                        className="w-full"
                      />
                    </div>
                  </>
                )}
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
                {uploadedImage && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>+ Custom Design</span>
                    <span>₹100</span>
                  </div>
                )}
                {text && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>+ Custom Text</span>
                    <span>₹50</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2">
                  <span>Total</span>
                  <span>₹{599 + (uploadedImage ? 100 : 0) + (text ? 50 : 0)}</span>
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
