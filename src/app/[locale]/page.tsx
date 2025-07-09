'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Grid,
  Box,
  Typography,
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
  CircularProgress,
} from '@mui/material';
import ProductCard from '@/components/card';
import SearchIcon from '@mui/icons-material/Search';
import TeamButtonsMUI from "@/components/button/TeamButtonsMUI";
import CategoryTreeFilter from '@/components/forms/CategoryTreeFilter';
import { ProductLabel } from '@/types/components/label';
import { Category, CategoryTree } from '@/types/components/category';
import { buildCategoryTree } from '@/lib/utils/categoryUtils';

interface Product {
  _id: string;
  name: string;
  images: string[]; // theo model
  price: number;
  discountPrice?: number;
  tags: string[];
  categories: { _id: string; name: string }[]; // theo model
  brand: { _id: string; name: string };
  label?: string;
}

interface Brand {
  _id: string;
  name: string;
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryTree, setCategoryTree] = useState<CategoryTree[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch initial categories and brands only once
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
        
        // If tree endpoint returns tree structure directly
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
          // If tree endpoint returns flat structure, build tree
          setCategories(categoriesData);
          setCategoryTree(buildCategoryTree(categoriesData));
        }
        
        setBrands(brandsData);
      } catch (error) {
        console.error('Error fetching categories or brands:', error);
        // Fallback to regular categories endpoint
        try {
          const categoriesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`);
          const categoriesData = await categoriesRes.json();
          setCategories(categoriesData);
          setCategoryTree(buildCategoryTree(categoriesData));
        } catch (fallbackError) {
          console.error('Error fetching fallback categories:', fallbackError);
        }
      }
    };
    fetchInitialData();
  }, []);

  // Fetch filtered products whenever filters change
  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          minPrice: priceRange[0].toString(),
          maxPrice: priceRange[1].toString(),
          sortBy,
          ...(selectedCategories.length > 0 && { category: selectedCategories.join(',') }),
          ...(selectedBrands.length > 0 && { brand: selectedBrands.join(',') }),
          ...(searchQuery && { search: searchQuery }),
        });

        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setProducts(result.data);
        } else {
          throw new Error(result.message);
        }
      } catch (error) {
        console.error('Error fetching filtered products:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedBrands, sortBy, searchQuery]);

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

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', mb: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          PICK YOUR TEAM
        </Typography>
        <TeamButtonsMUI />
      </Box>

      <Grid container spacing={4}>
        {/* Filters Sidebar */}
        <Box sx={{ width: { xs: '100%', md: '25%' } }}>
          <Box sx={{ position: 'sticky', top: 20 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Filters
            </Typography>

            {/* Search */}
            <TextField
              fullWidth
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ mb: 3 }}
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
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Price Range
              </Typography>
              <Slider
                value={priceRange}
                onChange={handlePriceChange}
                valueLabelDisplay="auto"
                min={0}
                max={5000000}
                step={100000}
                valueLabelFormat={(value) => `${value.toLocaleString('vi-VN')}đ`}
              />
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">{priceRange[0].toLocaleString('vi-VN')}đ</Typography>
                <Typography variant="body2">{priceRange[1].toLocaleString('vi-VN')}đ</Typography>
              </Stack>
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Categories Tree */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Categories
              </Typography>
              <CategoryTreeFilter
                categories={categoryTree}
                selectedCategories={selectedCategories}
                onCategoryChange={handleCategoryChange}
              />
            </Box>

            <Divider sx={{ my: 2 }} />

            {/* Brands */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" sx={{ mb: 1 }}>
                Brands
              </Typography>
              <FormGroup>
                {brands.map((brand) => (
                  <FormControlLabel
                    key={brand._id}
                    control={
                      <Checkbox
                        checked={selectedBrands.includes(brand._id)}
                        onChange={(e) => handleBrandChange(e, brand._id)}
                      />
                    }
                    label={brand.name}
                  />
                ))}
              </FormGroup>
            </Box>
          </Box>
        </Box>

        {/* Products Grid */}
        <Box sx={{ width: { xs: '100%', md: '75%' } }}>
          {/* Sort and Filter Bar */}
          <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6">{products.length} Products</Typography>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Sort By</InputLabel>
              <Select value={sortBy} label="Sort By" onChange={(e) => setSortBy(e.target.value)}>
                <MenuItem value="newest">Newest</MenuItem>
                <MenuItem value="price-low">Price: Low to High</MenuItem>
                <MenuItem value="price-high">Price: High to Low</MenuItem>
                <MenuItem value="popular">Most Popular</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Products Grid */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 3,
            }}
          >
            {products.map((product) => {
              const validLabels = Array.isArray(product.label)
                ? product.label.filter(l => [
                    'new', 'hot', 'sale', 'outlet', 'limited', 'preorder', 'exclusive', 'bestseller', 'trend', 'restock'
                  ].includes(l)) as ProductLabel[]
                : undefined;
              return (
                <Box key={product._id}>
                  <ProductCard
                    name={product.name}
                    image={product.images[0]}
                    price={product.price}
                    discountPrice={product.discountPrice}
                    tags={product.tags}
                    brand={product.brand}
                    categories={product.categories}
                    labels={validLabels}
                    allCategories={categories}
                    allBrands={brands}
                    productId={product._id}
                    onAddToCart={() => console.log('Add to cart:', product._id)}
                  />
                </Box>
              );
            })}
          </Box>
        </Box>
      </Grid>
    </Container>
  );
}