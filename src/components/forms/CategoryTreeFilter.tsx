'use client';

import React from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Checkbox,
  FormControlLabel,
  Typography,
  Box,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CategoryTree } from '@/types/components/category';

interface CategoryTreeFilterProps {
  categories: CategoryTree[];
  selectedCategories: string[];
  onCategoryChange: (categoryId: string, checked: boolean) => void;
}

const CategoryTreeFilter: React.FC<CategoryTreeFilterProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
}) => {
  const renderCategoryNode = (category: CategoryTree, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedCategories.includes(category._id);

    if (hasChildren) {
      return (
        <Accordion
          key={category._id}
          sx={{
            boxShadow: 'none',
            '&:before': { display: 'none' },
            ml: level * 2,
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon />}
            sx={{
              minHeight: '40px',
              '& .MuiAccordionSummary-content': {
                margin: '8px 0',
              },
            }}
          >
            <FormControlLabel
              control={
                <Checkbox
                  checked={isSelected}
                  onChange={e => onCategoryChange(category._id, e.target.checked)}
                  onClick={e => e.stopPropagation()}
                  size="small"
                />
              }
              label={
                <Typography variant="body2" sx={{ fontWeight: 500 }}>
                  {category.name}
                </Typography>
              }
              sx={{ margin: 0, width: '100%' }}
            />
          </AccordionSummary>
          <AccordionDetails sx={{ pt: 0, pb: 1 }}>
            <Box sx={{ ml: 2 }}>
              {category.children?.map(child => renderCategoryNode(child, level + 1))}
            </Box>
          </AccordionDetails>
        </Accordion>
      );
    }

    return (
      <Box key={category._id} sx={{ ml: level * 2 + 2, mb: 0.5 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={isSelected}
              onChange={e => onCategoryChange(category._id, e.target.checked)}
              size="small"
            />
          }
          label={<Typography variant="body2">{category.name}</Typography>}
          sx={{ margin: 0 }}
        />
      </Box>
    );
  };

  return <Box>{categories.map(category => renderCategoryNode(category))}</Box>;
};

export default CategoryTreeFilter;
