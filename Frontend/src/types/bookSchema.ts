import * as yup from "yup";

export const bookSchema = yup.object({
  title: yup.string().required("Title is required"),
  author: yup.string().required("Author is required"),
  genre: yup.string().required("Genre is required"),
  year: yup
    .number()
    .typeError("Year must be a number")
    .integer("Year must be an integer")
    .min(1500, "Enter a realistic year")
    .max(new Date().getFullYear(), "Year cannot be in the future")
    .required("Year is required"),
  status: yup
    .mixed<"Available" | "Issued">()
    .oneOf(["Available", "Issued"])
    .required(),
});

export type BookFormData = yup.InferType<typeof bookSchema>;
