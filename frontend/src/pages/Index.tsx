import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import WheelOfClothes from "@/components/WheelOfClothes";
import ProductsGrid from "@/components/ProductsGrid";
import ProductSubNav from "@/components/ProductSubNav";
import AboutSection from "@/components/AboutSection";
import ContactSection from "@/components/ContactSection";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <ProductSubNav />
        <WheelOfClothes />
        <ProductsGrid />
        <AboutSection />
        <ContactSection />
      </main>
      
      {/* Footer */}
      <footer className="bg-primary text-primary-foreground py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © 2024 Fits-on-Wheels. All rights reserved. 
            <a href="https://www.thetropical.in" target="_blank" rel="noreferrer" className="underline ml-1">www.thetropical.in</a>
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
