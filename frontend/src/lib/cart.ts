export type CartItem = {
  id: number;
  name: string;
  price: number; // numeric price; store cents if needed
  image?: string;
  quantity: number;
  size?: string;
  customization?: any; // For custom T-shirt designs
};

const KEY = "cart_items";

export function getCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveCart(items: CartItem[]) {
  localStorage.setItem(KEY, JSON.stringify(items));
  // Notify listeners
  try {
    window.dispatchEvent(new CustomEvent('cart:updated', { detail: { count: items.reduce((n, i) => n + i.quantity, 0) } }));
  } catch {}
}

export function addToCart(item: CartItem) {
  const items = getCart();
  const idx = items.findIndex((i) => i.id === item.id && i.size === item.size);
  if (idx >= 0) {
    items[idx].quantity += item.quantity;
  } else {
    items.push(item);
  }
  saveCart(items);
}

export function updateQuantity(id: number, size: string | undefined, quantity: number) {
  const items = getCart();
  const idx = items.findIndex((i) => i.id === id && i.size === size);
  if (idx >= 0) {
    items[idx].quantity = Math.max(1, quantity);
    saveCart(items);
  }
}

export function removeFromCart(id: number, size?: string) {
  const items = getCart().filter((i) => !(i.id === id && i.size === size));
  saveCart(items);
}

export function clearCart() {
  saveCart([]);
}
