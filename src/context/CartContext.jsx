import { createContext, useCallback, useMemo } from "react";
import { useLocalStorage } from "../hooks/useLocalStorage";
import { isEventPast } from "../utils/dateHelpers";

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useLocalStorage("cartItems", []);

  const addToCart = useCallback(
    (item) => {
      if (item?.eventDate && isEventPast(item.eventDate)) return;
      setCartItems((prev) => [...prev, item]);
    },
    [setCartItems]
  );

  const removeFromCart = useCallback(
    (id) => {
      setCartItems((prev) => prev.filter((item) => item.id !== id));
    },
    [setCartItems]
  );

  const updateQuantity = useCallback(
    (id, delta) => {
      setCartItems((prev) =>
        prev.map((item) => item.id === id ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item )
      );
    },
    [setCartItems]
  );

  const clearCart = useCallback(() => {
    setCartItems((prev) => (prev.length === 0 ? prev : []));
  }, [setCartItems]);

  const totalPrice = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0),
    [cartItems]
  );

  const value = useMemo(
    () => ({cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice,}),
    [cartItems, addToCart, removeFromCart, updateQuantity, clearCart, totalPrice]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};
