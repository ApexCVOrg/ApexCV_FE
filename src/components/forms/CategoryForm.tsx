'use client';

import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    IconButton,
    Typography,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    SelectChangeEvent,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
import { Category } from '@/types/components/category';

interface CategoryFormProps {
    open: boolean;
    onClose: () => void;
    onSubmit: (data: {
        name: string;
        description: string;
        parentCategory?: string | null;
        status: 'active' | 'inactive';
    }) => void;
    initialData?: {
        name?: string;
        description?: string;
        parentCategory?: string | null;
        status?: 'active' | 'inactive';
    };
    title: string;
    categories?: Category[];
}

const CategoryForm: React.FC<CategoryFormProps> = ({
    open,
    onClose,
    onSubmit,
    initialData,
    title,
    categories = [],
}) => {
    const [formData, setFormData] = useState({
        name: initialData?.name || '',
        description: initialData?.description || '',
        parentCategory: initialData?.parentCategory || '',
        status: initialData?.status || 'active',
    });

    const [errors, setErrors] = useState({
        name: '',
        description: '',
        status: '',
    });

    const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (name && errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const handleSelectChange = (e: SelectChangeEvent<string>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
        if (name && errors[name as keyof typeof errors]) {
            setErrors(prev => ({
                ...prev,
                [name]: '',
            }));
        }
    };

    const validateForm = () => {
        const newErrors = {
            name: '',
            description: '',
            status: '',
        };

        if (!formData.name.trim()) {
            newErrors.name = 'Category name is required';
        }

        if (!formData.description.trim()) {
            newErrors.description = 'Description is required';
        }

        if (!formData.status) {
            newErrors.status = 'Status is required';
        }

        setErrors(newErrors);
        return !newErrors.name && !newErrors.description && !newErrors.status;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit({
                ...formData,
                parentCategory: formData.parentCategory || null,
            });
            setFormData({
                name: '',
                description: '',
                parentCategory: '',
                status: 'active',
            });
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" justifyContent="space-between" alignItems="center">
                    <Typography variant="h6">{title}</Typography>
                    <IconButton onClick={onClose} size="small">
                        <CloseIcon />
                    </IconButton>
                </Box>
            </DialogTitle>
            <form onSubmit={handleSubmit}>
                <DialogContent>
                    <Box display="flex" flexDirection="column" gap={2}>
                        <TextField
                            name="name"
                            label="Category Name"
                            value={formData.name}
                            onChange={handleTextChange}
                            error={!!errors.name}
                            helperText={errors.name}
                            fullWidth
                            required
                        />
                        <TextField
                            name="description"
                            label="Description"
                            value={formData.description}
                            onChange={handleTextChange}
                            error={!!errors.description}
                            helperText={errors.description}
                            fullWidth
                            required
                            multiline
                            rows={4}
                        />
                        <FormControl fullWidth>
                            <InputLabel>Parent Category</InputLabel>
                            <Select
                                name="parentCategory"
                                value={formData.parentCategory}
                                onChange={handleSelectChange}
                                label="Parent Category"
                            >
                                <MenuItem value="">None</MenuItem>
                                {categories.map(category => (
                                    <MenuItem key={category._id} value={category._id}>
                                        {category.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl fullWidth required>
                            <InputLabel>Status</InputLabel>
                            <Select
                                name="status"
                                value={formData.status}
                                onChange={handleSelectChange}
                                label="Status"
                                error={!!errors.status}
                            >
                                <MenuItem value="active">Active</MenuItem>
                                <MenuItem value="inactive">Inactive</MenuItem>
                            </Select>
                        </FormControl>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={onClose} color="inherit">
                        Cancel
                    </Button>
                    <Button type="submit" variant="contained" color="primary">
                        {initialData ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </form>
        </Dialog>
    );
};

export default CategoryForm; 