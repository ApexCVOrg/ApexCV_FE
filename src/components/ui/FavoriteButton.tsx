'use client';

import React, { useState } from 'react';
import { IconButton, Tooltip, CircularProgress } from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

interface FavoriteButtonProps {
  productId: string;
  size?: 'small' | 'medium' | 'large';
  color?: 'primary' | 'secondary' | 'error' | 'default';
  showTooltip?: boolean;
  onToggle?: (isFavorite: boolean) => void;
  className?: string;
  dataTestId?: string;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  productId,
  size = 'medium',
  color = 'error',
  showTooltip = true,
  onToggle,
  className,
  dataTestId = 'favorite-button',
}) => {
  const { isAuthenticated } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const favorite = isFavorite(productId);

  const handleClick = async (event: React.MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();

    if (!isAuthenticated) {
      router.push('/auth/login');
      return;
    }

    setIsLoading(true);
    try {
      await toggleFavorite(productId);
      onToggle?.(!favorite);
    } catch (error) {
      console.error('Error toggling favorite:', error);
      // Toast notification có thể được thêm ở đây
    } finally {
      setIsLoading(false);
    }
  };

  const button = (
    <IconButton
      onClick={handleClick}
      disabled={isLoading}
      size={size}
      color={color}
      className={className}
      data-testid={dataTestId}
      sx={{
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'scale(1.1)',
        },
        '&:disabled': {
          opacity: 0.6,
        },
      }}
    >
      {isLoading ? (
        <CircularProgress size={size === 'small' ? 16 : size === 'large' ? 24 : 20} />
      ) : favorite ? (
        <FavoriteIcon />
      ) : (
        <FavoriteBorderIcon />
      )}
    </IconButton>
  );

  if (!showTooltip) {
    return button;
  }

  const tooltipTitle = isLoading
    ? 'Loading...'
    : favorite
    ? 'Bỏ khỏi yêu thích'
    : 'Thêm vào yêu thích';

  return (
    <Tooltip title={tooltipTitle} arrow placement="top">
      {button}
    </Tooltip>
  );
};

export default FavoriteButton; 