import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { User, ShoppingBag, Menu, X } from "lucide-react";
import { Button } from "./ui/button";
import { getToken } from "@/lib/api";
import { getCart } from "@/lib/cart";

const Navbar = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cartCount, setCartCount] = useState(0);
  const isAuthed = !!getToken();

  // Logout moved to Profile page
  useEffect(() => {
    // initialize
    try {
      const count = getCart().reduce((n, i) => n + i.quantity, 0);
      setCartCount(count);
    } catch {}

    const onCartUpdated = (e: Event) => {
      // @ts-ignore - CustomEvent detail
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail.count === 'number') {
        setCartCount(detail.count);
      } else {
        // fallback: recompute
        const cnt = getCart().reduce((n, i) => n + i.quantity, 0);
        setCartCount(cnt);
      }
    };
    window.addEventListener('cart:updated' as any, onCartUpdated as any);
    return () => {
      window.removeEventListener('cart:updated' as any, onCartUpdated as any);
    };
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-background border-b border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex-shrink-0">
            <h1 className="text-2xl font-bold tracking-tighter">The Tropical</h1>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/customize">
              <Button variant="ghost" size="sm">
                Customize
              </Button>
            </Link>

            {isAuthed ? (
              <Link to="/profile">
                <Button
                  variant="ghost"
                  size="icon"
                  className="transition-transform hover:scale-110"
                >
                  <User className="h-5 w-5" />
                </Button>
              </Link>
            ) : (
              <Link to="/login">
                <Button variant="outline" size="sm">Login</Button>
              </Link>
            )}

            <Link to="/cart">
              <Button
                variant="ghost"
                size="icon"
                className="relative transition-transform hover:scale-110"
              >
                <ShoppingBag className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-accent text-accent-foreground text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-border animate-fade-in">
          <div className="px-4 py-4 space-y-3">
            <Link to="/customize" className="block">
              <Button variant="outline" className="w-full">
                Customize T-Shirt
              </Button>
            </Link>
            <div className="flex space-x-4">
              {isAuthed ? (
                <Link to="/profile" className="flex-1">
                  <Button variant="outline" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </Button>
                </Link>
              ) : (
                <Link to="/login" className="flex-1">
                  <Button variant="outline" className="w-full">Login</Button>
                </Link>
              )}
              <Link to="/cart" className="flex-1">
                <Button variant="outline" className="w-full">
                  <ShoppingBag className="h-4 w-4 mr-2" />
                  Cart ({cartCount})
                </Button>
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
