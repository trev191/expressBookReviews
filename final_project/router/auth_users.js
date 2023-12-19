const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
  const validUser = users.filter((user) => {
    return (user.username === username && user.password === password);
  })
  if (validUser.length > 0) {
    return true;
  } else {
    return false;
  }
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (authenticatedUser(username, password)) {
        const accessToken = jwt.sign({
            data: password
        }, 'access', { expiresIn: 60 * 60});

        req.session.authorization = {
            accessToken, username
        }

        return res.status(200).send("User successfully logged in");
    } else {
        return res.status(208).json({message: "Invalid Login. Check username and password"});
    }
  } else {
    return res.status(404).json({message: "Error logging in"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const review = req.query.review;
    const isbn = req.params.isbn;
    const findBook = books[isbn];
     
    if (findBook) {
      let reviews = findBook.reviews;
      if (reviews[username]) {
        // update existing review
        reviews[username] = review;
        return res.send(`Review successfully updated: ${JSON.stringify(findBook)}`);
      } else {
        // add new review
        reviews[username] = review;
        return res.send(`Review successfully updated: ${JSON.stringify(findBook)}`);
      }
    }
  
    return res.status(404).json({message: `Book with ISBN ${isbn} does not exist!`});
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
    const username = req.session.authorization.username;
    const isbn = req.params.isbn;
    const findBook = books[isbn];

    if (findBook) {
        let reviews = findBook.reviews;
        if (reviews[username]) {
          // update existing review
          delete reviews[username];
          return res.send(`Review successfully deleted: ${JSON.stringify(findBook)}`);
        } else {
          // user does not have a review
          return res.send(`Review by ${username} does not exist!`);
        }
    }

    return res.status(404).json({message: `Book with ISBN ${isbn} does not exist!`});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
