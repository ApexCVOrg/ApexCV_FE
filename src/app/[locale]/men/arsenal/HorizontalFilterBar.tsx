import { Box, Button, Menu, MenuItem } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useState } from 'react';

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

  return (
    <Box sx={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      borderBottom: '1px solid #eee',
      mb: 2,
      px: 2,
      overflowX: 'auto'
    }}>
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