"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { TextField, Button, Paper, Typography, Box, Alert, Chip, CircularProgress, IconButton } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styled from '@emotion/styled';

// Styled components for a cleaner structure and reusable styles
const StyledPaper = styled(Paper)`
  max-width: 600px;
  margin: 60px auto;
  padding: 40px;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled(Typography)`
  font-weight: 600; /* Adjusted from 400 to 600 for a slightly bolder, but not too heavy, look */
  color: #212121;
  margin-bottom: 24px;
  text-align: center;
  font-size: 2.2rem;
  letter-spacing: -0.5px;
  /* Material-UI's default font family (Roboto) generally handles Vietnamese characters well.
     If you have a specific custom font that supports Vietnamese, you can add it here. */
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif;
`;

const SectionTitle = styled(Typography)`
  font-weight: 700;
  color: #424242;
  margin-bottom: 16px;
  font-size: 1.1rem;
  align-self: flex-start;
`;

const StyledTextField = styled(TextField)`
  margin-bottom: 24px !important;
  .MuiOutlinedInput-root {
    border-radius: 10px;
    background-color: #fcfcfc;
    fieldset {
      border-color: #e0e0e0;
      transition: border-color 0.3s ease;
    }
    &:hover fieldset {
      border-color: #90caf9;
    }
    &.Mui-focused fieldset {
      border-color: #2196f3;
      border-width: 2px;
    }
  }
  .MuiInputLabel-root.Mui-focused {
    color: #2196f3;
  }
`;

const StyledButton = styled(Button)`
  border-radius: 10px;
  font-weight: 700;
  padding: 14px 28px;
  box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  text-transform: uppercase;
  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 8px 20px rgba(0,0,0,0.15);
  }
  &.MuiButton-containedError {
    background-color: #f44336;
    &:hover {
      background-color: #d32f2f;
    }
  }
  &.MuiButton-containedPrimary {
    background-color: #2196f3;
    &:hover {
      background-color: #1976d2;
    }
  }
`;

const ImagePreviewContainer = styled(Box)`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 100%;
`;

const ImageWrapper = styled(Box)`
  position: relative;
  width: 100px;
  height: 100px;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #cfd8dc;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #eceff1;
  box-shadow: 0 2px 5px rgba(0,0,0,0.05);
`;

const PreviewImage = styled('img')`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const RemoveImageButton = styled(IconButton)`
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #ffffff;
  border: 1px solid #ef5350;
  &:hover {
    background-color: #ffebee;
  }
  .MuiSvgIcon-root {
    color: #ef5350;
    font-size: 20px;
  }
`;

const AddImageButton = styled(StyledButton)`
  width: 100px;
  height: 100px;
  min-width: unset;
  padding: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed #90caf9;
  color: #64b5f6;
  background-color: #e3f2fd;
  &:hover {
    border-color: #2196f3;
    color: #1976d2;
    background-color: #bbdefb;
    transform: translateY(-2px);
  }
  .MuiSvgIcon-root {
    font-size: 36px;
    margin-bottom: 4px;
  }
  span {
    font-size: 0.75rem;
    font-weight: 600;
  }
`;

const ChipContainer = styled(Box)`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 20px;
  width: 100%;
  justify-content: flex-start;
`;

const StyledChip = styled(Chip)`
  font-weight: 600;
  padding: 8px 12px;
  border-radius: 20px;
  transition: all 0.2s ease-in-out;
  &.MuiChip-filledPrimary {
    background-color: #2196f3;
    color: white;
    &:hover {
      background-color: #1976d2;
    }
  }
  &.MuiChip-outlined {
    border-color: #9e9e9e;
    color: #616161;
    &:hover {
      background-color: #f5f5f5;
      border-color: #757575;
    }
  }
`;

const InfoBox = styled(Box)`
  width: 100%;
  margin-bottom: 30px;
  padding: 20px;
  background-color: #f8f9fa;
  border-radius: 10px;
  border: 1px solid #e9ecef;
  box-shadow: inset 0 1px 3px rgba(0,0,0,0.05);
`;

const StatusAlert = styled(Alert)`
  border-radius: 10px;
  margin-bottom: 24px;
  font-weight: 600;
  .MuiAlert-icon {
    font-size: 28px;
  }
`;

interface Order {
  _id: string;
  txnRef?: string;
  createdAt?: string;
  totalPrice?: number;
  // ... các trường khác nếu cần
}

interface Refund {
  status: string;
  rejectReason?: string;
  // ... các trường khác nếu cần
}

export default function RefundRequestPage() {
  const router = useRouter();
  const { orderId } = useParams();
  const { getToken } = useAuth();
  const [amount, setAmount] = useState(0);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [order, setOrder] = useState<Order | null>(null);
  const [refundHistory, setRefundHistory] = useState<Refund[]>([]);
  const [images, setImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
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
      } catch (err: unknown) {
        if (err instanceof Error) setError(err.message || "Lỗi khi lấy thông tin đơn hàng");
      }
    };

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

  const rejectedRefunds = refundHistory.filter(r => r.status === 'rejected');
  const isRejectedLimit = rejectedRefunds.length >= 3;
  const lastRejectReason = rejectedRefunds.length ? rejectedRefunds[rejectedRefunds.length - 1].rejectReason : null;

  if (isRejectedLimit) {
    return (
      <StyledPaper>
        <ErrorOutlineIcon sx={{ fontSize: 70, color: "#ef4444", mb: 3 }} />
        <Title variant="h5" sx={{ color: '#ef4444' }}>Yêu cầu hoàn tiền bị từ chối</Title>
        <StatusAlert severity="error">
          Bạn đã bị từ chối hoàn tiền **3 lần** cho đơn hàng này.
        </StatusAlert>
        {lastRejectReason && (
          <Alert severity="info" sx={{ mb: 3, width: '100%', borderRadius: '10px' }}>
            **Lý do từ chối lần cuối:** {lastRejectReason}
          </Alert>
        )}
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/order-history")}
          sx={{ mt: 2 }}
        >
          Quay lại lịch sử đơn hàng
        </StyledButton>
      </StyledPaper>
    );
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const currentImagesCount = images.length;
    // Allow adding up to 3 images in total
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
      formData.append("txnRef", order?.txnRef || order?._id || "");
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
    } catch (err: unknown) {
      if (err instanceof Error) setError(err.message || "Gửi yêu cầu hoàn tiền thất bại");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <StyledPaper>
        <CheckCircleOutlineIcon sx={{ fontSize: 70, color: "#4caf50", mb: 3 }} />
        <Title variant="h5" sx={{ color: '#4caf50' }}>Yêu cầu hoàn tiền đã được gửi!</Title>
        <StatusAlert severity="success">
          Yêu cầu của bạn đã được tiếp nhận và đang chờ quản lý xem xét.
        </StatusAlert>
        <Typography variant="body1" sx={{ mb: 4, color: '#616161', textAlign: 'center' }}>
          Chúng tôi sẽ phản hồi yêu cầu của bạn trong thời gian sớm nhất.
        </Typography>
        <StyledButton
          variant="contained"
          color="primary"
          startIcon={<ArrowBackIcon />}
          onClick={() => router.push("/order-history")}
        >
          Quay lại lịch sử đơn hàng
        </StyledButton>
      </StyledPaper>
    );
  }

  return (
    <StyledPaper>
      <Title variant="h5">Yêu cầu hoàn tiền</Title>
      {order && (
        <InfoBox>
          <Typography variant="body1" sx={{ mb: 0.5, fontWeight: 500, color: '#333' }}>
            **Mã đơn hàng:** <Box component="span" sx={{ fontWeight: 700, color: '#2d3748' }}>#{order._id?.slice(-8).toUpperCase()}</Box>
          </Typography>
          <Typography variant="body2" sx={{ mb: 0.5, color: '#616161' }}>
            **Ngày đặt:** {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "N/A"}
          </Typography>
          <Typography variant="body1" sx={{ fontWeight: 500, color: '#333' }}>
            **Tổng giá trị đơn hàng:** <Box component="span" sx={{ fontWeight: 700, color: '#e53e3e' }}>{order.totalPrice?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</Box>
          </Typography>
        </InfoBox>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: '10px', width: '100%' }}>
          {error}
        </Alert>
      )}

      <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <SectionTitle>Số tiền muốn hoàn</SectionTitle>
        <StyledTextField
          label="Số tiền hoàn lại"
          type="text" // Use text to display formatted currency, handle conversion internally if needed
          value={amount.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}
          disabled
          fullWidth
          InputProps={{
            readOnly: true,
            style: { fontWeight: 700, color: '#e53e3e' }
          }}
        />

        <SectionTitle>Lý do hoàn tiền</SectionTitle>
        <ChipContainer>
          {["Sản phẩm lỗi", "Thiếu hàng", "Giao nhầm", "Không đúng mô tả", "Khác"].map(sample => (
            <StyledChip
              key={sample}
              label={sample}
              onClick={() => handleReasonSample(sample)}
              variant={reason === sample ? "filled" : "outlined"}
              color={reason === sample ? "primary" : "default"}
            />
          ))}
        </ChipContainer>
        <StyledTextField
          label="Mô tả chi tiết lý do của bạn"
          value={reason}
          onChange={e => setReason(e.target.value)}
          fullWidth
          multiline
          minRows={4}
          placeholder="Ví dụ: Sản phẩm bị rách ở phần cổ áo, màu sắc không giống hình mẫu..."
          required
        />

        <SectionTitle>Ảnh minh chứng (tối đa 3 ảnh)</SectionTitle>
        <ImagePreviewContainer>
          {imagePreviews.map((url, idx) => (
            <ImageWrapper key={idx}>
              <PreviewImage src={url} alt={`refund-img-${idx}`} />
              <RemoveImageButton size="small" onClick={() => handleRemoveImage(idx)}>
                <DeleteIcon />
              </RemoveImageButton>
            </ImageWrapper>
          ))}
          {images.length < 3 && (
            <AddImageButton
              variant="outlined"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon />
              <span>Thêm ảnh</span>
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

        <StyledButton
          type="submit"
          variant="contained"
          color="error"
          fullWidth
          disabled={loading || !reason || amount <= 0}
          sx={{ mt: 3 }}
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