import React from 'react';
import { Box, Typography, List, ListItem, ListItemText } from '@mui/material';
import Link from 'next/link';
import { ROUTES } from '@/lib/constants/constants';

const allNewShoes = [
  { name: 'ADIZERO', route: '/shoes/adizero' },
  { name: 'GAZELLE', route: ROUTES.SHOES.GAZELLE },
  { name: 'SAMBA', route: ROUTES.SHOES.SAMBA },
  { name: 'SL 72', route: ROUTES.SHOES.SL_72 },
  { name: 'SPEZIAL', route: ROUTES.SHOES.SPEZIAL },
  { name: 'SUPERSTAR', route: ROUTES.SHOES.SUPERSTAR },
];
const trendingShoes = [
  { name: 'Air Force', route: '/shoes/air-force' },
  { name: 'Air Max', route: '/shoes/air-max' },
];
const featured = [
  {
    name: 'SAMBA',
    img: '/assets/images/shoes/samba/Giay_Samba_OG_trang_B75806_01_00_standard.avif',
    route: ROUTES.SHOES.SAMBA,
  },
  {
    name: 'GAZELLE',
    img: '/assets/images/shoes/gazelle/Giay_Gazelle_Indoor_DJen_JI2060_01_standard.avif',
    route: ROUTES.SHOES.GAZELLE,
  },
  {
    name: 'SL 72',
    img: '/assets/images/shoes/sl72/Giay_SL_72_OG_Mau_xanh_da_troi_JS0255_01_00_standard.avif',
    route: ROUTES.SHOES.SL_72,
  },
  {
    name: 'SUPERSTAR',
    img: '/assets/images/shoes/superstar/Giay_Superstar_Vintage_trang_JQ3254_01_00_standard.avif',
    route: ROUTES.SHOES.SUPERSTAR,
  },
];

export default function HeaderMenuShoes() {
  return (
    <Box
      sx={{
        bgcolor: 'white',
        boxShadow: 3,
        borderRadius: 2,
        p: 1.5,
        minWidth: 700,
        display: 'grid',
        gridTemplateRows: '1fr 1fr',
        gap: 0,
      }}
    >
      {/* Hàng 1: ADIDAS + 2 ảnh đầu */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', minHeight: 200 }}>
        <Box
          sx={{
            minWidth: 200,
            pr: 3,
            borderRight: '1px solid #eee',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, mt: 1 }}>
            ADIDAS
          </Typography>
          <List dense disablePadding>
            {allNewShoes.map(item => (
              <ListItem key={item.name} disableGutters sx={{ py: 0.2 }}>
                <Link
                  href={item.route}
                  style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
                >
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      fontWeight: 400,
                      fontSize: 15,
                      sx: { cursor: 'pointer' },
                    }}
                  />
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box
          sx={{
            pl: 3,
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 3,
            alignItems: 'flex-start',
            justifyItems: 'center',
          }}
        >
          {featured.slice(0, 2).map(shoe => (
            <Link
              key={shoe.name}
              href={shoe.route}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {shoe.name}
                </Typography>
                <Box
                  sx={{
                    width: 260,
                    height: 180,
                    bgcolor: '#f7f7f7',
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 1,
                    p: 0,
                    m: 0,
                  }}
                >
                  <img
                    src={shoe.img}
                    alt={shoe.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </Box>
              </Box>
            </Link>
          ))}
        </Box>
      </Box>
      {/* Hàng 2: NIKE + 2 ảnh sau */}
      <Box sx={{ display: 'flex', alignItems: 'flex-start', minHeight: 200, mt: 2 }}>
        <Box
          sx={{
            minWidth: 200,
            pr: 3,
            borderRight: '1px solid #eee',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 1, mt: 1 }}>
            NIKE
          </Typography>
          <List dense disablePadding>
            {trendingShoes.map(item => (
              <ListItem key={item.name} disableGutters sx={{ py: 0.2 }}>
                <Link
                  href={item.route}
                  style={{ textDecoration: 'none', color: 'inherit', width: '100%' }}
                >
                  <ListItemText
                    primary={item.name}
                    primaryTypographyProps={{
                      fontWeight: 400,
                      fontSize: 15,
                      sx: { cursor: 'pointer' },
                    }}
                  />
                </Link>
              </ListItem>
            ))}
          </List>
        </Box>
        <Box
          sx={{
            pl: 3,
            flex: 1,
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 3,
            alignItems: 'flex-start',
            justifyItems: 'center',
          }}
        >
          {featured.slice(2, 4).map(shoe => (
            <Link
              key={shoe.name}
              href={shoe.route}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <Box>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 700,
                    mb: 1,
                    textTransform: 'uppercase',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                >
                  {shoe.name}
                </Typography>
                <Box
                  sx={{
                    width: 260,
                    height: 180,
                    bgcolor: '#f7f7f7',
                    borderRadius: 2,
                    overflow: 'hidden',
                    mb: 1,
                    p: 0,
                    m: 0,
                  }}
                >
                  <img
                    src={shoe.img}
                    alt={shoe.name}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                  />
                </Box>
              </Box>
            </Link>
          ))}
        </Box>
      </Box>
    </Box>
  );
}
