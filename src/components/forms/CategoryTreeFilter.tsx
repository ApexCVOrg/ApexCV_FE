'use client';

import React, { useCallback, useMemo } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
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

const CategoryTreeFilter: React.FC<CategoryTreeFilterProps> = React.memo(({
  categories,
  selectedCategories,
  onCategoryChange,
}) => {
  console.log('CategoryTreeFilter render:', { categories: categories.length, selectedCategories });
  
  // Memoize the onCategoryChange handler to prevent child re-renders
  const memoizedOnCategoryChange = useCallback((categoryId: string, checked: boolean) => {
    console.log('Category checkbox onChange:', { categoryId, checked });
    onCategoryChange(categoryId, checked);
  }, [onCategoryChange]);

  // Memoize the checkbox click handler
  const handleCheckboxClick = useCallback((e: React.MouseEvent) => {
    console.log('Category checkbox onClick');
    e.stopPropagation();
  }, []);

  // Memoize the checkbox change handler for parent categories
  const handleParentCheckboxChange = useCallback((categoryId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Category checkbox onChange (parent):', { categoryId, checked: e.target.checked });
    e.stopPropagation();
    memoizedOnCategoryChange(categoryId, e.target.checked);
  }, [memoizedOnCategoryChange]);

  // Memoize the checkbox change handler for leaf categories
  const handleLeafCheckboxChange = useCallback((categoryId: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('Category checkbox onChange (leaf):', { categoryId, checked: e.target.checked });
    memoizedOnCategoryChange(categoryId, e.target.checked);
  }, [memoizedOnCategoryChange]);

  const renderCategoryNode = useCallback((category: CategoryTree, level: number = 0) => {
    const hasChildren = category.children && category.children.length > 0;
    const isSelected = selectedCategories.includes(category._id);

    console.log('Rendering category:', { id: category._id, name: category.name, isSelected, hasChildren });

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
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleParentCheckboxChange(category._id)}
                onClick={handleCheckboxClick}
                style={{ marginRight: '8px', cursor: 'pointer' }}
              />
              <Typography variant="body2" sx={{ fontWeight: 500 }}>
                {category.name}
              </Typography>
            </Box>
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
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleLeafCheckboxChange(category._id)}
            onClick={handleCheckboxClick}
            style={{ marginRight: '8px', cursor: 'pointer' }}
          />
          <Typography variant="body2">{category.name}</Typography>
        </Box>
      </Box>
    );
  }, [selectedCategories, handleParentCheckboxChange, handleLeafCheckboxChange, handleCheckboxClick]);

  // Memoize the rendered categories
  const renderedCategories = useMemo(() => {
    return categories.map(category => renderCategoryNode(category));
  }, [categories, renderCategoryNode]);

  return <Box>{renderedCategories}</Box>;
});

CategoryTreeFilter.displayName = 'CategoryTreeFilter';

export default CategoryTreeFilter;
