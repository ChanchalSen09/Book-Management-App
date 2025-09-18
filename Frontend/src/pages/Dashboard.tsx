import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  Container,
  Typography,
  Button,
  TextField,
  MenuItem,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
  Pagination,
} from "@mui/material";

type Book = {
  _id: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  status: "Available" | "Issued";
};

const fetchBooks = async (): Promise<Book[]> => {
  const res = await axios.get("http://localhost:5000/api/books/");
  return res.data;
};

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  // Filters & search
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const {
    data: books,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["books"],
    queryFn: fetchBooks,
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) =>
      axios.delete(`http://localhost:5000/api/books/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
    },
  });

  const filteredBooks = useMemo(() => {
    if (!books) return [];
    return books
      .filter((b) =>
        [b.title.toLowerCase(), b.author.toLowerCase()].some((field) =>
          field.includes(search.toLowerCase())
        )
      )
      .filter((b) => (genreFilter ? b.genre === genreFilter : true))
      .filter((b) => (statusFilter ? b.status === statusFilter : true));
  }, [books, search, genreFilter, statusFilter]);

  const totalPages = Math.ceil(filteredBooks.length / pageSize);
  const paginatedBooks = filteredBooks.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  if (isLoading)
    return (
      <Container sx={{ p: 4 }}>
        <Typography variant="h6">Loading books...</Typography>
      </Container>
    );

  if (isError)
    return (
      <Container sx={{ p: 4 }}>
        <Typography color="error">Error loading books.</Typography>
      </Container>
    );

  return (
    <Container sx={{ py: 4 }}>
      {/* Header */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        mb={3}
        spacing={2}>
        <Typography variant="h4" fontWeight="bold">
          Book Management
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate("/add")}>
          + Add Book
        </Button>
      </Stack>

      {/* Filters */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={2}
        mb={3}
        alignItems="center">
        <TextField
          label="Search by Title/Author"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => {
            setPage(1);
            setSearch(e.target.value);
          }}
        />
        <TextField
          select
          label="Genre"
          size="small"
          value={genreFilter}
          onChange={(e) => {
            setPage(1);
            setGenreFilter(e.target.value);
          }}
          sx={{ minWidth: 150 }}>
          <MenuItem value="">All Genres</MenuItem>
          {[...new Set(books.map((b) => b.genre))].map((genre) => (
            <MenuItem key={genre} value={genre}>
              {genre}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          select
          label="Status"
          size="small"
          value={statusFilter}
          onChange={(e) => {
            setPage(1);
            setStatusFilter(e.target.value);
          }}
          sx={{ minWidth: 150 }}>
          <MenuItem value="">All Status</MenuItem>
          <MenuItem value="Available">Available</MenuItem>
          <MenuItem value="Issued">Issued</MenuItem>
        </TextField>
      </Stack>

      {/* Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Title</TableCell>
              <TableCell>Author</TableCell>
              <TableCell>Genre</TableCell>
              <TableCell>Published Year</TableCell>
              <TableCell>Status</TableCell>
              <TableCell align="center">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {paginatedBooks.length ? (
              paginatedBooks.map((book) => (
                <TableRow key={book._id}>
                  <TableCell>{book.title}</TableCell>
                  <TableCell>{book.author}</TableCell>
                  <TableCell>{book.genre}</TableCell>
                  <TableCell>{book.year}</TableCell>
                  <TableCell>{book.status}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" spacing={1} justifyContent="center">
                      <Button
                        variant="contained"
                        color="warning"
                        size="small"
                        onClick={() => navigate(`/edit/${book._id}`)}>
                        Edit
                      </Button>
                      <Button
                        variant="contained"
                        color="error"
                        size="small"
                        onClick={() => {
                          if (
                            confirm(
                              "Are you sure you want to delete this book?"
                            )
                          ) {
                            deleteMutation.mutate(book._id);
                          }
                        }}>
                        Delete
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  No books found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <Stack spacing={2} mt={3} alignItems="center">
        <Pagination
          count={totalPages || 1}
          page={page}
          onChange={(_, value) => setPage(value)}
          color="primary"
        />
      </Stack>
    </Container>
  );
}
