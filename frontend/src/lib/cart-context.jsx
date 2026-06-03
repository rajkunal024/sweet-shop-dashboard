import React, { createContext, useContext, useState, useCallback } from "react";

const CartContext = createContext(undefined);

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isOpen, setIsOpen] = useState(false);

  const addToCart = useCallback((sweet, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.sweet.id === sweet.id);
      if (existing) {
        return prev.map((item) =>
          item.sweet.id === sweet.id
            ? {
                ...item,
                quantity: Math.min(item.quantity + quantity, sweet.quantity),
              }
            : item,
        );
      }
      return [...prev, { sweet, quantity }];
    });
    setIsOpen(true);
  }, []);

  const removeFromCart = useCallback((sweetId) => {
    setItems((prev) => prev.filter((item) => item.sweet.id !== sweetId));
  }, []);

  const updateQuantity = useCallback(
    (sweetId, quantity) => {
      if (quantity <= 0) {
        removeFromCart(sweetId);
        return;
      }
      setItems((prev) =>
        prev.map((item) =>
          item.sweet.id === sweetId
            ? { ...item, quantity: Math.min(quantity, item.sweet.quantity) }
            : item,
        ),
      );
    },
    [removeFromCart],
  );

  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalPrice = items.reduce(
    (sum, item) => sum + Number(item.sweet.price) * item.quantity,
    0,
  );

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        totalItems,
        totalPrice,
        isOpen,
        setIsOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
