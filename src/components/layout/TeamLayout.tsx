'use client';

import React from 'react';
import { Box, Container, Typography, Paper } from '@mui/material';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import styles from '@/styles/pages/TeamLayout.module.scss';

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
    name: "Arsenal",
    route: "arsenal",
    logo: "https://upload.wikimedia.org/wikipedia/vi/thumb/5/53/Arsenal_FC.svg/800px-Arsenal_FC.svg.png",
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

export default function TeamLayout({ children, section, title, hideTabs }: TeamLayoutProps) {
  const pathname = usePathname();
  const currentTeam = pathname.split('/').pop() || '';

  return (
    <Container maxWidth="lg" className={styles.container}>
      <Box>
        {!hideTabs && (
          <>
            <Typography variant="h4" component="h1" className={styles.title} gutterBottom sx={{ mt: 8 }}>
              {title}
            </Typography>
            <Paper
              elevation={3}
              className={styles.tabsWrapper}
              sx={{ mt: 2 }}
            >
              {teams.map((team) => (
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
                  >
                    <Image
                      src={team.logo}
                      alt={team.name}
                      width={60}
                      height={60}
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
  );
} 
