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
    <Box>
      <Typography variant="h4" fontWeight={700} mb={2}>
        Audit Log (Nhật ký hoạt động Admin)
      </Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mb={2}>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>Hành động</InputLabel>
          <Select value={action} label="Hành động" onChange={e => setAction(e.target.value)}>
            <MenuItem value="">Tất cả</MenuItem>
            {ACTIONS.map(a => (
              <MenuItem key={a} value={a}>
                {a}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl sx={{ minWidth: 180 }} size="small">
          <InputLabel>Admin</InputLabel>
          <Select value={adminId} label="Admin" onChange={e => setAdminId(e.target.value)}>
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
        <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : (
        <Paper>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Thời gian</TableCell>
                  <TableCell>Hành động</TableCell>
                  <TableCell>Đối tượng</TableCell>
                  <TableCell>Chi tiết</TableCell>
                  <TableCell>IP</TableCell>
                  <TableCell>UserAgent</TableCell>
                  <TableCell>Admin</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map(log => (
                  <TableRow key={log._id} hover>
                    <TableCell>{new Date(log.createdAt).toLocaleString()}</TableCell>
                    <TableCell>{log.action}</TableCell>
                    <TableCell>{log.target}</TableCell>
                    <TableCell>{log.detail}</TableCell>
                    <TableCell>{log.ip}</TableCell>
                    <TableCell
                      sx={{
                        maxWidth: 120,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {log.userAgent}
                    </TableCell>
                    <TableCell>
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
          />
        </Paper>
      )}
    </Box>
  );
}
