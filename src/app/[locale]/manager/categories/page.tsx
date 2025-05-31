"use client";
import { useRouter } from 'next/navigation';
import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import { useTranslations } from 'next-intl';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { API_ENDPOINTS, API_BASE_URL, SUCCESS_MESSAGES, ERROR_MESSAGES } from '@/lib/constants/constants';
import api from '@/services/api';

interface Category {
    id: number;
    name: string;
    description: string;
    status: 'active' | 'inactive';
    createdAt: string;
    updatedAt: string;
}

type CategoryStatus = 'active' | 'inactive';

interface CategoryFormData {
    name: string;
    description: string;
    status: CategoryStatus;
}

export default function CategoriesPage() {
    const router = useRouter();
    const t = useTranslations('manager.categories');
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
    const [formData, setFormData] = useState<CategoryFormData>({
        name: '',
        description: '',
        status: 'active',
    });
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success' as 'success' | 'error',
    });

    // Fetch categories
    const fetchCategories = async () => {
        try {
            setLoading(true);
            const response = await api.get<Category[]>(API_ENDPOINTS.MANAGER.CATEGORIES);
            setCategories(response.data);
            setError(null);
        } catch (err) {
            setError(ERROR_MESSAGES.NETWORK_ERROR);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const token = localStorage.getItem('auth_token');
        if (!token) {
            router.push('/login');
        } else {
            fetchCategories();
        }
    }, [router]);

    // Handle form input changes
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    // Handle dialog open/close
    const handleOpenDialog = (category?: Category) => {
        if (category) {
            setSelectedCategory(category);
            setFormData({
                name: category.name,
                description: category.description,
                status: category.status,
            });
        } else {
            setSelectedCategory(null);
            setFormData({
                name: '',
                description: '',
                status: 'active',
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedCategory(null);
        setFormData({
            name: '',
            description: '',
            status: 'active',
        });
    };

    // Handle form submission
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = selectedCategory
                ? `${API_ENDPOINTS.MANAGER.CATEGORIES}/${selectedCategory.id}`
                : API_ENDPOINTS.MANAGER.CATEGORIES;

            const method = selectedCategory ? 'put' : 'post';
            await api[method](url, formData);

            setSnackbar({
                open: true,
                message: selectedCategory
                    ? SUCCESS_MESSAGES.MANAGER.CATEGORY_UPDATED
                    : SUCCESS_MESSAGES.MANAGER.CATEGORY_CREATED,
                severity: 'success',
            });

            handleCloseDialog();
            fetchCategories();
        } catch (err) {
            setSnackbar({
                open: true,
                message: ERROR_MESSAGES.MANAGER.INVALID_CATEGORY_DATA,
                severity: 'error',
            });
        }
    };

    // Handle category deletion
    const handleDelete = async (id: number) => {
        if (!window.confirm(t('deleteConfirm'))) return;

        try {
            await api.delete(`${API_ENDPOINTS.MANAGER.CATEGORIES}/${id}`);

            setSnackbar({
                open: true,
                message: SUCCESS_MESSAGES.MANAGER.CATEGORY_DELETED,
                severity: 'success',
            });

            fetchCategories();
        } catch (err) {
            setSnackbar({
                open: true,
                message: ERROR_MESSAGES.MANAGER.INVALID_CATEGORY_DATA,
                severity: 'error',
            });
        }
    };

    return (
        <Box>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" component="h1" fontWeight="bold">
                    {t('title')}
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    {t('addNew')}
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
                            <TableCell>{t('name')}</TableCell>
                            <TableCell>{t('description')}</TableCell>
                            <TableCell>{t('statusLabel')}</TableCell>
                            <TableCell>{t('createdAt')}</TableCell>
                            <TableCell align="right">{t('actions')}</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    {t('loading')}
                                </TableCell>
                            </TableRow>
                        ) : categories.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    {t('noCategories')}
                                </TableCell>
                            </TableRow>
                        ) : (
                            categories.map((category) => (
                                <TableRow key={category.id}>
                                    <TableCell>{category.name}</TableCell>
                                    <TableCell>{category.description}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={t(`status.${category.status}`)}
                                            color={category.status === 'active' ? 'success' : 'default'}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(category.createdAt).toLocaleDateString()}
                                    </TableCell>
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
                                            onClick={() => handleDelete(category.id)}
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
                <DialogTitle>
                    {selectedCategory ? t('editCategory') : t('addCategory')}
                </DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Stack spacing={3}>
                            <TextField
                                name="name"
                                label={t('name')}
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                                fullWidth
                            />
                            <TextField
                                name="description"
                                label={t('description')}
                                value={formData.description}
                                onChange={handleInputChange}
                                multiline
                                rows={3}
                                fullWidth
                            />
                            <TextField
                                name="status"
                                label={t('statusLabel')}
                                value={formData.status}
                                onChange={handleInputChange}
                                select
                                SelectProps={{ native: true }}
                                fullWidth
                            >
                                <option value="active">{t('status.active')}</option>
                                <option value="inactive">{t('status.inactive')}</option>
                            </TextField>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>{t('cancel')}</Button>
                        <Button type="submit" variant="contained">
                            {selectedCategory ? t('update') : t('create')}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Snackbar for notifications */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
            >
                <Alert
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    severity={snackbar.severity}
                    sx={{ width: '100%' }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
} 