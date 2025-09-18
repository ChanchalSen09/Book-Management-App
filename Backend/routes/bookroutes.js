const express = require("express");
const {
  getBooks,
  addBook,
  getBook,
  updateBook,
  deleteBook,
} = require("../controller/bookController");

const router = express.Router();

router.route("/").get(getBooks).post(addBook);

router.route("/:id").put(updateBook).delete(deleteBook).get(getBook);

module.exports = router;
