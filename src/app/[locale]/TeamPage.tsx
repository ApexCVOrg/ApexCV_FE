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
  Stack,
} from '@mui/material';
import ProductCard from '@/components/card';
import HorizontalFilterBar from './HorizontalFilterBar';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags: string[];
  categories: { 
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
  }[];
  brand: { _id: string; name: string };
  sizes: { size: string; stock: number }[];
  colors: string[];
}

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
  const [products, setProducts] = useState<Product[]>([]);
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
        const [categoriesRes, brandsRes] = await Promise.all([
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/categories`),
          fetch(`${process.env.NEXT_PUBLIC_API_URL}/brands`),
        ]);
        const [categoriesData, brandsData] = await Promise.all([
          categoriesRes.json(),
          brandsRes.json(),
        ]);
        setCategories(categoriesData);
        setBrands(brandsData);

        // Find the gender category (Men/Women)
        const genderCategory = categoriesData.find((cat: Category) => 
          cat.name.toLowerCase() === gender.toLowerCase() && !cat.parentCategory
        );

        if (genderCategory) {
          // Find the team category under the gender category
          const teamCategory = categoriesData.find((cat: Category) => 
            cat.name === teamName && 
            cat.parentCategory?._id === genderCategory._id
          );

          if (teamCategory) {
            // Get all product type categories under the team
            const productTypeCategories = categoriesData.filter((cat: Category) => 
              cat.parentCategory?._id === teamCategory._id
            );

            // Set selected categories to include both team and its product types
            setSelectedCategories([teamCategory._id, ...productTypeCategories.map((cat: Category) => cat._id)]);
          } else {
            setSelectedCategories([]);
          }
        } else {
          setSelectedCategories([]);
        }
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
        const queryParams = new URLSearchParams({
          minPrice: priceRange[0].toString(),
          maxPrice: priceRange[1].toString(),
          sortBy,
          ...(selectedCategories.length > 0 && { categories: selectedCategories.join(',') }),
          ...(selectedBrands.length > 0 && { brand: selectedBrands.join(',') }),
          gender: gender.toLowerCase()
        });

        const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`;
        const response = await fetch(apiUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch products: ${response.status}`);
        }

        const result = await response.json();
        if (result.success) {
          // Filter products to ensure they match the team
          const filteredProducts = result.data.filter((product: Product) => {
            // Check if any category's parent is the team
            return product.categories.some(cat => {
              // Check if the category itself is the team
              if (cat.name === teamName) return true;
              
              // Check if the category's parent is the team
              if (cat.parentCategory?.name === teamName) return true;
              
              // Check if the category's grandparent is the team
              if (cat.parentCategory?.parentCategory?.name === teamName) return true;
              
              return false;
            });
          });
          
          setProducts(filteredProducts);
        } else {
          throw new Error(result.message);
        }
      } catch (err) {
        console.error('[TeamPage] Error:', err);
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
      prev.includes(brandId) 
        ? prev.filter((id: string) => id !== brandId)
        : [...prev, brandId]
    );
  };

  if (error) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
      <Container maxWidth={false} sx={{ 
        py: 4, 
        px: { xs: 2, sm: 3, md: 4 },
        maxWidth: '1600px',
        width: '100%'
      }}>
        <HorizontalFilterBar
          teamName={teamName}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onFilterSort={() => setFilterDialogOpen(true)}
        />
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '50vh' }}>
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
              justifyContent: 'center'
            }}
          >
            {products.map((product) => (
              <Box 
                key={product._id}
                sx={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'center'
                }}
              >
                <ProductCard
                  name={product.name || 'Unnamed Product'}
                  image={product.images?.[0] ? `/assets/images/${product.images[0]}` : '/assets/images/placeholder.jpg'}
                  price={product.price || 0}
                  discountPrice={product.discountPrice}
                  tags={product.tags || []}
                  brand={product.brand || { _id: '', name: 'Unknown Brand' }}
                  categories={product.categories || []}
                  onAddToCart={() => console.log('Add to cart:', product._id)}
                />
              </Box>
            ))}
          </Box>
        )}
        <Dialog open={filterDialogOpen} onClose={() => setFilterDialogOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle>Filter & Sort</DialogTitle>
          <DialogContent>
            <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>Price Range</Typography>
            <Slider
              value={priceRange}
              onChange={(_, newValue) => setPriceRange(newValue as number[])}
              valueLabelDisplay="auto"
              min={0}
              max={10000000}
              step={100000}
              marks={[
                { value: 0, label: '0 VND' },
                { value: 5000000, label: '5M VND' },
                { value: 10000000, label: '10M VND' },
              ]}
            />

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Categories</Typography>
            <FormGroup>
              {categories
                .filter(cat => !cat.parentCategory) // Only show top-level categories (Men/Women)
                .map((genderCat) => (
                  <Box key={genderCat._id} sx={{ ml: 0 }}>
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
                      .map((teamCat) => (
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
                            .map((productTypeCat) => (
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

            <Typography variant="h6" sx={{ mt: 3, mb: 1 }}>Brands</Typography>
            <FormGroup>
              {brands.map((brand) => (
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
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setFilterDialogOpen(false)}>Close</Button>
            <Button onClick={() => {
              setSelectedCategories([]);
              setSelectedBrands([]);
              setPriceRange([0, 10000000]);
              setSortBy('newest');
              setFilterDialogOpen(false);
            }}>Reset Filters</Button>
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 