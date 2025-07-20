"use client"
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { CircularProgress, Container, Paper, Typography, Alert, Button } from "@mui/material";
import { useRouter } from "next/navigation";

export default function VnpayReturnPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'pending' | 'success' | 'fail'>('pending');
  const [detail, setDetail] = useState<any>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // Gửi toàn bộ query lên backend để xác thực
    const fetchStatus = async () => {
      const params = Object.fromEntries(searchParams.entries());
      const query = new URLSearchParams(params).toString();
      try {
        const res = await fetch(`/api/payment/vnpay/return?${query}`);
        const json = await res.json();
        setDetail(json.result || json.error || json);
        setMessage(json.message || '');
        if (json.result?.isSuccess) {
          setStatus('success');
        } else {
          setStatus('fail');
        }
      } catch (err) {
        setStatus('fail');
        setMessage('Lỗi xác thực kết quả thanh toán!');
      }
    };
    fetchStatus();
    // eslint-disable-next-line
  }, []);

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper elevation={3} sx={{ p: 4, textAlign: "center", borderRadius: 0, border: "2px solid black" }}>
        <Typography variant="h4" sx={{ fontWeight: 900, mb: 2 }}>
          Kết quả thanh toán VNPAY
        </Typography>
        {status === "pending" && <CircularProgress sx={{ color: "black", my: 4 }} />}
        {status === "success" && (
          <Alert severity="success" sx={{ fontWeight: 700, mb: 2 }}>
            {message || 'Thanh toán thành công!'}
          </Alert>
        )}
        {status === "fail" && (
          <Alert severity="error" sx={{ fontWeight: 700, mb: 2 }}>
            {message || 'Thanh toán thất bại!'}
          </Alert>
        )}
        <Button variant="contained" sx={{ mt: 3, borderRadius: 0 }} onClick={() => router.push("/")}>Về trang chủ</Button>
        <pre style={{ textAlign: "left", marginTop: 24, background: "#f5f5f5", padding: 12, borderRadius: 4, fontSize: 13 }}>
          {JSON.stringify(detail, null, 2)}
        </pre>
      </Paper>
    </Container>
  );
} 