'use client';

import { 
  Box, 
  Button, 
  Menu, 
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Slider,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography
} from '@mui/material';
import { useState } from 'react';
import FilterListIcon from '@mui/icons-material/FilterList';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

export interface HorizontalFilterBarProps {
  teamName: string;
  sortBy: string;
  onSortChange: (value: string) => void;
  onFilterSort: () => void;
  categories?: { 
    _id: string; 
    name: string; 
    parentCategory?: { 
      _id: string; 
      name: string;
      parentCategory?: {
        _id: string;
        name: string;
      };
    } 
  }[];
  selectedCategories?: string[];
  onCategoryChange?: (categoryId: string) => void;
  priceRange?: number[];
  onPriceRangeChange?: (range: number[]) => void;
  brands?: { _id: string; name: string }[];
  selectedBrands?: string[];
  onBrandChange?: (brandId: string) => void;
  onResetFilters?: () => void;
}

const sortOptions = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'top_seller', label: 'Top Seller' },
];

export default function HorizontalFilterBar({ 
  teamName, 
  sortBy, 
  onSortChange, 
  onFilterSort,
  categories = [],
  selectedCategories = [],
  onCategoryChange,
  priceRange = [0, 10000000],
  onPriceRangeChange,
  brands = [],
  selectedBrands = [],
  onBrandChange,
  onResetFilters
}: HorizontalFilterBarProps) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const open = Boolean(anchorEl);

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

  const handleFilterSort = () => {
    setFilterDialogOpen(true);
    onFilterSort();
  };

  const handleCategoryChange = (categoryId: string) => {
    if (onCategoryChange) {
      onCategoryChange(categoryId);
    }
  };

  const handleBrandChange = (brandId: string) => {
    if (onBrandChange) {
      onBrandChange(brandId);
    }
  };

  const handlePriceRangeChange = (_: Event, newValue: number[] | number) => {
    if (onPriceRangeChange) {
      onPriceRangeChange(newValue as number[]);
    }
  };

  const handleResetFilters = () => {
    if (onResetFilters) {
      onResetFilters();
    }
    setFilterDialogOpen(false);
  };

  const selectedSort = sortOptions.find(option => option.value === sortBy)?.label || 'Newest';

  return (
    <>
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
            onClick={handleFilterSort}
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

      <Dialog
        open={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Filter & Sort</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography variant="h6" gutterBottom>Price Range</Typography>
            <Slider
              value={priceRange}
              onChange={handlePriceRangeChange}
              valueLabelDisplay="auto"
              min={0}
              max={10000000}
              step={100000}
              valueLabelFormat={(value) => `${value.toLocaleString('vi-VN')} VND`}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2">
                {priceRange[0].toLocaleString('vi-VN')} VND
              </Typography>
              <Typography variant="body2">
                {priceRange[1].toLocaleString('vi-VN')} VND
              </Typography>
            </Box>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Categories</Typography>
            <FormGroup>
              {categories
                .filter(cat => !cat.parentCategory) // Only show gender categories
                .map((genderCat) => (
                  <Box key={genderCat._id}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={selectedCategories.includes(genderCat._id)}
                          onChange={() => handleCategoryChange(genderCat._id)}
                        />
                      }
                      label={genderCat.name}
                    />
                    {/* Show teams under this gender */}
                    {categories
                      .filter(cat => cat.parentCategory?._id === genderCat._id)
                      .map((teamCat) => (
                        <Box key={teamCat._id} sx={{ ml: 2 }}>
                          <FormControlLabel
                            control={
                              <Checkbox
                                checked={selectedCategories.includes(teamCat._id)}
                                onChange={() => handleCategoryChange(teamCat._id)}
                              />
                            }
                            label={teamCat.name}
                          />
                          {/* Show product types under this team */}
                          {categories
                            .filter(cat => cat.parentCategory?._id === teamCat._id)
                            .map((productTypeCat) => (
                              <Box key={productTypeCat._id} sx={{ ml: 4 }}>
                                <FormControlLabel
                                  control={
                                    <Checkbox
                                      checked={selectedCategories.includes(productTypeCat._id)}
                                      onChange={() => handleCategoryChange(productTypeCat._id)}
                                    />
                                  }
                                  label={productTypeCat.name}
                                />
                              </Box>
                            ))}
                        </Box>
                      ))}
                  </Box>
                ))}
            </FormGroup>
          </Box>

          <Box sx={{ mt: 4 }}>
            <Typography variant="h6" gutterBottom>Brands</Typography>
            <FormGroup>
              {brands.map((brand) => (
                <FormControlLabel
                  key={brand._id}
                  control={
                    <Checkbox
                      checked={selectedBrands.includes(brand._id)}
                      onChange={() => handleBrandChange(brand._id)}
                    />
                  }
                  label={brand.name}
                />
              ))}
            </FormGroup>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFilterDialogOpen(false)}>Close</Button>
          <Button onClick={handleResetFilters}>Reset Filters</Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 