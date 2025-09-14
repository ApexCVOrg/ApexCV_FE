'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  Divider,
  IconButton,
  InputAdornment
} from '@mui/material'
import {
  QrCode as QrCodeIcon,
  AccountBalanceWallet as WalletIcon,
  CheckCircle as CheckCircleIcon,
  Close as CloseIcon,
  
} from '@mui/icons-material'
import { createSepayPayment, checkPaymentStatus, getUserPoints } from '../../services/api'

interface SepayPaymentProps {
  open: boolean
  onClose: () => void
  onSuccess?: (points: number) => void
}

interface PaymentData {
  qrCodeUrl: string
  sessionId: string
  amount: number
}

const SepayPayment: React.FC<SepayPaymentProps> = ({ open, onClose, onSuccess }) => {
  const [amount, setAmount] = useState<number>(10000) // Mặc định 10,000 VND
  const [description, setDescription] = useState<string>('Nạp điểm ApexCV')
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null)
  const [userPoints, setUserPoints] = useState<number>(0)
  const [activeStep, setActiveStep] = useState<number>(0)
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null)

  const steps = ['Nhập thông tin', 'Quét QR Code', 'Hoàn thành']

  // Lấy thông tin điểm của user khi component mount
  useEffect(() => {
    if (open) {
      fetchUserPoints()
    }
  }, [open])

  // Cleanup polling khi component unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval)
      }
    }
  }, [pollingInterval])

  const fetchUserPoints = async () => {
    try {
      const response = await getUserPoints()
      setUserPoints(response.data.points)
    } catch (error) {
      console.error('Error fetching user points:', error)
    }
  }

  const startPolling = (sessionId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await checkPaymentStatus(sessionId)
        if (status.paid && status.transaction) {
          // 1. Update user points after success - fetch latest balance
          try {
            const userPointsResponse = await getUserPoints()
            const latestPoints = userPointsResponse.data.points
            setUserPoints(latestPoints)
            
            // 2. Show success message from backend if available
            const successMessage = status.message || `Thanh toán thành công! Bạn đã nhận được ${status.transaction.points} điểm`
            setSuccess(successMessage)
            
            // Also pass the updated balance to the optional onSuccess callback
            if (onSuccess) {
              onSuccess(latestPoints)
            }
          } catch (pointsError) {
            console.error('Error fetching updated points:', pointsError)
            // Fallback to status data if getUserPoints fails
            setUserPoints(status.user?.points || 0)
            const successMessage = status.message || `Thanh toán thành công! Bạn đã nhận được ${status.transaction.points} điểm`
            setSuccess(successMessage)
            
            if (onSuccess && status.user) {
              onSuccess(status.user.points)
            }
          }
          
          setActiveStep(2)
          
          // Dừng polling
          clearInterval(interval)
          setPollingInterval(null)
        }
      } catch (error) {
        console.error('Error checking payment status:', error)
      }
    }, 3000) // Kiểm tra mỗi 3 giây
    
    setPollingInterval(interval)
  }

  const handleCreatePayment = async () => {
    if (amount < 1000) {
      setError('Số tiền tối thiểu là 1,000 VND')
      return
    }

    setLoading(true)
    setError('')
    setSuccess('')

    try {
      const response = await createSepayPayment({
        amount,
        description
      })

      setPaymentData(response)
      setActiveStep(1)
      setSuccess('QR code đã được tạo thành công!')
      
      // Bắt đầu polling để kiểm tra trạng thái thanh toán
      startPolling(response.sessionId)
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Có lỗi xảy ra khi tạo QR code'
      setError(message)
    } finally {
      setLoading(false)
    }
  }


  const handleClose = async () => {
    // Dừng polling nếu đang chạy
    if (pollingInterval) {
      clearInterval(pollingInterval)
      setPollingInterval(null)
    }
    
    // 3. Ensure dialog closes cleanly - refresh points one more time (just to be safe)
    if (activeStep === 2) {
      try {
        const userPointsResponse = await getUserPoints()
        const latestPoints = userPointsResponse.data.points
        setUserPoints(latestPoints)
        
        // Update parent component with latest points
        if (onSuccess) {
          onSuccess(latestPoints)
        }
      } catch (error) {
        console.error('Error fetching final points balance:', error)
      }
    }
    
    setAmount(10000)
    setDescription('Nạp điểm ApexCV')
    setError('')
    setSuccess('')
    setPaymentData(null)
    setActiveStep(0)
    onClose()
  }

  // copyToClipboard removed (unused)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box display="flex" alignItems="center" gap={1}>
            <WalletIcon color="primary" />
            <Typography variant="h6">Nạp điểm qua Sepay</Typography>
          </Box>
          <IconButton onClick={handleClose}>
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent>
        <Box mb={3}>
          <Stepper activeStep={activeStep} alternativeLabel>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Hiển thị điểm hiện tại */}
        <Box mb={3}>
          <Card variant="outlined">
            <CardContent>
              <Box display="flex" alignItems="center" gap={1}>
                <WalletIcon color="primary" />
                <Typography variant="h6">Điểm hiện tại: {userPoints.toLocaleString()}</Typography>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        {/* Bước 1: Nhập thông tin */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Thông tin thanh toán
            </Typography>
            
            <Box mb={2}>
              <TextField
                fullWidth
                label="Số tiền (VND)"
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₫</InputAdornment>,
                }}
                helperText="Tối thiểu 1,000 VND"
              />
            </Box>

            <Box mb={2}>
              <TextField
                fullWidth
                label="Mô tả giao dịch"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                multiline
                rows={2}
              />
            </Box>

            <Box mb={2}>
              <Alert severity="info">
                <Typography variant="body2">
                  <strong>Tỷ lệ quy đổi:</strong> 1 VND = 1 điểm
                </Typography>
                <Typography variant="body2">
                  Số điểm bạn sẽ nhận được: <strong>{amount.toLocaleString()} điểm</strong>
                </Typography>
              </Alert>
            </Box>
          </Box>
        )}

        {/* Bước 2: Quét QR Code */}
        {activeStep === 1 && paymentData && (
          <Box>
            <Typography variant="h6" gutterBottom>
              Quét QR Code để thanh toán
            </Typography>
            
            <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
              <Card variant="outlined" sx={{ p: 2 }}>
                <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                  <QrCodeIcon sx={{ fontSize: 100, color: 'primary.main' }} />
                  <Typography variant="body2" color="text.secondary">
                    Quét QR code bằng ứng dụng ngân hàng
                  </Typography>
                </Box>
              </Card>

              <Box width="100%" maxWidth={300}>
                <img
                  src={paymentData.qrCodeUrl}
                  alt="QR Code thanh toán"
                  style={{ width: '100%', height: 'auto' }}
                />
              </Box>

              <Box width="100%">
                <Typography variant="body2" color="text.secondary" gutterBottom>
                  Thông tin giao dịch:
                </Typography>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Số tiền:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {formatCurrency(paymentData.amount)}
                  </Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Mô tả:</Typography>
                  <Typography variant="body2">{description}</Typography>
                </Box>
                <Box display="flex" justifyContent="space-between" mb={1}>
                  <Typography variant="body2">Điểm nhận được:</Typography>
                  <Typography variant="body2" fontWeight="bold" color="primary">
                    {paymentData.amount.toLocaleString()} điểm
                  </Typography>
                </Box>
              </Box>

              <Divider sx={{ width: '100%' }} />

              <Box width="100%">
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Hướng dẫn:</strong>
                  </Typography>
                  <Typography variant="body2">
                    1. Quét QR code bằng ứng dụng ngân hàng
                  </Typography>
                  <Typography variant="body2">
                    2. Thực hiện thanh toán
                  </Typography>
                  <Typography variant="body2">
                    3. Điểm sẽ được tự động cộng vào tài khoản
                  </Typography>
                </Alert>
                
                <Box display="flex" alignItems="center" gap={1} mt={2}>
                  <CircularProgress size={16} />
                  <Typography variant="body2" color="text.secondary">
                    Đang chờ thanh toán...
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        )}

        {/* Bước 3: Xác nhận thành công */}
        {activeStep === 2 && (
          <Box textAlign="center">
            <CheckCircleIcon sx={{ fontSize: 80, color: 'success.main', mb: 2 }} />
            <Typography variant="h5" gutterBottom>
              Thanh toán thành công!
            </Typography>
            <Typography variant="body1" color="text.secondary" gutterBottom>
              Bạn đã nhận được {paymentData?.amount.toLocaleString()} điểm
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Điểm hiện tại: {userPoints.toLocaleString()}
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        {activeStep === 0 && (
          <Button onClick={handleCreatePayment} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Tạo QR Code'}
          </Button>
        )}

        {activeStep === 1 && (
          <Button variant="contained" disabled>
            Đang chờ thanh toán...
          </Button>
        )}

        {activeStep === 2 && (
          <Button onClick={handleClose} variant="contained">
            Hoàn thành
          </Button>
        )}

        <Button onClick={handleClose}>
          {activeStep === 2 ? 'Đóng' : 'Hủy'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default SepayPayment
