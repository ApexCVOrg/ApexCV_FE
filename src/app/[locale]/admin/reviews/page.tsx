"use client";
import React, { useEffect, useState } from "react";
import { Typography, Table, TableHead, TableRow, TableCell, TableBody, Avatar, Rating, Paper, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import api from "@/services/api";

interface Review {
  _id: string;
  user: { fullName?: string } | string;
  product: { _id: string; name: string; images?: string[] } | string;
  rating: number;
  comment: string;
  createdAt: string;
}

const AdminReviewPage = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchReviews = async () => {
    try {
      const res = await api.get("/reviews");
      setReviews(res.data as Review[]);
    } catch {
      setReviews([]);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    setLoading(true);
    try {
      await api.delete(`/reviews/${deleteId}`);
      setDeleteId(null);
      fetchReviews();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3, mt: 2 }}>
      <Typography variant="h5" fontWeight={700} mb={2}>Quản lí đánh giá</Typography>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>STT</TableCell>
            <TableCell>Ảnh</TableCell>
            <TableCell>Sản phẩm</TableCell>
            <TableCell>Người đánh giá</TableCell>
            <TableCell>Rating</TableCell>
            <TableCell>Bình luận</TableCell>
            <TableCell>Ngày</TableCell>
            <TableCell></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reviews.map((review, idx) => (
            <TableRow key={review._id}>
              <TableCell>{idx + 1}</TableCell>
              <TableCell>
                {typeof review.product === "object" && review.product.images?.[0] ? (
                  <Avatar src={review.product.images[0]} variant="square" />
                ) : null}
              </TableCell>
              <TableCell>
                {typeof review.product === "object" ? review.product.name : ""}
              </TableCell>
              <TableCell>
                {typeof review.user === "object" ? review.user.fullName : ""}
              </TableCell>
              <TableCell>
                <Rating value={review.rating} readOnly size="small" />
              </TableCell>
              <TableCell>{review.comment}</TableCell>
              <TableCell>
                {new Date(review.createdAt).toLocaleDateString("vi-VN")}
              </TableCell>
              <TableCell>
                <IconButton color="error" onClick={() => setDeleteId(review._id)}>
                  <DeleteIcon />
                </IconButton>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <Dialog open={!!deleteId} onClose={() => setDeleteId(null)}>
        <DialogTitle>Xác nhận xóa đánh giá</DialogTitle>
        <DialogContent>Bạn có chắc chắn muốn xóa đánh giá này không?</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteId(null)} disabled={loading}>Hủy</Button>
          <Button onClick={handleDelete} color="error" disabled={loading}>
            Xóa
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default AdminReviewPage; 