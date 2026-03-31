import { useState, useEffect, useRef } from "react";
 
import { Button } from "./ui/button";
import heroImage from "@/assets/hero-fashion.jpg";
import { apiFetch, toImageUrl } from "@/lib/api";

type HeroData = {
  title: string;
  subtitle?: string;
  buttonText: string;
  buttonLink: string;
  backgroundImage?: string;
};

const HERO_CACHE_KEY = "tropical_hero_cache";
const HERO_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Read hero data from localStorage cache if it exists and hasn't expired.
 * This allows the hero to render instantly on repeat visits without
 * waiting for the API.
 */
function getCachedHero(): HeroData | null {
  try {
    const raw = localStorage.getItem(HERO_CACHE_KEY);
    if (!raw) return null;
    const { data, timestamp } = JSON.parse(raw);
    if (Date.now() - timestamp > HERO_CACHE_TTL) {
      localStorage.removeItem(HERO_CACHE_KEY);
      return null;
    }
    return data as HeroData;
  } catch {
    return null;
  }
}

function setCachedHero(data: HeroData) {
  try {
    localStorage.setItem(
      HERO_CACHE_KEY,
      JSON.stringify({ data, timestamp: Date.now() })
    );
  } catch {
    // localStorage might be full or disabled — ignore
  }
}

const DEFAULT_HERO: HeroData = {
  title: "NEW COLLECTION",
  subtitle: "Discover the latest trends in modern fashion",
  buttonText: "Shop Now",
  buttonLink: "/products",
};

const Hero = () => {
  // Initialize from cache so the hero shows instantly on repeat visits
  const cached = useRef(getCachedHero());
  const [heroData, setHeroData] = useState<HeroData>(cached.current || DEFAULT_HERO);
  const [backgroundImage, setBackgroundImage] = useState(() => {
    // If cached hero has a background image, use it immediately
    if (cached.current?.backgroundImage) {
      return toImageUrl(cached.current.backgroundImage) || heroImage;
    }
    return heroImage;
  });
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Always fetch fresh data in the background (stale-while-revalidate pattern)
    apiFetch<{ data: HeroData }>("/hero")
      .then((response) => {
        if (response?.data) {
          setHeroData(response.data);
          setCachedHero(response.data);

          if (response.data.backgroundImage) {
            const imageUrl = toImageUrl(response.data.backgroundImage);
            const finalUrl = imageUrl || response.data.backgroundImage;

            // Preload the image before swapping to avoid flash
            const img = new Image();
            img.onload = () => {
              setBackgroundImage(finalUrl);
            };
            img.src = finalUrl;
          }
        }
      })
      .catch((error) => {
        console.error("Error fetching hero data:", error);
        // Cache or defaults are already showing — no action needed
      });
  }, []);

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <img
          src={backgroundImage}
          alt={heroData.title}
          className={`w-full h-full object-cover transition-opacity duration-500 ${
            imageLoaded ? "opacity-100" : "opacity-0"
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={(e) => {
            // Fallback to bundled hero image if remote fails
            if (e.currentTarget.src !== heroImage) {
              e.currentTarget.src = heroImage;
            }
          }}
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
