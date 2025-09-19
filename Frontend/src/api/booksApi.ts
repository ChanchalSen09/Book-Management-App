import api from "./axios";

export type Book = {
  _id?: string;
  title: string;
  author: string;
  genre: string;
  year: number;
  status: "Available" | "Issued";
};

export const getBooks = async (): Promise<Book[]> => {
  const res = await api.get("/books");
  return res.data;
};

export const getBookById = async (id: string): Promise<Book> => {
  const res = await api.get(`/books/${id}`);
  return res.data;
};

export const addBook = async (newBook: Book): Promise<Book> => {
  const res = await api.post("/books", newBook);
  return res.data;
};

export const updateBook = async (
  id: string,
  updatedBook: Book
): Promise<Book> => {
  const res = await api.put(`/books/${id}`, updatedBook);
  return res.data;
};

export const deleteBook = async (id: string): Promise<void> => {
  await api.delete(`/books/${id}`);
};
