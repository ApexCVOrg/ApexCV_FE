"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { TextField, Button, Paper, Typography, Box, Alert, Chip, CircularProgress, IconButton } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import styled from '@emotion/styled';

// Styled components for a cleaner structure and reusable styles
const StyledPaper = styled(Paper)`
  max-width: 550px;
  margin: 60px auto;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
`;

const Title = styled(Typography)`
  font-weight: 800;
  color: #1a202c;
  margin-bottom: 24px;
  text-align: center;
`;

const StyledTextField = styled(TextField)`
  margin-bottom: 20px !important;
  .MuiOutlinedInput-root {
    border-radius: 8px;
    background-color: #f9fafb;
    &:hover fieldset {
      border-color: #a0aec0;
    }
    &.Mui-focused fieldset {
      border-color: #3182ce;
      border-width: 2px;
    }
  }
  .MuiInputLabel-root.Mui-focused {
    color: #3182ce;
  }
`;

const StyledButton = styled(Button)`
  border-radius: 8px;
  font-weight: 700;
  padding: 12px 24px;
  box-shadow: 0 4px 10px rgba(0,0,0,0.08);
  transition: transform 0.2s ease-in-out, background-color 0.2s ease-in-out;
  &:hover {
    transform: translateY(-2px);
  }
`;

const ImagePreviewContainer = styled(Box)`
  display: flex;
  gap: 16px;
  margin-bottom: 20px;
  flex-wrap: wrap;
`;

const ImageWrapper = styled(Box)`
  position: relative;
  width: 90px;
  height: 90px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f7fafc;
`;

const PreviewImage = styled('img')`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled(IconButton)`
  position: absolute;
  top: -8px;
  right: -8px;
  background-color: rgba(255, 255, 255, 0.8);
  &:hover {
    background-color: white;
  }
  .MuiSvgIcon-root {
    color: #ef4444;
  }
`;

const AddImageButton = styled(StyledButton)`
  width: 90px;
  height: 90px;
  min-width: unset; // Override default min-width for small buttons
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px dashed #cbd5e0;
  color: #a0aec0;
  &:hover {
    border-color: #a0aec0;
    color: #718096;
    background-color: #f0f4f8;
  }
`;

const ChipContainer = styled(Box)`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

export default function RefundRequestPage() {
  const router = useRouter();
  const { orderId } = useParams();
  const { getToken } = useAuth();
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [order, setOrder] = useState<any>(null);
  const [refundHistory, setRefundHistory] = useState<any[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Lấy thông tin đơn hàng để hiển thị tổng tiền
    const fetchOrder = async () => {
      try {
        const token = getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/orders/${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );
        if (!res.ok) throw new Error("Không tìm thấy đơn hàng");
        const data = await res.json();
        setOrder(data);
        setAmount(data.totalPrice || 0);
      } catch (err: any) {
        setError(err.message || "Lỗi khi lấy thông tin đơn hàng");
      }
    };
    // Lấy lịch sử refund cho order này
    const fetchRefundHistory = async () => {
      try {
        const token = getToken();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/refund/history?orderId=${orderId}`,
          {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include",
          }
        );
        const data = await res.json();
        if (data.success) setRefundHistory(data.refunds || []);
      } catch {
        // Handle error silently or log if needed
      }
    };
    if (orderId) {
      fetchOrder();
      fetchRefundHistory();
    }
  }, [orderId, getToken]);

  // Kiểm tra số lần bị từ chối
  const rejectedRefunds = refundHistory.filter(r => r.status === 'rejected');
  const isRejectedLimit = rejectedRefunds.length >= 3;
  const lastRejectReason = rejectedRefunds.length ? rejectedRefunds[rejectedRefunds.length - 1].rejectReason : null;

  if (isRejectedLimit) {
    return (
      <StyledPaper sx={{ borderColor: "#ef4444" }}>
        <ErrorOutlineIcon sx={{ fontSize: 60, color: "#ef4444", mb: 2 }} />
        <Title variant="h5" sx={{ color: '#ef4444' }}>Bạn đã bị từ chối hoàn tiền 3 lần cho đơn này</Title>
        {lastRejectReason && <Alert severity="error" sx={{ mb: 3 }}>Lý do từ chối lần cuối: <b>{lastRejectReason}</b></Alert>}
        <StyledButton variant="contained" color="primary" onClick={() => router.push("/order-history")}>
          Quay lại lịch sử đơn hàng
        </StyledButton>
      </StyledPaper>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentImagesCount = images.length;
    const newImagesToAdd = files.slice(0, 3 - currentImagesCount);

    setImages(prev => [...prev, ...newImagesToAdd]);

    newImagesToAdd.forEach(file => {
      const reader = new FileReader();
      reader.onload = ev => setImagePreviews(prev => [...prev, ev.target?.result as string]);
      reader.readAsDataURL(file);
    });
    // Clear the input to allow selecting the same file(s) again if needed
    e.target.value = '';
  };

  const handleRemoveImage = (idx: number) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
    setImagePreviews(prev => prev.filter((_, i) => i !== idx));
  };

  const handleReasonSample = (sample: string) => setReason(sample);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const formData = new FormData();
      formData.append("orderId", orderId as string);
      formData.append("txnRef", order?.txnRef || order?._id || ""); // Use txnRef if available, otherwise _id
      formData.append("amount", String(amount));
      formData.append("reason", reason);
      images.forEach((file) => formData.append("images", file));

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/refund/request`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Gửi yêu cầu hoàn tiền thất bại");
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Gửi yêu cầu hoàn tiền thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <StyledPaper sx={{ borderColor: "#22c55e", textAlign: "center" }}>
        <CheckCircleOutlineIcon sx={{ fontSize: 60, color: "#22c55e", mb: 2 }} />
        <Title variant="h5" sx={{ color: '#22c55e' }}>Yêu cầu hoàn tiền đã được gửi!</Title>
        <Typography variant="body1" sx={{ mb: 3, color: '#4a5568' }}>Quản lý sẽ xem xét và phản hồi yêu cầu của bạn trong thời gian sớm nhất.</Typography>
        <StyledButton variant="contained" color="primary" onClick={() => router.push("/order-history")}>
          Quay lại lịch sử đơn hàng
        </StyledButton>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper>
      <Title variant="h5">Yêu cầu hoàn tiền</Title>
      {order && (
        <Box sx={{ mb: 3, p: 2, bgcolor: '#f0f4f8', borderRadius: '8px', border: '1px dashed #cbd5e0' }}>
          <Typography variant="body1" sx={{ mb: 0.5, fontWeight: 500 }}>Mã đơn: <Box component="span" sx={{ fontWeight: 700, color: '#2d3748' }}>#{order._id?.slice(-8).toUpperCase()}</Box></Typography>
          <Typography variant="body2" sx={{ mb: 0.5, color: '#4a5568' }}>Ngày đặt: {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : ""}</Typography>
          <Typography variant="body1" sx={{ fontWeight: 500 }}>Tổng tiền: <Box component="span" sx={{ fontWeight: 700, color: '#e53e3e' }}>{order.totalPrice?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</Box></Typography>
        </Box>
      )}
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
      <form onSubmit={handleSubmit}>
        <StyledTextField
          label="Số tiền muốn hoàn"
          type="number"
          value={amount}
          onChange={e => setAmount(Number(e.target.value))}
          fullWidth
          inputProps={{ min: 1000, max: order?.totalPrice || 100000000, step: 1000 }}
          required
        />
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Chọn lý do hoàn tiền</Typography>
          <ChipContainer>
            {["Sản phẩm lỗi", "Thiếu hàng", "Giao nhầm", "Không đúng mô tả", "Khác"].map(sample => (
              <Chip
                key={sample}
                label={sample}
                onClick={() => handleReasonSample(sample)}
                variant={reason === sample ? "filled" : "outlined"}
                color={reason === sample ? "primary" : "default"}
                sx={{ cursor: 'pointer', fontWeight: 600 }}
              />
            ))}
          </ChipContainer>
          <StyledTextField
            label="Lý do chi tiết"
            value={reason}
            onChange={e => setReason(e.target.value)}
            fullWidth
            multiline
            minRows={4}
            placeholder="Mô tả chi tiết lý do bạn muốn hoàn tiền..."
            required
          />
          <Typography variant="subtitle1" fontWeight={600} mb={1}>Ảnh minh chứng (tối đa 3 ảnh)</Typography>
          <ImagePreviewContainer>
            {imagePreviews.map((url, idx) => (
              <ImageWrapper key={idx}>
                <PreviewImage src={url} alt={`refund-img-${idx}`} />
                <RemoveImageButton size="small" onClick={() => handleRemoveImage(idx)}>
                  <DeleteIcon fontSize="small" />
                </RemoveImageButton>
              </ImageWrapper>
            ))}
            {images.length < 3 && (
              <AddImageButton
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
              >
                <ImageIcon fontSize="large" />
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  hidden
                  onChange={handleImageChange}
                />
              </AddImageButton>
            )}
          </ImagePreviewContainer>
        </Box>
        <StyledButton
          type="submit"
          variant="contained"
          color="error"
          fullWidth
          disabled={loading || !reason || amount <= 0}
        >
          {loading ? (
            <CircularProgress size={24} color="inherit" />
          ) : (
            "Gửi yêu cầu hoàn tiền"
          )}
        </StyledButton>
      </form>
    </StyledPaper>
  );
}