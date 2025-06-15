"use client";
import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Card, CardMedia, CardContent, Button, CircularProgress, IconButton } from "@mui/material";
import Image from "next/image";
import ProductCard from "@/components/card";
import RefreshIcon from '@mui/icons-material/Refresh';

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  tags: string[];
  brand: { _id: string; name: string };
  categories: { _id: string; name: string }[];
}

export default function MenPage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Function to get 6 random products
  const getRandomProducts = (products: Product[]) => {
    const shuffled = [...products].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 6);
  };

  // Function to refresh displayed products
  const refreshProducts = () => {
    setDisplayedProducts(getRandomProducts(allProducts));
  };

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products?gender=men`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
          setAllProducts(result.data);
          setDisplayedProducts(getRandomProducts(result.data));
        } else {
          throw new Error(result.message);
        }
      } catch (err: any) {
        setError(err.message);
        console.error('Error fetching products:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const handleAddToCart = (productName: string) => {
    console.log(`Added ${productName} to cart!`);
    // Implement your add to cart logic here (e.g., Redux, Context API, etc.)
  };

  return (
    <Container maxWidth="xl" disableGutters>
      {/* Hero Banner */}
      <Box sx={{ position: 'relative', height: '600px', width: '100%' }}>
        <Image
          src="https://brand.assets.adidas.com/image/upload/f_auto,q_auto:best,fl_lossy/if_w_gt_1920,w_1920/5756941_Gender_Landing_Page_2880x1280_95e0dc596b.jpg"
          alt="Men's Collection"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <Box
          sx={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            textAlign: 'center',
            color: 'white',
          }}
        >
          <Typography variant="h2" component="h1" gutterBottom>
           MEN'S COLLECTION
          </Typography>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            sx={{ mt: 30 }}
          >
            Shop Now
          </Button>
        </Box>
      </Box>

      {/* Categories Section */}
      <Box sx={{ py: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            SHOP BY CATEGORY
          </Typography>
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3, 
            mt: 2,
            '& > *': {
              flex: '1 1 300px',
              minWidth: '300px'
            }
          }}>
            {[
              { name: 'Shoes', image: '/assets/images/giaynu.jpg' },
              { name: 'Clothing', image: '/assets/images/aothun.jpg' },
              { name: 'Accessories', image: '/assets/images/gangtay.jpg' }
            ].map((category) => (
              <Card key={category.name} sx={{ height: '100%' }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={category.image}
                  alt={category.name}
                />
                <CardContent>
                  <Typography variant="h6" align="center">
                    {category.name}
                  </Typography>
                </CardContent>
              </Card>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Featured Products */}
      <Box sx={{ py: 6, bgcolor: 'grey.100' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h4" component="h2">
              FEATURED PRODUCTS
            </Typography>
            <IconButton 
              onClick={refreshProducts}
              sx={{ 
                bgcolor: 'primary.main', 
                color: 'white',
                '&:hover': { bgcolor: 'primary.dark' }
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>
          {loading && (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
              <CircularProgress />
            </Box>
          )}
          {error && (
            <Typography color="error" align="center" sx={{ my: 4 }}>
              Error: {error}
            </Typography>
          )}
          {!loading && !error && displayedProducts.length === 0 && (
            <Typography variant="h6" align="center" sx={{ my: 4 }}>
              No products found.
            </Typography>
          )}
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 3, 
            mt: 2,
            '& > *': {
              flex: '1 1 250px',
              minWidth: '250px'
            }
          }}>
            {displayedProducts.map((product) => (
              <ProductCard
                key={product._id}
                name={product.name}
                image={product.image}
                price={product.price}
                discountPrice={product.discountPrice}
                tags={product.tags}
                brand={product.brand || { _id: '', name: 'Unknown Brand' }}
                categories={product.categories}
                onAddToCart={() => handleAddToCart(product.name)}
              />
            ))}
          </Box>
        </Container>
      </Box>
    </Container>
  );
} 