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

const ArsenalPage = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [priceRange, setPriceRange] = useState([0, 5000000]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState('newest');
  const gender = 'men';
  const selectedType = 'arsenal';
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

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
        const data = await response.json();
        setProducts(data);
      } catch (error) {
        console.error('Error fetching filtered products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchFilteredProducts();
  }, [priceRange, selectedCategories, selectedBrands, sortBy, gender, selectedType]);

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId) ? prev.filter(id => id !== categoryId) : [...prev, categoryId]
    );
  };
  const handleBrandChange = (brandId: string) => {
    setSelectedBrands(prev =>
      prev.includes(brandId) ? prev.filter(id => id !== brandId) : [...prev, brandId]
    );
  };

  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <HorizontalFilterBar
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
            },
            gap: 3,
          }}
        >
          {products.map((product) => (
            <Box key={product._id}>
              <ProductCard
                name={product.name}
                image={product.images[0]}
                price={product.price}
                discountPrice={product.discountPrice}
                tags={product.tags}
                brand={product.brand}
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
          <Typography variant="subtitle2" sx={{ mt: 2 }}>Brands</Typography>
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
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ArsenalPage; 