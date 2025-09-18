export interface Book {
  _id?: string;
  title: string;
  author: string;
  genre: string;
  year: number; // publication year (e.g., 2023)
  status: "Available" | "Issued";
}
