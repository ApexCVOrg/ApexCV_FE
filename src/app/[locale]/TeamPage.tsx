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
  categories: { _id: string; name: string }[];
  brand: { _id: string; name: string };
}

interface Category {
  _id: string;
  name: string;
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
  console.log('TeamPage rendered with teamName:', teamName, 'and gender:', gender);
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
        console.log('Fetched categoriesData:', categoriesData);

        // Find the category ID matching teamName and set it as selected
        const teamCategory = categoriesData.find((cat: Category) => cat.name === teamName);
        if (teamCategory) {
          setSelectedCategories([teamCategory._id]);
          console.log('Found teamCategory:', teamCategory);
          console.log('Set selectedCategories to:', [teamCategory._id]);
        }

      } catch (error) {
        console.error('Error fetching categories or brands:', error);
      }
    };
    fetchInitialData();
  }, [teamName]); // Add teamName to dependency array to re-fetch if teamName changes

  useEffect(() => {
    const fetchFilteredProducts = async () => {
      console.log('fetchFilteredProducts called. teamName:', teamName, 'selectedCategories:', selectedCategories);
      setLoading(true);
      try {
        const queryParams = new URLSearchParams({
          minPrice: priceRange[0].toString(),
          maxPrice: priceRange[1].toString(),
          sortBy,
          ...(selectedCategories.length > 0 && { category: selectedCategories.join(',') }),
          ...(selectedBrands.length > 0 && { brand: selectedBrands.join(',') }),
          ...(gender && { gender }),
        });
        console.log('Attempting to fetch products with queryParams:', queryParams.toString());
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        console.log('Fetched products data:', data); // Log the actual data
        
        // Sort products to maintain consistent order
        const sortedProducts = [...data].sort((a, b) => {
          // Keep the original order based on _id
          return a._id.localeCompare(b._id);
        });
        
        setProducts(sortedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching filtered products:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedBrands, sortBy, gender, teamName, categories]); // Giữ lại categories trong dependency array

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
                  name={product.name}
                  image={product.images[0]}
                  price={product.price}
                  discountPrice={product.discountPrice}
                  tags={product.tags}
                  brand={product.brand.name}
                  categories={product.categories}
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
              {categories.map((category) => (
                <FormControlLabel
                  key={category._id}
                  control={
                    <Checkbox
                      checked={selectedCategories.includes(category._id)}
                      onChange={() => handleCategoryChange(category._id)}
                    />
                  }
                  label={category.name}
                />
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