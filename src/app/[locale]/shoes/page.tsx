import React from "react";
import { Box, Typography, Card, CardActionArea, CardContent, Container, Button } from "@mui/material";
import Link from "next/link";
import { ArrowForward, Star, TrendingUp, LocalShipping } from "@mui/icons-material";

const featuredProducts = [
  {
    name: "Nike Air Max 270",
    price: "$150",
    image: "/assets/images/men/banner/global_aclubs_home_realmadrid_football_ss25_launch_home_catlp_mh_d_7771d8dffb.avif",
    rating: 4.8,
    reviews: 124
  },
  {
    name: "Adidas Ultraboost 22",
    price: "$180",
    image: "/assets/images/banner/COLLECTIO-BANNER-HOME-KIT-25-26-CHICAS.webp",
    rating: 4.9,
    reviews: 89
  },
  {
    name: "Puma RS-X",
    price: "$120",
    image: "/assets/images/kids/banner/global_smiley_commercial_ss25_launch_kids_glp_banner_hero_4_d_49322caabb.avif",
    rating: 4.7,
    reviews: 156
  }
];

const categories = [
  {
    name: "Every Day Running",
    icon: "🏃‍♂️"
  },
  {
    name: "Run Energised",
    icon: "⚡"
  },
  {
    name: "Race to win",
    icon: "🏅"
  },
  {
    name: "Walking",
    icon: "🚶"
  }
];

export default function ShoesPage() {
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
        mt: 10, // tăng margin top để tránh bị che bởi header
        mx: 'calc(-50vw + 50%)',
        background: '#fff'
      }}>
        <img 
          src="https://res.cloudinary.com/dqmb4e2et/image/upload/v1752339174/s3_mca0rk.webp"
          alt="Banner"
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

      {/* Categories Section */}
      {/* Đã xoá mục Shop by Category theo yêu cầu */}

      {/* Featured Collection - Adidas Style */}
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
            Featured Collection
          </Typography>
          <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
            {[
              {
                name: 'Samba',
                image: 'https://res.cloudinary.com/dqmb4e2et/video/upload/v1752341091/Samba_OG_Shoes_Beige_IG6170_video_yfw3p0.webm',
                desc: 'Classic street style. Timeless comfort.',
                isVideo: true,
                href: '/shoes/samba'
              },
              {
                name: 'Gazelle',
                image: 'https://res.cloudinary.com/dqmb4e2et/video/upload/v1752341016/Gazelle_Indoor_Shoes_Red_JS1411_video_svlucy.webm',
                desc: 'Retro vibes. Modern edge.',
                isVideo: true,
                href: '/shoes/gazelle'
              },
              {
                name: 'Spezial',
                image: 'https://res.cloudinary.com/dqmb4e2et/video/upload/v1752340906/Handball_Spezial_Shoes_Green_IG6192_video_skpsxq.webm',
                desc: 'Heritage look. Everyday wear.',
                isVideo: true,
                href: '/shoes/spezial'
              },
              {
                name: 'Superstar',
                image: 'https://res.cloudinary.com/dqmb4e2et/video/upload/v1752340693/Giay_Superstar_Vintage_trang_JQ3254_video_ltzy3m.webm',
                desc: 'Iconic shell toe. Bold attitude.',
                isVideo: true,
                href: '/shoes/superstar'
              }
            ].map((item) => (
              <Box key={item.name} flex="1 1 260px" maxWidth={320} minWidth={200}>
                <Card sx={{
                  bgcolor: '#fff',
                  border: '2px solid #111',
                  borderRadius: 4,
                  boxShadow: 'none',
                  transition: '0.3s',
                  '&:hover': {
                    bgcolor: '#111',
                    color: '#fff',
                    borderColor: '#fff',
                  },
                  textAlign: 'center',
                  p: 2,
                  minHeight: 420
                }}>
                  <Box sx={{
                    width: '100%',
                    height: 200,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    mb: 2,
                    bgcolor: '#EBEDEE', // dùng màu nền mới
                    borderRadius: 4 // giống Card
                  }}>
                    {item.isVideo ? (
                      <video
                        src={item.image}
                        style={{ maxWidth: '98%', maxHeight: 190, objectFit: 'contain', borderRadius: 4, background: '#EBEDEE' }}
                        autoPlay
                        loop
                        muted
                        playsInline
                      />
                    ) : (
                      <img 
                        src={item.image}
                        alt={item.name}
                        style={{
                          maxWidth: '98%',
                          maxHeight: 190,
                          filter: 'grayscale(100%)',
                          objectFit: 'contain',
                          transition: 'filter 0.3s',
                          borderRadius: 4,
                          background: '#EBEDEE'
                        }}
                      />
                    )}
                  </Box>
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, letterSpacing: 1, fontFamily: 'Arial Black, Arial, sans-serif' }}>{item.name}</Typography>
                  <Typography variant="body2" sx={{ color: 'inherit', opacity: 0.8, mb: 2 }}>{item.desc}</Typography>
                  <Button component={Link} href={item.href} variant="outlined" sx={{
                    borderColor: '#111',
                    color: '#111',
                    fontWeight: 600,
                    letterSpacing: 1,
                    bgcolor: '#fff',
                    '&:hover': {
                      bgcolor: '#111',
                      color: '#fff',
                      borderColor: '#fff',
                    }
                  }}>Shop Now</Button>
                </Card>
              </Box>
            ))}
          </Box>
        </Container>
      </Box>

      {/* Featured Products */}
      <Box sx={{ bgcolor: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Typography variant="h3" sx={{ 
            fontWeight: "bold", 
            mb: 6, 
            textAlign: "center",
            color: 'text.primary'
          }}>
            Featured Products
      </Typography>
          <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
            {featuredProducts.map((product) => (
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

      {/* Features Section */}
      <Box sx={{ bgcolor: '#f8f9fa', py: 8 }}>
        <Container maxWidth="lg">
          <Box display="flex" flexWrap="wrap" gap={4} justifyContent="center">
            <Box flex="1 1 300px" maxWidth={400} minWidth={220}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <LocalShipping sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Free Shipping
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Free shipping on orders over $50
                </Typography>
              </Box>
            </Box>
            <Box flex="1 1 300px" maxWidth={400} minWidth={220}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <TrendingUp sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Best Quality
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Premium materials and craftsmanship
                </Typography>
              </Box>
            </Box>
            <Box flex="1 1 300px" maxWidth={400} minWidth={220}>
              <Box sx={{ textAlign: 'center', p: 3 }}>
                <Star sx={{ fontSize: 60, color: 'primary.main', mb: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 600, mb: 2 }}>
                  Customer Reviews
                </Typography>
                <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                  Trusted by thousands of customers
                </Typography>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 