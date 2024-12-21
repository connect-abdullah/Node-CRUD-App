require("dotenv").config();
const express = require("express");
const mongoose = require("./db"); // Updated to use the db.js file
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
    session({
        secret: "my secret key",
        saveUninitialized: true,
        resave: false,
        store: MongoStore.create({
            mongoUrl: process.env.DB_URI,
        }),
    })
);

app.use((req, res, next) => {
    res.locals.message = req.session.message;
    delete req.session.message;
    next();
});

// app.use("/uploads", express.static("uploads"));

// Set template engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Route prefix
app.use("", require("./routes/routes"));

// Set Content Security Policy
app.use((req, res, next) => {
    res.setHeader("Content-Security-Policy", 
        "default-src 'self'; " +
        "img-src 'self' https://res.cloudinary.com; " +
        "script-src 'self' https://code.jquery.com https://cdn.datatables.net; " +
        "style-src 'self' https://cdnjs.cloudflare.com https://cdn.jsdelivr.net https://cdn.datatables.net; " +
        "font-src 'self' https://cdnjs.cloudflare.com;");
    next();
});

  

app.listen(PORT, () => {
    console.log(`Server started at http://localhost:${PORT}`);
});
