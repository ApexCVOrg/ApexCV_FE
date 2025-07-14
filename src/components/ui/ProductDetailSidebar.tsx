import React, { useEffect, useState } from 'react';
import { Box, Typography, Divider, Button, Chip, Stack, CircularProgress } from '@mui/material';

interface ProductDetailSidebarProps {
  productId: string | null;
}

const ProductDetailSidebar: React.FC<ProductDetailSidebarProps> = ({ productId }) => {
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!productId) {
      setProduct(null);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/products/${productId}`)
      .then(res => {
        if (!res.ok) throw new Error('Không tìm thấy sản phẩm');
        return res.json();
      })
      .then(data => setProduct(data.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, [productId]);

  if (!productId) {
    return (
      <Box sx={{ width: 380, p: 3, position: 'fixed', right: 0, top: 80, bottom: 80, bgcolor: '#fff', boxShadow: 3, zIndex: 1200, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="text.secondary" align="center">
          Chọn sản phẩm để xem chi tiết
        </Typography>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ width: 380, p: 3, position: 'fixed', right: 0, top: 80, bottom: 80, bgcolor: '#fff', boxShadow: 3, zIndex: 1200, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box sx={{ width: 380, p: 3, position: 'fixed', right: 0, top: 80, bottom: 80, bgcolor: '#fff', boxShadow: 3, zIndex: 1200, borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" color="error" align="center">
          {error || 'Không tìm thấy sản phẩm'}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ width: 380, p: 3, position: 'fixed', right: 0, top: 80, bottom: 80, bgcolor: '#fff', boxShadow: 3, zIndex: 1200, borderRadius: 3, overflowY: 'auto' }}>
      <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
        {product.images?.map((img: string, idx: number) => (
          <Box key={typeof img === 'string' ? img : idx} sx={{ width: 60, height: 60, borderRadius: 2, overflow: 'hidden', border: '1px solid #eee', cursor: 'pointer' }}>
            <img src={typeof img === 'string' ? img : ''} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </Box>
        ))}
      </Box>
      <img src={product.images?.[0]} alt={product.name} style={{ width: '100%', borderRadius: 8, marginBottom: 16 }} />
      <Typography variant="h5" fontWeight={700}>{product.name}</Typography>
      <Stack direction="row" spacing={1} sx={{ my: 1 }}>
        {product.tags?.map((tag: string, idx: number) => (
          <Chip key={typeof tag === 'string' ? tag : idx} label={tag} size="small" color="primary" />
        ))}
      </Stack>
      <Typography variant="h6" color="primary" sx={{ mb: 1 }}>${product.price}</Typography>
      <Divider sx={{ my: 2 }} />
      {/* Ví dụ hiển thị size và số lượng */}
      <Typography variant="subtitle2" sx={{ mb: 1 }}>Size có sẵn:</Typography>
      <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
        {(product.sizes || ['US 7', 'US 8', 'US 9']).map((size: any, idx: number) => (
          <Chip key={typeof size === 'string' ? size : size?._id || idx} label={typeof size === 'string' ? size : size?.name || idx} variant="outlined" />
        ))}
      </Stack>
      <Button variant="contained" color="primary" fullWidth sx={{ mb: 2 }}>Thêm vào giỏ</Button>
      <Divider sx={{ my: 2 }} />
      <Typography variant="body2" color="text.secondary">{product.description || 'Mô tả sản phẩm sẽ hiển thị ở đây.'}</Typography>
    </Box>
  );
};

export default ProductDetailSidebar; 