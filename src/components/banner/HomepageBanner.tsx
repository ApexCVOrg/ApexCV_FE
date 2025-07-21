import React from 'react';
import Box from '@mui/material/Box';

const BANNER_URL = '/assets/images/banner/Web-Banner-GIF-Generic.webp';

const HomepageBanner: React.FC<{ scrollY?: number }> = ({ scrollY = 0 }) => {
  // Banner height (px)
  const bannerHeight = 500; // hoặc 60vh, tuỳ ý
  // Tính opacity, translateY, blur dựa trên scrollY
  const opacity = Math.max(0, 1 - scrollY / bannerHeight);
  const translateY = Math.min(scrollY / 1.5, bannerHeight / 1.5);
  const blur = Math.min(10, (scrollY / bannerHeight) * 10); // blur tối đa 10px

  return (
    <Box
      sx={{
        width: '100%',
        height: { xs: '320px', md: '70vh' },
        minHeight: 720,
        borderRadius: 0,
        overflow: 'hidden',
        position: 'relative',
        boxShadow: 'none',
        m: 0,
        p: 0,
        zIndex: 1,
        opacity,
        transform: `translateY(-${translateY}px)`,
        filter: `blur(${blur}px)`,
        transition:
          'opacity 0.6s cubic-bezier(.4,1.2,.6,1), transform 0.6s cubic-bezier(.4,1.2,.6,1), filter 0.6s cubic-bezier(.4,1.2,.6,1)',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={BANNER_URL}
        alt="Homepage Banner"
        style={{
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          display: 'block',
        }}
      />
      {/* Overlay mờ để dễ thêm text sau này */}
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          bgcolor: 'rgba(0,0,0,0.10)',
        }}
      />
    </Box>
  );
};

export default HomepageBanner;
