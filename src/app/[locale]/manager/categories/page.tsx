"use client";
import { useRouter } from "next/navigation";
import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Chip,
  Alert,
  Snackbar,
} from "@mui/material";
import { useTranslations } from "next-intl";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import {
  API_ENDPOINTS,
  SUCCESS_MESSAGES,
  ERROR_MESSAGES,
} from "@/lib/constants/constants";
import api from "@/services/api";
import { Category } from "@/types/components/category";

type CategoryStatus = "active" | "inactive";

interface CategoryFormData {
  name: string;
  description: string;
  status: CategoryStatus;
  parentCategory?: string;
}

export default function CategoriesPage() {
  const router = useRouter();
  const t = useTranslations("manager.categories");

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);

  const [formData, setFormData] = useState<CategoryFormData>({
    name: "",
    description: "",
    status: "active",
    parentCategory: "",
  });

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  // Fetch categories
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get<Category[]>(API_ENDPOINTS.MANAGER.CATEGORIES);
      setCategories(response.data);
      setError(null);
    } catch {
      setError(ERROR_MESSAGES.NETWORK_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("auth_token");
    if (!token) {
      router.push("/login");
    } else {
      fetchCategories();
    }
  }, [router]);

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
  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        status: category.status,
        parentCategory: category.parentCategory ? (category.parentCategory as any)._id : "",
      });
    } else {
      setSelectedCategory(null);
      setFormData({
        name: "",
        description: "",
        status: "active",
        parentCategory: "",
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedCategory(null);
    setFormData({
      name: "",
      description: "",
      status: "active",
      parentCategory: "",
    });
  };

  // Submit form add/edit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (
      selectedCategory &&
      formData.parentCategory === selectedCategory._id
    ) {
      setSnackbar({
        open: true,
        message: t("error.cannotSelectSelfAsParent"),
        severity: "error",
      });
      return;
    }

    try {
      const url = selectedCategory
        ? `${API_ENDPOINTS.MANAGER.CATEGORIES}/${selectedCategory._id}`
        : API_ENDPOINTS.MANAGER.CATEGORIES;
      const method = selectedCategory ? "put" : "post";

      await api[method](url, formData);

      setSnackbar({
        open: true,
        message: selectedCategory
          ? SUCCESS_MESSAGES.MANAGER.CATEGORY_UPDATED
          : SUCCESS_MESSAGES.MANAGER.CATEGORY_CREATED,
        severity: "success",
      });

      handleCloseDialog();
      fetchCategories();
    } catch {
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.MANAGER.INVALID_CATEGORY_DATA,
        severity: "error",
      });
    }
  };

  // Delete category
  const handleDelete = async (id: string) => {
    if (!window.confirm(t("deleteConfirm"))) return;

    try {
      await api.delete(`${API_ENDPOINTS.MANAGER.CATEGORIES}/${id}`);

      setSnackbar({
        open: true,
        message: SUCCESS_MESSAGES.MANAGER.CATEGORY_DELETED,
        severity: "success",
      });

      fetchCategories();
    } catch {
      setSnackbar({
        open: true,
        message: ERROR_MESSAGES.MANAGER.INVALID_CATEGORY_DATA,
        severity: "error",
      });
    }
  };

  return (
    <Box>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>{t("name")}</TableCell>
              <TableCell>{t("description")}</TableCell>
              <TableCell>{t("parentCategory")}</TableCell>
              <TableCell>{t("statusLabel")}</TableCell>
              <TableCell>{t("createdAt")}</TableCell>
              <TableCell align="right">{t("actions")}</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t("loading")}
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  {t("noCategories")}
                </TableCell>
              </TableRow>
            ) : (
              categories.map((category) => (
                <TableRow key={typeof category._id === 'string' ? category._id : ''}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    {typeof category.parentCategory === 'string'
                      ? (categories.find(cat => cat._id === category.parentCategory)?.name || '-')
                      : (typeof category.parentCategory === 'object' && category.parentCategory !== null
                        ? (category.parentCategory as any).name
                        : '-')}
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={t(`status.${category.status}`)}
                      color={category.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{category.createdAt ? new Date(category.createdAt).toLocaleDateString() : '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => handleOpenDialog(category)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDelete(typeof category._id === 'string' ? category._id : '')}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>{selectedCategory ? t("editCategory") : t("addCategory")}</DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent>
            <Stack spacing={3}>
              <TextField
                name="name"
                label={t("name")}
                value={formData.name}
                onChange={handleInputChange}
                required
                fullWidth
              />

              <TextField
                name="description"
                label={t("description")}
                value={formData.description}
                onChange={handleInputChange}
                multiline
                rows={3}
                fullWidth
              />

              <TextField
                name="parentCategory"
                label={t("parentCategory")}
                value={formData.parentCategory || ""}
                onChange={handleInputChange}
                select
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="">{t("none")}</option>
                {categories
                  .filter(cat => !cat.parentCategory) // chỉ lấy các category là parent
                  .map(parentCat => (
                    <option key={(parentCat as any)._id} value={(parentCat as any)._id}>
                      {parentCat.name}
                    </option>
                  ))}
              </TextField>

              <TextField
                name="status"
                label={t("statusLabel")}
                value={formData.status}
                onChange={handleInputChange}
                select
                SelectProps={{ native: true }}
                fullWidth
              >
                <option value="active">{t("status.active")}</option>
                <option value="inactive">{t("status.inactive")}</option>
              </TextField>
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog}>{t("cancel")}</Button>
            <Button type="submit" variant="contained">
              {selectedCategory ? t("update") : t("create")}
            </Button>
          </DialogActions>
        </form>
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
