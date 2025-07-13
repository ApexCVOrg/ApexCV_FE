"use client";
import React, { useState } from "react";
import { Box, Typography, Card, CardContent, Container, Button, FormControl, InputLabel, Select, MenuItem } from "@mui/material";
import { ArrowForward, Star } from "@mui/icons-material";
import Link from "next/link";

const TABS = [
  { label: "SPEZIAL", value: "spezial", image: "/assets/images/shoes/spezial/Giay_Handball_Spezial_mau_xanh_la_IG6192_01_standard.avif" },
  { label: "SAMBA", value: "samba", image: "/assets/images/shoes/samba/Giay_Samba_OG_trang_B75806_01_00_standard.avif" },
  { label: "SUPERSTAR", value: "superstar", image: "/assets/images/shoes/superstar/Giay_Superstar_Vintage_trang_JQ3254_01_00_standard.avif" },
  { label: "GAZELLE", value: "gazelle", image: "/assets/images/shoes/gazelle/Giay_Gazelle_Indoor_DJen_JI2060_01_standard.avif" },
  { label: "SL 72", value: "sl-72", image: "/assets/images/shoes/sl72/Giay_SL_72_OG_Mau_xanh_da_troi_JS0255_01_00_standard.avif" }
];

const sambaProducts = [
  {
    name: "Samba OG",
    price: "$100",
    image: "/assets/images/shoes/samba/Giay_Samba_OG_trang_B75806_01_00_standard.avif",
    rating: 4.9,
    reviews: 245
  },
  {
    name: "Samba Classic",
    price: "$95",
    image: "/assets/images/shoes/samba/Giay_Samba_Classic_trang_B75806_02_standard.avif",
    rating: 4.8,
    reviews: 189
  },
  {
    name: "Samba Vegan",
    price: "$110",
    image: "/assets/images/shoes/samba/Giay_Samba_Vegan_trang_B75806_03_standard.avif",
    rating: 4.7,
    reviews: 156
  }
];

export default function SambaPage() {
  const [sortBy, setSortBy] = useState('newest');
  // Breadcrumb + Heading
  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh", mt: 10, position: 'relative' }}>
      {/* Banner ở phía sau */}
      <Box sx={{ 
        position: 'absolute', 
        top: 0, 
        left: 0, 
        right: 0, 
        height: 400, 
        zIndex: 1 
      }}>
        <img 
          src="https://res.cloudinary.com/dqmb4e2et/image/upload/v1752376328/originals_ss25_the_original_introduce_plp_the_original_iwp_background_media_d_79a5b46e37_lwnind.avif" 
          alt="Banner" 
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover' 
          }} 
        />
      </Box>
      
      {/* Breadcrumb và navigation ở phía trên banner */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Breadcrumb */}
        <Box sx={{ px: { xs: 2, md: 6 }, pt: 4, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Link href="/shoes" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none', color: 'inherit', fontWeight: 700, marginRight: 2 }}>
              <span style={{ fontWeight: 700, marginRight: 4 }}>{'< BACK'}</span>
            </Link>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography component="span" sx={{ color: '#000', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}>Home</Typography>
            </Link>
            <Typography component="span" sx={{ color: '#000', mx: 0.5 }}>/</Typography>
            <Typography component="span" sx={{ color: 'text.primary', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: '4px', fontSize: '1rem' }}>Samba</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0 }}>
              ADIDAS SAMBA
            </Typography>
            <Typography variant="body2" sx={{ color: '#000', fontWeight: 400, ml: 1 }}>
              [111]
            </Typography>
          </Box>
        </Box>
        {/* Tab Card Navigation */}
        <Container maxWidth="xl" sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-start', alignItems: 'flex-end', pb: 2 }}>
            {TABS.map(tab => (
              <Link key={tab.value} href={`/shoes/${tab.value}`} style={{ textDecoration: 'none', flex: 1 }}>
                <Box sx={{
                  border: 0,
                  borderBottom: tab.value === 'samba' ? '4px solid #000' : 'none',
                  bgcolor: tab.value === 'samba' ? '#000' : '#fff',
                  color: tab.value === 'samba' ? '#fff' : '#111',
                  fontWeight: tab.value === 'samba' ? 700 : 500,
                  textAlign: 'center',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  p: 0,
                  pb: 0,
                  minWidth: 180,
                  maxWidth: 220,
                  mx: 0.5,
                  '&:hover': {
                    borderBottom: '4px solid #000',
                    bgcolor: tab.value === 'samba' ? '#000' : '#f5f5f5',
                    color: '#000',
                    fontWeight: 700,
                    transform: 'scale(1.04)',
                    boxShadow: '0 4px 24px 0 rgba(0,0,0,0.08)'
                  }
                }}>
                  <Box sx={{ width: '100%', height: 160, overflow: 'hidden', borderRadius: 0 }}>
                    <img src={tab.image} alt={tab.label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </Box>
                  <Typography sx={{ py: 2, fontWeight: tab.value === 'samba' ? 700 : 600, fontSize: '1.1rem', letterSpacing: 1, bgcolor: tab.value === 'samba' ? '#000' : '#fff', color: tab.value === 'samba' ? '#fff' : '#111', textTransform: 'uppercase' }}>{tab.label}</Typography>
                </Box>
              </Link>
            ))}
          </Box>
        </Container>
      </Box>
      
      {/* Filter Bar */}
      <Container maxWidth="lg" sx={{ mb: 3, position: 'relative', zIndex: 2, mt: 6 }}>
        <Box sx={{ mb: 3, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Sort By</InputLabel>
            <Select 
              value={sortBy} 
              label="Sort By" 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="price-low">Price: Low to High</MenuItem>
              <MenuItem value="price-high">Price: High to Low</MenuItem>
              <MenuItem value="popular">Most Popular</MenuItem>
            </Select>
          </FormControl>
        </Box>
        {/* Product List */}
        <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
          {sambaProducts.map((product) => (
            <Box key={product.name} flex="1 1 320px" maxWidth={400} minWidth={260}>
              <Card sx={{ 
                borderRadius: 3, 
                boxShadow: 3, 
                transition: "0.3s", 
                overflow: 'hidden',
                position: 'relative', // Added for positioning
                zIndex: 2, // Ensure cards are above the banner
                '&:hover': { 
                  boxShadow: 8, 
                  transform: 'translateY(-6px)' 
                } 
              }}>
                <Box sx={{ 
                  height: 250, 
                  position: "relative", 
                  overflow: "hidden"
                }}>
                  <img 
                    src={product.image} 
                    alt={product.name} 
                    style={{ 
                      width: "100%", 
                      height: "100%", 
                      objectFit: "cover" 
                    }} 
                  />
                  <Box sx={{
                    position: 'absolute',
                    top: 16,
                    right: 16,
                    bgcolor: 'rgba(0,0,0,0.7)',
                    color: 'white',
                    px: 2,
                    py: 0.5,
                    borderRadius: 2,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5
                  }}>
                    <Star sx={{ fontSize: 16, color: '#ffd700' }} />
                    <Typography variant="body2">{product.rating}</Typography>
                  </Box>
                </Box>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 600, mb: 1 }}>
                    {product.name}
                  </Typography>
                  <Typography variant="h5" sx={{ 
                    fontWeight: "bold", 
                    color: "primary.main",
                    mb: 1
                  }}>
                    {product.price}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", mb: 2 }}>
                    {product.reviews} reviews
                  </Typography>
                  <Button 
                    variant="outlined" 
                    fullWidth
                    endIcon={<ArrowForward />}
                    sx={{ borderRadius: 2 }}
                  >
                    View Details
                  </Button>
                </CardContent>
              </Card>
            </Box>
          ))}
        </Box>
      </Container>
    </Box>
  );
} 