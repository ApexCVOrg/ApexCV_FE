"use client";
import { useEffect, useState } from "react";
import { Paper, Typography, Box, Button, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert, CircularProgress } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";
import styled from '@emotion/styled';
import Image from 'next/image'; // Use next/image for optimized images

interface RefundRequest {
  _id: string;
  orderId: { _id: string } | string;
  userId: { _id: string; fullName?: string } | string;
  txnRef: string;
  amount: number;
  reason: string;
  status: "pending" | "accepted" | "rejected";
  managerId?: { _id: string; fullName?: string } | string;
  rejectReason?: string;
  createdAt: string;
  updatedAt: string;
  images?: string[];
}

// Styled components
const PageContainer = styled(Box)`
  max-width: 960px;
  margin: 60px auto;
  padding: 24px;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.05);
`;

const PageTitle = styled(Typography)`
  font-weight: 600; /* Slightly bolder, suitable for titles */
  color: #212121;
  margin-bottom: 32px;
  text-align: center;
  font-size: 2.5rem;
  letter-spacing: -0.8px;
  font-family: 'Roboto', 'Helvetica', 'Arial', sans-serif; /* Explicitly set font-family */
`;

const StyledRefundCard = styled(Paper)`
  padding: 28px;
  border-radius: 12px;
  border: 1px solid #e0e0e0;
  background-color: #ffffff;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.12);
  }
`;

const CardHeader = styled(Box)`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
`;

const StyledChip = styled(Chip)`
  font-weight: 700;
  font-size: 0.9rem;
  padding: 4px 8px;
  border-radius: 8px;
  text-transform: uppercase;
`;

const InfoText = styled(Typography)`
  margin-bottom: 8px;
  color: #424242;
  font-size: 1rem;
  line-height: 1.5;
  b {
    font-weight: 700;
    color: #212121;
  }
`;

const ImagePreviewContainer = styled(Box)`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
`;

const StyledImage = styled(Image)`
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid #ddd;
  transition: transform 0.2s ease;
  &:hover {
    transform: scale(1.05);
  }
`;

const ActionButtonsContainer = styled(Box)`
  margin-top: 20px;
  display: flex;
  gap: 16px;
  justify-content: flex-end; /* Align buttons to the right */
`;

const StyledButton = styled(Button)`
  font-weight: 700;
  padding: 10px 20px;
  border-radius: 8px;
  text-transform: uppercase;
  box-shadow: 0 4px 10px rgba(0,0,0,0.05);
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 15px rgba(0,0,0,0.1);
  }
`;

const StyledDialogTitle = styled(DialogTitle)`
  background-color: #f5f5f5;
  padding: 20px 24px;
  border-bottom: 1px solid #eee;
  h2 {
    font-weight: 700;
    color: #333;
    font-size: 1.4rem;
  }
`;

const StyledDialogContent = styled(DialogContent)`
  padding: 24px !important;
  .MuiTextField-root {
    margin-top: 16px;
  }
`;

const StyledDialogActions = styled(DialogActions)`
  padding: 16px 24px;
  border-top: 1px solid #eee;
  justify-content: flex-end;
`;

export default function ManagerRefundsPage() {
  const { getToken } = useAuth();
  const [refunds, setRefunds] = useState<RefundRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selected, setSelected] = useState<RefundRequest | null>(null);
  const [rejectDialog, setRejectDialog] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [actionLoading, setActionLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");

  const fetchRefunds = async () => {
    setLoading(true);
    setError("");
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/refund/requests`, {
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Lỗi lấy danh sách refund");
      setRefunds(data.refunds);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Lỗi lấy danh sách refund");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchRefunds(); }, []);

  const handleAccept = async (refund: RefundRequest) => {
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/refund/accept/${refund._id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Lỗi duyệt hoàn tiền");
      setSuccessMsg("Đã duyệt yêu cầu hoàn tiền thành công!");
      fetchRefunds(); // Re-fetch to update the status
      setSelected(null);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Lỗi duyệt hoàn tiền");
      }
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!selected) return;
    setActionLoading(true);
    setError("");
    setSuccessMsg("");
    try {
      const token = getToken();
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/refund/reject/${selected._id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rejectReason }),
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message || "Lỗi từ chối hoàn tiền");
      setSuccessMsg("Đã từ chối yêu cầu hoàn tiền!");
      fetchRefunds(); // Re-fetch to update the status
      setSelected(null);
      setRejectDialog(false);
      setRejectReason("");
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message || "Lỗi từ chối hoàn tiền");
      }
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <PageContainer>
      <PageTitle variant="h4">Quản lý yêu cầu hoàn tiền</PageTitle>
      {error && <Alert severity="error" sx={{ mb: 3, borderRadius: '8px' }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 3, borderRadius: '8px' }}>{successMsg}</Alert>}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
          <CircularProgress size={40} />
          <Typography variant="h6" sx={{ ml: 2, color: '#555' }}>Đang tải danh sách yêu cầu...</Typography>
        </Box>
      ) : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {refunds.length === 0 ? (
            <Typography variant="body1" sx={{ textAlign: 'center', color: '#757575', mt: 4 }}>
              Không có yêu cầu hoàn tiền nào đang chờ xử lý.
            </Typography>
          ) : (
            refunds.map(refund => (
              <StyledRefundCard key={refund._id}>
                <CardHeader>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: '#1a202c' }}>
                    Yêu cầu cho đơn: <Box component="span" sx={{ color: '#007bff' }}>#{
                      typeof refund.orderId === 'object'
                        ? (refund.orderId && refund.orderId._id ? refund.orderId._id.slice(-8).toUpperCase() : 'Đã xóa')
                        : (refund.orderId ? String(refund.orderId).slice(-8).toUpperCase() : 'Đã xóa')
                    }</Box>
                  </Typography>
                  <StyledChip
                    label={refund.status === 'pending' ? 'Chờ duyệt' : refund.status === 'accepted' ? 'Đã hoàn tiền' : 'Đã từ chối'}
                    color={refund.status === 'pending' ? 'warning' : refund.status === 'accepted' ? 'success' : 'error'}
                  />
                </CardHeader>

                <InfoText>
                  Người yêu cầu: <b>{typeof refund.userId === 'object' ? refund.userId.fullName || 'Người dùng ẩn danh' : 'ID: ' + refund.userId}</b>
                </InfoText>
                <InfoText>
                  Số tiền hoàn: <b>{typeof refund.amount === 'number' ? refund.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 'N/A'}</b>
                </InfoText>
                <InfoText>
                  Lý do: <b>{refund.reason}</b>
                </InfoText>
                {Array.isArray(refund.images) && refund.images.length > 0 && (
                  <ImagePreviewContainer>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#555', width: '100%', mb: 0.5 }}>Ảnh minh chứng:</Typography>
                    {refund.images.map((url: string, idx: number) => (
                      <a key={idx} href={url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <StyledImage src={url} alt={`refund-img-${idx}`} width={90} height={90} />
                      </a>
                    ))}
                  </ImagePreviewContainer>
                )}
                <InfoText sx={{ fontSize: '0.9rem', color: '#757575' }}>
                  Ngày yêu cầu: {new Date(refund.createdAt).toLocaleString('vi-VN', {
                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                  })}
                </InfoText>
                {refund.status === 'rejected' && refund.rejectReason && (
                  <Alert severity="info" sx={{ mt: 2, borderRadius: '8px', bgcolor: '#e3f2fd', color: '#1976d2', fontWeight: 500 }}>
                    Lý do từ chối: <b>{refund.rejectReason}</b>
                  </Alert>
                )}

                {refund.status === 'pending' && (
                  <ActionButtonsContainer>
                    <StyledButton
                      variant="contained"
                      color="success"
                      disabled={actionLoading}
                      onClick={() => handleAccept(refund)}
                    >
                      Duyệt hoàn tiền
                    </StyledButton>
                    <StyledButton
                      variant="outlined"
                      color="error"
                      disabled={actionLoading}
                      onClick={() => { setSelected(refund); setRejectDialog(true); }}
                    >
                      Từ chối
                    </StyledButton>
                  </ActionButtonsContainer>
                )}
              </StyledRefundCard>
            ))
          )}
        </Box>
      )}

      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <StyledDialogTitle>
          <Typography variant="h6">
            Từ chối yêu cầu hoàn tiền
          </Typography>
        </StyledDialogTitle>
        <StyledDialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Vui lòng nhập lý do từ chối hoàn tiền cho khách hàng. Lý do này sẽ được gửi qua email cho khách.
          </Typography>
          <TextField
            label="Lý do từ chối"
            placeholder="Nhập lý do cụ thể..."
            multiline
            minRows={4}
            maxRows={6}
            fullWidth
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            error={!rejectReason.trim() && actionLoading}
            helperText={!rejectReason.trim() && actionLoading ? 'Vui lòng nhập lý do từ chối.' : ''}
            variant="outlined"
            InputProps={{
              style: { background: '#fcfcfc', borderRadius: 8 }
            }}
          />
        </StyledDialogContent>
        <StyledDialogActions>
          <StyledButton onClick={() => setRejectDialog(false)} color="inherit" variant="outlined">
            Hủy
          </StyledButton>
          <StyledButton
            onClick={() => {
              if (!rejectReason.trim()) {
                setActionLoading(true); // Trigger error message display
                return;
              }
              handleReject();
            }}
            color="error"
            variant="contained"
            disabled={actionLoading || !rejectReason.trim()}
          >
            {actionLoading ? <CircularProgress size={24} color="inherit" /> : "Từ chối hoàn tiền"}
          </StyledButton>
        </StyledDialogActions>
      </Dialog>
    </PageContainer>
  );
}