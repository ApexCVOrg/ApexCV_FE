"use client";
import React, { useEffect, useState } from "react";
import { Container, Typography, Box, Card, CardMedia, CardContent, Button, CircularProgress } from "@mui/material";
import Image from "next/image";
import ProductCard from "@/components/card";

interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  discountPrice?: number;
  tags: string[];
  brand: string;
  categories: { _id: string; name: string }[];
}

export default function MenPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/products`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setProducts(data);
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
            {['Shoes', 'Clothing', 'Accessories'].map((category) => (
              <Card key={category} sx={{ height: '100%' }}>
                <CardMedia
                  component="img"
                  height="300"
                  image={`/images/${category.toLowerCase()}.jpg`}
                  alt={category}
                />
                <CardContent>
                  <Typography variant="h6" align="center">
                    {category}
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
          <Typography variant="h4" component="h2" align="center" gutterBottom>
            FEATURED PRODUCTS
          </Typography>
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
          {!loading && !error && products.length === 0 && (
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
            {products.map((product) => (
              <ProductCard
                key={product._id}
                name={product.name}
                image={product.image}
                price={product.price}
                discountPrice={product.discountPrice}
                tags={product.tags}
                brand={product.brand}
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