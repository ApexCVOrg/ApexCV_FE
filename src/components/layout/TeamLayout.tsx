'use client';

import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/pages/TeamLayout.module.scss';
import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

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
  hideTabs?: boolean;
}

const teams: TeamInfo[] = [
  {
    name: 'Arsenal',
    route: 'arsenal',
    logo: 'https://upload.wikimedia.org/wikipedia/vi/thumb/5/53/Arsenal_FC.svg/800px-Arsenal_FC.svg.png',
  },
  {
    name: 'Real Madrid',
    route: 'real-madrid',
    logo: 'https://upload.wikimedia.org/wikipedia/en/5/56/Real_Madrid_CF.svg',
  },
  {
    name: 'Manchester United',
    route: 'manchester-united',
    logo: 'https://upload.wikimedia.org/wikipedia/en/7/7a/Manchester_United_FC_crest.svg',
  },
  {
    name: 'Juventus',
    route: 'juventus',
    logo: 'https://dothethao.net.vn/wp-content/uploads/2020/06/logo-juventus.png',
  },
  {
    name: 'Bayern Munich',
    route: 'bayern-munich',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/2048px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png',
  },
];

const tabColors: Record<string, string> = {
  arsenal: '#EF3340',
  'real-madrid': '#00529F',
  'manchester-united': '#DA291C',
  juventus: '#000',
  'bayern-munich': '#DC052D',
};

export default function TeamLayout({ children, section, title, hideTabs }: TeamLayoutProps) {
  const pathname = usePathname();
  const currentTeam = pathname.split('/').pop() || '';
  const { theme } = useTheme();

  return (
    <Box sx={{ 
      bgcolor: theme === THEME.LIGHT ? '#fff' : '#000',
      color: theme === THEME.LIGHT ? '#000' : '#fff',
      minHeight: '100vh',
      width: '100%',
      pt: 8 // Add padding top to account for fixed header
    }}>
      <Container maxWidth="xl" disableGutters className={styles.container} sx={{ 
        paddingTop: 0,
        bgcolor: theme === THEME.LIGHT ? '#fff' : '#000',
      }}>
        <Box sx={{ 
          width: '100%',
          bgcolor: theme === THEME.LIGHT ? '#fff' : '#000',
        }}>
        {!hideTabs && (
          <>
            <Typography
              variant="h4"
              component="h1"
              className={styles.title}
              gutterBottom
                sx={{ 
                  mt: 3,
                  mb: 2,
                  color: theme === THEME.LIGHT ? '#000' : '#fff',
                  fontWeight: 700,
                  textAlign: 'center',
                  fontSize: { xs: '1.8rem', md: '2.2rem', lg: '2.5rem' },
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase'
                }}
            >
              {title}
            </Typography>
              <Paper 
                elevation={0} 
                className={styles.tabsWrapper} 
                sx={{ 
                  mt: 2,
                  mb: 3,
                  bgcolor: theme === THEME.LIGHT ? '#f8f9fa' : '#1a1a1a',
                  color: theme === THEME.LIGHT ? '#000' : '#fff',
                  borderRadius: 3,
                  border: theme === THEME.LIGHT ? '1px solid #e0e0e0' : '1px solid #333',
                  boxShadow: theme === THEME.LIGHT 
                    ? '0 4px 20px rgba(0,0,0,0.08)' 
                    : '0 4px 20px rgba(0,0,0,0.3)',
                  backdropFilter: 'blur(10px)',
                  background: theme === THEME.LIGHT 
                    ? 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)'
                    : 'linear-gradient(135deg, #1a1a1a 0%, #000000 100%)'
                }}
              >
              {teams.map(team => (
                <Link
                  key={team.route}
                  href={`/${section}/${team.route}`}
                  style={{ textDecoration: 'none' }}
                >
                  <Box
                    className={
                      currentTeam === team.route
                        ? `${styles.teamIcon} ${styles.active}`
                        : styles.teamIcon
                    }
                    style={
                      currentTeam === team.route
                        ? { borderColor: tabColors[team.route] }
                        : undefined
                    }
                      sx={{
                        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                        bgcolor: theme === THEME.LIGHT ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.05)',
                        ...(currentTeam === team.route && {
                          bgcolor: theme === THEME.LIGHT ? 'rgba(255, 255, 255, 0.15)' : 'rgba(255, 255, 255, 0.1)',
                        }),
                        '&:hover': {
                          transform: 'scale(1.08) translateY(-2px)',
                          boxShadow: theme === THEME.LIGHT 
                            ? '0 6px 20px rgba(0,0,0,0.15)' 
                            : '0 6px 20px rgba(255,255,255,0.1)',
                          bgcolor: theme === THEME.LIGHT ? 'rgba(255, 255, 255, 0.12)' : 'rgba(255, 255, 255, 0.08)',
                        },
                        // Special styling for Juventus logo
                        '& img': {
                          filter: team.route === 'juventus' ? 'brightness(1.2) contrast(1.2)' : 'none',
                        }
                      }}
                  >
                    <Image
                      src={team.logo}
                      alt={team.name}
                        width={50}
                        height={50}
                      style={{ objectFit: 'contain' }}
                    />
                  </Box>
                </Link>
              ))}
            </Paper>
          </>
        )}
        {children}
      </Box>
    </Container>
    </Box>
  );
}
