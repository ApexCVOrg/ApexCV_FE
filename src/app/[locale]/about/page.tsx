// app/about/page.tsx
import React from 'react';
import { Container, Typography, Box } from '@mui/material';

export default function AboutPage() {
  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" component="h1" gutterBottom>
          About Nidas
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Your Style, Your Statement
        </Typography>
      </Box>

      <Typography variant="body1" paragraph>
        Nidas is a modern fashion e-commerce platform inspired by Adidas, dedicated to bringing you
        the latest trends in footwear, apparel, and accessories. We combine style, comfort, and
        quality to help you express your unique personality through every product.
      </Typography>

      <Typography variant="body1" paragraph>
        Our mission is to empower our customers with a seamless shopping experience and a diverse
        selection of premium products from trusted brands worldwide.
      </Typography>

      <Typography variant="body1" paragraph>
        At Nidas, innovation and customer satisfaction are our top priorities. We continually strive
        to enhance our platform and services to meet your evolving needs.
      </Typography>

      <Box mt={6} textAlign="center">
        <Typography variant="subtitle1" color="text.secondary">
          Thank you for choosing Nidas as your fashion partner.
        </Typography>
      </Box>
    </Container>
  );
}
