'use client';

import React, { useState } from 'react';
import {
  Box,
  Button,
  Typography,
  Alert,
  Chip,
  CircularProgress,
  Card,
  CardContent,
  Divider,
} from '@mui/material';
import { 
  Recommend, 
  Info 
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { formatFootLengthCm } from '@/lib/utils/unitConversion';

interface SizeRecommenderProps {
  productId: string;
  sizes: string[];
  categories: string[];
  onSizeSelect?: (size: string | { EU: number; US: number; UK: number }) => void;
}

interface SizeRecommendationResponse {
  needProfile?: boolean;
  missing?: string[];
  message?: string;
  recommendedSize?: string | { EU: number; US: number; UK: number };
  type?: 'apparel' | 'footwear';
  confidence?: number;
  footLength?: number;
}

const SizeRecommender = ({
  productId,
  sizes,
  categories,
  onSizeSelect
}: SizeRecommenderProps) => {
  const router = useRouter();
  const [recommendation, setRecommendation] = useState<SizeRecommendationResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getSizeRecommendation = async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('auth_token');
      console.log('SizeRecommender - Token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        setError('Please login to get size recommendations');
        setLoading(false);
        return;
      }

      const requestBody = {
        productId,
        sizes,
        categories,
      };
      
      console.log('SizeRecommender - Request body:', requestBody);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/size-recommendation`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log('SizeRecommender - API response:', data);

      if (!response.ok) {
        throw new Error(data.message || 'Failed to get size recommendation');
      }

      setRecommendation(data);
      console.log('SizeRecommender - Set recommendation:', data);
      
      // Call onSizeSelect if provided
      if (data.recommendedSize && onSizeSelect) {
        onSizeSelect(data.recommendedSize);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = () => {
    router.push('/profile');
  };

  const getMissingFieldsText = (missing: string[]) => {
    const fieldMap: { [key: string]: string } = {
      height: 'Chiều cao',
      weight: 'Cân nặng',
      footLength: 'Chiều dài chân'
    };
    
    return missing.map(field => fieldMap[field] || field).join(', ');
  };

  const renderApparelSize = (size: string, confidence?: number) => (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Chip
        label={size}
        color="primary"
        variant="filled"
        size="medium"
      />
      {confidence && (
        <Typography variant="caption" color="text.secondary">
          ({Math.round(confidence * 100)}% phù hợp)
        </Typography>
      )}
    </Box>
  );

  const renderFootwearSize = (sizes: { EU: number; US: number; UK: number }, confidence?: number) => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Typography variant="subtitle2" color="text.secondary">
        Size được gợi ý:
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        <Chip label={`EU ${sizes.EU}`} color="primary" variant="filled" />
        <Chip label={`US ${sizes.US}`} color="primary" variant="filled" />
        <Chip label={`UK ${sizes.UK}`} color="primary" variant="filled" />
      </Box>
      {confidence && (
        <Typography variant="caption" color="text.secondary">
          ({Math.round(confidence * 100)}% phù hợp)
        </Typography>
      )}
    </Box>
  );

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <Recommend color="primary" />
          <Typography variant="h6" component="h3">
            Gợi ý Size
          </Typography>
        </Box>

        {loading && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, py: 2 }}>
            <CircularProgress size={20} />
            <Typography>Đang phân tích size phù hợp...</Typography>
          </Box>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {recommendation?.needProfile && (
          <Alert 
            severity="info" 
            sx={{ mb: 2 }}
            action={
              <Button 
                color="inherit" 
                size="small" 
                onClick={handleUpdateProfile}
              >
                Cập nhật
              </Button>
            }
          >
            <Typography variant="body2">
              Cần cập nhật thông tin: <strong>{getMissingFieldsText(recommendation.missing || [])}</strong>
            </Typography>
          </Alert>
        )}

        {recommendation?.recommendedSize && !recommendation.needProfile && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Info color="success" />
              <Typography variant="subtitle1" color="success.main">
                Size được gợi ý cho bạn
              </Typography>
            </Box>
            
            {recommendation.type === 'apparel' && typeof recommendation.recommendedSize === 'string' && (
              renderApparelSize(recommendation.recommendedSize, recommendation.confidence)
            )}
            
            {recommendation.type === 'footwear' && typeof recommendation.recommendedSize === 'object' && (
              renderFootwearSize(recommendation.recommendedSize, recommendation.confidence)
            )}
            
            {recommendation.type === 'footwear' && typeof recommendation.recommendedSize === 'string' && (
              renderApparelSize(recommendation.recommendedSize, recommendation.confidence)
            )}

            {recommendation.type === 'footwear' && recommendation.footLength && (
              <Typography variant="caption" color="text.secondary">
                Dựa trên chiều dài chân: {formatFootLengthCm(recommendation.footLength)}
              </Typography>
            )}
            
            {recommendation.type === 'apparel' && (
              <Typography variant="caption" color="text.secondary">
                Dựa trên chiều cao và cân nặng của bạn
              </Typography>
            )}

            <Divider />
            
            <Typography variant="caption" color="text.secondary">
              * Gợi ý dựa trên thông tin cơ thể của bạn. Vui lòng thử trước khi mua.
            </Typography>
          </Box>
        )}

        {!loading && !recommendation && !error && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Nhận gợi ý size phù hợp dựa trên thông tin cơ thể của bạn
            </Typography>
            <Button
              variant="outlined"
              startIcon={<Recommend />}
              onClick={getSizeRecommendation}
              sx={{ alignSelf: 'flex-start' }}
            >
              Nhận gợi ý size
            </Button>
          </Box>
        )}

        {recommendation && !recommendation.needProfile && (
          <Button
            variant="outlined"
            size="small"
            onClick={getSizeRecommendation}
            sx={{ mt: 2 }}
          >
            Làm mới gợi ý
          </Button>
        )}
      </CardContent>
    </Card>
  );
};

export default SizeRecommender;