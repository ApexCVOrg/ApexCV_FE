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
import SearchIcon from '@mui/icons-material/Search';
import CategoryTreeFilter from '@/components/forms/CategoryTreeFilter';
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
      const queryParams = new URLSearchParams({
        minPrice: priceRange[0].toString(),
        maxPrice: priceRange[1].toString(),
        ...(selectedCategories.length > 0 && { category: selectedCategories.join(',') }),
        ...(selectedBrands.length > 0 && { brand: selectedBrands.join(',') }),
        ...(searchQuery && { search: searchQuery }),
        tab: tabKey, // Pass tabKey to backend to filter by section
      });
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
      if (!response.ok) throw new Error('Failed to fetch products');
      const result = await response.json();
      setProducts(prev => ({ ...prev, [tabKey]: result.data || [] }));
    } catch (error) {
      setProducts(prev => ({ ...prev, [tabKey]: [] }));
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  }, [priceRange, selectedCategories, selectedBrands, searchQuery]);

  // Fetch products when tab or filters change
  useEffect(() => {
    const tabKey = TABS[tab].key;
    fetchProducts(tabKey);
  }, [tab, priceRange, selectedCategories, selectedBrands, searchQuery, fetchProducts]);

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
              {/* Tabs */}
              <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
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

              {/* Products Grid */}
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
                  {products[TABS[tab].key]?.slice(0, 6).map((product) => (
                    <ProductCard
                      key={product._id}
                      name={product.name}
                      image={product.images && product.images[0] ? `/assets/images/${product.images[0]}` : '/assets/images/placeholder.jpg'}
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
                  ))}
                </Box>
              )}

              {/* No Products Message */}
              {!loading && (!products[TABS[tab].key] || products[TABS[tab].key].length === 0) && (
                <Box sx={{ textAlign: 'center', py: 4 }}>
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
            </motion.div>
          </Box>
        </Box>
      </Box>
    </>
  );
}