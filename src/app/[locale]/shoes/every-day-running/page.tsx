import React from "react";
import { Box, Typography, Card, CardContent, Container, Button } from "@mui/material";
import { ArrowForward, Star } from "@mui/icons-material";

const everyDayRunningProducts = [
  {
    name: "Ultraboost Light",
    price: "$200",
    image: "/assets/images/shoes/every-day-running/Giay_Ultraboost_Light_trang_IG6189_01_standard.avif",
    rating: 4.9,
    reviews: 345
  },
  {
    name: "Adizero Boston 12",
    price: "$180",
    image: "/assets/images/shoes/every-day-running/Giay_Adizero_Boston_12_trang_IG6189_02_standard.avif",
    rating: 4.8,
    reviews: 267
  },
  {
    name: "Solarboost 4",
    price: "$160",
    image: "/assets/images/shoes/every-day-running/Giay_Solarboost_4_trang_IG6189_03_standard.avif",
    rating: 4.7,
    reviews: 198
  }
];

export default function EveryDayRunningPage() {
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
          src="/assets/images/shoes/every-day-running/Giay_Ultraboost_Light_trang_IG6189_01_standard.avif"
          alt="Every Day Running Collection"
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

      {/* Every Day Running Collection */}
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
            Every Day Running Collection
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
            {everyDayRunningProducts.map((product) => (
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