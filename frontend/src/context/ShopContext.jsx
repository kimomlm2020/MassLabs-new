// ShopContext.jsx
import React, { createContext, useEffect, useState, useCallback, useMemo, useRef } from "react";
import { products as localProducts } from '../assets/assets';
import { toast } from 'react-toastify';
import { useNavigate } from "react-router-dom";
import axios from 'axios';

export const ShopContext = createContext();

const ShopContextProvider = (props) => {
  const currency = '€';
  const delivery_fee = 30;
  const free_shipping_threshold = 200;

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 'http://localhost:4000';

  const [search, setSearch] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [cartItems, setCartItems] = useState({});
  const [products, setProducts] = useState([]);
  const [token, setToken] = useState('');
  const [user, setUser] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedSubCategory, setSelectedSubCategory] = useState('All');
  const [sortType, setSortType] = useState('relevant');
  const [isBackendReady, setIsBackendReady] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const navigate = useNavigate();
  const isInitialized = useRef(false);

  const categories = ['All', 'Injectables', 'Orals', 'SARMs', 'PCT', 'Peptides'];
  const subCategories = useMemo(() => ({
    'All': [],
    'Injectables': ['All', 'Testosterone', 'Nandrolone', 'Boldenone', 'Trenbolone', 'Masteron', 'Winstrol', 'Primobolan', 'Anadrol'],
    'Orals': ['All', 'Dianabol', 'Anavar', 'Winstrol', 'Anadrol', 'Turinabol', 'Methyltestosterone', 'Halotestin', 'Superdrol'],
    'SARMs': ['All', 'Ostarine', 'Ligandrol', 'RAD-140', 'Ibutamoren', 'Andarine', 'Cardarine', 'YK-11', 'S-23'],
    'PCT': ['All', 'Nolvadex', 'Clomid', 'Arimidex', 'Aromasin', 'HCG', 'Letrozole', 'Cabergoline', 'Finasteride', 'Cialis', 'Viagra'],
    'Peptides': ['All', 'HGH-Fragment', 'CJC-1295', 'Ipamorelin', 'BPC-157']
  }), []);

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get(`${backendUrl}/api/product/list`, { 
        timeout: 10000,
        params: { limit: 100 }
      });
      
      if (response.data.success) {
        setProducts(response.data.products);
        setIsBackendReady(true);
      } else {
        throw new Error(response.data.message || 'Failed to fetch products');
      }
    } catch (error) {
      toast.error('Failed to load products. Using local data.');
      setProducts(prev => prev.length === 0 ? localProducts : prev);
    } finally {
      setIsLoading(false);
    }
  }, [backendUrl]);

  const getUserCart = useCallback(async (userToken) => {
    if (!userToken) return;
    try {
      const response = await axios.post(
        `${backendUrl}/api/cart/get`, 
        {}, 
        { headers: { token: userToken } }
      );
      if (response.data.success) {
        setCartItems(response.data.cartData || {});
      }
    } catch (error) {
      // Silent fail on initial load
    }
  }, [backendUrl]);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('cartItems');
    setToken('');
    setUser(null);
    setCartItems({});
    navigate('/login');
    toast.info('Logged out successfully');
  }, [navigate]);

  useEffect(() => {
    if (isInitialized.current) return;
    isInitialized.current = true;
    
    fetchProducts();

    const storedToken = localStorage.getItem('token');
    
    if (storedToken) {
      setToken(storedToken);
      
      const storedUser = localStorage.getItem('user');
      
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          localStorage.removeItem('user');
        }
      }
      
      getUserCart(storedToken);
    }

    const savedCart = localStorage.getItem('cartItems');
    if (savedCart) {
      try {
        const parsed = JSON.parse(savedCart);
        if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
          setCartItems(parsed);
        }
      } catch (e) {
        localStorage.removeItem('cartItems');
      }
    }
  }, [fetchProducts, getUserCart]);

  useEffect(() => {
    localStorage.setItem('cartItems', JSON.stringify(cartItems));
  }, [cartItems]);

  useEffect(() => {
    setSelectedSubCategory('All');
  }, [selectedCategory]);

  const addToCart = useCallback(async (itemId) => {
    setCartItems(prev => {
      const currentQty = prev[itemId] || 0;
      const newQty = currentQty + 1;
      
      if (newQty > 10) {
        toast.error('Maximum 10 units per product');
        return prev;
      }
      
      return { ...prev, [itemId]: newQty };
    });

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/add`, 
          { itemId, quantity: 1 }, 
          { headers: { token } }
        );
      } catch (error) {
        toast.error('Failed to sync with server');
      }
    }
  }, [token, backendUrl]);

  const removeFromCart = useCallback(async (itemId) => {
    setCartItems(prev => {
      const newCart = { ...prev };
      delete newCart[itemId];
      return newCart;
    });

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/remove`, 
          { itemId }, 
          { headers: { token } }
        );
      } catch (error) {
        // Silent fail
      }
    }
  }, [token, backendUrl]);

  const updateQuantity = useCallback(async (itemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(itemId);
      return;
    }
    if (quantity > 10) {
      toast.error('Maximum 10 units');
      return;
    }

    setCartItems(prev => ({
      ...prev,
      [itemId]: quantity
    }));

    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/update`, 
          { itemId, quantity }, 
          { headers: { token } }
        );
      } catch (error) {
        // Silent fail
      }
    }
  }, [token, backendUrl, removeFromCart]);

  const clearCart = useCallback(async () => {
    setCartItems({});
    localStorage.removeItem('cartItems');
    
    if (token) {
      try {
        await axios.post(
          `${backendUrl}/api/cart/clear`, 
          {}, 
          { headers: { token } }
        );
      } catch (error) {
        // Silent fail
      }
    }
    
    toast.success('Cart cleared');
  }, [token, backendUrl]);

  const getCartCount = useCallback(() => {
    return Object.values(cartItems).reduce((sum, qty) => sum + (qty || 0), 0);
  }, [cartItems]);

  const getCartAmount = useCallback(() => {
    return Object.entries(cartItems).reduce((total, [itemId, qty]) => {
      const product = products.find(p => p._id === itemId);
      return total + (product?.price || 0) * (qty || 0);
    }, 0);
  }, [cartItems, products]);

  const getShippingCost = useCallback(() => {
    return getCartAmount() >= free_shipping_threshold ? 0 : delivery_fee;
  }, [getCartAmount]);

  const getCartTotal = useCallback(() => {
    const subtotal = getCartAmount();
    const shipping = getShippingCost();
    return {
      subtotal,
      shipping,
      total: subtotal + shipping,
      isFreeShipping: shipping === 0,
      remainingForFree: Math.max(0, free_shipping_threshold - subtotal),
      freeShippingThreshold: free_shipping_threshold
    };
  }, [getCartAmount, getShippingCost]);

  const getCartItems = useCallback(() => {
    return Object.entries(cartItems)
      .map(([itemId, quantity]) => {
        const product = products.find(p => p._id === itemId);
        if (!product) return null;
        return {
          ...product,
          quantity,
          total: product.price * quantity
        };
      })
      .filter(Boolean);
  }, [cartItems, products]);

  const getFilteredProducts = useCallback(() => {
    let filtered = [...products];

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(item => item.category === selectedCategory);
    }

    if (selectedSubCategory !== 'All') {
      filtered = filtered.filter(item => item.subCategory === selectedSubCategory);
    }

    if (search.trim()) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(item =>
        item.name?.toLowerCase().includes(searchLower) ||
        item.description?.toLowerCase().includes(searchLower) ||
        item.category?.toLowerCase().includes(searchLower)
      );
    }

    switch (sortType) {
      case 'price-low':
        filtered.sort((a, b) => (a.price || 0) - (b.price || 0));
        break;
      case 'price-high':
        filtered.sort((a, b) => (b.price || 0) - (a.price || 0));
        break;
      case 'bestseller':
        filtered.sort((a, b) => (b.bestseller ? 1 : 0) - (a.bestseller ? 1 : 0));
        break;
      default:
        filtered.sort((a, b) => {
          if (a.bestseller && !b.bestseller) return -1;
          if (!a.bestseller && b.bestseller) return 1;
          return (a.name || '').localeCompare(b.name || '');
        });
    }

    return filtered;
  }, [products, selectedCategory, selectedSubCategory, search, sortType]);

  const getBestsellers = useCallback(() => {
    return products.filter(item => item.bestseller).slice(0, 8);
  }, [products]);

  const getProductById = useCallback((id) => {
    return products.find(product => product._id === id);
  }, [products]);

  const value = useMemo(() => ({
    currency,
    delivery_fee,
    free_shipping_threshold,
    backendUrl,
    categories,
    subCategories,
    products,
    token,
    user,
    isBackendReady,
    isLoading,
    search,
    showSearch,
    selectedCategory,
    selectedSubCategory,
    sortType,
    cartItems,
    setSearch,
    setShowSearch,
    setSelectedCategory,
    setSelectedSubCategory,
    setSortType,
    setCartItems,
    setToken,
    setUser,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    getCartCount,
    getCartAmount,
    getCartTotal,
    getShippingCost,
    getCartItems,
    getFilteredProducts,
    getBestsellers,
    getProductById,
    getUserCart,
    fetchProducts, 
    logout,
    navigate
  }), [
    currency, delivery_fee, free_shipping_threshold, backendUrl,
    categories, subCategories, products, token, user,
    isBackendReady, isLoading, search, showSearch, selectedCategory,
    selectedSubCategory, sortType, cartItems,
    addToCart, removeFromCart, updateQuantity, clearCart,
    getCartCount, getCartAmount, getCartTotal, getShippingCost,
    getCartItems, getFilteredProducts, getBestsellers, getProductById,
    getUserCart, fetchProducts, logout, navigate
  ]);

  return (
    <ShopContext.Provider value={value}>
      {props.children}
    </ShopContext.Provider>
  );
};

export default ShopContextProvider;