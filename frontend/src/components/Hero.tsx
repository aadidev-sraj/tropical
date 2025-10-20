import { useState, useEffect } from "react";
 
import { Button } from "./ui/button";
import heroImage from "@/assets/hero-fashion.jpg";
import { apiFetch } from "@/lib/api";

type HeroData = {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage?: string;
};

const Hero = () => {
  const [heroData, setHeroData] = useState<HeroData>({
    title: "NEW COLLECTION",
    subtitle: "Discover the latest trends in modern fashion",
    buttonText: "Shop Now",
    buttonLink: "/products",
  });
  const [backgroundImage, setBackgroundImage] = useState(heroImage);

  useEffect(() => {
    // Fetch hero data from API
    apiFetch<{ data: HeroData }>("/hero")
      .then((response) => {
        if (response?.data) {
          setHeroData(response.data);
          if (response.data.backgroundImage) {
            setBackgroundImage(response.data.backgroundImage);
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching hero data:", error);
        // Use default values on error
      });
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt={heroData.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 animate-fade-in">
        <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 tracking-tighter">
          {heroData.title}
        </h1>
        {heroData.subtitle && (
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-2xl mx-auto">
            {heroData.subtitle}
          </p>
        )}
        <Button
          size="lg"
          className="bg-accent hover:bg-accent/90 text-accent-foreground font-semibold px-8 py-6 text-lg transition-all"
          onClick={() => {
            const el = document.getElementById("shop");
            if (el) {
              el.scrollIntoView({ behavior: "smooth", block: "start" });
            } else {
              window.location.href = "/#shop";
            }
          }}
        >
          {heroData.buttonText}
        </Button>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce">
        <div className="w-6 h-10 border-2 border-white/50 rounded-full flex items-start justify-center p-2">
          <div className="w-1 h-2 bg-white/50 rounded-full" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
