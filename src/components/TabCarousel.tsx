'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Box, IconButton, useTheme } from '@mui/material';
import { Swiper, SwiperSlide } from 'swiper/react';
import type { Swiper as SwiperType } from 'swiper';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import { motion } from 'framer-motion';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ProductCard from '@/components/card';
import { ProductLabel } from '@/types/components/label';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface Product {
  _id: string;
  name: string;
  images: string[];
  price: number;
  discountPrice?: number;
  labels?: string[];
  brand?: { _id: string; name: string };
  categories?: { _id: string; name: string }[];
  tags?: string[];
  label?: string;
}

interface TabCarouselProps {
  products: Product[];
  onProductClick?: (productId: string, product?: Product) => void;
}

const CARD_MAX_WIDTH = 340;
const CARD_MIN_WIDTH = 260;
const CARD_HEIGHT = 450;

const TabCarousel: React.FC<TabCarouselProps> = ({ products, onProductClick }) => {
  const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeIndex, setActiveIndex] = useState(0);
  const swiperRef = useRef<SwiperType | null>(null);

  // Swiper breakpoints configuration
  const swiperBreakpoints = {
    320: {
      slidesPerView: 1,
      spaceBetween: 12,
      centeredSlides: true,
    },
    600: {
      slidesPerView: 1.3,
      spaceBetween: 16,
      centeredSlides: true,
    },
    900: {
      slidesPerView: 2,
      spaceBetween: 24,
      centeredSlides: true,
    },
    1200: {
      slidesPerView: 3,
      spaceBetween: 32,
      centeredSlides: true,
    },
  };

  // Swiper configuration
  const swiperConfig = {
    modules: [Navigation, Pagination, Autoplay],
    breakpoints: swiperBreakpoints,
    loop: false,
    autoplay: {
      delay: 4000,
      disableOnInteraction: true,
    },
    navigation: {
      nextEl: '.swiper-button-next',
      prevEl: '.swiper-button-prev',
    },
    pagination: {
      el: '.swiper-pagination',
      clickable: true,
      dynamicBullets: true,
    },
    onSlideChange: (swiper: SwiperType) => {
      setActiveIndex(swiper.realIndex);
    },
    onSwiper: (swiper: SwiperType) => {
      swiperRef.current = swiper;
    },
    effect: 'coverflow',
    coverflowEffect: {
      rotate: 0,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: false,
    },
  };

  // Prevent vertical scroll when hovering over carousel container
  useEffect(() => {
    const carouselContainer = document.querySelector('.tab-carousel-container');
    const handleMouseEnter = () => {
      if (carouselContainer) {
        carouselContainer.addEventListener(
          'wheel',
          e => {
            e.preventDefault();
          },
          { passive: false }
        );
      }
    };
    const handleMouseLeave = () => {
      if (carouselContainer) {
        carouselContainer.removeEventListener('wheel', e => {
          e.preventDefault();
        });
      }
    };
    if (carouselContainer) {
      carouselContainer.addEventListener('mouseenter', handleMouseEnter);
      carouselContainer.addEventListener('mouseleave', handleMouseLeave);
    }
    return () => {
      if (carouselContainer) {
        carouselContainer.removeEventListener('mouseenter', handleMouseEnter);
        carouselContainer.removeEventListener('mouseleave', handleMouseLeave);
      }
    };
  }, []);

  if (!products || products.length === 0) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <p>No products found.</p>
      </Box>
    );
  }

  return (
    <Box
      className="tab-carousel-container"
      role="region"
      aria-roledescription="carousel"
      sx={{
        position: 'relative',
        width: '100%',
        maxWidth: 1200,
        mx: 'auto',
        px: { xs: 1, md: 0 },
        height: { xs: CARD_HEIGHT + 40, sm: CARD_HEIGHT + 60, md: CARD_HEIGHT + 80 },
        display: 'flex',
        alignItems: 'center',
        perspective: '1000px',
        overflow: 'hidden',
        '& .swiper': {
          width: '100%',
          height: '100%',
          paddingTop: '20px',
          paddingBottom: '20px',
        },
        '& .swiper-slide': {
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
          transformStyle: 'preserve-3d',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          cursor: 'pointer',
        },
        '& .swiper-slide-active': {
          transform: 'scale(1.12) translateZ(40px)',
          zIndex: 10,
          '& .product-card-wrapper': {
            boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
            filter: 'brightness(1.1)',
          },
        },
        '& .swiper-slide-prev, & .swiper-slide-next': {
          transform: 'scale(0.92) translateZ(0px) rotateY(12deg)',
          filter: 'brightness(0.7)',
          '& .product-card-wrapper': {
            boxShadow: '0 10px 20px rgba(0,0,0,0.12)',
          },
        },
        '& .swiper-slide-prev': {
          transform: 'scale(0.92) translateZ(0px) rotateY(12deg)',
        },
        '& .swiper-slide-next': {
          transform: 'scale(0.92) translateZ(0px) rotateY(-12deg)',
        },
      }}
    >
      {/* Custom Navigation Buttons */}
      <IconButton
        className="swiper-button-prev"
        sx={{
          position: 'absolute',
          left: { xs: 2, md: 10 },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          width: 54,
          height: 54,
          bgcolor: 'linear-gradient(135deg, #fff 60%, #e3e6f3 100%)',
          color: theme.palette.primary.main,
          border: '2px solid #e3e6f3',
          borderRadius: '50%',
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          fontSize: 28,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: 'linear-gradient(135deg, #f5f7fa 60%, #dbeafe 100%)',
            color: theme.palette.primary.dark,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            transform: 'translateY(-50%) scale(1.08)',
          },
          '&.swiper-button-disabled': {
            opacity: 0.3,
            cursor: 'not-allowed',
            transform: 'translateY(-50%)',
          },
        }}
        aria-label="Previous slide"
      >
        <ArrowBackIosNewIcon sx={{ fontSize: 32 }} />
      </IconButton>

      <IconButton
        className="swiper-button-next"
        sx={{
          position: 'absolute',
          right: { xs: 2, md: 10 },
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 20,
          width: 54,
          height: 54,
          bgcolor: 'linear-gradient(135deg, #fff 60%, #e3e6f3 100%)',
          color: theme.palette.primary.main,
          border: '2px solid #e3e6f3',
          borderRadius: '50%',
          boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
          fontSize: 28,
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          '&:hover': {
            bgcolor: 'linear-gradient(135deg, #f5f7fa 60%, #dbeafe 100%)',
            color: theme.palette.primary.dark,
            boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
            transform: 'translateY(-50%) scale(1.08)',
          },
          '&.swiper-button-disabled': {
            opacity: 0.3,
            cursor: 'not-allowed',
            transform: 'translateY(-50%)',
          },
        }}
        aria-label="Next slide"
      >
        <ArrowForwardIosIcon sx={{ fontSize: 32 }} />
      </IconButton>

      {/* Swiper Component */}
      <Swiper {...swiperConfig}>
        {products.map((product, index) => (
          <SwiperSlide
            key={product._id}
            onClick={() => {
              if (swiperRef.current && activeIndex !== index) {
                swiperRef.current.slideTo(index);
              }
            }}
          >
            <motion.div
              className="product-card-wrapper"
              initial={{ opacity: 0, y: 50, scale: 0.8 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 0.6,
                delay: index * 0.1,
                ease: [0.4, 0, 0.2, 1],
              }}
              whileHover={{
                scale: 1.04,
                transition: { duration: 0.3 },
              }}
              style={{
                height: CARD_HEIGHT,
                width: '100%',
                maxWidth: CARD_MAX_WIDTH,
                minWidth: CARD_MIN_WIDTH,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0',
                transformStyle: 'preserve-3d',
              }}
            >
              <Box
                sx={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  transformStyle: 'preserve-3d',
                  transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
                }}
              >
                <ProductCard
                  _id={product._id}
                  productId={product._id}
                  name={product.name}
                  image={product.images?.[0] || '/assets/images/placeholder.jpg'}
                  price={product.price}
                  discountPrice={product.discountPrice}
                  tags={product.tags}
                  brand={product.brand}
                  categories={product.categories}
                  labels={product.label ? [product.label as ProductLabel] : []}
                  onViewDetail={() => onProductClick?.(product._id, product)}
                  backgroundColor="#f8f9fa"
                  colors={3}
                />
              </Box>
            </motion.div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Custom Pagination */}
      <Box
        className="swiper-pagination"
        sx={{
          display: 'flex',
          justifyContent: 'center',
          mt: 4,
          '& .swiper-pagination-bullet': {
            width: 12,
            height: 12,
            bgcolor: 'rgba(0,0,0,0.2)',
            opacity: 1,
            margin: '0 6px',
            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
            borderRadius: '50%',
            cursor: 'pointer',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.4)',
              transform: 'scale(1.2)',
            },
          },
          '& .swiper-pagination-bullet-active': {
            bgcolor: theme.palette.primary.main,
            transform: 'scale(1.3)',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          },
        }}
      />
    </Box>
  );
};

export default TabCarousel;
