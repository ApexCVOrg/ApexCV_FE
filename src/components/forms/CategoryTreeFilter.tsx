'use client';

import React, { useCallback, useMemo } from 'react';
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { CategoryTree } from '@/types/components/category';
import { useTheme } from '@/hooks/useTheme';
import { THEME } from '@/lib/constants/constants';

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
  const { theme } = useTheme();
  const isDark = theme === THEME.DARK;
  
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
            border: `1px solid ${isDark ? '#444' : '#e0e0e0'}`,
            borderRadius: '8px',
            mb: 1,
            backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
            '&:hover': {
              borderColor: isDark ? '#666' : '#1976d2',
              boxShadow: isDark 
                ? '0 2px 8px rgba(255, 255, 255, 0.1)' 
                : '0 2px 8px rgba(25, 118, 210, 0.1)',
            },
          }}
        >
          <AccordionSummary
            expandIcon={<ExpandMoreIcon sx={{ color: isDark ? '#ccc' : '#666' }} />}
            sx={{
              minHeight: '40px',
              '& .MuiAccordionSummary-content': {
                margin: '8px 0',
              },
              '&:hover': {
                backgroundColor: isDark ? '#2a2a2a' : '#f5f5f5',
              },
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
              <input
                type="checkbox"
                checked={isSelected}
                onChange={handleParentCheckboxChange(category._id)}
                onClick={handleCheckboxClick}
                style={{ 
                  marginRight: '8px', 
                  cursor: 'pointer',
                  width: '16px',
                  height: '16px',
                  accentColor: isDark ? '#90caf9' : '#1976d2',
                }}
              />
              <Typography 
                variant="body2" 
                sx={{ 
                  fontWeight: 500,
                  color: isDark ? '#e0e0e0' : '#333',
                }}
              >
                {category.name}
              </Typography>
            </Box>
          </AccordionSummary>
          <AccordionDetails sx={{ 
            pt: 0, 
            pb: 1, 
            backgroundColor: isDark ? '#111' : '#fafafa' 
          }}>
            <Box sx={{ ml: 2 }}>
              {category.children?.map(child => renderCategoryNode(child, level + 1))}
            </Box>
          </AccordionDetails>
        </Accordion>
      );
    }

    return (
      <Box 
        key={category._id} 
        sx={{ 
          ml: level * 2 + 2, 
          mb: 0.5,
          p: 1,
          borderRadius: '4px',
          border: `1px solid ${isDark ? '#333' : '#f0f0f0'}`,
          backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
          '&:hover': {
            borderColor: isDark ? '#666' : '#1976d2',
            backgroundColor: isDark ? '#2a2a2a' : '#f8f9fa',
          },
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={handleLeafCheckboxChange(category._id)}
            onClick={handleCheckboxClick}
            style={{ 
              marginRight: '8px', 
              cursor: 'pointer',
              width: '16px',
              height: '16px',
              accentColor: isDark ? '#90caf9' : '#1976d2',
            }}
          />
          <Typography 
            variant="body2"
            sx={{ color: isDark ? '#e0e0e0' : '#333' }}
          >
            {category.name}
          </Typography>
        </Box>
      </Box>
    );
  }, [selectedCategories, handleParentCheckboxChange, handleLeafCheckboxChange, handleCheckboxClick, isDark]);

  // Memoize the rendered categories
  const renderedCategories = useMemo(() => {
    return categories.map(category => renderCategoryNode(category));
  }, [categories, renderCategoryNode]);

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        border: `2px solid ${isDark ? '#444' : '#e0e0e0'}`,
        borderRadius: '12px',
        backgroundColor: isDark ? '#1a1a1a' : '#ffffff',
        '&:hover': {
          borderColor: isDark ? '#666' : '#1976d2',
          boxShadow: isDark 
            ? '0 4px 12px rgba(255, 255, 255, 0.1)' 
            : '0 4px 12px rgba(25, 118, 210, 0.15)',
        },
      }}
    >
      <Box>{renderedCategories}</Box>
    </Paper>
  );
});

CategoryTreeFilter.displayName = 'CategoryTreeFilter';

export default CategoryTreeFilter;
