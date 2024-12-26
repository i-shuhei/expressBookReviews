const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


// Define the registration route
public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if username or password is missing
  if (!username || !password) {
    return res.status(400).json({
      message: "Error: Username and password are required",
    });
  }

  // Check if the username already exists
  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res.status(400).json({
      message: "Error: Username already exists",
    });
  }

  // If validations pass, register the user
  users.push({ username, password });
  return res.status(200).json({
    message: "User successfully registered",
  });
});

// Get the book list available in the shop
/*
public_users.get('/',function (req, res) {
  //Write your code here
  return res.status(200).json({ message: "Success", data: JSON.stringify(books) });
});
*/

// Task 10
function getBooks() {
    return new Promise((resolve, reject) => {
      resolve(books); 
    });
  };
  
public_users.get('/', function (req, res) {
    getBooks()
        .then((retrievedBooks) => {
        res.status(200).json({
            message: "Success",
            data: JSON.stringify(retrievedBooks),
        });
        })
        .catch((error) => {
        res.status(500).json({
            message: "Something went wrong",
            error: error.toString(),
        });
    });
});

// Get book details based on ISBN
/*
public_users.get('/isbn/:isbn', (req, res) => {
    // Retrieve the ISBN from request parameters
    const { isbn } = req.params;
    
    // Find the book in your data source
    const book = books[isbn];
  
    if (!book) {
      // ISBN not found in data source
      return res.status(404).json({ 
        message: `Book with ISBN ${isbn} not found.` 
      });
    }
  
    // Return the book details
    return res.status(200).json(book);
  });
*/

// Tasl 11
public_users.get('/isbn/:isbn', (req, res) => {
    const { isbn } = req.params;
  
    new Promise((resolve, reject) => {
      const book = books[isbn];
      if (!book) {
        reject(`Book with ISBN ${isbn} not found.`);
      } else {
        resolve(book);
      }
    })
      .then(book => {
        return res.status(200).json(book);
      })
      .catch(error => {
        return res.status(404).json({ 
          message: error 
        });
      });
  });

// Get book details based on author
/*
public_users.get('/author/:author', (req, res) => {
    const authorParam = req.params.author.toLowerCase();
  
    // Filter the books by matching author name (case-insensitive)
    const matchingBooks = Object.entries(books)
      .filter(([isbn, book]) => book.author.toLowerCase() === authorParam)
      .map(([isbn, book]) => ({ isbn, ...book }));
  
    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: `No books found for author '${req.params.author}'` });
    }
  
    return res.status(200).json(matchingBooks);
  });
*/

// Task 12
public_users.get('/author/:author', (req, res) => {
    new Promise((resolve, reject) => {
      const authorParam = req.params.author.toLowerCase();
  
      const matchingBooks = Object.entries(books)
        .filter(([isbn, book]) => book.author.toLowerCase() === authorParam)
        .map(([isbn, book]) => ({ isbn, ...book }));
  
      if (matchingBooks.length === 0) {
        reject({ message: `No books found for author '${req.params.author}'`, status: 404 });
      } else {
        resolve(matchingBooks);
      }
    })
      .then((matchingBooks) => {
        return res.status(200).json(matchingBooks);
      })
      .catch((err) => {
        return res.status(err.status || 500).json({ message: err.message });
      });
  });

// Get all books based on title
/*
public_users.get('/title/:title',function (req, res) {
    const titleParam = req.params.title.toLowerCase();
  
    // Filter the books by matching author name (case-insensitive)
    const matchingBooks = Object.entries(books)
      .filter(([isbn, book]) => book.title.toLowerCase() === titleParam)
      .map(([isbn, book]) => ({ isbn, ...book }));
  
    if (matchingBooks.length === 0) {
      return res.status(404).json({ message: `No books found for title '${req.params.title}'` });
    }
  
    return res.status(200).json(matchingBooks);
});
*/

// Task 13
public_users.get('/title/:title', (req, res) => {
    new Promise((resolve, reject) => {
      const titleParam = req.params.title.toLowerCase();
      
      const matchingBooks = Object.entries(books)
        .filter(([isbn, book]) => book.title.toLowerCase() === titleParam)
        .map(([isbn, book]) => ({ isbn, ...book }));
  
      if (matchingBooks.length === 0) {
        reject(`No books found for title '${req.params.title}'`);
      } else {
        resolve(matchingBooks);
      }
    })
      .then(matchingBooks => {
        res.status(200).json(matchingBooks);
      })
      .catch(error => {
        res.status(404).json({ message: error });
      });
  });

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
    // Retrieve the ISBN from request parameters
    const { isbn } = req.params;
    
    // Find the book in your data source
    const book = books[isbn];
  
    if (!book) {
      // ISBN not found in data source
      return res.status(404).json({ 
        message: `Book with ISBN ${isbn} not found.` 
      });
    }
  
    // Return the book details
    return res.status(200).json({
        "isbn":isbn, 
        "reviews": book.reviews
    });
});

module.exports.general = public_users;
