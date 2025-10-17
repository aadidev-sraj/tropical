import Navbar from "@/components/Navbar";
import { getCart, clearCart } from "@/lib/cart";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { apiFetch } from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useRazorpay, RazorpayResponse } from "@/hooks/useRazorpay";

function formatPrice(p: number) {
  return new Intl.NumberFormat('en-IN', { style: "currency", currency: "INR" }).format(p);
}

export default function Payment() {
  const navigate = useNavigate();
  const [items, setItems] = useState(() => getCart());
  const [isProcessing, setIsProcessing] = useState(false);
  const { isLoaded, isLoading, openRazorpay } = useRazorpay();
  const [customerInfo, setCustomerInfo] = useState({
    name: "",
    email: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      country: "",
      zipCode: ""
    }
  });

  useEffect(() => {
    const handler = () => setItems(getCart());
    window.addEventListener("cart:updated", handler as any);
    return () => window.removeEventListener("cart:updated", handler as any);
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, it) => sum + it.price * it.quantity, 0), [items]);
  const shipping = items.length > 0 ? 10 : 0;
  const total = subtotal + shipping;

  const handlePay = async () => {
    // Validate customer information
    if (!customerInfo.name.trim() || !customerInfo.email.trim() || !customerInfo.phone.trim()) {
      toast.error("Please fill in all required fields (Name, Email, Phone)");
      return;
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(customerInfo.email)) {
      toast.error("Please enter a valid email address");
      return;
    }

    // Phone validation (basic)
    const phoneRegex = /^[\d\s\-\+\(\)]+$/;
    if (!phoneRegex.test(customerInfo.phone)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (items.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    if (!isLoaded) {
      toast.error("Payment system is loading. Please try again.");
      return;
    }

    setIsProcessing(true);

    try {
      // Step 1: Create Razorpay order on backend
      const orderResponse = await apiFetch("/payment/create-order", {
        method: "POST",
        body: JSON.stringify({
          amount: total,
          currency: "INR",
          receipt: `receipt_${Date.now()}`,
          notes: {
            customerName: customerInfo.name,
            customerEmail: customerInfo.email
          }
        })
      });

      if (!orderResponse.success) {
        toast.error(orderResponse.message || "Failed to create payment order");
        setIsProcessing(false);
        return;
      }

      const { orderId, keyId } = orderResponse.data;

      // Step 2: Open Razorpay checkout
      openRazorpay({
        key: keyId,
        amount: Math.round(total * 100), // Amount in paise
        currency: "INR",
        name: "Tropical Store",
        description: "Order Payment",
        order_id: orderId,
        handler: async (response: RazorpayResponse) => {
          // Step 3: Verify payment on backend and create order
          try {
            const orderData = {
              items: items.map(item => ({
                productId: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                size: item.size,
                image: item.image
              })),
              customerInfo: {
                name: customerInfo.name,
                email: customerInfo.email,
                phone: customerInfo.phone,
                address: customerInfo.address
              },
              pricing: {
                subtotal,
                shipping,
                total
              }
            };

            const verifyResponse = await apiFetch("/payment/verify", {
              method: "POST",
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                orderData
              })
            });

            if (verifyResponse.success) {
              toast.success("Payment successful! Check your email for confirmation.");
              clearCart();
              navigate("/");
            } else {
              toast.error(verifyResponse.message || "Payment verification failed");
            }
          } catch (error: any) {
            console.error("Verification error:", error);
            toast.error("Payment verification failed. Please contact support.");
          } finally {
            setIsProcessing(false);
          }
        },
        prefill: {
          name: customerInfo.name,
          email: customerInfo.email,
          contact: customerInfo.phone
        },
        theme: {
          color: "#667eea"
        },
        modal: {
          ondismiss: () => {
            setIsProcessing(false);
            toast.info("Payment cancelled");
          }
        }
      });
    } catch (error: any) {
      console.error("Payment error:", error);
      toast.error(error.message || "Failed to initiate payment. Please try again.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <div className="mb-4">
          <Link to="/cart" className="text-sm text-muted-foreground hover:underline">← Back to cart</Link>
        </div>

        <h1 className="text-2xl font-semibold mb-6">Checkout</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            {items.length === 0 && (
              <p>Your cart is empty. <Link className="underline" to="/">Continue shopping</Link></p>
            )}
            
            {/* Customer Information Form */}
            {items.length > 0 && (
              <div className="border rounded-md p-6">
                <h2 className="text-xl font-semibold mb-4">Contact Information</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Full Name *</Label>
                    <Input
                      id="name"
                      type="text"
                      placeholder="John Doe"
                      value={customerInfo.name}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      value={customerInfo.email}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Phone Number (with country code) *</Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={customerInfo.phone}
                      onChange={(e) => setCustomerInfo({ ...customerInfo, phone: e.target.value })}
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      You'll receive order confirmation via email
                    </p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mt-6 mb-4">Shipping Address (Optional)</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="street">Street Address</Label>
                    <Input
                      id="street"
                      type="text"
                      placeholder="123 Main St"
                      value={customerInfo.address.street}
                      onChange={(e) => setCustomerInfo({ 
                        ...customerInfo, 
                        address: { ...customerInfo.address, street: e.target.value }
                      })}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City</Label>
                      <Input
                        id="city"
                        type="text"
                        placeholder="New York"
                        value={customerInfo.address.city}
                        onChange={(e) => setCustomerInfo({ 
                          ...customerInfo, 
                          address: { ...customerInfo.address, city: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State</Label>
                      <Input
                        id="state"
                        type="text"
                        placeholder="NY"
                        value={customerInfo.address.state}
                        onChange={(e) => setCustomerInfo({ 
                          ...customerInfo, 
                          address: { ...customerInfo.address, state: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="country">Country</Label>
                      <Input
                        id="country"
                        type="text"
                        placeholder="USA"
                        value={customerInfo.address.country}
                        onChange={(e) => setCustomerInfo({ 
                          ...customerInfo, 
                          address: { ...customerInfo.address, country: e.target.value }
                        })}
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">Zip Code</Label>
                      <Input
                        id="zipCode"
                        type="text"
                        placeholder="10001"
                        value={customerInfo.address.zipCode}
                        onChange={(e) => setCustomerInfo({ 
                          ...customerInfo, 
                          address: { ...customerInfo.address, zipCode: e.target.value }
                        })}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Order Items */}
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">Order Items</h2>
              {items.map((it) => (
                <div key={`${it.id}-${it.size ?? "_"}`} className="flex items-center gap-4 border rounded-md p-4">
                  {it.image ? (
                    <img src={it.image} alt={it.name} className="w-20 h-20 object-cover rounded" />
                  ) : (
                    <div className="w-20 h-20 bg-muted rounded" />
                  )}
                  <div className="flex-1">
                    <div className="font-medium">{it.name}{it.size ? ` • ${it.size}` : ""}</div>
                    <div className="text-sm text-muted-foreground">Qty: {it.quantity}</div>
                  </div>
                  <div className="font-medium">{formatPrice(it.price * it.quantity)}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="border rounded-md p-4 h-fit">
            <h2 className="font-semibold mb-4">Order Summary</h2>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              <div className="flex justify-between"><span>Shipping</span><span>{formatPrice(shipping)}</span></div>
              <div className="flex justify-between font-semibold border-t pt-2"><span>Total</span><span>{formatPrice(total)}</span></div>
            </div>
            <button
              disabled={items.length === 0 || isProcessing || isLoading}
              onClick={handlePay}
              className="mt-4 w-full inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-primary-foreground hover:opacity-90 disabled:opacity-50"
            >
              {isLoading ? "Loading..." : isProcessing ? "Processing..." : "Pay with Razorpay"}
            </button>
            <p className="text-xs text-muted-foreground text-center mt-2">
              💳 Secure payment via Razorpay
            </p>
            <p className="text-xs text-muted-foreground text-center mt-1">
              📧 Email confirmation after payment
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
