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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Pagination,
} from "@mui/material";
import { useTranslations } from "next-intl";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
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

type ParentCategory = { _id: string; name: string };

export default function CategoriesPage() {
  const router = useRouter();
  const t = useTranslations("manager.categories");

  const [categories, setCategories] = useState<Category[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCategories, setTotalCategories] = useState(0);

  // Search and filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  // Search and filter function
  const filterCategories = () => {
    let filtered = categories || [];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (category.description && category.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(category => category.status === statusFilter);
    }

    setFilteredCategories(filtered);
  };

  // Apply filters when search terms or filters change
  useEffect(() => {
    filterCategories();
  }, [searchTerm, statusFilter, categories]);

  // Clear all filters
  const clearFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
  };

  // Fetch categories with pagination
  const fetchCategories = async () => {
    try {
      setLoading(true);
      const response = await api.get<Category[]>(API_ENDPOINTS.MANAGER.CATEGORIES, {
        params: { page, limit }
      });
      setCategories(response.data);
      setTotalCategories(response.data.length);
      setTotalPages(Math.ceil(response.data.length / limit));
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
  }, [router, page, limit]);

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
  const handleOpenDialog = (category?: Category) => {
    if (category) {
      setSelectedCategory(category);
      setFormData({
        name: category.name,
        description: category.description,
        status: category.status,
        parentCategory: typeof category.parentCategory === 'object' && category.parentCategory !== null
          ? (category.parentCategory as ParentCategory)._id
          : "",
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

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {/* Search and Filter Section */}
      <Paper sx={{ p: 2, mb: 2, maxWidth: '100%', overflowX: 'auto' }}>
        <Stack spacing={2}>
          {/* Search Bar */}
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            <TextField
              placeholder={t("search.searchCategories")}
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
              disabled={!searchTerm && statusFilter === "all"}
            >
              {t("search.clearFilters")}
            </Button>
          </Box>

          {/* Filter Row */}
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center', width: '100%', overflowX: 'auto' }}>
            <FormControl sx={{ minWidth: 120 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
              >
                <MenuItem value="all">{t("search.allStatus")}</MenuItem>
                <MenuItem value="active">{t("status.active")}</MenuItem>
                <MenuItem value="inactive">{t("status.inactive")}</MenuItem>
              </Select>
            </FormControl>

            {/* Results Count */}
            <Box sx={{ display: 'flex', alignItems: 'center', ml: 'auto' }}>
              <Typography variant="body2" color="text.secondary">
                {t("search.resultsCount", { filtered: filteredCategories.length, total: totalCategories, itemType: t("search.categories") })}
              </Typography>
            </Box>
          </Box>
        </Stack>
      </Paper>

      <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
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
              filteredCategories.map((category) => (
                <TableRow key={typeof category._id === 'string' ? category._id : ''}>
                  <TableCell>{category.name}</TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    {category.parentCategory
                      ? category.parentCategory.name
                      : '-'}
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
                  .filter(cat => {
                    // Chỉ lấy các category không có parentCategory hoặc parentCategory là null/undefined
                    return !cat.parentCategory || 
                           (typeof cat.parentCategory === 'string' && cat.parentCategory === '') ||
                           (typeof cat.parentCategory === 'object' && cat.parentCategory === null);
                  })
                  .map(parentCat => (
                    <option key={parentCat._id} value={parentCat._id}>
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
