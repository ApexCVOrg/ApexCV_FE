'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  SelectChangeEvent,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Chat as ChatIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useTranslations } from 'next-intl';

interface ChatSession {
  _id: string;
  chatId: string;
  userId: string;
  userName: string;
  lastMessage: string | { content: string; role?: string; createdAt?: string };
  messageCount: number;
  status: 'active' | 'closed' | 'pending';
  createdAt: string;
  updatedAt: string;
}

interface ChatSessionsResponse {
  data: ChatSession[];
  total: number;
  page: number;
  limit: number;
}

const ChatSessionsPage = () => {
  const router = useRouter();
  // const theme = useTheme();
  const { isAuthenticated, getToken } = useAuth();
  const t = useTranslations('admin.chats');

  // State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [mounted, setMounted] = useState(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Fetch chat sessions
  const fetchChatSessions = async () => {
    if (!isAuthenticated) {
      console.log('❌ User not authenticated');
      return;
    }

    console.log('🌍 Environment API URL:', process.env.NEXT_PUBLIC_API_URL);
    console.log('🌍 Fallback API URL:', process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api');

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      console.log('🔑 Token:', token ? 'Token exists' : 'No token');
      
      if (!token) {
        setError('Authentication token not found. Please login again.');
        return;
      }

      // Get user from localStorage or context to check role
      const userStr = localStorage.getItem('user');
      console.log('💾 User string from localStorage:', userStr);
      const user = userStr ? JSON.parse(userStr) : null;
      console.log('👤 User data:', user);
      console.log('🏷️ User role:', user?.role);
      console.log('🔍 Is admin check:', user?.role === 'admin');

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      // Use different endpoint based on user role
      const endpoint = user?.role === 'admin' ? 'admin' : 'manager';
      const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/${endpoint}/chats?${queryParams}`;
      console.log('🌐 API URL:', apiUrl);
      console.log('📊 Query params:', {
        page: page + 1,
        limit: rowsPerPage,
        search: searchTerm,
        status: statusFilter !== 'all' ? statusFilter : undefined
      });

      const response = await fetch(apiUrl, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Response error text:', errorText);
        
        // Handle 403 for admin users FIRST - before any other logic
        // Check both 'admin' and 'ADMIN' and also if we're in admin panel
        const isAdminUser = user?.role === 'admin' || user?.role === 'ADMIN' || window.location.pathname.includes('/admin/');
        console.log('🔍 Admin user check result:', isAdminUser);
        
        if (response.status === 403 && isAdminUser) {
          console.log('🔒 Admin user got 403, providing demo data immediately...');
          
          const mockData = {
            data: [
              {
                _id: 'mock-1',
                chatId: 'admin-demo-001',
                userId: 'user-001',
                userName: 'Nguyễn Văn A',
                lastMessage: 'Xin chào! Tôi cần hỗ trợ về sản phẩm giày thể thao.',
                messageCount: 5,
                status: 'active' as const,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
              },
              {
                _id: 'mock-2',
                chatId: 'admin-demo-002',
                userId: 'user-002',
                userName: 'Trần Thị B',
                lastMessage: 'Cảm ơn bạn đã hỗ trợ! Sản phẩm rất tốt.',
                messageCount: 12,
                status: 'closed' as const,
                createdAt: new Date(Date.now() - 86400000).toISOString(),
                updatedAt: new Date(Date.now() - 3600000).toISOString(),
              },
              {
                _id: 'mock-3',
                chatId: 'admin-demo-003',
                userId: 'user-003',
                userName: 'Lê Minh C',
                lastMessage: 'Tôi muốn đổi size áo...',
                messageCount: 8,
                status: 'pending' as const,
                createdAt: new Date(Date.now() - 172800000).toISOString(),
                updatedAt: new Date(Date.now() - 7200000).toISOString(),
              }
            ],
            total: 3,
            page: 1,
            limit: 10
          };
          
          console.log('✅ Providing demo data for admin:', mockData);
          setError(null);
          setSessions(mockData.data);
          setTotal(mockData.total);
          return;
        }
        
        // If admin endpoint doesn't exist, fallback to manager endpoint
        if (response.status === 404 && endpoint === 'admin') {
          console.log('🔄 Admin endpoint not found, trying manager endpoint...');
          const fallbackUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api'}/manager/chats?${queryParams}`;
          console.log('🔄 Fallback URL:', fallbackUrl);
          
          const fallbackResponse = await fetch(fallbackUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          
          console.log('🔄 Fallback response status:', fallbackResponse.status);
          
          if (fallbackResponse.status === 403 && isAdminUser) {
            // Handle 403 for admin users - they don't have manager permissions
            console.log('🔒 Admin user cannot access manager endpoint, providing demo data...');
            const mockData = {
              data: [
                {
                  _id: 'mock-1',
                  chatId: 'admin-demo-001',
                  userId: 'user-001',
                  userName: 'Nguyễn Văn A',
                  lastMessage: 'Xin chào! Tôi cần hỗ trợ về sản phẩm giày thể thao.',
                  messageCount: 5,
                  status: 'active' as const,
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                },
                {
                  _id: 'mock-2',
                  chatId: 'admin-demo-002',
                  userId: 'user-002',
                  userName: 'Trần Thị B',
                  lastMessage: 'Cảm ơn bạn đã hỗ trợ! Sản phẩm rất tốt.',
                  messageCount: 12,
                  status: 'closed' as const,
                  createdAt: new Date(Date.now() - 86400000).toISOString(),
                  updatedAt: new Date(Date.now() - 3600000).toISOString(),
                },
                {
                  _id: 'mock-3',
                  chatId: 'admin-demo-003',
                  userId: 'user-003',
                  userName: 'Lê Minh C',
                  lastMessage: 'Tôi muốn đổi size áo...',
                  messageCount: 8,
                  status: 'pending' as const,
                  createdAt: new Date(Date.now() - 172800000).toISOString(),
                  updatedAt: new Date(Date.now() - 7200000).toISOString(),
                }
              ],
              total: 3,
              page: 1,
              limit: 10
            };
            
            setError(null);
            setSessions(mockData.data);
            setTotal(mockData.total);
            return;
          }
          
          if (!fallbackResponse.ok) {
            const fallbackErrorText = await fallbackResponse.text();
            console.error('❌ Fallback response error:', fallbackErrorText);
            throw new Error(`HTTP error! status: ${fallbackResponse.status}, message: ${fallbackErrorText}`);
          }
          
          const fallbackData: ChatSessionsResponse = await fallbackResponse.json();
          console.log('✅ Fallback response data:', fallbackData);
          setSessions(fallbackData.data || []);
          setTotal(fallbackData.total || 0);
          return;
        }
        
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data: ChatSessionsResponse = await response.json();
      console.log('✅ Response data:', data);
      
      setSessions(data.data || []);
      setTotal(data.total || 0);
    } catch (err: unknown) {
      console.error('💥 Error fetching chat sessions:', err);
      if (err instanceof Error) {
        setError(`Lỗi tải chat sessions: ${err.message}`);
      } else {
        setError(t('error'));
      }
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchChatSessions();
  }, [page, rowsPerPage, searchTerm, statusFilter, isAuthenticated]);

  // Handle pagination
  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle search
  const handleSearch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  // Handle status filter
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
    setPage(0);
  };

  // Handle refresh
  const handleRefresh = () => {
    fetchChatSessions();
  };

  // Handle view chat session
  const handleViewChat = (chatId: string) => {
    router.push(`/admin/chats/${chatId}`);
  };

  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'closed':
        return 'default';
      case 'pending':
        return 'warning';
      default:
        return 'default';
    }
  };

  // Get status text
  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Đang hoạt động';
      case 'closed':
        return 'Đã đóng';
      case 'pending':
        return 'Chờ phản hồi';
      default:
        return status;
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // Helper function to extract message content
  const getMessageContent = (
    message: string | { content: string; role?: string; createdAt?: string }
  ) => {
    if (typeof message === 'string') {
      return message;
    }
    if (typeof message === 'object' && message?.content) {
      return message.content;
    }
    return 'Không có tin nhắn';
  };

  if (!mounted) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Alert severity="error">Bạn cần đăng nhập để truy cập trang này.</Alert>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        minHeight: '100vh',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(17, 17, 27, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        padding: { xs: 2, md: 4 }
      }}
    >
      <Box sx={{ width: '100%', maxWidth: 1600, mx: 'auto' }}>
      {/* Header */}
        <Box sx={{ 
          mb: 4, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2
        }}>
        <Box>
            <Typography 
              variant="h4" 
              sx={{ 
                fontWeight: 800,
                mb: 1,
                background: (theme) => theme.palette.mode === 'dark'
                  ? 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)'
                  : 'linear-gradient(45deg, #d32f2f 30%, #b71c1c 90%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}
            >
            Quản lý Chat Sessions
          </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                color: 'text.secondary',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }}
            >
            Quản lý và theo dõi các cuộc trò chuyện với khách hàng
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
            onClick={() => router.push('/admin/messages')}
            sx={{ 
              minWidth: 200, 
              fontWeight: 600,
              py: 1.5,
              px: 3,
              borderRadius: 2,
              textTransform: 'none',
              fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
              boxShadow: '0 3px 5px 2px rgba(244, 67, 54, .3)',
              '&:hover': {
                background: 'linear-gradient(45deg, #d32f2f 30%, #c62828 90%)',
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 10px 4px rgba(244, 67, 54, .3)',
              },
              transition: 'all 0.2s ease-in-out'
            }}
        >
          Xem list tin nhắn
        </Button>
      </Box>

      {/* Filters and Search */}
        <Paper 
          sx={{ 
            p: 3, 
            mb: 3,
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(25, 118, 210, 0.3)'
              : '1px solid rgba(25, 118, 210, 0.2)',
            borderRadius: 3,
            boxShadow: '0 8px 32px rgba(25, 118, 210, 0.1)',
          }}
        >
        <Box
          sx={{
            display: 'flex',
              gap: 3,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
            <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap', flex: 1 }}>
            {/* Search */}
            <TextField
              placeholder="Tìm theo userId hoặc chatId..."
              value={searchTerm}
              onChange={handleSearch}
              size="small"
                sx={{ 
                  minWidth: 300,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />

            {/* Status Filter */}
              <FormControl 
                size="small" 
                sx={{ 
                  minWidth: 180,
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    background: (theme) => theme.palette.mode === 'dark'
                      ? 'rgba(255, 255, 255, 0.05)'
                      : 'rgba(255, 255, 255, 0.8)',
                    backdropFilter: 'blur(10px)',
                  },
                }}
              >
              <InputLabel>Trạng thái</InputLabel>
              <Select value={statusFilter} label="Trạng thái" onChange={handleStatusFilterChange}>
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="closed">Đã đóng</MenuItem>
                <MenuItem value="pending">Chờ phản hồi</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Refresh Button */}
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading}
              sx={{
                backgroundColor: (theme) => theme.palette.mode === 'dark'
                  ? 'rgba(244, 67, 54, 0.1)'
                  : 'rgba(244, 67, 54, 0.05)',
                border: '1px solid',
                borderColor: 'error.main',
                borderRadius: 2,
                '&:hover': {
                  backgroundColor: 'error.main',
                  color: 'white',
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out'
              }}
            >
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
          <Alert 
            severity="error" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }
            }}
          >
          {error}
        </Alert>
      )}

        {/* Admin Demo Notice */}
        {mounted && (() => {
          const userStr = localStorage.getItem('user');
          const user = userStr ? JSON.parse(userStr) : null;
          return user?.role === 'admin' && sessions.length > 0 && sessions[0]?.chatId?.startsWith('admin-demo-');
        })() && (
          <Alert 
            severity="info" 
            sx={{ 
              mb: 3,
              borderRadius: 2,
              '& .MuiAlert-message': {
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }
            }}
          >
            🚀 <strong>Admin Demo Mode:</strong> Bạn đang xem dữ liệu demo cho Admin. 
            Để truy cập dữ liệu thực, vui lòng liên hệ IT để cấu hình backend API endpoints cho Admin.
          </Alert>
        )}

      {/* Table */}
        <Paper 
          sx={{ 
            width: '100%', 
            overflow: 'hidden',
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(25, 118, 210, 0.3)'
              : '1px solid rgba(25, 118, 210, 0.2)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(25, 118, 210, 0.1)',
          }}
        >
          <TableContainer sx={{ maxHeight: 700 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                  <TableCell 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 247, 250, 0.95) 0%, rgba(240, 242, 247, 0.95) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderBottom: (theme) => theme.palette.mode === 'dark'
                        ? '2px solid rgba(25, 118, 210, 0.3)'
                        : '2px solid rgba(25, 118, 210, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}
                  >
                    Chat ID
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 247, 250, 0.95) 0%, rgba(240, 242, 247, 0.95) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderBottom: (theme) => theme.palette.mode === 'dark'
                        ? '2px solid rgba(25, 118, 210, 0.3)'
                        : '2px solid rgba(25, 118, 210, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}
                  >
                    Người dùng
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 247, 250, 0.95) 0%, rgba(240, 242, 247, 0.95) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderBottom: (theme) => theme.palette.mode === 'dark'
                        ? '2px solid rgba(25, 118, 210, 0.3)'
                        : '2px solid rgba(25, 118, 210, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}
                  >
                    Tin nhắn cuối
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 247, 250, 0.95) 0%, rgba(240, 242, 247, 0.95) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderBottom: (theme) => theme.palette.mode === 'dark'
                        ? '2px solid rgba(25, 118, 210, 0.3)'
                        : '2px solid rgba(25, 118, 210, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}
                  >
                    Số tin nhắn
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 247, 250, 0.95) 0%, rgba(240, 242, 247, 0.95) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderBottom: (theme) => theme.palette.mode === 'dark'
                        ? '2px solid rgba(25, 118, 210, 0.3)'
                        : '2px solid rgba(25, 118, 210, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}
                  >
                    Trạng thái
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 247, 250, 0.95) 0%, rgba(240, 242, 247, 0.95) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderBottom: (theme) => theme.palette.mode === 'dark'
                        ? '2px solid rgba(25, 118, 210, 0.3)'
                        : '2px solid rgba(25, 118, 210, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}
                  >
                    Cập nhật lúc
                  </TableCell>
                  <TableCell 
                    sx={{ 
                      fontWeight: 700,
                      fontSize: '0.95rem',
                      background: (theme) => theme.palette.mode === 'dark'
                        ? 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)'
                        : 'linear-gradient(135deg, rgba(245, 247, 250, 0.95) 0%, rgba(240, 242, 247, 0.95) 100%)',
                      backdropFilter: 'blur(10px)',
                      borderBottom: (theme) => theme.palette.mode === 'dark'
                        ? '2px solid rgba(25, 118, 210, 0.3)'
                        : '2px solid rgba(25, 118, 210, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    }}
                  >
                    Thao tác
                  </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                      <CircularProgress sx={{ mb: 2 }} />
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }}
                      >
                      Đang tải dữ liệu...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                    <TableCell colSpan={7} sx={{ textAlign: 'center', py: 6 }}>
                      <ChatIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                      <Typography 
                        variant="h6" 
                        color="text.secondary"
                        sx={{ 
                          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          fontWeight: 600
                        }}
                      >
                      Không có chat sessions nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                  sessions.map((session, index) => (
                    <TableRow 
                      key={session._id} 
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(25, 118, 210, 0.08)'
                            : 'rgba(25, 118, 210, 0.04)',
                        },
                        '&:nth-of-type(odd)': {
                          backgroundColor: (theme) => theme.palette.mode === 'dark'
                            ? 'rgba(255, 255, 255, 0.02)'
                            : 'rgba(0, 0, 0, 0.02)',
                        },
                      }}
                    >
                    <TableCell>
                        <Typography 
                          variant="body2" 
                          sx={{ 
                            fontFamily: 'monospace',
                            fontSize: '0.85rem',
                            fontWeight: 500,
                            color: 'error.main'
                          }}
                        >
                        {session.chatId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                        <Typography 
                          variant="body2" 
                          fontWeight={600}
                          sx={{ 
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}
                        >
                        {session.userName}
                      </Typography>
                        <Typography 
                          variant="caption" 
                          color="text.secondary"
                          sx={{ 
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}
                        >
                        ID: {session.userId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                            maxWidth: 250,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }}
                      >
                        {getMessageContent(session.lastMessage)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={session.messageCount}
                        size="small"
                          sx={{
                            backgroundColor: 'error.main',
                            color: 'white',
                            fontWeight: 600,
                            minWidth: 40,
                          }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(session.status)}
                        color={getStatusColor(session.status) as 'success' | 'default' | 'warning'}
                        size="small"
                          sx={{
                            fontWeight: 600,
                            minWidth: 100,
                          }}
                      />
                    </TableCell>
                    <TableCell>
                        <Typography 
                          variant="body2"
                          sx={{ 
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                          }}
                        >
                          {formatDate(session.updatedAt)}
                        </Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                          variant="contained"
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewChat(session.chatId)}
                          sx={{ 
                            textTransform: 'none',
                            borderRadius: 2,
                            fontWeight: 600,
                            px: 2,
                            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                            background: 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)',
                            '&:hover': {
                              background: 'linear-gradient(45deg, #d32f2f 30%, #c62828 90%)',
                              transform: 'translateY(-1px)',
                            },
                            transition: 'all 0.2s ease-in-out'
                          }}
                      >
                        Xem
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Pagination */}
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={total}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Số hàng mỗi trang:"
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} trong ${count !== -1 ? count : `hơn ${to}`}`
          }
            sx={{
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)'
                : 'linear-gradient(135deg, rgba(245, 247, 250, 0.95) 0%, rgba(240, 242, 247, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              borderTop: (theme) => theme.palette.mode === 'dark'
                ? '1px solid rgba(25, 118, 210, 0.3)'
                : '1px solid rgba(25, 118, 210, 0.2)',
              '& .MuiTablePagination-toolbar': {
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              }
            }}
        />
      </Paper>
      </Box>
    </Box>
  );
};

export default ChatSessionsPage;
