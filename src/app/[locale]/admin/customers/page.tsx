"use client";
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Stack,
  Typography,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Snackbar,
  Alert,
  Chip,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Avatar,
  Tooltip,
  Switch,
  FormControlLabel,
  Pagination,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import api from "@/services/api";
import { API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants/constants";
import { useTranslations } from "next-intl";
import BlockIcon from "@mui/icons-material/Block";
import LockOpenIcon from "@mui/icons-material/LockOpen";

interface Address {
  recipientName: string;
  street: string;
  city: string;
  state: string;
  country: string;
  addressNumber?: string;
  isDefault: boolean;
}

interface User {
  _id: string;
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: "user" | "admin" | "manager";
  isVerified: boolean;
  addresses: Address[];
  createdAt: string;
  status?: string;
  updatedAt?: string;
  avatar?: string;
}

interface UserFormData {
  username: string;
  email: string;
  fullName: string;
  phone: string;
  role: "user" | "admin" | "manager";
  status: string;
  isVerified: boolean;
  addresses: Address[];
}

export default function CustomersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalUsers, setTotalUsers] = useState(0);
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [verificationFilter, setVerificationFilter] = useState<string>("all");
  const [banFilter, setBanFilter] = useState<string>("all");
  
  const [formData, setFormData] = useState<UserFormData>({
    username: "",
    email: "",
    fullName: "",
    phone: "",
    role: "user",
    status: "active",
    isVerified: false,
    addresses: [],
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Thêm state cho dialog ban user
  const [banDialog, setBanDialog] = useState<{ open: boolean; user: User | null }>({ open: false, user: null });
  const [banReason, setBanReason] = useState("");

  const t = useTranslations("admin.users");

  const [mounted, setMounted] = useState(false);
  useEffect(() => { setMounted(true); }, []);

  // Search and filter function
  const filterUsers = () => {
    let filtered = users || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.phone.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by role
    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(user => user.status === statusFilter);
    }

    // Filter by verification status
    if (verificationFilter !== "all") {
      const isVerified = verificationFilter === "verified";
      filtered = filtered.filter(user => user.isVerified === isVerified);
    }

    // Filter by ban status
    if (banFilter === "banned") {
      filtered = filtered.filter(user => user.status === "locked");
    } else if (banFilter === "notBanned") {
      filtered = filtered.filter(user => user.status !== "locked");
    }

    setFilteredUsers(filtered);
  };

  // Apply filters when search terms or filters change
  useEffect(() => {
    filterUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchTerm, roleFilter, statusFilter, verificationFilter, banFilter, users]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setRoleFilter("all");
    setStatusFilter("all");
    setVerificationFilter("all");
    setBanFilter("all");
  };

  // Fetch users with pagination
  const fetchUsers = async () => {
    try {
      setLoading(true);
      
      // Use CUSTOMERS endpoint for direct array response
      const response = await api.get<User[]>(API_ENDPOINTS.ADMIN.CUSTOMERS, {
        params: { page, limit }
      });
      
      // Parse resp.data directly as User[] array
      setUsers(response.data);
      
      // Set pagination info
      setTotalUsers(response.data.length);
      setTotalPages(Math.ceil(response.data.length / limit));
      
    } catch (error) {
      console.error('Error fetching users:', error);
      setSnackbar({ open: true, message: ERROR_MESSAGES.NETWORK_ERROR, severity: "error" });
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit]);

  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Open dialog for add or edit
  const handleOpenDialog = (user?: User) => {
    if (user) {
      setSelectedUser(user);
      setFormData({
        username: user.username,
        email: user.email,
        fullName: user.fullName,
        phone: user.phone,
        role: user.role,
        status: user.status || "active",
        isVerified: user.isVerified,
        addresses: user.addresses,
      });
    } else {
      setSelectedUser(null);
      setFormData({
        username: "",
        email: "",
        fullName: "",
        phone: "",
        role: "user",
        status: "active",
        isVerified: false,
        addresses: [],
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedUser(null);
    setFormData({
      username: "",
      email: "",
      fullName: "",
      phone: "",
      role: "user",
      status: "active",
      isVerified: false,
      addresses: [],
    });
  };

  // Submit form add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const url = selectedUser
        ? `${API_ENDPOINTS.ADMIN.CUSTOMERS}/${selectedUser._id}`
        : API_ENDPOINTS.ADMIN.CUSTOMERS;
      const method = selectedUser ? "put" : "post";

      await api[method](url, formData);

      setSnackbar({
        open: true,
        message: selectedUser
          ? SUCCESS_MESSAGES.MANAGER.USER_UPDATED
          : SUCCESS_MESSAGES.MANAGER.USER_CREATED,
        severity: "success",
      });

      handleCloseDialog();
      fetchUsers();
    } catch {
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.MANAGER.INVALID_USER_DATA,
        severity: "error",
      });
    }
  };

  // Delete user
  const handleDelete = async (id: string) => {
    if (!window.confirm(t("deleteConfirm"))) return;

    try {
      await api.delete(`${API_ENDPOINTS.ADMIN.CUSTOMERS}/${id}`);

      setSnackbar({
        open: true,
        message: SUCCESS_MESSAGES.MANAGER.USER_DELETED,
        severity: "success",
      });

      fetchUsers();
    } catch {
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.MANAGER.INVALID_USER_DATA,
        severity: "error",
      });
    }
  };

  // Hàm mở dialog ban user
  const handleOpenBanDialog = (user: User) => {
    setBanDialog({ open: true, user });
    setBanReason("");
  };
  const handleCloseBanDialog = () => {
    setBanDialog({ open: false, user: null });
    setBanReason("");
  };
  // Gọi API ban user
  const handleBanUser = async () => {
    if (!banDialog.user) return;
    if (!banReason.trim()) {
      setSnackbar({ open: true, message: "Ban reason is required", severity: "error" });
      return;
    }
    try {
      await api.patch(`${API_ENDPOINTS.ADMIN.USERS}/${banDialog.user._id}/status`, { status: "locked", reason: banReason });
      setSnackbar({ open: true, message: `User banned successfully`, severity: "success" });
      handleCloseBanDialog();
      fetchUsers();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || "Failed to ban user", severity: "error" });
    }
  };
  // Gọi API mở user
  const handleUnlockUser = async (user: User) => {
    try {
      await api.patch(`${API_ENDPOINTS.ADMIN.USERS}/${user._id}/status`, { status: "active" });
      setSnackbar({ open: true, message: `User unlocked successfully`, severity: "success" });
      fetchUsers();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || "Failed to unlock user", severity: "error" });
    }
  };

  // Helper: Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Helper: Get address count
  const getAddressCount = (addresses: Address[]) => {
    return addresses ? addresses.length : 0;
  };

  // Helper: Get default address
  const getDefaultAddress = (addresses: Address[]) => {
    if (!addresses || addresses.length === 0) return '-';
    const defaultAddr = addresses.find(addr => addr.isDefault);
    if (defaultAddr) {
      return `${defaultAddr.recipientName} - ${defaultAddr.city}, ${defaultAddr.country}`;
    }
    return `${addresses[0].recipientName} - ${addresses[0].city}, ${addresses[0].country}`;
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1400, mx: 'auto', p: { xs: 1, md: 3 }, overflowX: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3} sx={{ flexWrap: 'wrap' }}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          {t("title")}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          {t("addNew")}
        </Button>
      </Stack>

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 2, maxWidth: '100%', overflowX: 'auto' }}>
        <Stack spacing={2}>
          {/* Search Bar */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder={t("search.searchUsers")}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1 }}
              InputProps={{
                startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
              }}
            />
            <Button
              variant="outlined"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              disabled={!searchTerm && roleFilter === "all" && statusFilter === "all" && verificationFilter === "all" && banFilter === "all"}
            >
              {t("search.clearFilters")}
            </Button>
          </Box>

          {/* Filter Row */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', width: '100%', overflowX: 'auto' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>{t("role")}</InputLabel>
              <Select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                label={t("role")}
              >
                <MenuItem value="all">{t("search.allRoles")}</MenuItem>
                <MenuItem value="user">{t("roles.user")}</MenuItem>
                <MenuItem value="admin">{t("roles.admin")}</MenuItem>
                <MenuItem value="manager">{t("roles.manager")}</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>{t("status")}</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label={t("status")}
              >
                <MenuItem value="all">{t("search.allStatus")}</MenuItem>
                <MenuItem value="active">{t("statuses.active")}</MenuItem>
                <MenuItem value="inactive">{t("statuses.inactive")}</MenuItem>
                <MenuItem value="suspended">{t("statuses.suspended")}</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>{t("verification")}</InputLabel>
              <Select
                value={verificationFilter}
                onChange={(e) => setVerificationFilter(e.target.value)}
                label={t("verification")}
              >
                <MenuItem value="all">{t("search.allVerification")}</MenuItem>
                <MenuItem value="verified">{t("verificationStatus.verified")}</MenuItem>
                <MenuItem value="unverified">{t("verificationStatus.unverified")}</MenuItem>
              </Select>
            </FormControl>

            <FormControl sx={{ minWidth: 150 }}>
              <InputLabel>{t("banFilter.label")}</InputLabel>
              <Select
                value={banFilter}
                onChange={e => setBanFilter(e.target.value)}
                label={t("banFilter.label")}
              >
                <MenuItem value="all">{t("banFilter.all")}</MenuItem>
                <MenuItem value="banned">{t("banFilter.banned")}</MenuItem>
                <MenuItem value="notBanned">{t("banFilter.notBanned")}</MenuItem>
              </Select>
            </FormControl>

            {/* Results Count */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              <Typography variant="body2" color="text.secondary">
                {t("search.resultsCount", { filtered: filteredUsers.length, total: totalUsers, itemType: t("search.users") })}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("avatar")}</TableCell>
              <TableCell>{t("username")}</TableCell>
              <TableCell>{t("email")}</TableCell>
              <TableCell>{t("fullName")}</TableCell>
              <TableCell>{t("phone")}</TableCell>
              <TableCell>{t("role")}</TableCell>
              <TableCell>{t("status")}</TableCell>
              <TableCell>{t("verification")}</TableCell>
              <TableCell>{t("addresses")}</TableCell>
              <TableCell>{t("createdAt")}</TableCell>
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  {t("loading")}
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} align="center">
                  {t("noUsers")}
                </TableCell>
              </TableRow>
            ) : (
              Array.isArray(filteredUsers) ? filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <Avatar
                      src={user.avatar}
                      alt={user.fullName}
                      sx={{ width: 40, height: 40 }}
                    >
                      {user.fullName?.charAt(0) || user.username?.charAt(0)}
                    </Avatar>
                  </TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.fullName}</TableCell>
                  <TableCell>{user.phone}</TableCell>
                  <TableCell>
                    <Chip
                      label={t(`roles.${user.role}`)}
                      color={user.role === 'admin' ? 'error' : user.role === 'manager' ? 'warning' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`statuses.${user.status || 'active'}`)}
                      color={user.status === 'active' ? 'success' : user.status === 'suspended' ? 'error' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.isVerified ? t("verificationStatus.verified") : t("verificationStatus.unverified")}
                      color={user.isVerified ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Tooltip title={getDefaultAddress(user.addresses)}>
                      <Chip
                        label={`${getAddressCount(user.addresses)} ${t("addresses")}`}
                        size="small"
                        variant="outlined"
                      />
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    {mounted ? formatDate(user.createdAt) : new Date(user.createdAt).toISOString().slice(0, 10)}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(user)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(user._id)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                    {user.status === "locked" ? (
                      <Tooltip title="Unlock user">
                        <IconButton size="small" color="success" onClick={() => handleUnlockUser(user)}>
                          <LockOpenIcon />
                        </IconButton>
                      </Tooltip>
                    ) : (
                      <Tooltip title="Ban user">
                        <IconButton size="small" color="warning" onClick={() => handleOpenBanDialog(user)}>
                          <BlockIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={11} align="center">
                    {t("loading")}
                  </TableCell>
                </TableRow>
              )
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            showFirstButton
            showLastButton
          />
        </Box>
      )}

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedUser ? t("editUser") : t("addUser")}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={3}>
              <TextField
                name="username"
                label={t("username")}
                value={formData.username}
                onChange={handleInputChange}
                required
                fullWidth
              />

              <TextField
                name="email"
                label={t("email")}
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                fullWidth
              />

              <TextField
                name="fullName"
                label={t("fullName")}
                value={formData.fullName}
                onChange={handleInputChange}
                required
                fullWidth
              />

              <TextField
                name="phone"
                label={t("phone")}
                value={formData.phone}
                onChange={handleInputChange}
                fullWidth
              />

              <FormControl fullWidth required>
                <InputLabel>{t("role")}</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  onChange={(e) => setFormData(prev => ({ ...prev, role: e.target.value as "user" | "admin" | "manager" }))}
                  label={t("role")}
                >
                  <MenuItem value="user">{t("roles.user")}</MenuItem>
                  <MenuItem value="admin">{t("roles.admin")}</MenuItem>
                  <MenuItem value="manager">{t("roles.manager")}</MenuItem>
                </Select>
              </FormControl>

              <FormControl fullWidth required>
                <InputLabel>{t("status")}</InputLabel>
                <Select
                  name="status"
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  label={t("status")}
                >
                  <MenuItem value="active">{t("statuses.active")}</MenuItem>
                  <MenuItem value="inactive">{t("statuses.inactive")}</MenuItem>
                  <MenuItem value="suspended">{t("statuses.suspended")}</MenuItem>
                </Select>
              </FormControl>

              <FormControlLabel
                control={
                  <Switch
                    checked={formData.isVerified}
                    onChange={(e) => setFormData(prev => ({ ...prev, isVerified: e.target.checked }))}
                  />
                }
                label={t("isVerified")}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t("cancel")}</Button>
            <Button type="submit" variant="contained">
              {selectedUser ? t("update") : t("create")}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Dialog nhập lý do ban */}
      <Dialog open={banDialog.open} onClose={handleCloseBanDialog} maxWidth="xs" fullWidth>
        <DialogTitle>Ban User</DialogTitle>
        <DialogContent>
          <Typography mb={2}>Please enter the reason for banning user <b>{banDialog.user?.username}</b>:</Typography>
          <TextField
            label="Ban Reason"
            value={banReason}
            onChange={e => setBanReason(e.target.value)}
            fullWidth
            multiline
            minRows={2}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseBanDialog}>Cancel</Button>
          <Button onClick={handleBanUser} variant="contained" color="warning">Ban</Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 