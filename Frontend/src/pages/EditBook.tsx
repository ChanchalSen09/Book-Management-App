import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  Button,
  CircularProgress,
  Box,
} from "@mui/material";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { getBookById, updateBook } from "../api/booksApi";
import type { Book } from "../types/book";

type BookFormData = Omit<Book, "_id"> & { year: number };

export default function EditBook() {
  const { bookId } = useParams<{ bookId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const [loadingBook, setLoadingBook] = useState(true);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<BookFormData>();

  useEffect(() => {
    const fetchBook = async () => {
      try {
        if (!bookId) return;
        const data = await getBookById(bookId);
        (["title", "author", "genre", "status"] as const).forEach((field) =>
          setValue(field, data[field])
        );
        setValue("year", data.year);
      } catch {
        enqueueSnackbar("Failed to load book details.", { variant: "error" });
        navigate("/");
      } finally {
        setLoadingBook(false);
      }
    };

    fetchBook();
  }, [bookId, setValue, navigate, enqueueSnackbar]);

  const mutation = useMutation({
    mutationFn: (updatedBook: BookFormData) => {
      const bookToUpdate = { ...updatedBook, publishedYear: updatedBook.year };
      delete (bookToUpdate as Record<string, unknown>).year;
      return bookId ? updateBook(bookId, bookToUpdate) : Promise.reject();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      enqueueSnackbar("Book updated successfully!", { variant: "success" });
      navigate("/");
    },
    onError: () => {
      enqueueSnackbar("Failed to update book.", { variant: "error" });
    },
  });

  const onSubmit = (data: BookFormData) => {
    mutation.mutate(data);
  };

  const handleClose = () => {
    navigate("/");
  };

  if (loadingBook) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="50vh">
        <CircularProgress />
      </Box>
    );
  }

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
            label="Published Year"
            type="number"
            margin="normal"
            {...register("year", {
              required: "Published Year is required",
            })}
            error={!!errors.year}
            helperText={errors.year?.message}
          />
          <TextField
            fullWidth
            label="Published Year"
            type="number"
            margin="normal"
            {...register("year", {
              required: "Published Year is required",
            })}
            error={!!errors.year}
            helperText={errors.year?.message}
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
            disabled={mutation.status === "pending"}>
            {mutation.status === "pending" ? (
              <CircularProgress size={24} />
            ) : (
              "Update"
            )}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}
