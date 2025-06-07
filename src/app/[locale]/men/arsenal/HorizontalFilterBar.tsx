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

interface HorizontalFilterBarProps {
  sortBy: string;
  onSortChange: (value: string) => void;
  onFilterSort: () => void;
}

export default function HorizontalFilterBar({
  sortBy, onSortChange,
  onFilterSort
}: HorizontalFilterBarProps) {
  const [sortAnchor, setSortAnchor] = useState<HTMLElement | null>(null);

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