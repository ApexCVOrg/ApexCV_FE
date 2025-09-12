'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Chip,
  CircularProgress,
  Alert,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material'
import { getUserPoints } from '../../services/api'
import SepayPayment from '../payment/SepayPayment'

interface UserPointsProps {
  userId?: string
  showActions?: boolean
}

const UserPoints: React.FC<UserPointsProps> = ({ userId, showActions = true }) => {
  const [points, setPoints] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [sepayOpen, setSepayOpen] = useState<boolean>(false)

  useEffect(() => {
    fetchUserPoints()
  }, [userId])

  const fetchUserPoints = async (): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      const response = await getUserPoints()
      setPoints(response.data.points)
    } catch (error: unknown) {
      setError('Không thể tải thông tin điểm')
      console.error('Error fetching user points:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSepaySuccess = (newPoints: number) => {
    setPoints(newPoints)
    setSepayOpen(false)
  }

  const handleRefresh = () => {
    fetchUserPoints()
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={2}>
            <CircularProgress size={24} />
            <Typography variant="body2" ml={1}>
              Đang tải thông tin điểm...
            </Typography>
          </Box>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent>
          <Alert severity="error" action={
            <Button color="inherit" size="small" onClick={handleRefresh}>
              Thử lại
            </Button>
          }>
            {error}
          </Alert>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box display="flex" alignItems="center" gap={2}>
              <WalletIcon color="primary" sx={{ fontSize: 32 }} />
              <Box>
                <Typography variant="h6" component="div">
                  Điểm tích lũy
                </Typography>
                <Typography variant="h4" color="primary" fontWeight="bold">
                  {points.toLocaleString()}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  điểm
                </Typography>
              </Box>
            </Box>

            {showActions && (
              <Box display="flex" gap={1}>
                <Tooltip title="Làm mới">
                  <IconButton onClick={handleRefresh} size="small">
                    <RefreshIcon />
                  </IconButton>
                </Tooltip>
                
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => setSepayOpen(true)}
                  size="small"
                >
                  Nạp điểm
                </Button>
              </Box>
            )}
          </Box>

          {points > 0 && (
            <Box mt={2}>
              <Chip
                label={`1 điểm = 1 VND`}
                color="primary"
                variant="outlined"
                size="small"
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <SepayPayment
        open={sepayOpen}
        onClose={() => setSepayOpen(false)}
        onSuccess={handleSepaySuccess}
      />
    </>
  )
}

export default UserPoints
