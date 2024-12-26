const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
    // For example, ensure the username is non-empty
    // and is of type string.
    if (typeof username !== "string" || username.trim().length === 0) {
      return false;
    }
    return true;
  };

const authenticatedUser = (username, password) => {
    // Look up any user in the users array with matching username & password
    const validUsers = users.filter((user) => {
      return (user.username === username && user.password === password);
    });
    return validUsers.length > 0;
  };
  

//only registered users can login
regd_users.post("/login", (req,res) => {
    const username = req.body.username;
    const password = req.body.password;
  
    // Check if username / password are provided
    if (!username || !password) {
      return res.status(400).json({
        message: "Please provide a username and password.",
      });
    }
  
    // Make sure the username meets our "valid" criteria
    if (!isValid(username)) {
      return res.status(401).json({
        message: "Invalid username.",
      });
    }
  
    // Check if user exists in our records
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({
        message: "Invalid Login. Check username and password.",
      });
    }
  
    // Generate JWT token (signing data can be customized as needed)
    let accessToken = jwt.sign(
      {
        data: { username: username },
      },
      "access", // Secret key used to sign JWT (replace with a more secure key in production)
      { expiresIn: 60 * 60 } // Token expiration (1 hour)
    );
  
    // Save the token in session (if you're using express-session or similar)
    req.session.authorization = {
      accessToken,
      username,
    };
  
    return res.status(200).json({
      message: "User logged in successfully.",
      token: accessToken,
    });
  });

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  // Get the ISBN from the URL parameters
  const isbn = req.params.isbn;

  // Get the review text from the query string (per the hint requirements).
  // Example: /auth/review/1?review=great%20book
  const reviewText = req.query.review;

  // Retrieve the logged-in username from session
  const username = req.session.authorization.username;

  // Check if the book exists
  if (!books[isbn]) {
    return res.status(404).json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // If the review is empty or missing, handle accordingly
  if (!reviewText) {
    return res.status(400).json({ message: "Review text cannot be empty." });
  }

  // Add or modify the review
  // If the user has previously reviewed the book, this will overwrite the old review
  books[isbn].reviews[username] = reviewText;

  // Respond with success
  return res.status(200).json({
    message: `Review for book with ISBN ${isbn} has been added/updated successfully.`,
    reviews: books[isbn].reviews
  });
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    // Extract the ISBN from the route parameter
    const isbn = req.params.isbn;
  
    // Get the logged-in username from session
    const username = req.session.authorization.username;
  
    // Check if the book exists
    if (!books[isbn]) {
      return res.status(404).json({ 
        message: `Book with ISBN ${isbn} not found.` 
      });
    }
  
    // Check if the user has any review for this book
    if (!books[isbn].reviews[username]) {
      return res.status(400).json({ 
        message: `No review by user '${username}' found for ISBN ${isbn}.` 
      });
    }
  
    // Delete the user's review
    delete books[isbn].reviews[username];
  
    return res.status(200).json({
      message: `Review by '${username}' for book with ISBN ${isbn} has been deleted.`,
      reviews: books[isbn].reviews
    });
  });

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
