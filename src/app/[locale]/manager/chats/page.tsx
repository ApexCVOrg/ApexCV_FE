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
  Chip,
  IconButton,
  Button,
  CircularProgress,
  Alert,
  SelectChangeEvent,
  Stack,
} from '@mui/material';
import {
  Search as SearchIcon,
  Refresh as RefreshIcon,
  Chat as ChatIcon,
  Visibility as ViewIcon,
} from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

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
  const { isAuthenticated, getToken } = useAuth();

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
    if (!isAuthenticated) return;

    setLoading(true);
    setError(null);

    try {
      const token = getToken();
      if (!token) {
        setError('Không tìm thấy token xác thực. Vui lòng đăng nhập lại.');
        return;
      }

      const queryParams = new URLSearchParams({
        page: (page + 1).toString(),
        limit: rowsPerPage.toString(),
        ...(searchTerm && { search: searchTerm }),
        ...(statusFilter !== 'all' && { status: statusFilter }),
      });

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/manager/chats?${queryParams}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ChatSessionsResponse = await response.json();
      setSessions(data.data);
      setTotal(data.total);
    } catch {
      console.error('Error fetching chat sessions');
      setError('Không thể tải danh sách chat sessions. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchChatSessions();
  }, [page, rowsPerPage, searchTerm, statusFilter, isAuthenticated, getToken]);

  // Handle pagination
  const handleChangePage = (event: unknown, newPage: number) => {
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
    router.push(`/manager/chats/${chatId}`);
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
    <Box sx={{ 
      width: '100%', 
      maxWidth: '100%', 
      mx: 'auto', 
      p: { xs: 2, md: 4 },
      pt: { xs: 4, md: 6 },
      overflowX: 'auto' 
    }}>
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={4}
        sx={{ 
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box>
          <Typography 
            variant="h4" 
            component="h1" 
            sx={{
              fontWeight: 800,
              fontSize: { xs: '1.75rem', md: '2.25rem' },
              letterSpacing: '0.5px',
              color: 'text.primary',
              fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
              mb: 1,
            }}
          >
            Quản lý Chat Sessions
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{
              fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
            }}
          >
            Quản lý và theo dõi các cuộc trò chuyện với khách hàng
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/manager/messages')}
          sx={{ 
            minWidth: 180, 
            fontWeight: 600,
            px: 3,
            py: 1.5,
            borderRadius: 2,
            textTransform: 'none',
            fontSize: '0.95rem',
            fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
            '&:hover': {
              boxShadow: '0 6px 20px rgba(0,0,0,0.2)',
              transform: 'translateY(-1px)',
            },
            transition: 'all 0.2s ease-in-out',
          }}
        >
          Xem list tin nhắn
        </Button>
      </Stack>

      {/* Filters and Search */}
      <Paper sx={{ 
        p: 3, 
        mb: 3, 
        maxWidth: '100%', 
        overflowX: 'auto',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
          : 'linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(248,250,252,0.95) 100%)',
        border: (theme) => theme.palette.mode === 'dark'
          ? '1px solid rgba(100, 120, 150, 0.3)'
          : '1px solid rgba(0,0,0,0.06)',
      }}>
        <Stack spacing={3}>
          {/* Search Bar */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
            <TextField
              placeholder="Tìm theo userId hoặc chatId..."
              value={searchTerm}
              onChange={handleSearch}
              sx={{ 
                flexGrow: 1,
                minWidth: 250,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
                '& .MuiInputBase-input': {
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                },
              }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
            <IconButton 
              onClick={handleRefresh} 
              disabled={loading}
              sx={{
                borderRadius: 2,
                px: 2,
                py: 1.5,
                '&:hover': {
                  transform: 'translateY(-1px)',
                },
                transition: 'all 0.2s ease-in-out',
              }}
            >
              <RefreshIcon />
            </IconButton>
          </Box>

          {/* Filter Row */}
          <Box
            sx={{
              display: 'flex',
              gap: 3,
              flexWrap: 'wrap',
              alignItems: 'center',
              width: '100%',
              overflowX: 'auto',
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
              <Typography 
                variant="body2" 
                sx={{ 
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 0.5,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                }}
              >
                Trạng thái
              </Typography>
              <FormControl sx={{ 
                minWidth: 150,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                  '&:hover': {
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: 'primary.main',
                    },
                  },
                },
              }}>
                <Select 
                  value={statusFilter} 
                  onChange={handleStatusFilterChange}
                  displayEmpty
                  sx={{
                    '& .MuiSelect-select': {
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      py: 1.5,
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                    },
                  }}
                >
                <MenuItem value="all">Tất cả</MenuItem>
                <MenuItem value="active">Đang hoạt động</MenuItem>
                <MenuItem value="closed">Đã đóng</MenuItem>
                <MenuItem value="pending">Chờ phản hồi</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        </Stack>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <TableContainer component={Paper} sx={{
        width: '100%',
        overflowX: 'auto',
        borderRadius: 3,
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(25, 35, 50, 0.95) 0%, rgba(30, 40, 60, 0.95) 100%)'
          : 'background.paper',
        border: (theme) => theme.palette.mode === 'dark'
          ? '1px solid rgba(100, 120, 150, 0.3)'
          : '1px solid rgba(0,0,0,0.06)',
      }}>
        <Table sx={{
          width: '100%',
          tableLayout: 'fixed',
          '& .MuiTableRow-root:hover': {
            backgroundColor: (theme) => theme.palette.mode === 'dark'
              ? 'rgba(255,255,255,0.05)'
              : 'rgba(0,0,0,0.02)',
            transition: 'background-color 0.2s ease-in-out',
          },
        }}>
            <TableHead>
            <TableRow sx={{ 
              backgroundColor: (theme) => theme.palette.mode === 'dark' 
                ? 'rgba(255,255,255,0.12)' 
                : 'rgba(0,0,0,0.12)' 
            }}>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '12%',
              }}>
                Chat ID
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '15%',
              }}>
                Người dùng
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '20%',
              }}>
                Tin nhắn cuối
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '10%',
              }}>
                Số tin nhắn
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '12%',
              }}>
                Trạng thái
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '15%',
              }}>
                Cập nhật lúc
              </TableCell>
              <TableCell sx={{ 
                fontWeight: 700, 
                fontSize: '0.95rem',
                color: 'text.primary',
                borderBottom: (theme) => theme.palette.mode === 'dark'
                  ? '2px solid rgba(255,255,255,0.15)'
                  : '2px solid rgba(0,0,0,0.2)',
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                backgroundColor: (theme) => theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.12)',
                py: 2,
                width: '16%',
              }}>
                Thao tác
              </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <CircularProgress />
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Đang tải dữ liệu...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : sessions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} sx={{ textAlign: 'center', py: 4 }}>
                    <ChatIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="body2" color="text.secondary">
                      Không có chat sessions nào
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                sessions.map(session => (
                <TableRow 
                  key={session._id}
                  sx={{
                    '&:hover': {
                      backgroundColor: (theme) => theme.palette.mode === 'dark'
                        ? 'rgba(255,255,255,0.05)'
                        : 'rgba(0,0,0,0.02)',
                    },
                    transition: 'background-color 0.2s ease-in-out',
                  }}
                >
                  <TableCell sx={{ py: 2 }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        fontWeight: 500,
                      }}
                    >
                        {session.chatId}
                      </Typography>
                    </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography 
                      variant="body2" 
                      fontWeight={500}
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
                  <TableCell sx={{ py: 2 }}>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        }}
                      >
                        {getMessageContent(session.lastMessage)}
                      </Typography>
                    </TableCell>
                  <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={session.messageCount}
                        size="small"
                        color="primary"
                        variant="outlined"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24,
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                      />
                    </TableCell>
                  <TableCell sx={{ py: 2 }}>
                      <Chip
                        label={getStatusText(session.status)}
                        color={getStatusColor(session.status) as 'default' | 'primary' | 'secondary' | 'error' | 'info' | 'success' | 'warning'}
                        size="small"
                      sx={{
                        fontWeight: 600,
                        fontSize: '0.75rem',
                        height: 24,
                        '& .MuiChip-label': {
                          px: 1,
                        },
                      }}
                      />
                    </TableCell>
                  <TableCell sx={{ py: 2 }}>
                    <Typography 
                      variant="body2"
                      sx={{
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        fontSize: '0.875rem',
                      }}
                    >
                      {formatDate(session.updatedAt)}
                    </Typography>
                    </TableCell>
                  <TableCell align="center" sx={{ py: 2 }}>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewChat(session.chatId)}
                      sx={{ 
                        textTransform: 'none',
                        borderRadius: 2,
                        px: 2,
                        py: 1,
                        fontWeight: 500,
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                        '&:hover': {
                          transform: 'translateY(-1px)',
                        },
                        transition: 'all 0.2s ease-in-out',
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

        {/* Pagination */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'center', 
          mt: 4,
          p: 2,
          borderRadius: 2,
          backgroundColor: (theme) => theme.palette.mode === 'dark' 
            ? 'rgba(255,255,255,0.05)' 
            : 'rgba(0,0,0,0.02)',
        }}>
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
              '& .MuiPaginationItem-root': {
                borderRadius: 1,
                fontWeight: 500,
                '&:hover': {
                  backgroundColor: 'rgba(25, 118, 210, 0.08)',
                },
              },
            }}
          />
        </Box>
      </TableContainer>
    </Box>
  );
};

export default ChatSessionsPage;