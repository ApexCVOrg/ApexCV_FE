'use client'

import React, { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
  Alert,
  Paper
} from '@mui/material'
import { QrCode as QrCodeIcon, Payment as PaymentIcon } from '@mui/icons-material'
import UserPoints from '../../../components/user/UserPoints'
import PointsHistory from '../../../components/user/PointsHistory'
import SepayPayment from '../../../components/payment/SepayPayment'

const SepayDemoPage: React.FC = () => {
  const [sepayOpen, setSepayOpen] = useState<boolean>(false)

  const handleSepaySuccess = () => {}

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box mb={4}>
        <Typography variant="h3" component="h1" gutterBottom align="center">
          Sepay Payment Demo
        </Typography>
        <Typography variant="h6" color="text.secondary" align="center">
          Hệ thống thanh toán và tích điểm qua Sepay
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {/* Thông tin điểm */}
        <Grid item xs={12} md={6}>
          <UserPoints showActions={true} />
        </Grid>

        {/* Thông tin Sepay */}
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <QrCodeIcon color="primary" sx={{ fontSize: 32 }} />
                <Typography variant="h6">
                  Thanh toán Sepay
                </Typography>
              </Box>
              
              <Typography variant="body1" paragraph>
                Nạp điểm vào tài khoản thông qua QR code Sepay
              </Typography>

              <Box mb={2}>
                <Alert severity="info">
                  <Typography variant="body2">
                    <strong>Tỷ lệ quy đổi:</strong> 1 VND = 1 điểm
                  </Typography>
                </Alert>
              </Box>

              <Button
                variant="contained"
                fullWidth
                startIcon={<PaymentIcon />}
                onClick={() => setSepayOpen(true)}
                size="large"
              >
                Nạp điểm qua Sepay
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Lịch sử giao dịch */}
        <Grid item xs={12}>
          <PointsHistory />
        </Grid>

        {/* Hướng dẫn sử dụng */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Hướng dẫn sử dụng
              </Typography>
              
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Bước 1
                    </Typography>
                    <Typography variant="body2">
                      Nhập số tiền muốn nạp (tối thiểu 1,000 VND)
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Bước 2
                    </Typography>
                    <Typography variant="body2">
                      Quét QR code bằng ứng dụng ngân hàng
                    </Typography>
                  </Paper>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Paper sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Bước 3
                    </Typography>
                    <Typography variant="body2">
                      Nhập mã giao dịch để xác nhận và nhận điểm
                    </Typography>
                  </Paper>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        </Grid>

        {/* Thông tin tài khoản Sepay */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Thông tin tài khoản Sepay
              </Typography>
              
              <Box display="flex" flexDirection="column" gap={1}>
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Ngân hàng:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    MBBank
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Số tài khoản:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    0949064234
                  </Typography>
                </Box>
                
                <Box display="flex" justifyContent="space-between">
                  <Typography variant="body2" color="text.secondary">
                    Chủ tài khoản:
                  </Typography>
                  <Typography variant="body2" fontWeight="bold">
                    ApexCV
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <SepayPayment
        open={sepayOpen}
        onClose={() => setSepayOpen(false)}
        onSuccess={handleSepaySuccess}
      />
    </Container>
  )
}

export default SepayDemoPage
