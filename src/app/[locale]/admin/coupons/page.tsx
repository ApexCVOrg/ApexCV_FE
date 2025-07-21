"use client";
import React, { useEffect, useState } from "react";
import {
  Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, Stack, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Chip, MenuItem, FormControl, InputLabel, Select, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "@/services/api";
import { API_ENDPOINTS } from "@/lib/constants/constants";
import { useTranslations } from "next-intl";
import dayjs from "dayjs";

interface Coupon {
  _id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  minOrderValue: number;
  maxUsage: number;
  used: number;
  expiresAt: string;
  isActive: boolean;
}

const defaultForm: Partial<Coupon> = {
  code: "",
  type: "percentage",
  value: 0,
  minOrderValue: 0,
  maxUsage: 1,
  expiresAt: "",
  isActive: true,
};

export default function CouponsPage() {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editCoupon, setEditCoupon] = useState<Coupon | null>(null);
  const [form, setForm] = useState<Partial<Coupon>>(defaultForm);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });
  const [confirmDelete, setConfirmDelete] = useState<{ open: boolean; coupon: Coupon | null }>({ open: false, coupon: null });

  const t = useTranslations("admin.coupons");

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get<{ data: Coupon[] }>(API_ENDPOINTS.ADMIN.COUPONS);
      setCoupons(res.data.data || []);
    } catch {
      setCoupons([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCoupons(); }, []);

  const handleOpenDialog = (coupon?: Coupon) => {
    if (coupon) {
      setEditCoupon(coupon);
      setForm({ ...coupon, expiresAt: dayjs(coupon.expiresAt).format("YYYY-MM-DD") });
    } else {
      setEditCoupon(null);
      setForm(defaultForm);
    }
    setOpenDialog(true);
  };
  const handleCloseDialog = () => { setOpenDialog(false); setEditCoupon(null); setForm(defaultForm); };

  const handleFormChange = (field: keyof Coupon) => (e: any) => {
    setForm(prev => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Validate
    if (!form.code || !form.value || !form.minOrderValue || !form.maxUsage || !form.expiresAt) {
      setSnackbar({ open: true, message: t("errors.required"), severity: "error" });
      return;
    }
    if (form.value <= 0 || form.minOrderValue <= 0 || form.maxUsage <= 0) {
      setSnackbar({ open: true, message: t("errors.positive"), severity: "error" });
      return;
    }
    try {
      if (editCoupon) {
        await api.patch(`${API_ENDPOINTS.ADMIN.COUPONS}/${editCoupon._id}`, form);
        setSnackbar({ open: true, message: t("updated"), severity: "success" });
      } else {
        await api.post(API_ENDPOINTS.ADMIN.COUPONS, form);
        setSnackbar({ open: true, message: t("created"), severity: "success" });
      }
      handleCloseDialog();
      fetchCoupons();
    } catch (err: any) {
      setSnackbar({ open: true, message: err?.response?.data?.message || t("errors.server"), severity: "error" });
    }
  };

  const handleDelete = async () => {
    if (!confirmDelete.coupon) return;
    try {
      await api.delete(`${API_ENDPOINTS.ADMIN.COUPONS}/${confirmDelete.coupon._id}`);
      setSnackbar({ open: true, message: t("deleted"), severity: "success" });
      setConfirmDelete({ open: false, coupon: null });
      fetchCoupons();
    } catch {
      setSnackbar({ open: true, message: t("errors.server"), severity: "error" });
    }
  };

  // Helper: highlight sắp hết hạn (3 ngày)
  const isExpiringSoon = (expiresAt: string) => {
    const now = dayjs();
    const exp = dayjs(expiresAt);
    return exp.diff(now, 'day') <= 3 && exp.isAfter(now);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 1200, mx: 'auto', p: { xs: 1, md: 3 }, overflowX: 'auto' }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4" fontWeight="bold">{t("title")}</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()}>{t("addNew")}</Button>
      </Stack>
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("code")}</TableCell>
              <TableCell>{t("type")}</TableCell>
              <TableCell>{t("value")}</TableCell>
              <TableCell>{t("minOrderValue")}</TableCell>
              <TableCell>{t("used")}</TableCell>
              <TableCell>{t("expiresAt")}</TableCell>
              <TableCell>{t("status")}</TableCell>
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} align="center">Loading...</TableCell></TableRow>
            ) : coupons.length === 0 ? (
              <TableRow><TableCell colSpan={8} align="center">{t("empty")}</TableCell></TableRow>
            ) : coupons.map(coupon => (
              <TableRow key={coupon._id} sx={isExpiringSoon(coupon.expiresAt) ? { bgcolor: '#fffbe6' } : {}}>
                <TableCell>{coupon.code}</TableCell>
                <TableCell>
                  <Chip label={coupon.type === 'percentage' ? '%' : '₫'} color={coupon.type === 'percentage' ? 'primary' : 'secondary'} size="small" />
                </TableCell>
                <TableCell>{coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value.toLocaleString()}₫`}</TableCell>
                <TableCell>{coupon.minOrderValue.toLocaleString()}₫</TableCell>
                <TableCell>{coupon.used} / {coupon.maxUsage}</TableCell>
                <TableCell>
                  <Tooltip title={dayjs(coupon.expiresAt).format('YYYY-MM-DD HH:mm')}>
                    <span>{dayjs(coupon.expiresAt).format('YYYY-MM-DD')}</span>
                  </Tooltip>
                </TableCell>
                <TableCell>
                  <Chip
                    label={coupon.isActive ? t("active") : t("expired")}
                    color={coupon.isActive ? 'success' : 'default'}
                    size="small"
                  />
                </TableCell>
                <TableCell align="right">
                  <IconButton size="small" onClick={() => handleOpenDialog(coupon)}><EditIcon /></IconButton>
                  <IconButton size="small" color="error" onClick={() => setConfirmDelete({ open: true, coupon })}><DeleteIcon /></IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {/* Form Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{editCoupon ? t("edit") : t("addNew")}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={2}>
              <TextField label={t("code")}
                value={form.code}
                onChange={handleFormChange("code")}
                required fullWidth inputProps={{ maxLength: 20 }}
                disabled={!!editCoupon}
              />
              <FormControl fullWidth required>
                <InputLabel>{t("type")}</InputLabel>
                <Select value={form.type} onChange={handleFormChange("type") as any} label={t("type") as any}>
                  <MenuItem value="percentage">%</MenuItem>
                  <MenuItem value="fixed">₫</MenuItem>
                </Select>
              </FormControl>
              <TextField label={t("value")}
                type="number" value={form.value}
                onChange={handleFormChange("value")}
                required fullWidth inputProps={{ min: 1 }}
              />
              <TextField label={t("minOrderValue")}
                type="number" value={form.minOrderValue}
                onChange={handleFormChange("minOrderValue")}
                required fullWidth inputProps={{ min: 1 }}
              />
              <TextField label={t("maxUsage")}
                type="number" value={form.maxUsage}
                onChange={handleFormChange("maxUsage")}
                required fullWidth inputProps={{ min: 1 }}
              />
              <TextField label={t("expiresAt")}
                type="date" value={form.expiresAt}
                onChange={handleFormChange("expiresAt")}
                required fullWidth InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t("cancel")}</Button>
            <Button type="submit" variant="contained">{editCoupon ? t("update") : t("create")}</Button>
          </DialogActions>
        </form>
      </Dialog>
      {/* Confirm Delete Dialog */}
      <Dialog open={confirmDelete.open} onClose={() => setConfirmDelete({ open: false, coupon: null })}>
        <DialogTitle>{t("confirmDeleteTitle")}</DialogTitle>
        <DialogContent>{t("confirmDeleteMsg", { code: confirmDelete.coupon?.code ?? "" })}</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDelete({ open: false, coupon: null })}>{t("cancel")}</Button>
          <Button onClick={handleDelete} color="error" variant="contained">{t("delete")}</Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: "100%" }}>{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
} 