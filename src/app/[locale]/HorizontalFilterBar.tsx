'use client';

import { Box, Button, Menu, MenuItem } from '@mui/material';
import { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export interface HorizontalFilterBarProps {
  teamName: string;
  sortBy: string;
  onSortChange: (value: string) => void;
  onFilterSort: () => void;
  categories?: { _id: string; name: string; parentCategory?: { _id: string; name: string } }[];
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_low_to_high', label: 'Price: Low to High' },
  { value: 'price_high_to_low', label: 'Price: High to Low' },
  { value: 'top_seller', label: 'Top Seller' },
];

export default function HorizontalFilterBar({ 
  teamName, 
  sortBy, 
  onSortChange, 
  onFilterSort,
  categories = []
}: HorizontalFilterBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  // Lọc bỏ các category trùng tên, giữ lại category đầu tiên
  const uniqueCategories = categories.reduce((acc, current) => {
    const x = acc.find(item => item.name === current.name);
    if (!x) {
      return acc.concat([current]);
    } else {
      return acc;
    }
  }, [] as typeof categories);

  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSortChange = (value: string) => {
    onSortChange(value);
    handleClose();
  };

  const selectedSort = sortOptions.find(option => option.value === sortBy)?.label || 'Newest';

  return (
    <Box sx={{ 
      display: 'flex', 
      justifyContent: 'space-between',
      alignItems: 'center',
      mb: 3,
      width: '100%'
    }}>
      <Box sx={{ typography: 'h5', fontWeight: 'bold' }}>
        {teamName}
      </Box>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          variant="outlined"
          onClick={handleClick}
          endIcon={<ArrowDropDownIcon />}
          sx={{
            textTransform: 'none',
            borderColor: 'rgba(0, 0, 0, 0.23)',
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.23)',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          {selectedSort}
        </Button>
        <Button
          variant="outlined"
          onClick={onFilterSort}
          startIcon={<FilterListIcon />}
          sx={{
            textTransform: 'none',
            borderColor: 'rgba(0, 0, 0, 0.23)',
            '&:hover': {
              borderColor: 'rgba(0, 0, 0, 0.23)',
              backgroundColor: 'rgba(0, 0, 0, 0.04)',
            },
          }}
        >
          FILTER & SORT
        </Button>
      </Box>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        {sortOptions.map((option) => (
          <MenuItem
            key={option.value}
            onClick={() => handleSortChange(option.value)}
            selected={sortBy === option.value}
          >
            {option.label}
          </MenuItem>
        ))}
      </Menu>
    </Box>
  );
} 