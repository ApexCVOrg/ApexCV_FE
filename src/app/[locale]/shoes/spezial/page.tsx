'use client';
import React, { useState, useEffect } from 'react';
import { Box, Typography, Container } from '@mui/material';
import Link from 'next/link';
import ProductCard from '@/components/card';

interface Product {
  _id: string;
  name: string;
  description?: string;
  images: string[];
  price: number;
  discountPrice?: number;
  tags?: string[];
  brand?: string | { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  categoryPath?: string[] | string;
}

// const TABS = [
//   // { label: "SPEZIAL", value: "spezial", image: "/assets/images/shoes/spezial/Giay_Handball_Spezial_mau_xanh_la_IG6192_01_standard.avif" }, // Loại bỏ SPEZIAL
//   {
//     label: 'SAMBA',
//     value: 'samba',
//     image: '/assets/images/shoes/samba/Giay_Samba_OG_trang_B75806_01_00_standard.avif',
//   },
//   {
//     label: 'SUPERSTAR',
//     value: 'superstar',
//     image: '/assets/images/shoes/superstar/Giay_Superstar_Vintage_trang_JQ3254_01_00_standard.avif',
//   },
//   {
//     label: 'GAZELLE',
//     value: 'gazelle',
//     image: '/assets/images/shoes/gazelle/Giay_Gazelle_Indoor_DJen_JI2060_01_standard.avif',
//   },
//   {
//     label: 'SL 72',
//     value: 'sl-72',
//     image: '/assets/images/shoes/sl72/Giay_SL_72_OG_Mau_xanh_da_troi_JS0255_01_00_standard.avif',
//   },
// ];

export default function SpezialPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'https://nidas-be.onrender.com/api'}/products?status=active`);
        const data = await res.json();

        // Lọc sản phẩm theo categoryPath mong muốn
        const desiredPath = ['Shoes', 'Adidas', 'Spezial'];

        // Thử nhiều cách filter khác nhau
        const filtered = (data.data || []).filter((item: Product) => {
          // Cách 1: Kiểm tra nếu categoryPath là array
          if (item.categoryPath && Array.isArray(item.categoryPath)) {
            const isMatch = desiredPath.every(
              (cat, idx) => (item.categoryPath![idx] || '').toLowerCase() === cat.toLowerCase()
            );
            if (isMatch) return true;
          }

          // Cách 2: Kiểm tra nếu categoryPath là string
          if (item.categoryPath && typeof item.categoryPath === 'string') {
            const pathString = item.categoryPath.toLowerCase();
            const desiredString = desiredPath.join('/').toLowerCase();
            if (pathString === desiredString) return true;
          }

          // Cách 3: Kiểm tra nếu có field khác chứa category info
          if (item.categories && Array.isArray(item.categories)) {
            const categoryNames = item.categories.map((cat: { _id: string; name: string }) => cat.name.toLowerCase());
            if (categoryNames.includes('spezial')) return true;
          }

          // Cách 4: Kiểm tra trong name hoặc description
          if (item.name.toLowerCase().includes('spezial')) return true;

          return false;
        });

        setProducts(filtered);
      } catch (e) {
        console.error('Error fetching products:', e);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  return (
    <Box sx={{ bgcolor: '#f8f9fa', minHeight: '100vh', mt: 10, position: 'relative' }}>
      {/* Banner cũ với text giới thiệu nổi phía trên */}
      <Box
        sx={{
          position: 'relative',
          width: '100vw',
          left: '50%',
          right: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          bgcolor: '#000',
          overflow: 'hidden',
          p: 0,
          m: 0,
          minHeight: { xs: '320px', md: '400px' },
          maxHeight: '600px',
        }}
      >
        <img
          src="/assets/images/banner/Handball_banner.jpg"
          alt="Banner"
          style={{
            width: '100vw',
            height: '40vw',
            minHeight: '320px',
            maxHeight: '600px',
            objectFit: 'cover',
            display: 'block',
            margin: 0,
            padding: 0,
            filter: 'brightness(0.55)', // làm mờ banner để text nổi bật
          }}
        />
        {/* Overlay text */}
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            color: '#fff',
            px: 2,
            zIndex: 2,
            textAlign: 'center',
            pointerEvents: 'none',
          }}
        >
          <Typography
            variant="h2"
            sx={{ fontWeight: 900, letterSpacing: 2, mb: 2, textShadow: '0 2px 16px #000' }}
          >
            ADIDAS SPEZIAL COLLECTION
          </Typography>
          <Typography
            variant="h5"
            sx={{ color: 'rgba(255,255,255,0.85)', mb: 1, textShadow: '0 2px 8px #000' }}
          >
            Nơi giao thoa giữa thể thao và thời trang
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: 'rgba(255,255,255,0.85)',
              maxWidth: 800,
              mx: 'auto',
              textShadow: '0 2px 8px #000',
            }}
          >
            Khám phá bộ sưu tập Adidas Spezial - nơi hội tụ tinh hoa của di sản thể thao và xu hướng
            thời trang hiện đại. Từ những năm 1970, Spezial đã trở thành biểu tượng không thể thiếu
            trong làng giày thể thao, mang đến phong cách retro độc đáo với chất liệu cao cấp và
            thiết kế tối giản đầy cá tính.
          </Typography>
        </Box>
      </Box>

      {/* Breadcrumb và navigation ở phía trên banner */}
      <Box sx={{ position: 'relative', zIndex: 2 }}>
        {/* Breadcrumb */}
        <Box sx={{ px: { xs: 2, md: 6 }, pt: 4, pb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
            <Link
              href="/shoes"
              style={{
                display: 'flex',
                alignItems: 'center',
                textDecoration: 'none',
                color: 'inherit',
                fontWeight: 700,
                marginRight: 2,
              }}
            >
              <span style={{ fontWeight: 700, marginRight: 4 }}>{'< BACK'}</span>
            </Link>
            <Link href="/" style={{ textDecoration: 'none' }}>
              <Typography
                component="span"
                sx={{ color: '#000', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}
              >
                Home
              </Typography>
            </Link>
            <Typography component="span" sx={{ color: '#000', mx: 0.5 }}>
              /
            </Typography>
            <Link href="/shoes" style={{ textDecoration: 'none' }}>
              <Typography
                component="span"
                sx={{ color: '#000', fontWeight: 400, fontSize: '1rem', transition: 'color 0.2s' }}
              >
                Shoes
              </Typography>
            </Link>
            <Typography component="span" sx={{ color: '#000', mx: 0.5 }}>
              /
            </Typography>
            <Typography
              component="span"
              sx={{
                color: 'text.primary',
                fontWeight: 500,
                textDecoration: 'underline',
                textUnderlineOffset: '4px',
                fontSize: '1rem',
              }}
            >
              Spezial
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h3" component="h1" sx={{ fontWeight: 'bold', mb: 0 }}>
              ADIDAS SPEZIAL
            </Typography>
            <Typography variant="body2" sx={{ color: '#000', fontWeight: 400, ml: 1 }}>
              [{products.length}]
            </Typography>
          </Box>
        </Box>
        {/* Tab Card Navigation đã bị loại bỏ ở đây */}
      </Box>

      {/* Banner mới với video và sản phẩm kết hợp */}
      <Box sx={{ mt: 4, mb: 6 }}>
        <Container maxWidth="xl">
          <Box
            sx={{
              position: 'relative',
              borderRadius: 4,
              overflow: 'hidden',
              boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              minHeight: { xs: '400px', md: '500px' },
            }}
          >
            {/* Video Background */}
            <video
              autoPlay
              muted
              loop
              playsInline
              style={{
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: 1,
                filter: 'brightness(0.3)',
              }}
            >
              <source
                src="https://res.cloudinary.com/dqmb4e2et/video/upload/v1752498628/handball_kdol2n.webm"
                type="video/webm"
              />
              Your browser does not support the video tag.
            </video>

            {/* Content Overlay */}
            <Box
              sx={{
                position: 'relative',
                zIndex: 2,
                display: 'flex',
                flexDirection: { xs: 'column', md: 'row' },
                alignItems: 'center',
                justifyContent: 'space-between',
                p: { xs: 4, md: 6 },
                minHeight: { xs: '400px', md: '500px' },
                color: '#fff',
              }}
            >
              {/* Text Content */}
              <Box sx={{ flex: 1, textAlign: { xs: 'center', md: 'left' }, mb: { xs: 4, md: 0 } }}>
                <Typography
                  variant="h3"
                  sx={{ fontWeight: 900, mb: 2, textShadow: '0 2px 8px #000' }}
                >
                  HANDBALL SPEZIAL
                </Typography>
                <Typography
                  variant="h6"
                  sx={{ mb: 2, color: 'rgba(255,255,255,0.9)', textShadow: '0 1px 4px #000' }}
                >
                  Di sản bóng đá, phong cách đường phố.
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    color: 'rgba(255,255,255,0.8)',
                    maxWidth: 500,
                    textShadow: '0 1px 4px #000',
                    lineHeight: 1.6,
                  }}
                >
                  Adidas Spezial là biểu tượng của sự kết hợp giữa di sản thể thao và thời trang
                  hiện đại. Với thiết kế tối giản, chất liệu cao cấp và logo vàng đặc trưng, Spezial
                  luôn là tuyên ngôn cho sự khác biệt và đẳng cấp.
                </Typography>
              </Box>

              {/* Product Display */}
              {!loading && products.length > 0 && (
                <Box
                  sx={{
                    flex: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    maxWidth: { xs: '100%', md: '400px' },
                  }}
                >
                  <Box
                    sx={{
                      bgcolor: 'rgba(255,255,255,0.95)',
                      borderRadius: 3,
                      p: 3,
                      backdropFilter: 'blur(10px)',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      maxWidth: 350,
                      width: '100%',
                    }}
                  >
                    <ProductCard
                      _id={products[0]._id}
                      productId={products[0]._id}
                      name={products[0].name}
                      image={products[0].images?.[0] || '/assets/images/placeholder.jpg'}
                      price={products[0].price}
                      discountPrice={products[0].discountPrice}
                      tags={products[0].tags}
                      brand={products[0].brand}
                      categories={products[0].categories}
                      onAddToCart={() => {}}
                    />
                  </Box>
                </Box>
              )}
            </Box>
          </Box>
        </Container>
      </Box>

      {/* Fallback Product Display */}
      <Container
        maxWidth="lg"
        sx={{ mb: 3, position: 'relative', zIndex: 2, px: { xs: 1, md: 4 } }}
      >
        {loading ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h6" sx={{ color: 'text.secondary' }}>
              Loading...
            </Typography>
          </Box>
        ) : products.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography variant="h5" sx={{ color: 'text.secondary', mb: 2 }}>
              Không tìm thấy sản phẩm Spezial
            </Typography>
            <Typography variant="body1" sx={{ color: 'text.secondary' }}>
              Sản phẩm có thể đang được cập nhật hoặc tạm thời không có sẵn.
            </Typography>
          </Box>
        ) : null}
      </Container>
    </Box>
  );
}
