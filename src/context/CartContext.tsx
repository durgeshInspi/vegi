"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { UnitType, Vegetable } from "@/types";
import { toast } from "sonner";

export interface CartItem {
  vegetableId: string;
  name: string;
  unit: UnitType;
  sellingPrice: number;
  availableStock: number;
  quantity: number;
  imageUrl?: string;
  categoryName?: string;
}

export interface DeliveryLocation {
  city: string;
  area: string;
  pincode: string;
}

interface CartContextType {
  cart: CartItem[];
  addToCart: (veg: Vegetable | any, quantity?: number) => boolean;
  updateQuantity: (vegetableId: string, quantity: number) => void;
  removeFromCart: (vegetableId: string) => void;
  clearCart: () => void;
  totalItemsCount: number;
  subtotal: number;
  deliveryFee: number;
  freeDeliveryThreshold: number;
  amountNeededForFreeDelivery: number;
  grandTotal: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isCheckoutOpen: boolean;
  setIsCheckoutOpen: (open: boolean) => void;
  quickViewVeg: (Vegetable & any) | null;
  setQuickViewVeg: (veg: (Vegetable & any) | null) => void;
  location: DeliveryLocation;
  setLocation: (loc: DeliveryLocation) => void;
  isLocationOpen: boolean;
  setIsLocationOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

const CART_STORAGE_KEY = "vegifresh_market_cart";
const LOCATION_STORAGE_KEY = "vegifresh_market_location";

const DEFAULT_LOCATION: DeliveryLocation = {
  city: "Mumbai",
  area: "Andheri West",
  pincode: "400053",
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [quickViewVeg, setQuickViewVeg] = useState<(Vegetable & any) | null>(null);
  const [location, setLocation] = useState<DeliveryLocation>(DEFAULT_LOCATION);
  const [isLocationOpen, setIsLocationOpen] = useState(false);

  // Load cart and location from localStorage on client mount
  useEffect(() => {
    try {
      const savedCart = localStorage.getItem(CART_STORAGE_KEY);
      if (savedCart) {
        setCart(JSON.parse(savedCart));
      }
      const savedLoc = localStorage.getItem(LOCATION_STORAGE_KEY);
      if (savedLoc) {
        setLocation(JSON.parse(savedLoc));
      }
    } catch {
      // Ignore JSON parse errors
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Save cart to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
      } catch {
        // Storage limit reached or private mode
      }
    }
  }, [cart, isLoaded]);

  // Save location to localStorage
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
      } catch {
        // Ignore
      }
    }
  }, [location, isLoaded]);

  const addToCart = (veg: Vegetable | any, quantityToAdd = 1): boolean => {
    const id = veg._id?.toString() || veg.id;
    const stock = Number(veg.stockQuantity ?? 0);

    if (stock <= 0) {
      toast.error(`"${veg.name}" is currently out of stock.`);
      return false;
    }

    let success = true;

    setCart((prev) => {
      const existingIndex = prev.findIndex((item) => item.vegetableId === id);

      if (existingIndex > -1) {
        const currentQty = prev[existingIndex].quantity;
        const newQty = Math.round((currentQty + quantityToAdd) * 10) / 10;

        if (newQty > stock) {
          toast.warning(
            `Cannot add more. Only ${stock} ${veg.unit} of "${veg.name}" available in stock.`
          );
          success = false;
          return prev;
        }

        const updated = [...prev];
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: newQty,
          availableStock: stock,
          sellingPrice: Number(veg.sellingPrice),
        };
        toast.success(`Updated "${veg.name}" quantity (${newQty} ${veg.unit})`);
        return updated;
      } else {
        if (quantityToAdd > stock) {
          toast.warning(`Only ${stock} ${veg.unit} available in stock.`);
          success = false;
          return prev;
        }

        toast.success(`Added ${quantityToAdd} ${veg.unit} of "${veg.name}" to your cart!`);
        return [
          ...prev,
          {
            vegetableId: id,
            name: veg.name,
            unit: veg.unit,
            sellingPrice: Number(veg.sellingPrice),
            availableStock: stock,
            quantity: quantityToAdd,
            imageUrl: veg.imageUrl,
            categoryName: veg.categoryName,
          },
        ];
      }
    });

    return success;
  };

  const updateQuantity = (vegetableId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(vegetableId);
      return;
    }

    setCart((prev) =>
      prev.map((item) => {
        if (item.vegetableId === vegetableId) {
          const clampedQty = Math.min(item.availableStock, Math.round(quantity * 10) / 10);
          if (clampedQty < quantity) {
            toast.warning(`Maximum available stock is ${item.availableStock} ${item.unit}`);
          }
          return { ...item, quantity: clampedQty };
        }
        return item;
      })
    );
  };

  const removeFromCart = (vegetableId: string) => {
    setCart((prev) => {
      const item = prev.find((i) => i.vegetableId === vegetableId);
      if (item) {
        toast.info(`Removed "${item.name}" from cart`);
      }
      return prev.filter((i) => i.vegetableId !== vegetableId);
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const totalItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const subtotal = Math.round(cart.reduce((sum, item) => sum + item.quantity * item.sellingPrice, 0));
  const freeDeliveryThreshold = 199;
  const deliveryFee = subtotal >= freeDeliveryThreshold || subtotal === 0 ? 0 : 30;
  const amountNeededForFreeDelivery = Math.max(0, freeDeliveryThreshold - subtotal);
  const grandTotal = subtotal + deliveryFee;

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        totalItemsCount,
        subtotal,
        deliveryFee,
        freeDeliveryThreshold,
        amountNeededForFreeDelivery,
        grandTotal,
        isCartOpen,
        setIsCartOpen,
        isCheckoutOpen,
        setIsCheckoutOpen,
        quickViewVeg,
        setQuickViewVeg,
        location,
        setLocation,
        isLocationOpen,
        setIsLocationOpen,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
