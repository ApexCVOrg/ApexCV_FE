import React from 'react';
import { Box, Typography } from '@mui/material';
import { motion } from 'framer-motion';
import CheckIcon from '@mui/icons-material/Check';

interface ColorPickerProps {
  colors: string[];
  selectedColor: string;
  onColorSelect: (color: string) => void;
  title?: string;
  showSelectedLabel?: boolean;
  size?: 'small' | 'medium' | 'large';
  variant?: 'circle' | 'rounded';
}

const ColorPicker: React.FC<ColorPickerProps> = ({
  colors,
  selectedColor,
  onColorSelect,
  title = 'Colors',
  showSelectedLabel = true,
  size = 'medium',
  variant = 'circle',
}) => {
  const sizeMap = {
    small: { width: 32, height: 32, fontSize: 12 },
    medium: { width: 40, height: 40, fontSize: 14 },
    large: { width: 48, height: 48, fontSize: 16 },
  };

  const currentSize = sizeMap[size];

  return (
    <Box>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          {title}:
        </Typography>
        {showSelectedLabel && (
          <Typography variant="body2" color="text.secondary">
            {selectedColor ? `Selected: ${selectedColor}` : 'Choose a color'}
          </Typography>
        )}
      </Box>

      {/* Color Options */}
      <Box sx={{ display: 'flex', gap: 1.5, flexWrap: 'wrap' }}>
        {colors.map((color, index) => (
          <motion.div
            key={`${color}-${index}`}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Box
              onClick={() => onColorSelect(color)}
              sx={{
                position: 'relative',
                width: currentSize.width,
                height: currentSize.height,
                borderRadius: variant === 'circle' ? '50%' : '8px',
                border: selectedColor === color ? '3px solid #1976d2' : '2px solid #e0e0e0',
                cursor: 'pointer',
                bgcolor: color.toLowerCase(),
                transition: 'all 0.2s ease',
                boxShadow: selectedColor === color 
                  ? '0 4px 12px rgba(25, 118, 210, 0.3)' 
                  : '0 2px 8px rgba(0,0,0,0.1)',
                '&:hover': {
                  transform: 'scale(1.1)',
                  boxShadow: '0 6px 16px rgba(0,0,0,0.2)',
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: -2,
                  left: -2,
                  right: -2,
                  bottom: -2,
                  borderRadius: variant === 'circle' ? '50%' : '10px',
                  background: 'linear-gradient(45deg, transparent, rgba(255,255,255,0.3), transparent)',
                  opacity: selectedColor === color ? 1 : 0,
                  transition: 'opacity 0.3s ease',
                },
              }}
            >
              {selectedColor === color && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                  }}
                >
                  {variant === 'circle' ? (
                    <Box
                      sx={{
                        width: 16,
                        height: 16,
                        borderRadius: '50%',
                        bgcolor: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 8,
                          height: 8,
                          borderRadius: '50%',
                          bgcolor: '#1976d2',
                        }}
                      />
                    </Box>
                  ) : (
                    <CheckIcon 
                      sx={{ 
                        color: '#fff', 
                        fontSize: currentSize.fontSize,
                        filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))',
                        stroke: '#000',
                        strokeWidth: 1,
                      }} 
                    />
                  )}
                </motion.div>
              )}
            </Box>
          </motion.div>
        ))}
      </Box>

      {/* Selected Color Label */}
      {selectedColor && showSelectedLabel && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1, fontStyle: 'italic' }}>
          Color: {selectedColor.charAt(0).toUpperCase() + selectedColor.slice(1)}
        </Typography>
      )}
    </Box>
  );
};

export default ColorPicker; 