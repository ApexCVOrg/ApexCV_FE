'use client';

import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  TablePagination,
  // TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  CircularProgress,
  Alert,
  Stack,
} from '@mui/material';

interface AuditLog {
  _id: string;
  action: string;
  target: string;
  detail: string;
  ip: string;
  userAgent: string;
  adminId: {
    _id: string;
    username?: string;
    email?: string;
  };
  createdAt: string;
}

const ACTIONS = [
  'LOGIN',
  'LOGOUT',
  'CREATE_PRODUCT',
  'UPDATE_PRODUCT',
  'DELETE_PRODUCT',
  'UPDATE_ORDER',
  'DELETE_ORDER',
  'CREATE_USER',
  'UPDATE_USER',
  'DELETE_USER',
  // Thêm các action khác nếu có
];

export default function AuditLogPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [action, setAction] = useState('');
  const [adminId, setAdminId] = useState('');
  const [admins, setAdmins] = useState<unknown[]>([]);

  // Lấy danh sách admin để filter (có thể tối ưu sau)
  useEffect(() => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/admin/admins`, {
      headers: {
        Authorization: token ? `Bearer ${token}` : '',
        'Content-Type': 'application/json',
      },
      credentials: 'include',
    })
      .then(res => res.json())
      .then(data => {
        if (data.success) setAdmins(data.data);
      })
      .catch(() => {});
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams({
        page: String(page + 1),
        limit: String(rowsPerPage),
      });
      if (action) params.append('action', action);
      if (adminId) params.append('adminId', adminId);
      const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : '';
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/admin/logs?${params.toString()}`,
        {
          headers: {
            Authorization: token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );
      const data = await res.json();
      if (data.success) {
        setLogs(data.data);
        setTotal(data.pagination.total);
      } else {
        setError(data.message || 'Lỗi khi tải audit log');
      }
    } catch {
      setError('Lỗi khi tải audit log');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, rowsPerPage, action, adminId]);

  return (
    <Box
      sx={{
        background: (theme) => theme.palette.mode === 'dark' 
          ? 'linear-gradient(135deg, rgba(17, 17, 27, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
          : 'linear-gradient(135deg, rgba(248, 250, 252, 0.98) 0%, rgba(255, 255, 255, 0.98) 100%)',
        backdropFilter: 'blur(20px)',
        borderRadius: 3,
        p: 3,
        minHeight: '100vh',
      }}
    >
      <Typography 
        variant="h4" 
        fontWeight={700} 
        mb={2}
        sx={{
          background: (theme) => theme.palette.mode === 'dark'
            ? 'linear-gradient(45deg, #f44336 30%, #d32f2f 90%)'
            : 'linear-gradient(45deg, #d32f2f 30%, #b71c1c 90%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
        }}
      >
        Audit Log (Nhật ký hoạt động Admin)
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <FormControl 
          sx={{ 
            minWidth: 180,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              background: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'error.main',
              },
            },
          }} 
          size="small"
        >
          <InputLabel sx={{ 
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
          }}>
            Hành động
          </InputLabel>
          <Select 
            value={action} 
            label="Hành động" 
            onChange={e => setAction(e.target.value)}
            sx={{
              color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {ACTIONS.map(a => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl 
          sx={{ 
            minWidth: 180,
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              background: (theme) => theme.palette.mode === 'dark'
                ? 'rgba(255, 255, 255, 0.05)'
                : 'rgba(255, 255, 255, 0.8)',
              backdropFilter: 'blur(10px)',
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: 'error.main',
              },
            },
          }} 
          size="small"
        >
          <InputLabel sx={{ 
            color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
          }}>
            Admin
          </InputLabel>
          <Select 
            value={adminId} 
            label="Admin" 
            onChange={e => setAdminId(e.target.value)}
            sx={{
              color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
            }}
          >
            <MenuItem value="">Tất cả</MenuItem>
            {admins.map((ad: unknown) => (
              <MenuItem key={(ad as { _id: string })._id} value={(ad as { _id: string })._id}>
                {(ad as { _id: string; username?: string; email?: string }).username || (ad as { _id: string; username?: string; email?: string }).email || (ad as { _id: string })._id}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      {loading ? (
        <Box 
          display="flex" 
          justifyContent="center" 
          alignItems="center" 
          minHeight={200}
          sx={{
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
            borderRadius: 3,
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(244, 67, 54, 0.3)'
              : '1px solid rgba(244, 67, 54, 0.2)',
          }}
        >
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ 
            borderRadius: 2,
            '& .MuiAlert-message': {
              fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
            }
          }}
        >
          {error}
        </Alert>
      ) : (
        <Paper
          sx={{
            background: (theme) => theme.palette.mode === 'dark'
              ? 'linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(0, 0, 0, 0.98) 100%)'
              : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98) 0%, rgba(248, 250, 252, 0.98) 100%)',
            backdropFilter: 'blur(10px)',
            border: (theme) => theme.palette.mode === 'dark'
              ? '1px solid rgba(244, 67, 54, 0.3)'
              : '1px solid rgba(244, 67, 54, 0.2)',
            borderRadius: 3,
            boxShadow: '0 20px 60px rgba(244, 67, 54, 0.1)',
          }}
        >
          <TableContainer>
            <Table size="small">
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
                        ? '2px solid rgba(244, 67, 54, 0.3)'
                        : '2px solid rgba(244, 67, 54, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                    }}
                  >
                    Thời gian
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
                        ? '2px solid rgba(244, 67, 54, 0.3)'
                        : '2px solid rgba(244, 67, 54, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                    }}
                  >
                    Hành động
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
                        ? '2px solid rgba(244, 67, 54, 0.3)'
                        : '2px solid rgba(244, 67, 54, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                    }}
                  >
                    Đối tượng
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
                        ? '2px solid rgba(244, 67, 54, 0.3)'
                        : '2px solid rgba(244, 67, 54, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                    }}
                  >
                    Chi tiết
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
                        ? '2px solid rgba(244, 67, 54, 0.3)'
                        : '2px solid rgba(244, 67, 54, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                    }}
                  >
                    IP
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
                        ? '2px solid rgba(244, 67, 54, 0.3)'
                        : '2px solid rgba(244, 67, 54, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                    }}
                  >
                    UserAgent
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
                        ? '2px solid rgba(244, 67, 54, 0.3)'
                        : '2px solid rgba(244, 67, 54, 0.2)',
                      fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                    }}
                  >
                    Admin
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map(log => (
                  <TableRow 
                    key={log._id} 
                    hover
                    sx={{
                      '&:hover': {
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(244, 67, 54, 0.08)'
                          : 'rgba(244, 67, 54, 0.04)',
                      },
                      '&:nth-of-type(odd)': {
                        backgroundColor: (theme) => theme.palette.mode === 'dark'
                          ? 'rgba(255, 255, 255, 0.02)'
                          : 'rgba(0, 0, 0, 0.02)',
                      },
                    }}
                  >
                    <TableCell 
                      sx={{
                        color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    >
                      {new Date(log.createdAt).toLocaleString()}
                    </TableCell>
                    <TableCell 
                      sx={{
                        color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    >
                      {log.action}
                    </TableCell>
                    <TableCell 
                      sx={{
                        color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    >
                      {log.target}
                    </TableCell>
                    <TableCell 
                      sx={{
                        color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    >
                      {log.detail}
                    </TableCell>
                    <TableCell 
                      sx={{
                        color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    >
                      {log.ip}
                    </TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 120,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    >
                      {log.userAgent}
                    </TableCell>
                    <TableCell 
                      sx={{
                        color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
                        fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                      }}
                    >
                      {log.adminId?.username ||
                        log.adminId?.email ||
                        log.adminId._id}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page}
            onPageChange={(_e, newPage) => setPage(newPage)}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={e => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            rowsPerPageOptions={[10, 20, 50]}
            sx={{
              background: (theme) => theme.palette.mode === 'dark'
                ? 'linear-gradient(135deg, rgba(30, 30, 50, 0.95) 0%, rgba(20, 20, 40, 0.95) 100%)'
                : 'linear-gradient(135deg, rgba(245, 247, 250, 0.95) 0%, rgba(240, 242, 247, 0.95) 100%)',
              backdropFilter: 'blur(10px)',
              borderTop: (theme) => theme.palette.mode === 'dark'
                ? '1px solid rgba(244, 67, 54, 0.3)'
                : '1px solid rgba(244, 67, 54, 0.2)',
              '& .MuiTablePagination-toolbar': {
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
              },
              '& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows': {
                fontFamily: "'Inter', 'Roboto', 'Noto Sans', 'Segoe UI', sans-serif",
                color: (theme) => theme.palette.mode === 'dark' ? '#fff' : '#333',
              },
            }}
          />
        </Paper>
      )}
    </Box>
  );
}