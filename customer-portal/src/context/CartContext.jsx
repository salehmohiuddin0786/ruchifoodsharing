'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

const CartContext = createContext();

export function CartProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load cart from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem('ruchi_customer_cart');
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch (e) {
      console.error('Failed to parse cart:', e);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('ruchi_customer_cart', JSON.stringify(items));
      } catch (e) {
        console.error('Failed to save cart:', e);
      }
    }
  }, [items, isLoaded]);

  const addToCart = (product, requestedQty = 1) => {
    const qty = parseInt(requestedQty, 10) || 1;
    const maxStock = product.stock_quantity !== undefined ? product.stock_quantity : 99;

    let error = null;

    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.id === product.id);

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newTotalQty = currentQty + qty;

        if (newTotalQty > maxStock) {
          error = `Cannot add more. Maximum available stock is ${maxStock}.`;
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newTotalQty,
        };
        return updated;
      } else {
        if (qty > maxStock) {
          error = `Requested quantity exceeds available stock (${maxStock}).`;
          return prev;
        }

        return [
          ...prev,
          {
            id: product.id,
            name: product.name,
            category: product.category,
            price: parseFloat(product.price),
            serving_size: product.serving_size,
            image_url: product.image_url,
            stock_quantity: maxStock,
            cook_id: product.cook_id,
            cook_name: product.cook_name || 'Home Cook',
            quantity: qty,
          },
        ];
      }
    });

    return error;
  };

  const updateQuantity = (itemId, newQty) => {
    const qty = parseInt(newQty, 10);
    if (qty <= 0) {
      removeFromCart(itemId);
      return;
    }

    setItems((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const clamped = Math.min(qty, i.stock_quantity || 99);
          return { ...i, quantity: clamped };
        }
        return i;
      })
    );
  };

  const removeFromCart = (itemId) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
  };

  const clearCart = () => {
    setItems([]);
  };

  const cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const subtotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartCount,
        subtotal,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
