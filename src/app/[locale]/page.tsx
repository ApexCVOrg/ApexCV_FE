'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  CircularProgress,
  Slider,
  Checkbox,
  FormGroup,
  FormControlLabel,
  TextField,
  InputAdornment,
  useMediaQuery,
  Box,
  Typography,
  Button,
  Tabs,
  Tab,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import CategoryTreeFilter from '@/components/forms/CategoryTreeFilter';
import { Category, CategoryTree } from '@/types/components/category';
import { buildCategoryTree } from '@/lib/utils/categoryUtils';
import { useAuth } from '@/hooks/useAuth';
import ProductCard from '@/components/card';
import HomepageBanner from '@/components/banner/HomepageBanner';
import { motion } from 'framer-motion';
// import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
// import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import TabCarousel from '@/components/TabCarousel';

import ProductDetailSidebar from '@/components/ui/ProductDetailSidebar';
// import { ProductLabel, PRODUCT_LABELS } from '@/types/components/label';
import { useHomeCartContext } from '@/context/HomeCartContext';
import { useCartContext } from '@/context/CartContext';
import { useToast } from '@/components/ui/Toast';
// import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import Snackbar from '@mui/material/Snackbar';
import { ApiProduct, ApiResponse } from '@/types';
import api from '@/services/api';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
  label?: string;
  brand?: { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  orderCount?: number; // Added for top-selling
}
interface Brand {
  _id: string;
  name: string;
}

const TABS = [
  { key: 'topSelling', label: 'Top Selling' },
  { key: 'newArrivals', label: 'New Arrivals' },
  { key: 'deals', label: 'Deals & Discounts' },
  { key: 'featured', label: 'Featured Collections' },
  { key: 'trending', label: 'Trending' },
];

// Hàm xác định đường dẫn ảnh
function getImageSrc(filename: string, gender?: string, team?: string): string {
  if (!filename) return '/assets/images/placeholder.jpg';
  
  // Nếu đã là URL đầy đủ hoặc đường dẫn tuyệt đối
  if (filename.startsWith('http') || filename.startsWith('/')) {
    return filename;
  }
  
  // Lib files
  const libFiles = [
    'nike-span-2.png',
    'nike-air-force-1-high.png',
    'nike-air-force.png',
    'air-max-90.png',
    'air-max-excee-.png',
    'air-max-270.png',
  ];
  if (libFiles.includes(filename)) {
    return `/assets/images/lib/${filename}`;
  }
  
  // Products đặc biệt
  const productFiles = ['arsenal-kids-home-jersey-2024.jpg', 'arsenal-kids-tracksuit.jpg'];
  if (productFiles.includes(filename)) return `/assets/images/products/${filename}`;
  // Women/Men/Kids theo gender/team
  if (gender && team && gender !== 'uncategorized' && team !== 'uncategorized') {
    const genderFolder = gender.toLowerCase();
    const teamFolder = team.toLowerCase().replace(/ /g, '-');
    return `/assets/images/${genderFolder}/${teamFolder}/${filename}`;
  }
  
  // Fallback về products
  return `/assets/images/products/${filename}`;
}

// Hàm đoán gender và team từ category, tags, name
function guessGenderAndTeam(product: Product): { gender?: string; team?: string } {
  let gender = undefined;
  let team = undefined;
  
  // Ưu tiên lấy từ category nếu có
  if (product.categories && product.categories.length > 0) {
    const cat = product.categories[0];
    team = cat.name;
  }
  
  // Nếu không có, thử lấy từ tags
  if (!gender && product.tags) {
    if (product.tags.some((t: string) => t.toLowerCase().includes('women'))) {
      gender = 'women';
    } else if (product.tags.some((t: string) => t.toLowerCase().includes('men'))) {
      gender = 'men';
    } else if (product.tags.some((t: string) => t.toLowerCase().includes('kids'))) {
      gender = 'kids';
    }
  }
  
  // Nếu không có, thử lấy từ name
  if (!gender && product.name) {
    if (product.name.toLowerCase().includes('women')) {
      gender = 'women';
    } else if (product.name.toLowerCase().includes('men')) {
      gender = 'men';
    } else if (product.name.toLowerCase().includes('kid')) {
      gender = 'kids';
    }
  }
  
  // Team từ tags nếu có
  if (!team && product.tags) {
    const teams = ['arsenal', 'bayern munich', 'real madrid', 'manchester united', 'juventus'];
    for (const t of teams) {
      if (product.tags.some((tag: string) => tag.toLowerCase().includes(t))) {
        team = t;
        break;
      }
    }
  }
  
  return { gender, team };
}

export default function HomePage() {
  const [mounted, setMounted] = useState(false);
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState<{ [key: string]: Product[] }>({});
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isProductDetailSidebarOpen, setIsProductDetailSidebarOpen] = useState(false);
  const [libProducts, setLibProducts] = useState<Product[]>([]);
  const [otherProducts, setOtherProducts] = useState<Product[]>([]);
  const [averageRatings, setAverageRatings] = useState<Record<string, number>>({});
  useAuth();
  const isLargeScreen = useMediaQuery('(width: 1440px) and (height: 1920px)');
  const [scrollY, setScrollY] = useState(0);
  // State for pagination (load more)
  const [visibleCount, setVisibleCount] = useState(6); // Mặc định 2 dòng (3 sản phẩm mỗi dòng)
  // State for pagination (load more) cho từng tab
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [tabVisibleCount, setTabVisibleCount] = useState<{ [key: string]: number }>({});
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { addToHomeCart } = useHomeCartContext();
  const { addToCart } = useCartContext();
  const { showToast } = useToast();
  // State cho tabbed-product-row: chỉ hiển thị 3 sản phẩm, điều khiển bằng startIndex
  // const [tabStartIndex, setTabStartIndex] = useState<{ [key: string]: number }>({});
  // State lưu hướng chuyển động (slide direction)
  // const [tabSlideDirection, setTabSlideDirection] = useState<'left' | 'right'>('right');
  const [snackbarOpen, setSnackbarOpen] = useState(false);

  // Prevent hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setScrollY(window.scrollY);
    };
    window.addEventListener('scroll', handleScroll);
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fetch initial categories and brands
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        console.log('Fetching initial categories and brands...');
        
        const [categoriesRes, brandsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/tree`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`),
        ]);
        
        console.log('Categories response status:', categoriesRes.status);
        console.log('Brands response status:', brandsRes.status);
        
        const [categoriesData, brandsData] = await Promise.all([
          categoriesRes.json(),
          brandsRes.json(),
        ]);
        
        console.log('Categories data:', categoriesData);
        console.log('Brands data:', brandsData);
        
        if (
          categoriesData &&
          Array.isArray(categoriesData) &&
          categoriesData.length > 0 &&
          categoriesData[0].children !== undefined
        ) {
          setCategoryTree(categoriesData);
          // Flatten the tree for backward compatibility
          const flattenCategories = (cats: CategoryTree[]): Category[] => {
            const result: Category[] = [];
            cats.forEach(cat => {
              result.push({
                _id: cat._id,
                name: cat.name,
                description: cat.description,
                parentCategory: cat.parentCategory,
                status: cat.status,
                createdAt: cat.createdAt,
                updatedAt: cat.updatedAt,
              });
              if (cat.children) {
                result.push(...flattenCategories(cat.children));
              }
            });
            return result;
          };
          setCategories(flattenCategories(categoriesData));
        } else {
          setCategories(categoriesData);
          setCategoryTree(buildCategoryTree(categoriesData));
        }
        setBrands(brandsData);
      } catch (error) {
        console.error('Error fetching initial data:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch filtered products (for main grid)
  const fetchFilteredProducts = useCallback(async () => {
    setLoading(true);
    try {
      const queryParams = new URLSearchParams({
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        ...(selectedCategories.length > 0 && { category: selectedCategories.join(',') }),
        ...(selectedBrands.length > 0 && { brand: selectedBrands.join(',') }),
        ...(searchQuery ? { search: searchQuery } : {}),
      });
      
      console.log('Fetching filtered products with params:', {
        priceRange,
        selectedCategories,
        selectedBrands,
        searchQuery,
        queryParams: queryParams.toString()
      });
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`;
      console.log('API URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const result: ApiResponse<ApiProduct[]> = await response.json();
      let filtered = result.data || [];

      console.log('Raw products from API:', filtered.length);
      console.log('Sample product:', filtered[0]);

      // Lọc lại phía client nếu cần (search theo tên, category cha, category con)
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        filtered = filtered.filter((product: Product) => {
          const nameMatch = product.name?.toLowerCase().includes(q);
          const catMatch = (product.categories || []).some(
            (cat: { _id: string; name: string; parentCategory?: { name: string } }) =>
              cat.name?.toLowerCase().includes(q) ||
              cat.parentCategory?.name?.toLowerCase().includes(q)
          );
          return nameMatch || catMatch;
        });
        console.log('After search filter:', filtered.length);
      }

      // Lọc theo khoảng giá phía client nếu backend chưa hỗ trợ
      filtered = (Array.isArray(filtered) ? filtered : []).filter(
        (product: Product) => product.price >= priceRange[0] && product.price <= priceRange[1]
      );
      console.log('After price filter:', filtered.length);
      
      // Lọc theo category (nếu có chọn)
      if (selectedCategories.length > 0) {
        console.log('Filtering by categories:', selectedCategories);
        filtered = filtered.filter((product: Product) => {
          const hasMatchingCategory = (product.categories || []).some(
            (cat: { _id: string; name: string; parentCategory?: { name: string } }) =>
              selectedCategories.includes(cat._id)
          );
          console.log(`Product ${product.name} categories:`, product.categories, 'has match:', hasMatchingCategory);
          return hasMatchingCategory;
        });
        console.log('After category filter:', filtered.length);
      }

      // Lọc theo brand (nếu có chọn)
      if (selectedBrands.length > 0) {
        console.log('Filtering by brands:', selectedBrands);
        filtered = filtered.filter((product: Product) => {
          const hasMatchingBrand = product.brand && selectedBrands.includes(product.brand._id);
          console.log(`Product ${product.name} brand:`, product.brand, 'has match:', hasMatchingBrand);
          return hasMatchingBrand;
        });
        console.log('After brand filter:', filtered.length);
      }

      // PHÂN LOẠI SẢN PHẨM LIB VÀ KHÁC
      const libFileNames = [
        'nike-span-2.png',
        'nike-air-force-1-high.png',
        'nike-air-force.png',
        'air-max-90.png',
        'air-max-excee-.png',
        'air-max-270.png',
      ];
      const isLib = (product: Product) => {
        if (!product.images || product.images.length === 0) return false;
        const img = product.images[0];
        if (!img) return false;
        
        // Xử lý an toàn khi lấy filename
        let fileName = '';
        if (img.includes('/')) {
          fileName = img.split('/').pop() || '';
        } else {
          fileName = img;
        }
        
        return libFileNames.includes(fileName);
      };
      const libFiltered = filtered.filter((p: Product) => isLib(p));
      
      // Debug: Check for duplicate IDs
      const libProductIds = libFiltered.map(p => p._id);
      const duplicateIds = libProductIds.filter((id, index) => libProductIds.indexOf(id) !== index);
      if (duplicateIds.length > 0) {
        console.warn('Duplicate product IDs found in lib products:', duplicateIds);
      }
      
      // Remove duplicates based on _id
      const uniqueLibProducts = libFiltered.filter((product, index, self) => 
        index === self.findIndex(p => p._id === product._id)
      );
      
      setLibProducts(uniqueLibProducts);
      
      // Remove duplicates from other products as well
      const otherFiltered = filtered.filter((p: Product) => !isLib(p));
      const uniqueOtherProducts = otherFiltered.filter((product, index, self) => 
        index === self.findIndex(p => p._id === product._id)
      );
      
      setOtherProducts(uniqueOtherProducts);
      setProducts(prev => ({ ...prev, filtered }));
      
      // Debug: Log kết quả phân loại
      console.log('Lib products count (before dedup):', libFiltered.length);
      console.log('Lib products count (after dedup):', uniqueLibProducts.length);
      console.log('Other products count (before dedup):', otherFiltered.length);
      console.log('Other products count (after dedup):', uniqueOtherProducts.length);
    } catch (error) {
      setLibProducts([]);
      setOtherProducts([]);
      setProducts(prev => ({ ...prev, filtered: [] }));
      console.error('Error fetching filtered products:', error);
    } finally {
      setLoading(false);
    }
  }, [priceRange, selectedCategories, selectedBrands, searchQuery]);

  // Fetch products for tabs (independent of filters)
  const fetchTabProducts = useCallback(async (tabKey: string) => {
    console.log('Fetching products for tab:', tabKey);
    try {
      let filtered: Product[] = [];
      
      // Build query parameters for all tabs
      const queryParams = new URLSearchParams({
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        ...(selectedCategories.length > 0 && { category: selectedCategories.join(',') }),
        ...(selectedBrands.length > 0 && { brand: selectedBrands.join(',') }),
        ...(searchQuery ? { search: searchQuery } : {}),
      });
      
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`;
      console.log('Calling API:', apiUrl);
      
      const response = await fetch(apiUrl);
      if (!response.ok) throw new Error('Failed to fetch products');
      const result = await response.json();
      filtered = result.data || [];
      
      if (tabKey === 'topSelling') {
        // Top Selling: sort theo orderCount và lấy top 10
        filtered = filtered.sort((a: Product, b: Product) => 
          (b.orderCount || 0) - (a.orderCount || 0)
        ).slice(0, 10);
      } else if (tabKey === 'newArrivals') {
        filtered = filtered.filter((product: Product) => {
          const labels = Array.isArray(product.label) ? product.label : [product.label];
          return labels?.some(
            (l: string) => l?.toLowerCase() === 'hot' || l?.toLowerCase() === 'new'
          );
        });
      } else if (tabKey === 'deals') {
        filtered = filtered.filter((product: Product) => product.discountPrice != null);
      } else if (tabKey === 'featured') {
        filtered = filtered.filter((product: Product) => {
          const labels = Array.isArray(product.label) ? product.label : [product.label];
          return labels?.some((l: string) =>
            ['bestseller', 'summer 2025', 'limited edition'].includes(l?.toLowerCase())
          );
        });
      } else if (tabKey === 'trending') {
        // Nếu có API trending thì gọi, nếu không thì dùng top-selling kết hợp label
        // Ở đây giả sử không có API trending
        filtered = filtered
          .filter((product: Product) => {
            const labels = Array.isArray(product.label) ? product.label : [product.label];
            return labels?.some(
              (l: string) => l?.toLowerCase() === 'hot' || l?.toLowerCase() === 'new'
            );
          })
          .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
      }
      
      // PHÂN LOẠI SẢN PHẨM LIB VÀ KHÁC
      const libFileNames = [
        'nike-span-2.png',
        'nike-air-force-1-high.png',
        'nike-air-force.png',
        'air-max-90.png',
        'air-max-excee-.png',
        'air-max-270.png',
      ];
      const isLib = (product: Product) => {
        if (!product.images || product.images.length === 0) return false;
        const img = product.images[0];
        if (!img) return false;
        
        // Xử lý an toàn khi lấy filename
        let fileName = '';
        if (img.includes('/')) {
          fileName = img.split('/').pop() || '';
        } else {
          fileName = img;
        }
        
        return libFileNames.includes(fileName);
      };
      if (tabKey === 'filtered') {
        setLibProducts(filtered.filter(isLib));
        setOtherProducts(filtered.filter(p => !isLib(p)));
      }
      console.log(`Products for ${tabKey}:`, filtered.length, filtered);
      setProducts(prev => ({ ...prev, [tabKey]: filtered }));
    } catch (error) {
      console.error('Error fetching products for tab:', tabKey, error);
      setProducts(prev => ({ ...prev, [tabKey]: [] }));
      setLibProducts([]);
      setOtherProducts([]);
    } finally {
      setLoading(false);
    }
  }, [priceRange, selectedCategories, selectedBrands, searchQuery]);

  // Reset visibleCount khi filter/search thay đổi
  useEffect(() => {
    setVisibleCount(6);
  }, [priceRange, selectedCategories, selectedBrands, searchQuery]);

  // Reset visible count khi đổi tab
  useEffect(() => {
    setTabVisibleCount(prev => ({ ...prev, [TABS[tab].key]: 5 }));
    // Chỉ reset startIndex nếu có nhiều hơn 3 sản phẩm
    // const key = TABS[tab].key;
    // const tabProducts = products[key] || [];
    // if (tabProducts.length > 3) {
    //   setTabStartIndex(prev => ({ ...prev, [key]: 0 }));
    // }
  }, [tab, priceRange, selectedCategories, selectedBrands, searchQuery, products]);

  // Fetch filtered products when filters change
  useEffect(() => {
    console.log('Filters changed, fetching filtered products');
    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedBrands, searchQuery]);

  // Fetch initial data (chỉ chạy 1 lần khi component mount)
  useEffect(() => {
    console.log('Component mounted, fetching initial data');
    fetchFilteredProducts();
    fetchTabProducts(TABS[tab].key);
  }, []); // Chỉ chạy 1 lần khi mount

  // Fetch tabbed products khi đổi tab
  useEffect(() => {
    const tabKey = TABS[tab].key;
    fetchTabProducts(tabKey);
  }, [tab, fetchTabProducts]);

  // Fetch average rating cho tất cả sản phẩm hiển thị
  useEffect(() => {
    const allProducts = Object.values(products).flat();
    const fetchAverages = async () => {
      const ratings: Record<string, number> = {};
      await Promise.all(allProducts.map(async (product) => {
        try {
          const res = await api.get(`/reviews/average/${product._id}`);
          const data = res.data as { average: number };
          ratings[product._id] = data.average || 0;
        } catch {
          ratings[product._id] = 0;
        }
      }));
      setAverageRatings(ratings);
    };
    if (allProducts.length > 0) fetchAverages();
  }, [products]);

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };
  // Memoize categories data to prevent unnecessary re-renders
  const memoizedCategoryTree = useMemo(() => categoryTree, [categoryTree]);
  const memoizedSelectedCategories = useMemo(() => selectedCategories, [selectedCategories]);
  const memoizedSelectedBrands = useMemo(() => selectedBrands, [selectedBrands]);
  const memoizedBrands = useMemo(() => brands, [brands]);

  // Optimize category change handler with useCallback
  const handleCategoryChange = useCallback((categoryId: string, checked: boolean) => {
    console.log('Category filter changed:', { categoryId, checked });
    setSelectedCategories(prev => {
      const newSelected = checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId);
      console.log('New selected categories:', newSelected);
      return newSelected;
    });
  }, []);

  // Optimize brand change handler with useCallback
  const handleBrandChange = useCallback((event: React.ChangeEvent<HTMLInputElement>, brandId: string) => {
    console.log('Brand filter changed:', { brandId, checked: event.target.checked });
    setSelectedBrands(prev => {
      const newSelected = event.target.checked ? [...prev, brandId] : prev.filter(id => id !== brandId);
      console.log('New selected brands:', newSelected);
      return newSelected;
    });
  }, []);

  const handleProductCardClick = (productId: string, product?: Product) => {
    setSelectedProductId(productId);
    setSelectedProduct(product || null);
    setIsProductDetailSidebarOpen(true);
  };

  const handleCloseProductDetailSidebar = () => {
    setIsProductDetailSidebarOpen(false);
    setSelectedProductId(null);
    setSelectedProduct(null);
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: '#fff',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <>
      {/* Banner luôn hiển thị ở đầu trang, fade out + trượt lên khi cuộn */}
      <HomepageBanner scrollY={scrollY} />
      {/* HÀNG SẢN PHẨM LIB NGAY DƯỚI BANNER */}
      {libProducts.length > 0 && (
        <Box
          sx={{
            maxWidth: 1200,
            mx: 'auto',
            width: '100%',
            mt: 2,
            mb: 4,
          }}
        >
          <Box
            sx={{
              width: '100%',
              maxWidth: 1200,
              minHeight: 220,
              mx: 'auto',
              my: 6,
              position: 'relative',
              background: 'transparent',
            }}
          >
            {/* Nike ở góc trên trái */}
            <Typography
              variant="h1"
              fontWeight={900}
              sx={{
                fontSize: 35,
                fontFamily: 'monospace',
                position: 'absolute',
                top: 30,
                left: 130,
                zIndex: 2,
              }}
            >
              NIKE
            </Typography>
            {/* Just Do It ở góc dưới phải */}
            <Typography
              variant="h1"
              fontWeight={900}
              sx={{
                fontSize: 35,
                fontFamily: 'monospace',
                position: 'absolute',
                bottom: 30,
                right: 150,
                zIndex: 2,
                whiteSpace: 'nowrap',
              }}
            >
              Just Do It
            </Typography>
            {/* Logo swoosh ở giữa */}
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                pointerEvents: 'none',
                userSelect: 'none',
              }}
            >
              <pre
                style={{
                  fontFamily: 'monospace',
                  fontSize: '22px',
                  lineHeight: '20px',
                  textAlign: 'center',
                  margin: 0,
                  padding: 0,
                  background: 'none',
                  border: 'none',
                }}
              >{`
⠀⠀⢀⠄⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⣀⣠⣤⡤⠖⠚⠁
⠀⣰⣿⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀ ⣀⣠⣤⣴⣶⡿⠿⠛⠉⠀⠀⠀⠀⠀
⢰⣿⣿⣧⣀⣀⣀⣀⣀⣤⣴⣶⣶⣿⣿⣿⠿⠟⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀
⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⣿⡿⠟⠛⠉⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠙⢿⣿⣿⣿⣿⡿⠿⠛⠋⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
⠀⠀⠀⠉⠁⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀⠀
    `}</pre>
            </Box>
          </Box>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{ mb: 4, textAlign: 'center', maxWidth: 700, mx: 'auto' }}
          >
            Khám phá các mẫu giày Nike Air Max hot nhất, thiết kế thời thượng, hiệu năng vượt trội.
            Được yêu thích bởi sneakerhead toàn cầu!
          </Typography>
          {/* Chia thành 2 hàng, mỗi hàng 3 sản phẩm */}
          {[0, 1].map(rowIdx => (
            <Box
              key={rowIdx}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                gap: 10, // tăng khoảng cách giữa các card
                mb: rowIdx === 0 ? 6 : 2, // tăng khoảng cách giữa 2 hàng
              }}
            >
              {libProducts.slice(rowIdx * 3, rowIdx * 3 + 3).map((product, productIndex) => {
                // Luôn lấy đúng ảnh lib
                const imgSrc = `/assets/images/lib/${product.images?.[0] || ''}`;
                const uniqueKey = `lib-${product._id}-${rowIdx}-${productIndex}`;
                console.log('Lib product key:', uniqueKey, 'product:', product._id);
                return (
                  <ProductCard
                    key={uniqueKey}
                    productId={product._id}
                    name={product.name}
                    image={imgSrc}
                    price={product.price}
                    discountPrice={product.discountPrice}
                    tags={product.tags}
                    brand={product.brand}
                    categories={product.categories}
                    // @ts-expect-error: Product label may be string, not ProductLabel
                    labels={product.label ? [product.label as string] : []}
                    allCategories={categories}
                    allBrands={brands}
                    averageRating={averageRatings[product._id] ?? 0}
                    onAddToCart={async () => {
                      try {
                        await addToCart({
                          productId: product._id,
                          quantity: 1
                        });
                        // Show success message
                        showToast('Đã thêm vào giỏ hàng!', 'success');
                      } catch (error) {
                        console.error('Add to cart error:', error);
                        // Show error message
                        showToast('Thêm vào giỏ hàng thất bại!', 'error');
                      }
                    }}
                    backgroundColor="#f8f9fa"
                    colors={3}
                    onViewDetail={() => handleProductCardClick(product._id, product)}
                  />
                );
              })}
            </Box>
          ))}
        </Box>
      )}
      {/* PHẦN CÒN LẠI GIỮ NGUYÊN */}
      <Box
        sx={{
          width: '100%',
          px: 0,
          py: { xs: 2, md: 4 },
          position: 'relative',
          zIndex: 1,
          marginRight: { md: isProductDetailSidebarOpen ? '400px' : '0px' }, // Để chừa chỗ cho sidebar bên phải
          transition: 'margin-right 0.3s ease',
        }}
      >
        <Box sx={{ maxWidth: 1200, mx: 'auto', width: '100%' }}>
          {/* Hero Section, Discover... */}
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            <Box
              sx={{
                mb: isLargeScreen ? 6 : 4,
                textAlign: 'center',
                '@media screen and (width: 1440px) and (height: 1920px)': {
                  marginBottom: '4rem',
                },
              }}
            >
              <Typography
                variant="h3"
                fontWeight={900}
                gutterBottom
                sx={{
                  '@media screen and (width: 1440px) and (height: 1920px)': {
                    fontSize: '3.5rem',
                    lineHeight: 1.1,
                    marginBottom: '1.5rem',
                  },
                }}
              >
                Discover Your Style
              </Typography>
              <Typography
                variant="h6"
                color="text.secondary"
                sx={{
                  '@media screen and (width: 1440px) and (height: 1920px)': {
                    fontSize: '1.5rem',
                    lineHeight: 1.4,
                  },
                }}
              >
                Shop the latest trends, best sellers, and exclusive deals
              </Typography>
            </Box>
          </motion.div>
          <Box
            sx={{
              display: 'flex',
              flexDirection: { xs: 'column', md: 'row' },
              gap: { xs: 2, md: 4 },
              alignItems: 'flex-start',
              '@media screen and (width: 1440px) and (height: 1920px)': {
                gap: '3rem',
              },
            }}
          >
            {/* Sidebar Filter */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.2 }}
              style={{ width: '100%' }}
            >
              <Box
                sx={{
                  width: { xs: '100%', md: isLargeScreen ? 320 : 220 },
                  flexShrink: 0,
                  mb: { xs: 4, md: 0 },
                  px: { xs: 0, md: 1 },
                  ml: { md: -20 },
                  '@media screen and (width: 1440px) and (height: 1920px)': {
                    width: '320px',
                    padding: '0 1rem',
                  },
                }}
              >
                <Box sx={{ position: 'sticky', top: 20 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      mb: 2,
                      '@media screen and (width: 1440px) and (height: 1920px)': {
                        fontSize: '1.8rem',
                        marginBottom: '1.5rem',
                      },
                    }}
                  >
                    Filters
                  </Typography>

                  {/* Search */}
                  <TextField
                    fullWidth
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setSearchQuery(e.target.value)
                    }
                    sx={{
                      mb: 3,
                      '@media screen and (width: 1440px) and (height: 1920px)': {
                        marginBottom: '2rem',
                        '& .MuiInputBase-root': {
                          fontSize: '1.1rem',
                          padding: '1rem 1.5rem',
                          borderRadius: '12px',
                        },
                      },
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <SearchIcon />
                        </InputAdornment>
                      ),
                    }}
                  />

                  {/* Price Range */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 1,
                        '@media screen and (width: 1440px) and (height: 1920px)': {
                          fontSize: '1.3rem',
                          marginBottom: '1rem',
                        },
                      }}
                    >
                      Price Range
                    </Typography>
                    <Slider
                      value={priceRange}
                      onChange={handlePriceChange}
                      valueLabelDisplay="auto"
                      min={0}
                      max={5000000}
                      step={100000}
                      sx={{
                        '@media screen and (width: 1440px) and (height: 1920px)': {
                          '& .MuiSlider-thumb': {
                            width: '24px',
                            height: '24px',
                          },
                          '& .MuiSlider-track': {
                            height: '6px',
                          },
                          '& .MuiSlider-rail': {
                            height: '6px',
                          },
                        },
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">
                        {priceRange[0].toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        })}
                      </Typography>
                      <Typography variant="body2">
                        {priceRange[1].toLocaleString('vi-VN', {
                          style: 'currency',
                          currency: 'VND',
                        })}
                      </Typography>
                    </Box>
                  </Box>



                  {/* Categories */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 1,
                        '@media screen and (width: 1440px) and (height: 1920px)': {
                          fontSize: '1.3rem',
                          marginBottom: '1rem',
                        },
                      }}
                    >
                      Categories
                    </Typography>
                    <Box sx={{ position: 'relative', zIndex: 10 }}>
                      <CategoryTreeFilter
                        categories={memoizedCategoryTree}
                        selectedCategories={memoizedSelectedCategories}
                        onCategoryChange={handleCategoryChange}
                      />
                    </Box>
                  </Box>

                  {/* Brands */}
                  <Box sx={{ mb: 3 }}>
                    <Typography
                      variant="subtitle1"
                      sx={{
                        mb: 1,
                        '@media screen and (width: 1440px) and (height: 1920px)': {
                          fontSize: '1.3rem',
                          marginBottom: '1rem',
                        },
                      }}
                    >
                      Brands
                    </Typography>
                    <Box sx={{ position: 'relative', zIndex: 10 }}>
                      <FormGroup>
                        {memoizedBrands.map(brand => (
                          <Box key={brand._id} sx={{ display: 'flex', alignItems: 'center', margin: '4px 0' }}>
                            <input
                              type="checkbox"
                              checked={memoizedSelectedBrands.includes(brand._id)}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                                console.log('Brand checkbox clicked:', { brandId: brand._id, checked: e.target.checked });
                                handleBrandChange(e, brand._id);
                              }}
                              onClick={(e) => {
                                console.log('Brand checkbox onClick:', { brandId: brand._id });
                                e.stopPropagation();
                              }}
                              style={{ marginRight: '8px', cursor: 'pointer' }}
                            />
                            <Typography variant="body2">{brand.name}</Typography>
                          </Box>
                        ))}
                      </FormGroup>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </motion.div>
            {/* Main Content */}
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.7, ease: 'easeOut', delay: 0.3 }}
              style={{ flex: 1, width: '100%' }}
            >
              {/* Products Grid (filtered) */}
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                  <CircularProgress size={60} />
                </Box>
              ) : (
                <Box
                  className="product-grid"
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: {
                      xs: 'repeat(2, 1fr)',
                      md: 'repeat(3, 1fr)',
                    },
                    gap: 3,
                    p: 2,
                    '@media screen and (width: 1440px) and (height: 1920px)': {
                      gridTemplateColumns: 'repeat(3, 1fr)',
                      gap: '2rem',
                      padding: '2rem 0',
                    },
                  }}
                >
                  {otherProducts.slice(0, visibleCount).length > 0 ? (
                    otherProducts.slice(0, visibleCount).map((product, idx) => {
                      const { gender, team } = guessGenderAndTeam(product);
                      let imgSrc = '/assets/images/placeholder.jpg';
                      if (product.images && product.images[0]) {
                        imgSrc = getImageSrc(product.images[0], gender, team);
                      }
                      return (
                        <motion.div
                          key={`other-${product._id}-${idx}-${product.images?.[0] || 'no-image'}`}
                          initial={{ opacity: 0, y: 40 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: idx * 0.07 }}
                          style={{ display: 'flex', height: '100%' }}
                        >
                          <ProductCard
                            productId={product._id}
                            name={product.name}
                            image={imgSrc}
                            price={product.price}
                            discountPrice={product.discountPrice}
                            tags={product.tags}
                            brand={product.brand}
                            categories={product.categories}
                            // @ts-expect-error: Product label may be string, not ProductLabel
                            labels={product.label ? [product.label as string] : []}
                            allCategories={categories}
                            allBrands={brands}
                            averageRating={averageRatings[product._id] ?? 0}
                            onAddToCart={async () => {
                      try {
                        await addToCart({
                          productId: product._id,
                          quantity: 1
                        });
                        // Show success message
                        showToast('Đã thêm vào giỏ hàng!', 'success');
                      } catch (error) {
                        console.error('Add to cart error:', error);
                        // Show error message
                        showToast('Thêm vào giỏ hàng thất bại!', 'error');
                      }
                    }}
                            backgroundColor="#f8f9fa"
                            colors={3}
                            sx={{ height: '100%' }}
                            onViewDetail={() => handleProductCardClick(product._id, product)}
                          />
                        </motion.div>
                      );
                    })
                  ) : (
                    <Box sx={{ textAlign: 'center', py: 4, gridColumn: '1/-1' }}>
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{
                          '@media screen and (width: 1440px) and (height: 1920px)': {
                            fontSize: '1.5rem',
                          },
                        }}
                      >
                        No products found. Try adjusting your filters.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              {/* Load more button */}
              {otherProducts && otherProducts.length > visibleCount && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button
                    variant="outlined"
                    onClick={() => setVisibleCount(c => c + 3)}
                    sx={{
                      color: '#111',
                      borderColor: '#111',
                      fontWeight: 700,
                      '&:hover': {
                        borderColor: '#111',
                        background: 'rgba(0,0,0,0.04)',
                        color: '#111',
                      },
                    }}
                  >
                    Load more
                  </Button>
                </Box>
              )}
              {/* Tabs section moved below the product grid */}
              <Box
                sx={{
                  borderBottom: 1,
                  borderColor: 'divider',
                  mb: 3,
                  mt: 6,
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <Tabs
                  value={tab}
                  onChange={(e: React.SyntheticEvent, newValue: number) => setTab(newValue)}
                  variant="standard"
                  sx={{
                    '& .MuiTabs-flexContainer': { justifyContent: 'center' },
                    '& .MuiTabs-indicator': { backgroundColor: '#111' },
                    '& .MuiTab-root': {
                      color: '#444',
                      fontWeight: 600,
                    },
                    '& .Mui-selected': {
                      color: '#111 !important',
                    },
                    '@media screen and (width: 1440px) and (height: 1920px)': {
                      '& .MuiTab-root': {
                        fontSize: '1.2rem',
                        padding: '1rem 2rem',
                        minHeight: '60px',
                      },
                    },
                  }}
                  centered
                >
                  {TABS.map((tabItem, index) => (
                    <Tab
                      key={index}
                      label={tabItem.label}
                      sx={{
                        textTransform: 'none',
                        fontWeight: 600,
                      }}
                    />
                  ))}
                </Tabs>
              </Box>

              {/* TabCarousel Component */}
              <Box sx={{ mt: 4 }}>
                <TabCarousel
                  products={products[TABS[tab].key] || []}
                  onProductClick={handleProductCardClick}
                />
              </Box>
            </motion.div>
          </Box>
        </Box>
      </Box>
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Box sx={{ bgcolor: 'success.main', color: 'white', p: 2, borderRadius: 1 }}>
          Product added to cart!
        </Box>
      </Snackbar>

      {/* Product Detail Sidebar */}
      <ProductDetailSidebar
        productId={selectedProductId}
        product={selectedProduct}
        isOpen={isProductDetailSidebarOpen}
        onClose={handleCloseProductDetailSidebar}
      />

      {/* Overlay for Product Detail Sidebar */}
      {isProductDetailSidebarOpen && (
        <Box
          onClick={handleCloseProductDetailSidebar}
          sx={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            bgcolor: 'rgba(0,0,0,0.3)',
            zIndex: 1200,
            cursor: 'pointer',
          }}
        />
      )}
    </>
  );
}
