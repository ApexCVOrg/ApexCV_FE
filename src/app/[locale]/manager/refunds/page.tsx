"use client";
import { useEffect, useState } from "react";
import { Paper, Typography, Box, Button, Chip, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from "@mui/material";
import { useAuth } from "@/hooks/useAuth";

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
    } catch (err: any) {
      setError(err.message || "Lỗi lấy danh sách refund");
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
      setSuccessMsg("Đã duyệt hoàn tiền thành công!");
      fetchRefunds();
      setSelected(null);
    } catch (err: any) {
      setError(err.message || "Lỗi duyệt hoàn tiền");
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
      setSuccessMsg("Đã từ chối hoàn tiền!");
      fetchRefunds();
      setSelected(null);
      setRejectDialog(false);
      setRejectReason("");
    } catch (err: any) {
      setError(err.message || "Lỗi từ chối hoàn tiền");
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 900, mx: "auto", mt: 6, p: 2 }}>
      <Typography variant="h4" sx={{ fontWeight: 900, mb: 3 }}>Quản lý yêu cầu hoàn tiền</Typography>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {successMsg && <Alert severity="success" sx={{ mb: 2 }}>{successMsg}</Alert>}
      {loading ? <Typography>Đang tải...</Typography> : (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {refunds.length === 0 && <Typography>Không có yêu cầu hoàn tiền nào.</Typography>}
          {refunds.map(refund => (
            <Paper key={refund._id} sx={{ p: 3, borderRadius: 2, border: '2px solid #111a2f', bgcolor: '#fafbfc' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="h6" sx={{ fontWeight: 700 }}>
                  Mã đơn: {
                    typeof refund.orderId === 'object'
                      ? (refund.orderId && refund.orderId._id ? refund.orderId._id.slice(-8) : 'Đã xóa')
                      : (refund.orderId ? String(refund.orderId).slice(-8) : 'Đã xóa')
                  }
                </Typography>
                <Chip label={refund.status === 'pending' ? 'Chờ duyệt' : refund.status === 'accepted' ? 'Đã hoàn tiền' : 'Đã từ chối'} color={refund.status === 'pending' ? 'warning' : refund.status === 'accepted' ? 'success' : 'error'} sx={{ fontWeight: 700 }} />
              </Box>
              <Typography>Người yêu cầu: {typeof refund.userId === 'object' ? refund.userId.fullName || refund.userId._id : refund.userId}</Typography>
              <Typography>Số tiền hoàn: <b>{typeof refund.amount === 'number' ? refund.amount.toLocaleString('vi-VN', { style: 'currency', currency: 'VND' }) : 0}</b></Typography>
              <Typography>Lý do: {refund.reason}</Typography>
              {Array.isArray((refund as any).images) && (refund as any).images.length > 0 && (
                <Box sx={{ mt: 1, mb: 1, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {(refund as any).images.map((url: string, idx: number) => (
                    <a key={idx} href={url} target="_blank" rel="noopener noreferrer">
                      <img src={url} alt={`refund-img-${idx}`} style={{ width: 80, height: 80, borderRadius: 8, objectFit: 'cover', border: '1px solid #eee', cursor: 'pointer' }} />
                    </a>
                  ))}
                </Box>
              )}
              <Typography>Ngày yêu cầu: {new Date(refund.createdAt).toLocaleString('vi-VN')}</Typography>
              {refund.status === 'rejected' && refund.rejectReason && (
                <Alert severity="info" sx={{ mt: 1 }}>Lý do từ chối: {refund.rejectReason}</Alert>
              )}
              {refund.status === 'pending' && (
                <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
                  <Button variant="contained" color="success" sx={{ fontWeight: 700, borderRadius: 0 }} disabled={actionLoading} onClick={() => handleAccept(refund)}>Duyệt hoàn tiền</Button>
                  <Button variant="outlined" color="error" sx={{ fontWeight: 700, borderRadius: 0 }} disabled={actionLoading} onClick={() => { setSelected(refund); setRejectDialog(true); }}>Từ chối</Button>
                </Box>
              )}
            </Paper>
          ))}
        </Box>
      )}
      {/* Reject Reason Dialog */}
      <Dialog open={rejectDialog} onClose={() => setRejectDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Typography variant="h6" fontWeight={700}>
            Từ chối yêu cầu hoàn tiền
          </Typography>
        </DialogTitle>
        <DialogContent>
          <Box mb={2}>
            <Typography color="text.secondary">
              Vui lòng nhập lý do từ chối hoàn tiền cho khách hàng. Lý do này sẽ được gửi qua email cho khách.
            </Typography>
          </Box>
          <TextField
            label="Lý do từ chối"
            placeholder="Nhập lý do cụ thể..."
            multiline
            minRows={3}
            maxRows={6}
            fullWidth
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            error={!rejectReason.trim() && actionLoading}
            helperText={!rejectReason.trim() && actionLoading ? 'Vui lòng nhập lý do từ chối.' : ''}
            variant="outlined"
            InputProps={{
              style: { background: '#fafafa', borderRadius: 8 }
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectDialog(false)} color="inherit" variant="outlined">
            Hủy
          </Button>
          <Button
            onClick={() => {
              if (!rejectReason.trim()) return;
              handleReject();
            }}
            color="error"
            variant="contained"
            disabled={actionLoading}
          >
            Từ chối hoàn tiền
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 