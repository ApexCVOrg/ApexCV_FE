'use client';

import React, { useState, useEffect } from 'react';
import {
  Container,
  Box,
  Typography,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import ProductCard from '@/components/card';
import { sortProductsClientSide, convertSortParams } from '@/lib/utils/sortUtils';
import { ApiProduct } from '@/types';

interface Category {
  _id: string;
  name: string;
  parentCategory?: {
    _id: string;
    name: string;
    parentCategory?: {
      _id: string;
      name: string;
    };
  };
  status: 'active' | 'inactive';
}

interface Brand {
  _id: string;
  name: string;
}

interface TeamPageProps {
  teamName: string;
  gender: 'men' | 'women' | 'kids';
}

export default function TeamPage({ teamName, gender }: TeamPageProps) {
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        // Fetch categories with gender filter
        const categoriesRes = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/categories?gender=${gender.toLowerCase()}`
        );
        const brandsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`);

        const [categoriesData, brandsData] = await Promise.all([
          categoriesRes.json(),
          brandsRes.json(),
        ]);

        // Find the gender category (Men/Women/Kids)
        const genderCategory = categoriesData.find(
          (cat: Category) => cat.name.toLowerCase() === gender.toLowerCase() && !cat.parentCategory
        );

        if (genderCategory) {
          // Find the team category under the gender category
          const teamCategory = categoriesData.find(
            (cat: Category) =>
              cat.name === teamName && cat.parentCategory?._id === genderCategory._id
          );

          if (teamCategory) {
            // Get all product type categories under the team
            const productTypeCategories = categoriesData.filter(
              (cat: Category) => cat.parentCategory?._id === teamCategory._id
            );

            // Set selected categories to include both team and its product types
            setSelectedCategories([
              teamCategory._id,
              ...productTypeCategories.map((cat: Category) => cat._id),
            ]);

            // Filter categories to only show those related to this team and gender
            const filteredCategories = categoriesData.filter((cat: Category) => {
              // Include the gender category
              if (cat._id === genderCategory._id) return true;

              // Include the team category
              if (cat._id === teamCategory._id) return true;

              // Include product type categories under the team
              if (cat.parentCategory?._id === teamCategory._id) return true;

              return false;
            });

            setCategories(filteredCategories);
          } else {
            setSelectedCategories([]);
            setCategories([]);
          }
        } else {
          setSelectedCategories([]);
          setCategories([]);
        }

        setBrands(brandsData);
      } catch (error) {
        console.error('[TeamPage] Error fetching categories or brands:', error);
      }
    };
    fetchInitialData();
  }, [teamName, gender]);

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      setLoading(true);
      try {
        // Convert sortBy to API format
        const { apiSortBy, sortOrder } = convertSortParams(sortBy);

        const queryParams = new URLSearchParams({
          minPrice: priceRange[0].toString(),
          maxPrice: priceRange[1].toString(),
          sortBy: apiSortBy,
          sortOrder: sortOrder,
          ...(selectedCategories.length > 0 && { categories: selectedCategories.join(',') }),
          ...(selectedBrands.length > 0 && { brand: selectedBrands.join(',') }),
          gender: gender.toLowerCase(),
        });

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`;
        const response = await fetch(apiUrl);

        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          // Filter products to ensure they match the team
          const filteredProducts = result.data.filter((product: ApiProduct) => {
            // Check if any category's parent is the team
            return product.categories?.some(cat => {
              // Check if the category itself is the team
              if (cat.name === teamName) return true;

              // Check if the category's parent is the team (ApiProduct categories don't have parentCategory)
              // We'll just check the category name for now
              return false;
            }) || false;
          });
          
          // Apply client-side sorting as fallback
          const sortedProducts = sortProductsClientSide(filteredProducts, sortBy);
          // Convert to match ApiProduct interface
          const converted = sortedProducts.map((item) => ({
            _id: item._id,
            name: item.name,
            images: item.images || [],
            price: item.price,
            discountPrice: item.discountPrice,
            tags: item.tags || [],
            brand: item.brand || { _id: '', name: 'Unknown Brand' },
            categories: item.categories || [],
            createdAt: item.createdAt || new Date().toISOString(),
          }));
          setProducts(converted);
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedBrands, sortBy, gender, teamName]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev: string[]) =>
      prev.includes(categoryId)
        ? prev.filter((id: string) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrands((prev: string[]) =>
      prev.includes(brandId) ? prev.filter((id: string) => id !== brandId) : [...prev, brandId]
    );
  };

  if (error) {
    return (
      <Box
        sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}
      >
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Container
        maxWidth={false}
        sx={{
          py: 4,
          px: { xs: 2, sm: 3, md: 4 },
          maxWidth: '1600px',
          width: '100%',
        }}
      >
        {/* Sort and Filter Bar */}
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">{products.length} Products</Typography>
          <FormControl sx={{ minWidth: 200, mr: { xs: 3, sm: 6, md: 8 } }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={e => {
                setSortBy(e.target.value);
              }}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '50vh',
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(3, 1fr)',
                lg: 'repeat(4, 1fr)',
              },
              gap: { xs: 2, sm: 3 },
              width: '100%',
              justifyContent: 'center',
            }}
          >
            {products.map(product => (
              <Box
                key={product._id}
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                }}
              >
                <ProductCard
                  _id={product._id}
                  productId={product._id}
                  name={product.name || 'Unnamed Product'}
                  image={
                    product.images?.[0]
                      ? `/assets/images/${gender}/${teamName.toLowerCase()}/${product.images[0]}`
                      : '/assets/images/placeholder.jpg'
                  }
                  price={product.price || 0}
                  discountPrice={product.discountPrice}
                  tags={product.tags || []}
                  brand={product.brand || { _id: '', name: 'Unknown Brand' }}
                  categories={product.categories || []}
                />
              </Box>
            ))}
          </Box>
        )}
        <Dialog
          open={filterDialogOpen}
          onClose={() => setFilterDialogOpen(false)}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>Filter & Sort</DialogTitle>
          <DialogContent>
            <Box sx={{ mt: 2 }}>
              <Typography variant="h6" gutterBottom>
                Price Range
              </Typography>
              <Slider
                value={priceRange}
                onChange={(_, newValue) => setPriceRange(newValue as number[])}
                valueLabelDisplay="auto"
                min={0}
                max={10000000}
                step={100000}
                valueLabelFormat={value => `${value.toLocaleString('vi-VN')} VND`}
              />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
                <Typography variant="body2">{priceRange[0].toLocaleString('vi-VN')} VND</Typography>
                <Typography variant="body2">{priceRange[1].toLocaleString('vi-VN')} VND</Typography>
              </Box>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Categories
              </Typography>
              <FormGroup>
                {categories
                  .filter(cat => !cat.parentCategory) // Only show gender categories
                  .map(genderCat => (
                    <Box key={genderCat._id}>
                      <FormControlLabel
                        control={
                          <Checkbox
                            checked={selectedCategories.includes(genderCat._id)}
                            onChange={() => handleCategoryChange(genderCat._id)}
                          />
                        }
                        label={genderCat.name}
                      />
                      {/* Show teams under this gender */}
                      {categories
                        .filter(cat => cat.parentCategory?._id === genderCat._id)
                        .map(teamCat => (
                          <Box key={teamCat._id} sx={{ ml: 2 }}>
                            <FormControlLabel
                              control={
                                <Checkbox
                                  checked={selectedCategories.includes(teamCat._id)}
                                  onChange={() => handleCategoryChange(teamCat._id)}
                                />
                              }
                              label={teamCat.name}
                            />
                            {/* Show product types under this team */}
                            {categories
                              .filter(cat => cat.parentCategory?._id === teamCat._id)
                              .map(productTypeCat => (
                                <Box key={productTypeCat._id} sx={{ ml: 4 }}>
                                  <FormControlLabel
                                    control={
                                      <Checkbox
                                        checked={selectedCategories.includes(productTypeCat._id)}
                                        onChange={() => handleCategoryChange(productTypeCat._id)}
                                      />
                                    }
                                    label={productTypeCat.name}
                                  />
                                </Box>
                              ))}
                          </Box>
                        ))}
                    </Box>
                  ))}
              </FormGroup>
            </Box>

            <Box sx={{ mt: 4 }}>
              <Typography variant="h6" gutterBottom>
                Brands
              </Typography>
              <FormGroup>
                {brands.map(brand => (
                  <FormControlLabel
                    key={brand._id}
                    control={
                      <Checkbox
                        checked={selectedBrands.includes(brand._id)}
                        onChange={() => handleBrandChange(brand._id)}
                      />
                    }
                    label={brand.name}
                  />
                ))}
              </FormGroup>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilterDialogOpen(false)}>Close</Button>
            <Button
              onClick={() => {
                setSelectedCategories([]);
                setSelectedBrands([]);
                setPriceRange([0, 10000000]);
                setSortBy('newest');
                setFilterDialogOpen(false);
              }}
            >
              Reset Filters
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
}
