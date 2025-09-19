import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
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
  ToggleButtonGroup,
  ToggleButton,
  Card,
  CardContent,
  CardActions,
  Skeleton,
} from "@mui/material";
import ViewModuleIcon from "@mui/icons-material/ViewModule";
import ViewListIcon from "@mui/icons-material/ViewList";
import { useSnackbar } from "notistack";

// ✅ Centralized API
import { getBooks, deleteBook } from "../api/booksApi";
import type { Book } from "../types/book";

export default function Dashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  // Filters & search
  const [search, setSearch] = useState("");
  const [genreFilter, setGenreFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  // Pagination
  const [page, setPage] = useState(1);
  const pageSize = 10;

  // Toggle view (list/grid)
  const [view, setView] = useState<"list" | "grid">("list");

  // Fetch books
  const {
    data: books,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["books"],
    queryFn: getBooks,
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteBook(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["books"] });
      enqueueSnackbar("Book deleted successfully!", { variant: "success" });
    },
    onError: () => {
      enqueueSnackbar("Failed to delete book.", { variant: "error" });
    },
  });

  // Derived data
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

  // Skeleton Loader
  if (isLoading) {
    return (
      <Container sx={{ py: 4 }}>
        <Typography variant="h4" fontWeight="bold" mb={3}>
          Book Management
        </Typography>

        {view === "list" ? (
          <TableContainer component={Paper}>
            <Table>
              <TableHead>
                <TableRow>
                  {[
                    "Title",
                    "Author",
                    "Genre",
                    "Published Year",
                    "Status",
                    "Actions",
                  ].map((col) => (
                    <TableCell key={col}>
                      <Skeleton variant="text" width={80} />
                    </TableCell>
                  ))}
                </TableRow>
              </TableHead>
              <TableBody>
                {Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    {Array.from({ length: 6 }).map((_, j) => (
                      <TableCell key={j}>
                        <Skeleton variant="text" width="100%" />
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        ) : (
          <Stack
            direction="row"
            flexWrap="wrap"
            gap={2}
            justifyContent={{ xs: "center", sm: "flex-start" }}>
            {Array.from({ length: 6 }).map((_, i) => (
              <Card key={i} sx={{ width: 280 }}>
                <CardContent>
                  <Skeleton variant="text" width="60%" height={28} />
                  <Skeleton variant="text" width="40%" />
                  <Skeleton variant="text" width="50%" />
                  <Skeleton variant="text" width="30%" />
                </CardContent>
                <CardActions>
                  <Skeleton variant="rectangular" width={60} height={30} />
                  <Skeleton variant="rectangular" width={60} height={30} />
                </CardActions>
              </Card>
            ))}
          </Stack>
        )}
      </Container>
    );
  }

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
        <Stack direction="row" spacing={2}>
          <ToggleButtonGroup
            value={view}
            exclusive
            onChange={(_, val) => val && setView(val)}
            size="small">
            <ToggleButton value="list">
              <ViewListIcon />
            </ToggleButton>
            <ToggleButton value="grid">
              <ViewModuleIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate("/add")}>
            + Add Book
          </Button>
        </Stack>
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
          {[...new Set(books?.map((b) => b.genre))].map((genre) => (
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

      {/* Conditional Rendering: List / Grid */}
      {view === "list" ? (
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
                    <TableCell>{book.publishedYear}</TableCell>
                    <TableCell>{book.status}</TableCell>
                    <TableCell align="center">
                      <Stack
                        direction="row"
                        spacing={1}
                        justifyContent="center">
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
      ) : (
        <Stack
          direction="row"
          flexWrap="wrap"
          gap={2}
          justifyContent={{ xs: "center", sm: "flex-start" }}>
          {paginatedBooks.length ? (
            paginatedBooks.map((book) => (
              <Card key={book._id} sx={{ width: 280 }}>
                <CardContent>
                  <Typography variant="h6">{book.title}</Typography>
                  <Typography color="text.secondary">{book.author}</Typography>
                  <Typography variant="body2">{book.genre}</Typography>
                  <Typography variant="body2">
                    Year: {book.publishedYear}
                  </Typography>
                  <Typography variant="body2">Status: {book.status}</Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    color="warning"
                    onClick={() => navigate(`/edit/${book._id}`)}>
                    Edit
                  </Button>
                  <Button
                    size="small"
                    color="error"
                    onClick={() => {
                      if (
                        confirm("Are you sure you want to delete this book?")
                      ) {
                        deleteMutation.mutate(book._id);
                      }
                    }}>
                    Delete
                  </Button>
                </CardActions>
              </Card>
            ))
          ) : (
            <Paper sx={{ p: 4, textAlign: "center", width: "100%" }}>
              <Typography>No books found.</Typography>
            </Paper>
          )}
        </Stack>
      )}

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
