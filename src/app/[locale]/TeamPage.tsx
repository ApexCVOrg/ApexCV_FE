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
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 10000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const [selectedType, setSelectedType] = useState(teamName);
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
      } catch (error) {
        console.error('Error fetching categories or brands:', error);
      }
    };
    fetchInitialData();
  }, []);

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
          ...(gender && { gender }),
          ...(selectedType && { type: selectedType }),
        });
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?${queryParams}`);
        if (!response.ok) {
          throw new Error('Failed to fetch products');
        }
        const data = await response.json();
        
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
  }, [priceRange, selectedCategories, selectedBrands, sortBy, gender, selectedType]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleBrandChange = (brandId: string) => {
    setSelectedBrands(prev => 
      prev.includes(brandId) 
        ? prev.filter(id => id !== brandId)
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
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Price Range</Typography>
            <Slider
              value={priceRange}
              onChange={(_, value) => setPriceRange(value as number[])}
              valueLabelDisplay="auto"
              min={0}
              max={5000000}
              step={100000}
              sx={{ mb: 2 }}
            />
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Categories</Typography>
            <FormGroup key="categories-group">
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
            <Typography variant="subtitle2" sx={{ mt: 2 }}>Brands</Typography>
            <FormGroup key="brands-group">
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
          </DialogActions>
        </Dialog>
      </Container>
    </Box>
  );
} 