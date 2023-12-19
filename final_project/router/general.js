const express = require('express');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username) => {
    const usersWithSameName = users.filter((user) => {
        return user.username == username;
    })

    if (usersWithSameName.length > 0) {
        return true;
    } else {
        return false;
    }
}

public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (username && password) {
    if (!doesExist(username)) {
        users.push({"username": username, "password": password});
        return res.status(200).json({message: `User ${username} successfully registered.`});
    } else {
        return res.status(404).json({message: `User ${username} already exists!`});  
    }
  } else {
    return res.status(404).json({message: "Username and/or password field missing in body"});
  }
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  let getAllBooks = new Promise((resolve, reject) => {
    resolve(res.send(JSON.stringify(books, null, 4)));
  });
  return getAllBooks;
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const findBook = books[isbn];

  let findBookPromise = new Promise((resolve, reject) => {
    if (findBook) {
        resolve(res.send(findBook));
    } else {
        resolve(res.status(404).json({message: `Book with ISBN ${isbn} does not exist!`}));
    }
  });

  return findBookPromise;
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  let findBookPromise = new Promise((resolve, reject) => {
    for (key in books) {
        if (books[key].author == author) {
            let obj = {};
            obj[key] = books[key];
            resolve(res.send(obj));
        }
    }
    // else no book by author exists
    resolve(res.status(404).json({message: `Books by author ${author} do not exist!`}));
  });

  return findBookPromise;
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;

  let findBookPromise = new Promise((resolve, reject) => {
    for (key in books) {
        if (books[key].title == title) {
            let obj = {};
            obj[key] = books[key];
            resolve(res.send(obj));
        }
    }
    // else no book by author exists
    resolve(res.status(404).json({message: `Book named ${title} does not exist!`}));
  });

  return findBookPromise;
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const findBook = books[isbn];
   
  if (findBook) {
    return res.send(findBook.reviews);
  }

  return res.status(404).json({message: `Book with ISBN ${isbn} does not exist!`});
});

module.exports.general = public_users;
