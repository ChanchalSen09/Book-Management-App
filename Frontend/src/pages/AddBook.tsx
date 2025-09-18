import { useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { bookSchema } from "../types/bookSchema";
import type { BookFormData } from "../types/bookSchema";
import {
  Container,
  Typography,
  TextField,
  MenuItem,
  Button,
  Paper,
  Box,
} from "@mui/material";
import api from "../api/axios";
import { useNavigate, useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";

// MUI DatePicker (year view)
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs, { Dayjs } from "dayjs";

export default function AddBook() {
  const navigate = useNavigate();
  const location = useLocation();
  const editBook = (location.state as any)?.book;
  const { enqueueSnackbar } = useSnackbar();

  const {
    register,
    handleSubmit,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<BookFormData>({
    resolver: yupResolver(bookSchema),
    defaultValues: {
      title: "",
      author: "",
      genre: "",
      year: new Date().getFullYear(),
      status: "Available",
    },
  });

  useEffect(() => {
    if (editBook) {
      setValue("title", editBook.title);
      setValue("author", editBook.author);
      setValue("genre", editBook.genre);
      setValue("year", editBook.year);
      setValue("status", editBook.status);
    }
  }, [editBook, setValue]);

  const onSubmit = async (data: BookFormData) => {
    try {
      if (editBook) {
        await api.put(`/books/${editBook._id}`, data);
        enqueueSnackbar("Book updated", { variant: "success" });
      } else {
        await api.post("/books", data);
        enqueueSnackbar("Book added", { variant: "success" });
      }
      navigate("/");
    } catch (err) {
      console.error(err);
      enqueueSnackbar("Failed to save book", { variant: "error" });
    }
  };

  return (
    <Container maxWidth="sm">
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>
          {editBook ? "Edit Book" : "Add Book"}
        </Typography>

        <form onSubmit={handleSubmit(onSubmit)}>
          <TextField
            fullWidth
            label="Title"
            margin="normal"
            {...register("title")}
            error={!!errors.title}
            helperText={errors.title?.message}
          />

          <TextField
            fullWidth
            label="Author"
            margin="normal"
            {...register("author")}
            error={!!errors.author}
            helperText={errors.author?.message}
          />

          <TextField
            fullWidth
            label="Genre"
            margin="normal"
            {...register("genre")}
            error={!!errors.genre}
            helperText={errors.genre?.message}
          />

          {/* Year picker - selects year only, value stored as number */}
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Controller
              name="year"
              control={control}
              defaultValue={editBook ? editBook.year : new Date().getFullYear()}
              render={({ field }) => (
                <DatePicker
                  label="Published Year"
                  views={["year"]}
                  value={field.value ? dayjs(String(field.value)) : null}
                  onChange={(newValue: Dayjs | null) => {
                    field.onChange(newValue ? newValue.year() : null);
                  }}
                  slotProps={{
                    textField: {
                      fullWidth: true,
                      margin: "normal",
                      error: !!errors.year,
                      helperText: errors.year?.message,
                    },
                  }}
                />
              )}
            />
          </LocalizationProvider>

          <TextField
            select
            fullWidth
            label="Status"
            margin="normal"
            {...register("status")}
            error={!!errors.status}
            helperText={errors.status?.message}>
            <MenuItem value="Available">Available</MenuItem>
            <MenuItem value="Issued">Issued</MenuItem>
          </TextField>

          <Box
            sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 2 }}>
            <Button variant="outlined" onClick={() => navigate("/")}>
              Cancel
            </Button>
            <Button variant="contained" type="submit" disabled={isSubmitting}>
              {editBook ? "Update" : "Add"}
            </Button>
          </Box>
        </form>
      </Paper>
    </Container>
  );
}
