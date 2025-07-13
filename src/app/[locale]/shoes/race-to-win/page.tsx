import React from "react";
import { Box, Typography, Card, CardContent, Container, Button } from "@mui/material";
import { ArrowForward, Star } from "@mui/icons-material";

const raceToWinProducts = [
  {
    name: "Adizero Takumi Sen 9",
    price: "$300",
    image: "/assets/images/shoes/race-to-win/Giay_Adizero_Takumi_Sen_9_trang_IG6191_01_standard.avif",
    rating: 4.9,
    reviews: 156
  },
  {
    name: "Adizero Prime X",
    price: "$280",
    image: "/assets/images/shoes/race-to-win/Giay_Adizero_Prime_X_trang_IG6191_02_standard.avif",
    rating: 4.8,
    reviews: 134
  },
  {
    name: "Adizero Adios Pro 4",
    price: "$320",
    image: "/assets/images/shoes/race-to-win/Giay_Adizero_Adios_Pro_4_trang_IG6191_03_standard.avif",
    rating: 4.9,
    reviews: 189
  }
];

export default function RaceToWinPage() {
  return (
    <Box sx={{ bgcolor: "#f8f9fa", minHeight: "100vh" }}>
      {/* Hero Banner */}
      <Box sx={{
        width: '100vw',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        py: 0,
        mt: 10,
        mx: 'calc(-50vw + 50%)',
        background: '#fff'
      }}>
        <img 
          src="/assets/images/shoes/race-to-win/Giay_Adizero_Takumi_Sen_9_trang_IG6191_01_standard.avif"
          alt="Race to Win Collection"
          style={{ 
            width: '100vw',
            height: 'auto',
            display: 'block',
            border: 'none',
            borderRadius: 0,
            boxShadow: 'none',
            margin: 0,
            padding: 0
          }}
        />
      </Box>

      {/* Race to Win Collection */}
      <Box sx={{ bgcolor: '#fff', py: 8, mt: 6 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ 
            fontWeight: "bold", 
            mb: 6, 
            textAlign: "center",
            color: '#111',
            letterSpacing: 2,
            textTransform: 'uppercase',
            fontFamily: 'Arial Black, Arial, sans-serif'
          }}>
            Race to Win Collection
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
            {raceToWinProducts.map((product) => (
              <Box key={product.name} flex="1 1 320px" maxWidth={400} minWidth={260}>
                <Card sx={{ 
                  borderRadius: 3, 
                  boxShadow: 3, 
                  transition: "0.3s", 
                  overflow: 'hidden',
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
    </Box>
  );
} 