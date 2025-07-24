"use client";
import { useRouter, useParams } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { TextField, Button, Paper, Typography, Box, Alert, Chip, CircularProgress, IconButton, useTheme as useMuiTheme } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import ImageIcon from "@mui/icons-material/Image";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import styled from '@emotion/styled';

// Styled components for a cleaner structure and reusable styles
const StyledPaper = styled(Paper)({
  maxWidth: 600,
  margin: '60px auto',
  padding: 40,
  borderRadius: 12,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const Title = styled(Typography)({
  fontWeight: 600,
  marginBottom: 24,
  textAlign: 'center',
  fontSize: '2.2rem',
  letterSpacing: '-0.5px',
  fontFamily: 'Roboto, Helvetica, Arial, sans-serif',
});

const SectionTitle = styled(Typography)({
  fontWeight: 700,
  marginBottom: 16,
  fontSize: '1.1rem',
  alignSelf: 'flex-start',
});

const StyledTextField = styled(TextField)({
  marginBottom: '24px !important',
  '& .MuiOutlinedInput-root': {
    borderRadius: 10,
    '& fieldset': {
      transition: 'border-color 0.3s ease',
    },
  },
});

const StyledButton = styled(Button)({
  borderRadius: 10,
  fontWeight: 700,
  padding: '14px 28px',
  transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
  textTransform: 'uppercase',
  '&:hover': {
    transform: 'translateY(-3px)',
  },
  '&.MuiButton-containedError': {
    backgroundColor: '#f44336',
    '&:hover': {
      backgroundColor: '#d32f2f',
    },
  },
  '&.MuiButton-containedPrimary': {
    '&:hover': {
    },
  },
});

const ImagePreviewContainer = styled(Box)({
  display: 'flex',
  gap: 16,
  marginBottom: 24,
  flexWrap: 'wrap',
  justifyContent: 'flex-start',
  width: '100%',
});

const ImageWrapper = styled(Box)({
  position: 'relative',
  width: 100,
  height: 100,
  borderRadius: 10,
  overflow: 'hidden',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  boxShadow: '0 2px 5px rgba(0,0,0,0.05)',
});

const PreviewImage = styled('img')({
  width: '100%',
  height: '100%',
  objectFit: 'cover',
});

const RemoveImageButton = styled(IconButton)({
  position: 'absolute',
  top: -10,
  right: -10,
  border: '1px solid #ef5350',
  '&:hover': {
  },
  '& .MuiSvgIcon-root': {
    color: '#ef5350',
    fontSize: 20,
  },
});

const AddImageButton = styled(StyledButton)({
  width: 100,
  height: 100,
  minWidth: 'unset',
  padding: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  border: '2px dashed #90caf9',
  color: '#64b5f6',
  backgroundColor: '#e3f2fd',
  '&:hover': {
    borderColor: '#2196f3',
    color: '#1976d2',
    backgroundColor: '#bbdefb',
    transform: 'translateY(-2px)',
  },
  '& .MuiSvgIcon-root': {
    fontSize: 36,
    marginBottom: 4,
  },
  '& span': {
    fontSize: '0.75rem',
    fontWeight: 600,
  },
});

const ChipContainer = styled(Box)({
  display: 'flex',
  gap: 10,
  flexWrap: 'wrap',
  marginBottom: 20,
  width: '100%',
  justifyContent: 'flex-start',
});

const StyledChip = styled(Chip)({
  fontWeight: 600,
  padding: '8px 12px',
  borderRadius: 20,
  transition: 'all 0.2s ease-in-out',
  '&.MuiChip-filledPrimary': {
    '&:hover': {
    },
  },
  '&.MuiChip-outlined': {
    '&:hover': {
    },
  },
});

const InfoBox = styled(Box)({
  width: '100%',
  marginBottom: 30,
  padding: 20,
  borderRadius: 10,
  boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.05)',
});

const StatusAlert = styled(Alert)({
  borderRadius: 10,
  marginBottom: 24,
  fontWeight: 600,
  '& .MuiAlert-icon': {
    fontSize: 28,
  },
});

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
  const muiTheme = useMuiTheme();
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
      <Box sx={{
        backgroundColor: muiTheme.palette.mode === 'light' ? '#fff' : '#000',
        color: muiTheme.palette.mode === 'light' ? '#000' : '#fff',
        minHeight: '100vh',
        width: '100%',
      }}>
        <StyledPaper sx={{
          boxShadow: muiTheme.palette.mode === 'light' 
            ? '0 10px 30px rgba(0, 0, 0, 0.1)' 
            : '0 10px 30px rgba(0, 0, 0, 0.5)',
          border: `1px solid ${muiTheme.palette.mode === 'light' ? '#e0e0e0' : '#333'}`,
          backgroundColor: muiTheme.palette.mode === 'light' ? '#ffffff' : '#1a1a1a',
        }}>
          <ErrorOutlineIcon sx={{ fontSize: 70, color: "#ef4444", mb: 3 }} />
          <Title variant="h5" sx={{ color: '#ef4444' }}>Yêu cầu hoàn tiền bị từ chối</Title>
          <StatusAlert severity="error" sx={{
            backgroundColor: muiTheme.palette.mode === 'light' ? undefined : '#1a1a1a',
          }}>
            Bạn đã bị từ chối hoàn tiền **3 lần** cho đơn hàng này.
          </StatusAlert>
          {lastRejectReason && (
            <Alert severity="info" sx={{ 
              mb: 3, 
              width: '100%', 
              borderRadius: '10px',
              backgroundColor: muiTheme.palette.mode === 'light' ? undefined : '#1a1a1a',
            }}>
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
      </Box>
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
      <Box sx={{
        backgroundColor: muiTheme.palette.mode === 'light' ? '#fff' : '#000',
        color: muiTheme.palette.mode === 'light' ? '#000' : '#fff',
        minHeight: '100vh',
        width: '100%',
      }}>
        <StyledPaper sx={{
          boxShadow: muiTheme.palette.mode === 'light' 
            ? '0 10px 30px rgba(0, 0, 0, 0.1)' 
            : '0 10px 30px rgba(0, 0, 0, 0.5)',
          border: `1px solid ${muiTheme.palette.mode === 'light' ? '#e0e0e0' : '#333'}`,
          backgroundColor: muiTheme.palette.mode === 'light' ? '#ffffff' : '#1a1a1a',
        }}>
          <CheckCircleOutlineIcon sx={{ fontSize: 70, color: "#4caf50", mb: 3 }} />
          <Title variant="h5" sx={{ color: '#4caf50' }}>Yêu cầu hoàn tiền đã được gửi!</Title>
          <StatusAlert severity="success" sx={{
            backgroundColor: muiTheme.palette.mode === 'light' ? undefined : '#1a1a1a',
          }}>
            Yêu cầu của bạn đã được tiếp nhận và đang chờ quản lý xem xét.
          </StatusAlert>
          <Typography variant="body1" sx={{ 
            mb: 4, 
            color: muiTheme.palette.mode === 'light' ? '#616161' : '#ccc', 
            textAlign: 'center' 
          }}>
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
      </Box>
    );
  }

  return (
    <Box sx={{
      backgroundColor: muiTheme.palette.mode === 'light' ? '#fff' : '#000',
      color: muiTheme.palette.mode === 'light' ? '#000' : '#fff',
      minHeight: '100vh',
      width: '100%',
    }}>
      <StyledPaper sx={{
        boxShadow: muiTheme.palette.mode === 'light' 
          ? '0 10px 30px rgba(0, 0, 0, 0.1)' 
          : '0 10px 30px rgba(0, 0, 0, 0.5)',
        border: `1px solid ${muiTheme.palette.mode === 'light' ? '#e0e0e0' : '#333'}`,
        backgroundColor: muiTheme.palette.mode === 'light' ? '#ffffff' : '#1a1a1a',
      }}>
        <Title variant="h5" sx={{
          color: muiTheme.palette.mode === 'light' ? '#212121' : '#fff',
        }}>Yêu cầu hoàn tiền</Title>
        {order && (
          <InfoBox sx={{
            backgroundColor: muiTheme.palette.mode === 'light' ? '#f8f9fa' : '#2a2a2a',
            border: `1px solid ${muiTheme.palette.mode === 'light' ? '#e9ecef' : '#444'}`,
            boxShadow: muiTheme.palette.mode === 'light' 
              ? 'inset 0 1px 3px rgba(0,0,0,0.05)' 
              : 'inset 0 1px 3px rgba(0,0,0,0.2)',
          }}>
            <Typography variant="body1" sx={{ 
              mb: 0.5, 
              fontWeight: 500, 
              color: muiTheme.palette.mode === 'light' ? '#333' : '#fff' 
            }}>
              **Mã đơn hàng:** <Box component="span" sx={{ 
                fontWeight: 700, 
                color: muiTheme.palette.mode === 'light' ? '#2d3748' : '#fff' 
              }}>#{order._id?.slice(-8).toUpperCase()}</Box>
            </Typography>
            <Typography variant="body2" sx={{ 
              mb: 0.5, 
              color: muiTheme.palette.mode === 'light' ? '#616161' : '#ccc' 
            }}>
              **Ngày đặt:** {order.createdAt ? new Date(order.createdAt).toLocaleString("vi-VN") : "N/A"}
            </Typography>
            <Typography variant="body1" sx={{ 
              fontWeight: 500, 
              color: muiTheme.palette.mode === 'light' ? '#333' : '#fff' 
            }}>
              **Tổng giá trị đơn hàng:** <Box component="span" sx={{ 
                fontWeight: 700, 
                color: '#e53e3e' 
              }}>{order.totalPrice?.toLocaleString("vi-VN", { style: "currency", currency: "VND" })}</Box>
            </Typography>
          </InfoBox>
        )}

        {error && (
          <Alert severity="error" sx={{ 
            mb: 3, 
            borderRadius: '10px', 
            width: '100%',
            backgroundColor: muiTheme.palette.mode === 'light' ? undefined : '#1a1a1a',
          }}>
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <SectionTitle sx={{
            color: muiTheme.palette.mode === 'light' ? '#424242' : '#fff',
          }}>Số tiền muốn hoàn</SectionTitle>
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
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: muiTheme.palette.mode === 'light' ? '#fcfcfc' : '#2a2a2a',
                color: muiTheme.palette.mode === 'light' ? '#000' : '#fff',
                '& fieldset': {
                  borderColor: muiTheme.palette.mode === 'light' ? '#e0e0e0' : '#444',
                },
                '&:hover fieldset': {
                  borderColor: muiTheme.palette.mode === 'light' ? '#90caf9' : '#666',
                },
                '&.Mui-focused fieldset': {
                  borderColor: muiTheme.palette.mode === 'light' ? '#2196f3' : '#fff',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: muiTheme.palette.mode === 'light' ? '#2196f3' : '#fff',
              },
              '& .MuiInputLabel-root': {
                color: muiTheme.palette.mode === 'light' ? '#666' : '#ccc',
              },
              '& .MuiInputBase-input': {
                color: muiTheme.palette.mode === 'light' ? '#000' : '#fff',
              },
            }}
          />

          <SectionTitle sx={{
            color: muiTheme.palette.mode === 'light' ? '#424242' : '#fff',
          }}>Lý do hoàn tiền</SectionTitle>
          <ChipContainer>
            {["Sản phẩm lỗi", "Thiếu hàng", "Giao nhầm", "Không đúng mô tả", "Khác"].map(sample => (
              <StyledChip
                key={sample}
                label={sample}
                onClick={() => handleReasonSample(sample)}
                variant={reason === sample ? "filled" : "outlined"}
                color={reason === sample ? "primary" : "default"}
                sx={{
                  '&.MuiChip-filledPrimary': {
                    backgroundColor: muiTheme.palette.mode === 'light' ? '#111a2f' : '#fff',
                    color: muiTheme.palette.mode === 'light' ? '#fff' : '#000',
                    '&:hover': {
                      backgroundColor: muiTheme.palette.mode === 'light' ? '#222c4c' : '#f0f0f0',
                    },
                  },
                  '&.MuiChip-outlined': {
                    borderColor: muiTheme.palette.mode === 'light' ? '#9e9e9e' : '#666',
                    color: muiTheme.palette.mode === 'light' ? '#616161' : '#ccc',
                    '&:hover': {
                      backgroundColor: muiTheme.palette.mode === 'light' ? '#f5f5f5' : '#333',
                      borderColor: muiTheme.palette.mode === 'light' ? '#757575' : '#888',
                    },
                  },
                }}
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
            sx={{
              '& .MuiOutlinedInput-root': {
                backgroundColor: muiTheme.palette.mode === 'light' ? '#fcfcfc' : '#2a2a2a',
                color: muiTheme.palette.mode === 'light' ? '#000' : '#fff',
                '& fieldset': {
                  borderColor: muiTheme.palette.mode === 'light' ? '#e0e0e0' : '#444',
                },
                '&:hover fieldset': {
                  borderColor: muiTheme.palette.mode === 'light' ? '#90caf9' : '#666',
                },
                '&.Mui-focused fieldset': {
                  borderColor: muiTheme.palette.mode === 'light' ? '#2196f3' : '#fff',
                  borderWidth: 2,
                },
              },
              '& .MuiInputLabel-root.Mui-focused': {
                color: muiTheme.palette.mode === 'light' ? '#2196f3' : '#fff',
              },
              '& .MuiInputLabel-root': {
                color: muiTheme.palette.mode === 'light' ? '#666' : '#ccc',
              },
              '& .MuiInputBase-input': {
                color: muiTheme.palette.mode === 'light' ? '#000' : '#fff',
              },
            }}
          />

          <SectionTitle sx={{
            color: muiTheme.palette.mode === 'light' ? '#424242' : '#fff',
          }}>Ảnh minh chứng (tối đa 3 ảnh)</SectionTitle>
          <ImagePreviewContainer>
            {imagePreviews.map((url, idx) => (
              <ImageWrapper key={idx} sx={{
                border: `1px solid ${muiTheme.palette.mode === 'light' ? '#cfd8dc' : '#444'}`,
                backgroundColor: muiTheme.palette.mode === 'light' ? '#eceff1' : '#2a2a2a',
                boxShadow: muiTheme.palette.mode === 'light' 
                  ? '0 2px 5px rgba(0,0,0,0.05)' 
                  : '0 2px 5px rgba(0,0,0,0.2)',
              }}>
                <PreviewImage src={url} alt={`refund-img-${idx}`} />
                <RemoveImageButton size="small" onClick={() => handleRemoveImage(idx)} sx={{
                  backgroundColor: muiTheme.palette.mode === 'light' ? '#ffffff' : '#1a1a1a',
                  '&:hover': {
                    backgroundColor: muiTheme.palette.mode === 'light' ? '#ffebee' : '#2a2a2a',
                  },
                }}>
                  <DeleteIcon />
                </RemoveImageButton>
              </ImageWrapper>
            ))}
            {images.length < 3 && (
              <AddImageButton
                variant="outlined"
                onClick={() => fileInputRef.current?.click()}
                sx={{
                  border: `2px dashed ${muiTheme.palette.mode === 'light' ? '#90caf9' : '#666'}`,
                  color: muiTheme.palette.mode === 'light' ? '#64b5f6' : '#ccc',
                  backgroundColor: muiTheme.palette.mode === 'light' ? '#e3f2fd' : '#2a2a2a',
                  '&:hover': {
                    borderColor: muiTheme.palette.mode === 'light' ? '#2196f3' : '#fff',
                    color: muiTheme.palette.mode === 'light' ? '#1976d2' : '#fff',
                    backgroundColor: muiTheme.palette.mode === 'light' ? '#bbdefb' : '#333',
                  },
                }}
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
            sx={{ 
              mt: 3,
              boxShadow: muiTheme.palette.mode === 'light' 
                ? '0 6px 15px rgba(0,0,0,0.1)' 
                : '0 6px 15px rgba(0,0,0,0.3)',
              '&:hover': {
                boxShadow: muiTheme.palette.mode === 'light' 
                  ? '0 8px 20px rgba(0,0,0,0.15)' 
                  : '0 8px 20px rgba(0,0,0,0.5)',
              },
            }}
          >
            {loading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Gửi yêu cầu hoàn tiền"
            )}
          </StyledButton>
        </form>
      </StyledPaper>
    </Box>
  );
}