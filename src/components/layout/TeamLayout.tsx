'use client';

import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';

interface TeamInfo {
  name: string;
  route: string;
  logo: string;
}

export interface ProductInfo {
  name: string;
  price: string;
  image: string;
  desc: string;
}

interface TeamLayoutProps {
  children: React.ReactNode;
  section: 'men' | 'women' | 'kids';
  title: string;
}

const teams: TeamInfo[] = [
  {
    name: "Arsenal",
    route: "arsenal",
    logo: "https://static.vecteezy.com/system/resources/previews/015/863/617/non_2x/arsenal-logo-on-transparent-background-free-vector.jpg",
  },
  {
    name: "Real Madrid",
    route: "real-madrid",
    logo: "https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg",
  },
  {
    name: "Manchester United",
    route: "manchester-united",
    logo: "https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg",
  },
  {
    name: "Juventus",
    route: "juventus",
    logo: "https://dothethao.net.vn/wp-content/uploads/2020/06/logo-juventus.png",
  },
  {
    name: "Bayern Munich",
    route: "bayern-munich",
    logo: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/2048px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png",
  },
];

const tabColors: Record<string, string> = {
  "arsenal": "#EF3340",
  "real-madrid": "#00529F",
  "manchester-united": "#DA291C",
  "juventus": "#000",
  "bayern-munich": "#DC052D",
};

export default function TeamLayout({ children, section, title }: TeamLayoutProps) {
  const pathname = usePathname();
  const currentTeam = pathname.split('/').pop() || '';

  return (
    <Container maxWidth="lg">
      <Box sx={{ py: 4 }}>
        <Typography variant="h4" component="h1" align="center" gutterBottom>
          {title}
        </Typography>
        <Paper 
          elevation={3} 
          sx={{ 
            p: 2, 
            mb: 4,
            display: 'flex',
            justifyContent: 'center',
            gap: 2,
            flexWrap: 'wrap'
          }}
        >
          {teams.map((team) => (
            <Link 
              key={team.route} 
              href={`/${section}/${team.route}`}
              style={{ textDecoration: 'none' }}
            >
              <Box
                sx={{
                  width: 60,
                  height: 60,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.1)',
                  },
                  border: currentTeam === team.route ? `2px solid ${tabColors[team.route]}` : 'none',
                  borderRadius: '50%',
                  padding: '4px',
                }}
              >
                <Image
                  src={team.logo}
                  alt={team.name}
                  width={60}
                  height={60}
                  style={{
                    objectFit: 'contain',
                  }}
                />
              </Box>
            </Link>
          ))}
        </Paper>
        {children}
      </Box>
    </Container>
  );
} 