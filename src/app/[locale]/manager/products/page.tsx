"use client";
import React, { useEffect, useState } from "react";
import {
    Box, Button, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Stack, Typography, IconButton, Dialog, DialogTitle, DialogContent, DialogActions,
    TextField, Snackbar, Alert, Chip, MenuItem, FormControl, InputLabel, Select, Tooltip
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import api from "@/services/api";
import { API_ENDPOINTS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "@/lib/constants/constants";
import { Checkbox, ListItemText } from "@mui/material";
import { PRODUCT_LABELS } from '@/types/components/label';

interface Product {
    _id: string;
    name: string;
    description: string;
    price: number;
    categories: string[];
    status: "active" | "inactive";
    createdAt: string;
    updatedAt: string;
    brand?: string | Brand;
    label?: string[];
    images?: string[];
}

interface ProductFormData {
    name: string;
    description: string;
    price: number;
    discountPrice?: number;
    categories: string[];
    brand: string;
    images: string[];
    sizes: { size: string; stock: number }[];
    colors: string[];
    tags: string[];
    status: "active" | "inactive";
    label?: string[];
}

interface Brand {
    _id: string;
    name: string;
}

export default function ProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [categories, setCategories] = useState<{ _id: string; name: string; parentCategory: string | null }[]>([]);
    const [brands, setBrands] = useState<Brand[]>([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [formData, setFormData] = useState<ProductFormData>({
        name: "",
        description: "",
        price: 0,
        discountPrice: undefined,
        categories: [],
        brand: "",
        images: [],
        sizes: [],
        colors: [],
        tags: [],
        status: "active",
        label: [],
    });
    const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({
        open: false, message: "", severity: "success"
    });
    const [colorInput, setColorInput] = useState("");
    const [imageInput, setImageInput] = useState("");


    // 1. Get subCategories (categories with parentCategory != null)
    const subCategories = categories.filter(cat => cat.parentCategory);

    // Fetch products and categories
    const fetchProducts = async () => {
        setLoading(true);
        try {
            const res = await api.get<Product[]>(API_ENDPOINTS.MANAGER.PRODUCTS);
            setProducts(res.data);
        } catch {
            setSnackbar({ open: true, message: ERROR_MESSAGES.NETWORK_ERROR, severity: "error" });
        } finally {
            setLoading(false);
        }
    };
    const fetchCategories = async () => {
        try {
            const res = await api.get<{ _id: string; name: string; parentCategory: string | null }[]>(API_ENDPOINTS.MANAGER.CATEGORIES);
            setCategories(res.data);
        } catch { }
    };
    const fetchBrands = async () => {
        try {
            const res = await api.get<Brand[]>(API_ENDPOINTS.MANAGER.BRANDS);
            setBrands(res.data);
        } catch { }
    };

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
    }, []);

    // Form handlers
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenDialog = (product?: Product) => {
        if (product) {
            setSelectedProduct(product);
            setFormData({
                name: product.name,
                description: product.description,
                price: product.price,
                discountPrice: undefined,
                categories: product.categories || [],
                brand: "",
                images: [],
                sizes: [],
                colors: [],
                tags: [],
                status: product.status,
                label: Array.isArray(product.label) ? product.label : product.label ? [product.label] : [],
            });
        } else {
            setSelectedProduct(null);
            setFormData({
                name: "",
                description: "",
                price: 0,
                discountPrice: undefined,
                categories: [],
                brand: "",
                images: [],
                sizes: [],
                colors: [],
                tags: [],
                status: "active",
                label: [],
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProduct(null);
        setFormData({
            name: "",
            description: "",
            price: 0,
            discountPrice: undefined,
            categories: [],
            brand: "",
            images: [],
            sizes: [],
            colors: [],
            tags: [],
            status: "active",
            label: [],
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = selectedProduct
                ? `${API_ENDPOINTS.MANAGER.PRODUCTS}/${selectedProduct._id}`
                : API_ENDPOINTS.MANAGER.PRODUCTS;
            const method = selectedProduct ? "put" : "post";
            const submitData = {
                ...formData,
                categories: formData.categories.map(cat => typeof cat === 'string' ? cat : cat),
                label: formData.label,
            };
            await api[method](url, submitData);
            setSnackbar({
                open: true,
                message: selectedProduct ? SUCCESS_MESSAGES.MANAGER.PRODUCT_UPDATED : SUCCESS_MESSAGES.MANAGER.PRODUCT_CREATED,
                severity: "success",
            });
            handleCloseDialog();
            fetchProducts();
        } catch {
            setSnackbar({ open: true, message: ERROR_MESSAGES.MANAGER.INVALID_PRODUCT_DATA, severity: "error" });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this product?")) return;
        try {
            await api.delete(`${API_ENDPOINTS.MANAGER.PRODUCTS}/${id}`);
            setSnackbar({ open: true, message: SUCCESS_MESSAGES.MANAGER.PRODUCT_DELETED, severity: "success" });
            fetchProducts();
        } catch {
            setSnackbar({ open: true, message: ERROR_MESSAGES.MANAGER.INVALID_PRODUCT_DATA, severity: "error" });
        }
    };

    // Handler động cho tags/colors/images/sizes
    const handleAddTag = (type: "tags" | "colors", value: string) => {
        if (!value) return;
        setFormData(prev => ({ ...prev, [type]: [...prev[type], value] }));
    };
    const handleDeleteTag = (type: "tags" | "colors", idx: number) => {
        setFormData(prev => ({ ...prev, [type]: prev[type].filter((_, i) => i !== idx) }));
    };
    const handleAddImage = (url: string) => {
        if (!url) return;
        setFormData(prev => ({ ...prev, images: [...prev.images, url] }));
    };
    const handleDeleteImage = (idx: number) => {
        setFormData(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== idx) }));
    };
    const handleAddSize = () => {
        setFormData(prev => ({ ...prev, sizes: [...prev.sizes, { size: "", stock: 0 }] }));
    };
    const handleSizeChange = (idx: number, field: "size" | "stock", value: string | number) => {
        setFormData(prev => ({
            ...prev,
            sizes: prev.sizes.map((s, i) => i === idx ? { ...s, [field]: value } : s)
        }));
    };
    const handleDeleteSize = (idx: number) => {
        setFormData(prev => ({ ...prev, sizes: prev.sizes.filter((_, i) => i !== idx) }));
    };

    // Helper: Lấy tên brand từ objectId hoặc object
    const getBrandName = (brand: string | Brand | undefined) => {
        if (!brand) return '-';
        if (typeof brand === 'string') {
            const found = brands.find(b => b._id === brand);
            return found ? found.name : brand;
        } else if (typeof brand === 'object' && brand !== null) {
            return brand.name;
        }
        return '-';
    };

    // Helper: Lấy tên category dạng parent-sub
    const getCategoryDisplay = (cat: any) => {
        if (!cat) return '';
        if (cat.parentCategory && cat.parentCategory.name) {
            return `${cat.parentCategory.name} - ${cat.name}`;
        }
        return cat.name;
    };

    // Helper: Format ngày tháng
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

    return (
        <Box sx={{ width: '100%', px: 0, pt: 2, pb: 0 }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={1} sx={{ px: 2, mb: 0 }}>
                <Typography variant="h4" sx={{ fontWeight: 700, fontSize: '2rem' }}>Products</Typography>
                <Button variant="contained" startIcon={<AddIcon />} onClick={() => handleOpenDialog()} sx={{ fontSize: '1rem', py: 1.5, px: 3 }}>
                    Add Product
                </Button>
            </Stack>
            <TableContainer component={Paper} sx={{ width: '100%', overflowX: 'auto', boxShadow: 3, mt: 0 }}>
                <Table sx={{ width: '100%' }}>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', py: 2, width: 100 }}>Image</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', py: 2, width: 180 }}>Name</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', py: 2, width: 260 }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', py: 2, width: 100 }}>Price</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', py: 2, width: 180 }}>Category</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', py: 2, width: 120 }}>Brand</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', py: 2, width: 100 }}>Status</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', py: 2, width: 180 }}>Created At</TableCell>
                            <TableCell sx={{ fontWeight: 700, fontSize: '1.1rem', py: 2, width: 120 }}>Label</TableCell>
                            <TableCell align="right" sx={{ fontWeight: 700, fontSize: '1.1rem', py: 2, width: 100 }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow key="loading">
                                <TableCell colSpan={10} align="center" sx={{ py: 4, fontSize: '1.2rem' }}>Loading...</TableCell>
                            </TableRow>
                        ) : products.length === 0 ? (
                            <TableRow key="empty">
                                <TableCell colSpan={10} align="center" sx={{ py: 4, fontSize: '1.2rem' }}>No products found</TableCell>
                            </TableRow>
                        ) : (
                            products.map(product => (
                                <TableRow key={product._id} sx={{ fontSize: '1rem', height: 64 }}>
                                    <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                        <img
                                            src={product.images?.[0] ? `/assets/images/${product.images[0]}` : '/assets/images/placeholder.jpg'}
                                            alt={product.name}
                                            style={{ width: 60, height: 60, objectFit: 'cover', borderRadius: 6, border: '1px solid #eee' }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal', wordBreak: 'break-word' }}>{product.name}</TableCell>
                                    <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                        <Typography variant="body2">
                                            {product.description}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal' }}>
                                        <Typography variant="body2" fontWeight="bold">
                                            ${product.price.toLocaleString()}
                                        </Typography>
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal', wordBreak: 'break-word' }}>
                                        {product.categories && product.categories.length > 0
                                            ? product.categories.map(getCategoryDisplay).join(', ')
                                            : '-'}
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal' }}>{getBrandName(product.brand)}</TableCell>
                                    <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal' }}>
                                        <Chip 
                                            label={product.status} 
                                            color={product.status === "active" ? "success" : "default"} 
                                            size="small"
                                            variant="outlined"
                                            sx={{
                                                fontWeight: 'bold',
                                                textTransform: 'uppercase',
                                                fontSize: '0.85rem',
                                                '&.MuiChip-colorSuccess': {
                                                    backgroundColor: '#e8f5e8',
                                                    color: '#2e7d32',
                                                    borderColor: '#4caf50'
                                                },
                                                '&.MuiChip-colorDefault': {
                                                    backgroundColor: '#f5f5f5',
                                                    color: '#666',
                                                    borderColor: '#ddd'
                                                }
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal' }}>{formatDate(product.createdAt)}</TableCell>
                                    <TableCell sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal' }}>
                                        {product.label && product.label.length > 0 ? (
                                            <Stack direction="row" spacing={0.5} flexWrap="wrap">
                                                {product.label.map((l, idx) => {
                                                    const labelObj = PRODUCT_LABELS.find(opt => opt.value === l);
                                                    return (
                                                        <Chip
                                                            key={l + '-' + idx}
                                                            label={labelObj ? labelObj.label : l}
                                                            size="small"
                                                            variant="outlined"
                                                            sx={{
                                                                fontSize: '0.8rem',
                                                                height: '22px',
                                                                backgroundColor: '#f0f8ff',
                                                                borderColor: '#1976d2',
                                                                color: '#1976d2',
                                                                m: 0.2
                                                            }}
                                                        />
                                                    );
                                                })}
                                            </Stack>
                                        ) : '-'}
                                    </TableCell>
                                    <TableCell align="right" sx={{ fontSize: '1rem', py: 2, whiteSpace: 'normal' }}>
                                        <IconButton size="small" onClick={() => handleOpenDialog(product)} sx={{ mr: 1 }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton size="small" onClick={() => handleDelete(product._id)} color="error">
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
            {/* Dialog Add/Edit */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>{selectedProduct ? "Edit Product" : "Add Product"}</DialogTitle>
                <form onSubmit={handleSubmit}>
                    <DialogContent>
                        <Stack spacing={2}>
                            <TextField name="name" label="Name" value={formData.name} onChange={handleInputChange} required fullWidth />
                            <TextField name="description" label="Description" value={formData.description} onChange={handleInputChange} multiline rows={3} fullWidth />
                            <TextField name="price" label="Price" type="number" value={formData.price} onChange={handleInputChange} required fullWidth />
                            <TextField name="discountPrice" label="Discount Price" type="number" value={formData.discountPrice || ""} onChange={handleInputChange} fullWidth />
                            
                            {/* Status select - đưa lên trên */}
                            <FormControl fullWidth required>
                                <InputLabel id="status-label">Status</InputLabel>
                                <Select
                                    labelId="status-label"
                                    value={formData.status}
                                    onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value as "active" | "inactive" }))}
                                    label="Status"
                                >
                                    <MenuItem value="active">Active</MenuItem>
                                    <MenuItem value="inactive">Inactive</MenuItem>
                                </Select>
                            </FormControl>

                            {/* Categories multi-select */}
                            <FormControl fullWidth required>
                                <InputLabel id="categories-label">Categories</InputLabel>
                                <Select
                                    labelId="categories-label"
                                    multiple
                                    value={formData.categories}
                                    onChange={(e) => {
                                        const { value } = e.target;
                                        setFormData(prev => ({
                                            ...prev,
                                            categories: typeof value === "string" ? value.split(",") : value,
                                        }));
                                    }}
                                    label="Categories"
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value, idx) => {
                                                const category = categories.find(cat => cat._id === value);
                                                return <Chip key={value + '-' + idx} label={category?.name || value} />;
                                            })}
                                        </Box>
                                    )}
                                >
                                    {categories.map((cat) => (
                                        <MenuItem key={cat._id} value={cat._id}>
                                            <Checkbox checked={formData.categories.indexOf(cat._id) > -1} />
                                            <ListItemText primary={cat.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>

                            {/* Brand select */}
                            <TextField
                                name="brand"
                                label="Brand"
                                value={formData.brand}
                                onChange={e => setFormData(prev => ({ ...prev, brand: e.target.value }))}
                                select
                                SelectProps={{ native: true }}
                                required
                                fullWidth
                            >
                                <option value="">Select brand</option>
                                {brands.map(brand => (
                                    <option key={brand._id} value={brand._id}>{brand.name}</option>
                                ))}
                            </TextField>
                            {/* Images */}
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <TextField
                                        label="Add Image URL"
                                        value={imageInput}
                                        onChange={e => setImageInput(e.target.value)}
                                        size="small"
                                    />
                                    <Button onClick={() => { handleAddImage(imageInput); setImageInput(""); }} variant="outlined" size="small">Add</Button>
                                </Stack>
                                <Stack direction="row" spacing={1} mt={1}>
                                    {formData.images.map((img, idx) => (
                                        <Chip
                                            key={idx}
                                            label={img}
                                            onDelete={() => handleDeleteImage(idx)}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                            {/* Sizes */}
                            <Box>
                                <Typography variant="subtitle2">Sizes</Typography>
                                <Button onClick={handleAddSize} startIcon={<AddIcon />} size="small">Add Size</Button>
                                <Stack spacing={1} mt={1}>
                                    {formData.sizes.map((sz, idx) => (
                                        <Stack direction="row" spacing={1} alignItems="center" key={idx}>
                                            <TextField
                                                label="Size"
                                                value={sz.size}
                                                onChange={e => handleSizeChange(idx, "size", e.target.value)}
                                                size="small"
                                            />
                                            <TextField
                                                label="Stock"
                                                type="number"
                                                value={sz.stock}
                                                onChange={e => handleSizeChange(idx, "stock", Number(e.target.value))}
                                                size="small"
                                            />
                                            <IconButton onClick={() => handleDeleteSize(idx)} size="small"><DeleteIcon /></IconButton>
                                        </Stack>
                                    ))}
                                </Stack>
                            </Box>
                            {/* Colors */}
                            <Box>
                                <Stack direction="row" spacing={1} alignItems="center">
                                    <TextField
                                        label="Add Color"
                                        value={colorInput}
                                        onChange={e => setColorInput(e.target.value)}
                                        size="small"
                                    />
                                    <Button onClick={() => { handleAddTag("colors", colorInput); setColorInput(""); }} variant="outlined" size="small">Add</Button>
                                </Stack>
                                <Stack direction="row" spacing={1} mt={1}>
                                    {formData.colors.map((color, idx) => (
                                        <Chip
                                            key={idx}
                                            label={color}
                                            onDelete={() => handleDeleteTag("colors", idx)}
                                        />
                                    ))}
                                </Stack>
                            </Box>
                            {/* Label (multi-select) */}
                            <FormControl fullWidth required>
                                <InputLabel id="label-label">Label</InputLabel>
                                <Select
                                    labelId="label-label"
                                    multiple
                                    value={formData.label}
                                    onChange={e => {
                                        const { value } = e.target;
                                        setFormData(prev => ({
                                            ...prev,
                                            label: typeof value === 'string' ? value.split(',') : value,
                                        }));
                                    }}
                                    label="Label"
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value, idx) => {
                                                const labelObj = PRODUCT_LABELS.find(l => l.value === value);
                                                return <Chip key={value + '-' + idx} label={labelObj ? labelObj.label : value} />;
                                            })}
                                        </Box>
                                    )}
                                >
                                    {PRODUCT_LABELS.map(option => (
                                        <MenuItem key={option.value} value={option.value}>
                                            <Checkbox checked={(formData.label || []).indexOf(option.value) > -1} />
                                            <ListItemText primary={option.label} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {/* Tags (multi-select, like categories) */}
                            <FormControl fullWidth>
                                <InputLabel id="tags-label">Tags (SubCategories)</InputLabel>
                                <Select
                                    labelId="tags-label"
                                    multiple
                                    value={formData.tags}
                                    onChange={e => {
                                        const { value } = e.target;
                                        setFormData(prev => ({
                                            ...prev,
                                            tags: typeof value === 'string' ? value.split(',') : value,
                                        }));
                                    }}
                                    label="Tags (SubCategories)"
                                    renderValue={(selected) => (
                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                                            {selected.map((value, idx) => {
                                                const sub = subCategories.find(s => s._id === value);
                                                return <Chip key={value + '-' + idx} label={sub?.name || value} />;
                                            })}
                                        </Box>
                                    )}
                                >
                                    {subCategories.map(sub => (
                                        <MenuItem key={sub._id} value={sub._id}>
                                            <Checkbox checked={formData.tags.indexOf(sub._id) > -1} />
                                            <ListItemText primary={sub.name} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </Stack>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog}>Cancel</Button>
                        <Button type="submit" variant="contained">{selectedProduct ? "Update" : "Create"}</Button>
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
