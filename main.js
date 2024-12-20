// Imports

require("dotenv").config()
const express = require("express");
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const PORT = process.env.PORT || 3000;

// Database Conection
mongoose.connect(process.env.DB_URI)
  .then(() => console.log("Connected to Database"))
  .catch((error) => console.log("Error connecting to Database:", error));
const db = mongoose.connection;

// middlewares
app.use(express.urlencoded({extended : false}));
app.use(express.json());

app.use(session({
    secret : "my secret key",
    saveUninitialized : true,
    resave : false
}))

app.use((req, res, next) => {
    res.locals.message = req.session.message; // Copy session message to locals
    delete req.session.message;              // Clear the message from the session
    next();
});

app.use("/uploads", express.static("uploads"));


// Set template engine
app.set("view engine", "ejs")

// route prefix
app.use("", require('./routes/routes')) // This imports the router module from the file routes/routes.js.

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`)
})