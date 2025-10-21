import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Cart from "./pages/Cart";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Product from "./pages/Product";
import Payment from "./pages/Payment";
import CategoryPage from "./pages/CategoryPage";
import CustomizableProducts from "./pages/CustomizableProducts";
import CustomizeProductV2 from "./pages/CustomizeProduct_new";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/payment" element={<Payment />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/products/:slug" element={<Product />} />
          <Route path="/products/tshirts" element={<CategoryPage />} />
          <Route path="/products/shirts" element={<CategoryPage />} />
          <Route path="/products/jeans" element={<CategoryPage />} />
          <Route path="/products/hoodies" element={<CategoryPage />} />
          <Route path="/products/pants" element={<CategoryPage />} />
          <Route path="/customize" element={<CustomizableProducts />} />
          <Route path="/customize-product/:slug" element={<CustomizeProductV2 />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
