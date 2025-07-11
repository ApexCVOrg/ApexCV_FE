'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useCartContext } from './CartContext';

interface HomeCartItem {
  _id: string;
  productId: string;
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  brand?: string;
  size?: string;
  color?: string;
  quantity: number;
}

interface HomeCartContextProps {
  homeCartItems: HomeCartItem[];
  isHomeCartOpen: boolean;
  addToHomeCart: (item: Omit<HomeCartItem, '_id'>) => void;
  updateHomeCartItem: (itemId: string, quantity: number) => void;
  removeFromHomeCart: (itemId: string) => void;
  clearHomeCart: () => void;
  openHomeCart: () => void;
  closeHomeCart: () => void;
  confirmHomeCart: () => Promise<void>;
  homeCartItemCount: number;
  homeCartTotal: number;
}

const HomeCartContext = createContext<HomeCartContextProps | undefined>(undefined);

export const HomeCartProvider = ({ children }: { children: ReactNode }) => {
  const [homeCartItems, setHomeCartItems] = useState<HomeCartItem[]>([]);
  const [isHomeCartOpen, setIsHomeCartOpen] = useState(true);
  const { addToCart, loading } = useCartContext();

  // Tính tổng số lượng sản phẩm trong home cart
  const homeCartItemCount = homeCartItems.reduce((total, item) => total + item.quantity, 0);

  // Tính tổng giá trị home cart
  const homeCartTotal = homeCartItems.reduce((total, item) => {
    const itemPrice = item.discountPrice || item.price;
    return total + (itemPrice * item.quantity);
  }, 0);

  // Thêm sản phẩm vào home cart
  const addToHomeCart = (item: Omit<HomeCartItem, '_id'>) => {
    const newItem: HomeCartItem = {
      ...item,
      _id: `${item.productId}-${item.size || 'no-size'}-${item.color || 'no-color'}`,
    };

    setHomeCartItems(prev => {
      const existingItemIndex = prev.findIndex(
        existing => existing._id === newItem._id
      );

      if (existingItemIndex >= 0) {
        // Cập nhật số lượng nếu sản phẩm đã tồn tại
        const updated = [...prev];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          quantity: updated[existingItemIndex].quantity + newItem.quantity,
        };
        return updated;
      } else {
        // Thêm sản phẩm mới
        return [...prev, newItem];
      }
    });

    // Không cần mở sidebar vì đã luôn mở
  };

  // Cập nhật số lượng sản phẩm trong home cart
  const updateHomeCartItem = (itemId: string, quantity: number) => {
    setHomeCartItems(prev =>
      prev.map(item =>
        item._id === itemId ? { ...item, quantity } : item
      )
    );
  };

  // Xóa sản phẩm khỏi home cart
  const removeFromHomeCart = (itemId: string) => {
    setHomeCartItems(prev => prev.filter(item => item._id !== itemId));
  };

  // Xóa toàn bộ home cart
  const clearHomeCart = () => {
    setHomeCartItems([]);
  };

  // Mở home cart (không cần thiết vì luôn mở)
  const openHomeCart = () => {
    setIsHomeCartOpen(true);
  };

  // Đóng home cart
  const closeHomeCart = () => {
    setIsHomeCartOpen(false);
  };

  // Xác nhận home cart - chuyển tất cả sản phẩm vào cart chính
  const confirmHomeCart = async () => {
    try {
      // Thêm từng sản phẩm vào cart chính
      for (const item of homeCartItems) {
        await addToCart({
          productId: item.productId,
          quantity: item.quantity,
          size: item.size || '',
          color: item.color || '',
        });
      }

      // Xóa home cart sau khi đã chuyển thành công
      clearHomeCart();
      // Không đóng sidebar vì luôn mở
    } catch (error) {
      console.error('Error confirming home cart:', error);
      throw error;
    }
  };

  const value: HomeCartContextProps = {
    homeCartItems,
    isHomeCartOpen,
    addToHomeCart,
    updateHomeCartItem,
    removeFromHomeCart,
    clearHomeCart,
    openHomeCart,
    closeHomeCart,
    confirmHomeCart,
    homeCartItemCount,
    homeCartTotal,
  };

  return (
    <HomeCartContext.Provider value={value}>
      {children}
    </HomeCartContext.Provider>
  );
};

export const useHomeCartContext = () => {
  const context = useContext(HomeCartContext);
  if (!context) {
    throw new Error('useHomeCartContext must be used within HomeCartProvider');
  }
  return context;
}; 