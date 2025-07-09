'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Button,
  Tabs,
  Tab,
  CircularProgress,
  Chip,
  Stack,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Slider,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Divider,
  TextField,
  InputAdornment,
  useMediaQuery,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';import CategoryTreeFilter from '@/components/forms/CategoryTreeFilter';
import { Category, CategoryTree } from '@/types/components/category';
import { buildCategoryTree } from '@/lib/utils/categoryUtils';
import { useAuth } from '@/hooks/useAuth';
import ProductCard from '@/components/card';
import HomepageBanner from '@/components/banner/HomepageBanner';
import { motion } from 'framer-motion';

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
  if (filename.startsWith('/') || filename.startsWith('http')) return filename;
  // Lib
  const libFiles = [
    'nike-span-2.png', 'nike-air-force-1-high.png', 'nike-air-force.png',
    'air-max-90.png', 'air-max-excee-.png', 'air-max-270.png'
  ];
  if (libFiles.includes(filename)) return `/assets/images/lib/${filename}`;
  // Products đặc biệt
  const productFiles = [
    'arsenal-kids-home-jersey-2024.jpg', 'arsenal-kids-tracksuit.jpg'
  ];
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
function guessGenderAndTeam(product: any): { gender?: string, team?: string } {
  let gender = undefined;
  let team = undefined;
  // Ưu tiên lấy từ category nếu có
  if (product.categories && product.categories.length > 0) {
    const cat = product.categories[0];
    if ('gender' in cat) gender = (cat as any).gender;
    team = cat.name;
  }
  // Nếu không có, thử lấy từ tags
  if (!gender && product.tags) {
    if (product.tags.some((t: string) => t.toLowerCase().includes('women'))) gender = 'women';
    else if (product.tags.some((t: string) => t.toLowerCase().includes('men'))) gender = 'men';
    else if (product.tags.some((t: string) => t.toLowerCase().includes('kids'))) gender = 'kids';
  }
  // Nếu không có, thử lấy từ name
  if (!gender && product.name) {
    if (product.name.toLowerCase().includes('women')) gender = 'women';
    else if (product.name.toLowerCase().includes('men')) gender = 'men';
    else if (product.name.toLowerCase().includes('kid')) gender = 'kids';
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
  const { isAuthenticated } = useAuth();
  const isLargeScreen = useMediaQuery('(width: 1440px) and (height: 1920px)');
  const [scrollY, setScrollY] = useState(0);
  // State for pagination (load more)
  const [visibleCount, setVisibleCount] = useState(10);
  // State for pagination (load more) cho từng tab
  const [tabVisibleCount, setTabVisibleCount] = useState<{ [key: string]: number }>({});

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
        const [categoriesRes, brandsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories/tree`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`),
        ]);
        const [categoriesData, brandsData] = await Promise.all([
          categoriesRes.json(),
          brandsRes.json(),
        ]);
        if (categoriesData && Array.isArray(categoriesData) && categoriesData.length > 0 && categoriesData[0].children !== undefined) {
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
        console.error('Error fetching categories or brands:', error);
      }
    };
    fetchInitialData();
  }, []);

  // Fetch products for the active tab and current filters
  const fetchProducts = useCallback(async (tabKey: string) => {
    setLoading(true);
    try {
      let filtered: Product[] = [];
      if (tabKey === 'topSelling') {
        // Top Selling: gọi API public, không cần token
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/public-top-selling?limit=5`);
        const result = await response.json();
        console.log('Top Selling API response:', response, result);
        // Map lại dữ liệu cho đúng shape ProductCard
        filtered = (Array.isArray(result.data) ? result.data : []).map((item: any) => ({
          _id: item._id,
          name: item.name,
          images: [item.image],
          price: item.totalRevenue || 0,
          discountPrice: undefined,
          tags: [],
          label: '',
          brand: { _id: '', name: '' },
          categories: [{ _id: '', name: item.category || 'Uncategorized' }],
        }));
      } else {
        // Các tab còn lại lấy từ API products (có thể filter theo category, price, brand)
        const queryParams = new URLSearchParams({
          minPrice: priceRange[0].toString(),
          maxPrice: priceRange[1].toString(),
          ...(selectedCategories.length > 0 && { category: selectedCategories.join(',') }),
          ...(selectedBrands.length > 0 && { brand: selectedBrands.join(',') }),
          ...(tabKey === 'filtered' && searchQuery ? { search: searchQuery } : {}),
        });
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
        if (!response.ok) throw new Error('Failed to fetch products');
        const result = await response.json();
        filtered = result.data || [];
        if (tabKey === 'newArrivals') {
          filtered = filtered.filter((product: Product) => {
            const labels = Array.isArray(product.label) ? product.label : [product.label];
            return labels?.some((l: string) => l?.toLowerCase() === 'hot' || l?.toLowerCase() === 'new');
          });
        } else if (tabKey === 'deals') {
          filtered = filtered.filter((product: Product) => product.discountPrice != null);
        } else if (tabKey === 'featured') {
          filtered = filtered.filter((product: Product) => {
            const labels = Array.isArray(product.label) ? product.label : [product.label];
            return labels?.some((l: string) => ['bestseller', 'summer 2025', 'limited edition'].includes(l?.toLowerCase()));
          });
        } else if (tabKey === 'trending') {
          // Nếu có API trending thì gọi, nếu không thì dùng top-selling kết hợp label
          // Ở đây giả sử không có API trending
          filtered = filtered
            .filter((product: Product) => {
              const labels = Array.isArray(product.label) ? product.label : [product.label];
              return labels?.some((l: string) => l?.toLowerCase() === 'hot' || l?.toLowerCase() === 'new');
            })
            .sort((a, b) => (b.orderCount || 0) - (a.orderCount || 0));
        } else if (tabKey === 'filtered') {
          // Lọc lại phía client nếu cần (search theo tên, category cha, category con)
          if (searchQuery) {
            const q = searchQuery.toLowerCase();
            filtered = filtered.filter((product: Product) => {
              const nameMatch = product.name?.toLowerCase().includes(q);
              const catMatch = (product.categories || []).some((cat: { _id: string; name: string; parentCategory?: { name: string } }) =>
                cat.name?.toLowerCase().includes(q) ||
                cat.parentCategory?.name?.toLowerCase().includes(q)
              );
              return nameMatch || catMatch;
            });
          }
        }
      }
      // Lọc theo khoảng giá phía client nếu backend chưa hỗ trợ
      filtered = (Array.isArray(filtered) ? filtered : []).filter((product: Product) => product.price >= priceRange[0] && product.price <= priceRange[1]);
      // Lọc theo category (nếu có chọn)
      if (selectedCategories.length > 0) {
        filtered = filtered.filter((product: Product) =>
          (product.categories || []).some((cat: { _id: string; name: string; parentCategory?: { name: string } }) => selectedCategories.includes(cat._id))
        );
      }
      setProducts(prev => ({ ...prev, [tabKey]: filtered }));
    } catch (error) {
      setProducts(prev => ({ ...prev, [tabKey]: [] }));
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [priceRange, selectedCategories, selectedBrands, searchQuery]);

  // Reset visibleCount khi filter/search thay đổi
  useEffect(() => {
    setVisibleCount(10);
  }, [priceRange, selectedCategories, selectedBrands, searchQuery]);

  // Reset visible count khi đổi tab hoặc filter
  useEffect(() => {
    setTabVisibleCount(prev => ({ ...prev, [TABS[tab].key]: 5 }));
  }, [tab, priceRange, selectedCategories, selectedBrands, searchQuery]);

  // Fetch products when tab or filters change
  useEffect(() => {
    // Luôn fetch sản phẩm filter riêng
    fetchProducts('filtered');
  }, [priceRange, selectedCategories, selectedBrands, searchQuery, fetchProducts]);

  // Fetch tabbed products khi đổi tab
  useEffect(() => {
    const tabKey = TABS[tab].key;
    fetchProducts(tabKey);
  }, [tab, fetchProducts]);

  const handlePriceChange = (event: Event, newValue: number | number[]) => {
    setPriceRange(newValue as number[]);
  };
  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    setSelectedCategories(prev =>
      checked ? [...prev, categoryId] : prev.filter(id => id !== categoryId)
    );
  };
  const handleBrandChange = (event: React.ChangeEvent<HTMLInputElement>, brandId: string) => {
    setSelectedBrands(prev =>
      event.target.checked ? [...prev, brandId] : prev.filter(id => id !== brandId)
    );
  };

  return (
    <>
      {/* Banner luôn hiển thị ở đầu trang, fade out + trượt lên khi cuộn */}
      <HomepageBanner scrollY={scrollY} />
      <Box 
        sx={{ 
          width: '100%',
          px: 0,
          py: { xs: 2, md: 4 },
          position: 'relative',
          zIndex: 1,
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
                }
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
                  }
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
                  }
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
              }
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
                  '@media screen and (width: 1440px) and (height: 1920px)': {
                    width: '320px',
                    padding: '0 1rem',
                  }
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
                      }
                    }}
                  >
                    Filters
                  </Typography>
                  
                  {/* Search */}
                  <TextField
                    fullWidth
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
                    sx={{ 
                      mb: 3,
                      '@media screen and (width: 1440px) and (height: 1920px)': {
                        marginBottom: '2rem',
                        '& .MuiInputBase-root': {
                          fontSize: '1.1rem',
                          padding: '1rem 1.5rem',
                          borderRadius: '12px',
                        }
                      }
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
                        }
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
                          }
                        }
                      }}
                    />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                      <Typography variant="body2">
                        {priceRange[0].toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
                      </Typography>
                      <Typography variant="body2">
                        {priceRange[1].toLocaleString('vi-VN', { style: 'currency', currency: 'VND' })}
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
                        }
                      }}
                    >
                      Categories
                    </Typography>
                    <CategoryTreeFilter
                      categories={categoryTree}
                      selectedCategories={selectedCategories}
                      onCategoryChange={handleCategoryChange}
                    />
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
                        }
                      }}
                    >
                      Brands
                    </Typography>
                    <FormGroup>
                      {brands.map((brand) => (
                        <FormControlLabel
                          key={brand._id}
                          control={
                            <Checkbox
                              checked={selectedBrands.includes(brand._id)}
                              onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleBrandChange(e, brand._id)}
                              sx={{
                                '@media screen and (width: 1440px) and (height: 1920px)': {
                                  '& .MuiSvgIcon-root': {
                                    fontSize: '1.5rem',
                                  }
                                }
                              }}
                            />
                          }
                          label={brand.name}
                          sx={{
                            '@media screen and (width: 1440px) and (height: 1920px)': {
                              fontSize: '1.1rem',
                              marginBottom: '0.5rem',
                            }
                          }}
                        />
                      ))}
                    </FormGroup>
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
                      md: 'repeat(2, 1fr)',
                    },
                    gap: isLargeScreen ? 3 : 2,
                    padding: isLargeScreen ? '2rem 0' : '1rem 0',
                    '@media screen and (width: 1440px) and (height: 1920px)': {
                      gridTemplateColumns: 'repeat(2, 1fr)',
                      gap: '2rem',
                      padding: '2rem 0',
                    }
                  }}
                >
                  {products['filtered']?.slice(0, visibleCount).length > 0 ? products['filtered'].slice(0, visibleCount).map((product) => {
                    const { gender, team } = guessGenderAndTeam(product);
                    let imgSrc = '/assets/images/placeholder.jpg';
                    if (product.images && product.images[0]) {
                      imgSrc = getImageSrc(product.images[0], gender, team);
                    }
                    // console.log('Image src:', imgSrc, product);
                    return (
                      <ProductCard
                        key={product._id}
                        name={product.name}
                        image={imgSrc}
                        price={product.price}
                        discountPrice={product.discountPrice}
                        tags={product.tags}
                        brand={product.brand}
                        categories={product.categories}
                        labels={product.label ? [product.label as any] : []}
                        allCategories={categories}
                        allBrands={brands}
                        onAddToCart={() => console.log('Add to cart:', product._id)}
                        backgroundColor="#f8f9fa"
                        colors={3}
                      />
                    );
                  }) : (
                    <Box sx={{ textAlign: 'center', py: 4, gridColumn: '1/-1' }}>
                      <Typography 
                        variant="h6" 
                        color="text.secondary"
                        sx={{
                          '@media screen and (width: 1440px) and (height: 1920px)': {
                            fontSize: '1.5rem',
                          }
                        }}
                      >
                        No products found. Try adjusting your filters.
                      </Typography>
                    </Box>
                  )}
                </Box>
              )}
              {/* Load more button */}
              {products['filtered'] && products['filtered'].length > visibleCount && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button variant="outlined" onClick={() => setVisibleCount(c => c + 10)}>
                    Load more
                  </Button>
                </Box>
              )}

              {/* Tabs section moved below the product grid */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, mt: 6 }}>
                <Tabs 
                  value={tab} 
                  onChange={(e: React.SyntheticEvent, newValue: number) => setTab(newValue)}
                  variant="scrollable"
                  scrollButtons="auto"
                  sx={{
                    '@media screen and (width: 1440px) and (height: 1920px)': {
                      '& .MuiTab-root': {
                        fontSize: '1.2rem',
                        padding: '1rem 2rem',
                        minHeight: '60px',
                      }
                    }
                  }}
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
              {/* Tabbed Products Row (each tab = 1 row, horizontal scroll) */}
              <Box
                className="tabbed-product-row"
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  overflowX: 'auto',
                  overflowY: 'hidden',
                  maxHeight: 420,
                  minHeight: 340,
                  alignItems: 'stretch',
                  gap: 3,
                  py: 2,
                  mb: 4,
                  scrollBehavior: 'smooth',
                  px: 1,
                  '@media screen and (width: 1440px) and (height: 1920px)': {
                    gap: '2rem',
                    padding: '2rem 0',
                  }
                }}
                onWheel={e => {
                  const target = e.currentTarget;
                  if (e.deltaY !== 0) {
                    e.preventDefault();
                    target.scrollLeft += e.deltaY;
                  }
                }}
              >
                {products[TABS[tab].key]?.slice(0, tabVisibleCount[TABS[tab].key] || 5).length > 0 ? products[TABS[tab].key].slice(0, tabVisibleCount[TABS[tab].key] || 5).map((product) => {
                    const { gender, team } = guessGenderAndTeam(product);
                    let imgSrc = '/assets/images/placeholder.jpg';
                    if (product.images && product.images[0]) {
                      imgSrc = getImageSrc(product.images[0], gender, team);
                    }
                    return (
                      <Box key={product._id} sx={{ minWidth: 320, flex: '0 0 auto' }}>
                        <ProductCard
                          name={product.name}
                          image={imgSrc}
                          price={product.price}
                          discountPrice={product.discountPrice}
                          tags={product.tags}
                          brand={product.brand}
                          categories={product.categories}
                          labels={product.label ? [product.label as any] : []}
                          allCategories={categories}
                          allBrands={brands}
                          onAddToCart={() => console.log('Add to cart:', product._id)}
                          backgroundColor="#f8f9fa"
                          colors={3}
                        />
                      </Box>
                    );
                  }) : (
                  <Box sx={{ textAlign: 'center', py: 4, minWidth: 320 }}>
                    <Typography 
                      variant="h6" 
                      color="text.secondary"
                      sx={{
                        '@media screen and (width: 1440px) and (height: 1920px)': {
                          fontSize: '1.5rem',
                        }
                      }}
                    >
                      No products found in this tab.
                    </Typography>
                  </Box>
                )}
              </Box>
              {/* Load more button for tab */}
              {products[TABS[tab].key] && (tabVisibleCount[TABS[tab].key] || 5) < products[TABS[tab].key].length && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                  <Button variant="outlined" onClick={() => setTabVisibleCount(prev => ({ ...prev, [TABS[tab].key]: (prev[TABS[tab].key] || 5) + 5 }))}>
                    Load more
                  </Button>
                </Box>
              )}
            </motion.div>
          </Box>
        </Box>
      </Box>
    </>
  );
}