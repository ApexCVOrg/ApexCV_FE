'use client';
import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import Image from 'next/image';
import Link from 'next/link';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

interface Logo {
  src: string;
  alt: string;
  width?: number;
  height?: number;
}

interface HeroBannerProps {
  imageSrc: string;
  imageAlt: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  logos?: Logo[];
  minHeight?: { xs: string; md: string; lg: string };
}

export default function HeroBanner({
  imageSrc,
  imageAlt,
  title,
  subtitle,
  ctaText,
  ctaLink,
  logos = [],
  minHeight = { xs: '60vh', md: '80vh', lg: '90vh' },
}: HeroBannerProps) {
  return (
    <Box
      sx={{
        position: 'relative',
        width: '100vw',
        left: '50%',
        right: '50%',
        marginLeft: '-50vw',
        marginRight: '-50vw',
        minHeight: minHeight,
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <Image src={imageSrc} alt={imageAlt} fill style={{ objectFit: 'cover' }} priority />
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'flex-start',
          padding: { xs: 4, md: 8, lg: 12 },
          gap: 2,
        }}
      >
        {/* Logos */}
        {logos.length > 0 && (
          <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
            {logos.map((logo, idx) => (
              <Box
                key={idx}
                sx={{
                  bgcolor: 'white',
                  borderRadius: 0.5,
                  px: 1,
                  py: 0.5,
                  display: 'flex',
                  alignItems: 'center',
                  boxShadow: 1,
                }}
              >
                <Image
                  src={logo.src}
                  alt={logo.alt}
                  width={logo.width || 36}
                  height={logo.height || 24}
                  style={{ objectFit: 'contain', display: 'block' }}
                />
              </Box>
            ))}
          </Box>
        )}
        {/* Main Title Block */}
        <Box
          sx={{
            bgcolor: 'white',
            color: 'black',
            px: 2,
            py: 0.5,
            mb: 0.5,
            maxWidth: 'fit-content',
            display: 'inline-block',
            borderRadius: 0.5,
            boxShadow: 1,
          }}
        >
          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 900,
              fontSize: { xs: '1.3rem', md: '2rem', lg: '2.2rem' },
              lineHeight: 1.1,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              margin: 0,
              fontFamily: 'inherit',
              display: 'block',
            }}
          >
            {title}
          </Typography>
        </Box>
        {/* Subtitle Block */}
        <Box
          sx={{
            bgcolor: 'white',
            color: 'black',
            px: 2,
            py: 0.5,
            mb: 2,
            maxWidth: 'fit-content',
            display: 'inline-block',
            borderRadius: 0.5,
            boxShadow: 1,
          }}
        >
          <Typography
            variant="subtitle1"
            component="h2"
            sx={{
              fontWeight: 400,
              fontSize: { xs: '1rem', md: '1.1rem', lg: '1.15rem' },
              margin: 0,
              letterSpacing: '0.01em',
              fontFamily: 'inherit',
            }}
          >
            {subtitle}
          </Typography>
        </Box>
        {/* CTA Button */}
        <Link href={ctaLink} style={{ textDecoration: 'none' }}>
          <Button
            variant="outlined"
            size="large"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 24, ml: 0.5 }} />}
            sx={{
              bgcolor: 'white',
              color: 'black',
              px: 3,
              py: 1.2,
              fontSize: { xs: '1rem', md: '1.1rem' },
              fontWeight: 700,
              textTransform: 'none',
              borderRadius: 0.5,
              border: '2px solid black',
              minWidth: '160px',
              boxShadow: 1,
              justifyContent: 'flex-start',
              '&:hover': {
                bgcolor: 'black',
                color: 'white',
                borderColor: 'black',
                boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              },
              transition: 'all 0.3s ease',
            }}
          >
            {ctaText}
          </Button>
        </Link>
      </Box>
    </Box>
  );
}
