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
// import { useTranslations } from 'next-intl';

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
    } catch (err: unknown) {
      console.error('Error fetching chat sessions:', err);
      setError('Không thể tải danh sách chat sessions. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount and when dependencies change
  useEffect(() => {
    fetchChatSessions();
  }, [page, rowsPerPage, searchTerm, statusFilter, isAuthenticated, getToken, fetchChatSessions]);

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
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', px: { xs: 1, md: 3 }, pt: 2, pb: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700, mb: 1 }}>
            Quản lý Chat Sessions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Quản lý và theo dõi các cuộc trò chuyện với khách hàng
          </Typography>
        </Box>
        <Button
          variant="contained"
          color="primary"
          onClick={() => router.push('/manager/messages')}
          sx={{ minWidth: 180, fontWeight: 600 }}
        >
          Xem list tin nhắn
        </Button>
      </Box>

      {/* Filters and Search */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: 'flex',
            gap: 2,
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
            {/* Search */}
            <TextField
              placeholder="Tìm theo userId hoặc chatId..."
              value={searchTerm}
              onChange={handleSearch}
              size="small"
              sx={{ minWidth: 250 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />

            {/* Status Filter */}
            <FormControl size="small" sx={{ minWidth: 150 }}>
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
          <IconButton onClick={handleRefresh} disabled={loading}>
            <RefreshIcon />
          </IconButton>
        </Box>
      </Paper>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {/* Table */}
      <Paper sx={{ width: '100%', overflow: 'hidden' }}>
        <TableContainer sx={{ maxHeight: 600 }}>
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Chat ID</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Người dùng</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Tin nhắn cuối</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Số tin nhắn</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Trạng thái</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Cập nhật lúc</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Thao tác</TableCell>
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
                  <TableRow key={session._id} hover>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {session.chatId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {session.userName}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        ID: {session.userId}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography
                        variant="body2"
                        sx={{
                          maxWidth: 200,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {getMessageContent(session.lastMessage)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={session.messageCount}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getStatusText(session.status)}
                        color={getStatusColor(session.status) as 'success' | 'default' | 'warning'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(session.updatedAt)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outlined"
                        size="small"
                        startIcon={<ViewIcon />}
                        onClick={() => handleViewChat(session.chatId)}
                        sx={{ textTransform: 'none' }}
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
        />
      </Paper>
    </Box>
  );
};

export default ChatSessionsPage;
