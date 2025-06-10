"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Alert,
  Snackbar,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { Category } from "@/types/components/category";
import CategoryForm from '@/components/forms/CategoryForm';
import axios from "axios";

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [openForm, setOpenForm] = useState(false);
  const [selected, setSelected] = useState<Category | null>(null);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
    open: false,
    message: "",
    severity: "success",
  });

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await axios.get<Category[]>("/api/categories");
      setCategories(res.data);
      setError(null);
    } catch {
      setError("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenForm = (category?: Category) => {
    if (category) setSelected(category);
    else setSelected(null);
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setSelected(null);
    setOpenForm(false);
  };

  const handleSubmit = async (data: {
    name: string;
    description: string;
    parentCategory?: string | null;
    status: "active" | "inactive";
  }) => {
    try {
      if (selected) {
        await axios.put(`/api/categories/${selected._id}`, data);
        setSnackbar({ open: true, message: "Category updated", severity: "success" });
      } else {
        await axios.post("/api/categories", data);
        setSnackbar({ open: true, message: "Category created", severity: "success" });
      }
      handleCloseForm();
      fetchCategories();
    } catch {
      setSnackbar({ open: true, message: "Failed to save category", severity: "error" });
    }
  };

  const handleDelete = async (_id: string) => {
    if (!confirm("Delete this category?")) return;
    try {
      await axios.delete(`/api/categories/${_id}`);
      setSnackbar({ open: true, message: "Category deleted", severity: "success" });
      fetchCategories();
    } catch {
      setSnackbar({ open: true, message: "Failed to delete category", severity: "error" });
    }
  };

  return (
    <Box p={3}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Categories</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenForm()}>
          Add Category
        </Button>
      </Stack>

      {error && <Alert severity="error">{error}</Alert>}

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Parent</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Created At</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : categories.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No categories found
                </TableCell>
              </TableRow>
            ) : (
              categories.map((cat) => (
                <TableRow key={cat._id}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.description || "-"}</TableCell>
                  <TableCell>{cat.parentCategory?.name || "-"}</TableCell>
                  <TableCell>
                    <Chip color={cat.status === "active" ? "success" : "default"} label={cat.status} size="small" />
                  </TableCell>
                  <TableCell>{cat.createdAt ? new Date(cat.createdAt).toLocaleDateString() : '-'}</TableCell>
                  <TableCell align="right">
                    <IconButton onClick={() => handleOpenForm(cat)} size="small" sx={{ mr: 1 }}>
                      <EditIcon />
                    </IconButton>
                    <IconButton onClick={() => handleDelete(cat._id)} size="small" color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <CategoryForm
        open={openForm}
        onClose={handleCloseForm}
        onSubmit={handleSubmit}
        categories={categories}
        title={selected ? "Edit Category" : "Add Category"}
        initialData={
          selected
            ? ({
              name: selected.name,
              description: selected.description,
              parentCategory: selected.parentCategory?._id || null,
              status: selected.status,
            } as { name?: string; description?: string; parentCategory?: string | null; status?: "active" | "inactive"; })
            : undefined
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
