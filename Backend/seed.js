const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Book = require("./model/book.js");
const { books } = require("./booksData.js");

dotenv.config();

const seedBooks = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Book.deleteMany();
    await Book.insertMany(books);
    console.log("Inserted 50+ demo books successfully!");
    process.exit();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
};

seedBooks();
