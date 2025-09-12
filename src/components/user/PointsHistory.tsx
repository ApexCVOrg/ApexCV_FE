'use client'

import React, { useState, useEffect } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  CircularProgress,
  Alert,
  Button,
  Pagination,
  IconButton,
  Tooltip
} from '@mui/material'
import {
  AccountBalanceWallet as WalletIcon,
  Add as AddIcon,
  Remove as RemoveIcon,
  Refresh as RefreshIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material'
import { getPointsHistory } from '../../services/api'

interface Transaction {
  _id: string
  type: 'sepay_payment' | 'points_used' | 'points_earned' | 'refund'
  amount: number
  points: number
  transactionId?: string
  description?: string
  status: 'pending' | 'completed' | 'failed' | 'cancelled'
  createdAt: string
}

interface PointsHistoryProps {
  userId?: string
}

const PointsHistory: React.FC<PointsHistoryProps> = ({ userId }) => {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [page, setPage] = useState<number>(1)
  const [totalPages, setTotalPages] = useState<number>(1)
  const [total, setTotal] = useState<number>(0)

  useEffect(() => {
    fetchHistory()
  }, [page, userId])

  const fetchHistory = async () => {
    try {
      setLoading(true)
      setError('')
      const response = await getPointsHistory()
      setTransactions(response.data.history)
      setTotalPages(response.data.pagination.pages)
      setTotal(response.data.pagination.total)
    } catch (error: any) {
      setError('Không thể tải lịch sử giao dịch')
      console.error('Error fetching points history:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = () => {
    fetchHistory()
  }

  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'sepay_payment':
        return <AddIcon color="success" />
      case 'points_used':
        return <RemoveIcon color="error" />
      case 'points_earned':
        return <AddIcon color="success" />
      case 'refund':
        return <ReceiptIcon color="info" />
      default:
        return <WalletIcon />
    }
  }

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'sepay_payment':
        return 'Nạp điểm Sepay'
      case 'points_used':
        return 'Sử dụng điểm'
      case 'points_earned':
        return 'Tích điểm'
      case 'refund':
        return 'Hoàn điểm'
      default:
        return 'Giao dịch'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success'
      case 'pending':
        return 'warning'
      case 'failed':
        return 'error'
      case 'cancelled':
        return 'default'
      default:
        return 'default'
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('vi-VN', {
      style: 'currency',
      currency: 'VND'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="center" py={4}>
            <CircularProgress size={24} />
            <Typography variant="body2" ml={1}>
              Đang tải lịch sử giao dịch...
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
    <Card>
      <CardContent>
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
          <Box display="flex" alignItems="center" gap={1}>
            <ReceiptIcon color="primary" />
            <Typography variant="h6">
              Lịch sử giao dịch điểm
            </Typography>
            <Chip label={`${total} giao dịch`} size="small" color="primary" variant="outlined" />
          </Box>
          
          <Tooltip title="Làm mới">
            <IconButton onClick={handleRefresh} size="small">
              <RefreshIcon />
            </IconButton>
          </Tooltip>
        </Box>

        {transactions.length === 0 ? (
          <Box textAlign="center" py={4}>
            <ReceiptIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Chưa có giao dịch nào
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Lịch sử giao dịch điểm sẽ hiển thị ở đây
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Loại giao dịch</TableCell>
                    <TableCell align="right">Số tiền</TableCell>
                    <TableCell align="right">Điểm</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell>Thời gian</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction._id} hover>
                      <TableCell>
                        <Box display="flex" alignItems="center" gap={1}>
                          {getTransactionIcon(transaction.type)}
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {getTransactionLabel(transaction.type)}
                            </Typography>
                            {transaction.description && (
                              <Typography variant="caption" color="text.secondary">
                                {transaction.description}
                              </Typography>
                            )}
                            {transaction.transactionId && (
                              <Typography variant="caption" color="text.secondary" display="block">
                                ID: {transaction.transactionId}
                              </Typography>
                            )}
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell align="right">
                        <Typography variant="body2" fontWeight="medium">
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="right">
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color={transaction.points > 0 ? 'success.main' : 'error.main'}
                        >
                          {transaction.points > 0 ? '+' : ''}{transaction.points.toLocaleString()}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={transaction.status}
                          color={getStatusColor(transaction.status) as any}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {formatDate(transaction.createdAt)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {totalPages > 1 && (
              <Box display="flex" justifyContent="center" mt={3}>
                <Pagination
                  count={totalPages}
                  page={page}
                  onChange={handlePageChange}
                  color="primary"
                />
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export default PointsHistory
