import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack"; // ✅ Import Notistack

type Book = {
  _id: string;
  title: string;
  author: string;
  genre: string;
  publishedYear: number;
  status: "Available" | "Issued";
};

export default function EditBook() {
  const { bookId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar(); // ✅ Initialize snackbar

  const [book, setBook] = useState<Book | null>(null);
  const [loadingBook, setLoadingBook] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<Book>();

  // Fetch the book data
  useEffect(() => {
    const fetchBook = async () => {
      try {
        const response = await axios.get(
          `http://localhost:5000/api/books/${bookId}`
        );
        setBook(response.data);
        const fields: (keyof Book)[] = [
          "title",
          "author",
          "genre",
          "publishedYear",
          "status",
        ];
        fields.forEach((field) => setValue(field, response.data[field]));
      } catch (error) {
        enqueueSnackbar("Failed to load book details.", { variant: "error" }); // ❌ Error toast
        navigate("/");
      } finally {
        setLoadingBook(false);
      }
    };

    if (bookId) fetchBook();
  }, [bookId, setValue, navigate, enqueueSnackbar]);

  const mutation = useMutation({
    mutationFn: (updatedBook: Book) =>
      axios.put(`http://localhost:5000/api/books/${bookId}`, updatedBook),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      enqueueSnackbar("Book updated successfully!", { variant: "success" }); // ✅ Success toast
      navigate("/");
    },
    onError: () => {
      enqueueSnackbar("Failed to update book.", { variant: "error" }); // ❌ Error toast
    },
  });

  const onSubmit = (data: Book) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    navigate("/");
  };

  if (loadingBook) return <div>Loading book details...</div>;

  return (
    <Dialog open maxWidth="sm" fullWidth>
      <DialogTitle>Edit Book</DialogTitle>
      <form onSubmit={handleSubmit(onSubmit)}>
        <DialogContent dividers>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            {...register("title", { required: "Title is required" })}
            error={!!errors.title}
            helperText={errors.title?.message}
          />
          <TextField
            fullWidth
            label="Author"
            margin="normal"
            {...register("author", { required: "Author is required" })}
            error={!!errors.author}
            helperText={errors.author?.message}
          />
          <TextField
            fullWidth
            label="Genre"
            margin="normal"
            {...register("genre", { required: "Genre is required" })}
            error={!!errors.genre}
            helperText={errors.genre?.message}
          />
          <TextField
            fullWidth
            label="Published Year"
            type="number"
            margin="normal"
            {...register("publishedYear", {
              required: "Published Year is required",
            })}
            error={!!errors.publishedYear}
            helperText={errors.publishedYear?.message}
          />
          <TextField
            select
            fullWidth
            label="Status"
            margin="normal"
            {...register("status", { required: "Status is required" })}
            error={!!errors.status}
            helperText={errors.status?.message}>
            <MenuItem value="Available">Available</MenuItem>
            <MenuItem value="Issued">Issued</MenuItem>
          </TextField>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} variant="outlined">
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={mutation.isLoading}>
            {mutation.isLoading ? <CircularProgress size={24} /> : "Update"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
