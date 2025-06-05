import { Box, Button, Menu, MenuItem } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

const teams = [
  { name: 'Manchester United', path: '/men/manchester-united' },
  { name: 'Arsenal', path: '/men/arsenal' },
  { name: 'Real Madrid', path: '/men/real-madrid' },
  { name: 'Bayern Munich', path: '/men/bayern-munich' },
  { name: 'Inter Miami', path: '/men/inter-miami' }
];

const sortOptions = [
  { label: 'Newest', value: 'newest' },
  { label: 'Price: Low to High', value: 'price-low' },
  { label: 'Price: High to Low', value: 'price-high' },
  { label: 'Top Seller', value: 'top-seller' }
];

const genderOptions = [
  { label: 'All', value: '' },
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Unisex', value: 'unisex' }
];

interface HorizontalFilterBarProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  gender: string;
  onGenderChange: (value: string) => void;
  onFilterSort: () => void;
}

export default function HorizontalFilterBar({
  sortBy, onSortChange,
  gender, onGenderChange,
  onFilterSort
}: HorizontalFilterBarProps) {
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);
  const [genderAnchor, setGenderAnchor] = useState<HTMLElement | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '1px solid #eee',
      mb: 2,
      px: 2,
      overflowX: 'auto'
    }}>
      <Box sx={{ display: 'flex', gap: 3, flexWrap: 'nowrap', overflowX: 'auto' }}>
        {teams.map((team) => {
          const isActive = pathname === team.path || pathname.endsWith(team.path);
          return (
            <Button
              key={team.name}
              onClick={() => router.push(team.path)}
              sx={{
                color: isActive ? '#000' : 'gray',
                fontWeight: isActive ? 700 : 400,
                borderRadius: 0,
                borderBottom: isActive ? '3px solid #000' : '3px solid transparent',
                minWidth: 0,
                px: 2,
                background: 'none',
                boxShadow: 'none',
                '&:hover': { background: 'none', color: '#000' }
              }}
              disableRipple
            >
              {team.name}
            </Button>
          );
        })}
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {/* Sort Dropdown */}
        <Button
          endIcon={<ArrowDropDownIcon />}
          onClick={(e) => setSortAnchor(e.currentTarget as HTMLElement)}
          sx={{ fontWeight: 700, color: '#000', border: '1px solid #000', background: '#fff' }}
        >
          {sortOptions.find(opt => opt.value === sortBy)?.label || 'Sort'}
        </Button>
        <Menu
          anchorEl={sortAnchor}
          open={Boolean(sortAnchor)}
          onClose={() => setSortAnchor(null)}
        >
          {sortOptions.map(opt => (
            <MenuItem
              key={opt.value}
              selected={sortBy === opt.value}
              onClick={() => { onSortChange(opt.value); setSortAnchor(null); }}
            >
              {opt.label}
            </MenuItem>
          ))}
        </Menu>
        {/* Gender Dropdown */}
        <Button
          endIcon={<ArrowDropDownIcon />}
          onClick={(e) => setGenderAnchor(e.currentTarget as HTMLElement)}
          sx={{ fontWeight: 700, color: '#000', border: '1px solid #000', background: '#fff' }}
        >
          {genderOptions.find(opt => opt.value === gender)?.label || 'Gender'}
        </Button>
        <Menu
          anchorEl={genderAnchor}
          open={Boolean(genderAnchor)}
          onClose={() => setGenderAnchor(null)}
        >
          {genderOptions.map(opt => (
            <MenuItem
              key={opt.value}
              selected={gender === opt.value}
              onClick={() => { onGenderChange(opt.value); setGenderAnchor(null); }}
            >
              {opt.label}
            </MenuItem>
          ))}
        </Menu>
        {/* Filter & Sort Button */}
        <Button
          variant="outlined"
          startIcon={<FilterListIcon />}
          sx={{
            fontWeight: 700,
            letterSpacing: 1,
            borderColor: '#000',
            color: '#000',
            px: 3,
            py: 1,
            '&:hover': { borderColor: '#000', background: '#fafafa' }
          }}
          onClick={onFilterSort}
        >
          FILTER & SORT
        </Button>
      </Box>
    </Box>
  );
} 