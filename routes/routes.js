const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer")
const fs = require("fs")

// Image Upload
let storage = multer.diskStorage ({
    destination:  function (req,file,cb) {
        cb(null,"./uploads")
    },
    filename: function (req,file,cb) {
        cb(null, file.fieldname + "_"+  Date.now()+ "_" + file.originalname)
    },
})

let upload = multer({
    storage: storage, // Use the storage configuration defined above.
}).single("image")


// Insert User to Database Route, Using POST REQ
router.post("/add", upload, (req,res) => {
    const user = new User ({
        name: req.body.name,       // User's name from the form data.
        email: req.body.email,     // User's email from the form data.
        phone: req.body.phone,     // User's phone from the form data.
        image: req.file.filename   // The filename of the uploaded image is saved in the "image" field.
    });
    user.save()
    .then(() => {
        req.session.manager = {
            type: "success",
            message: "User Added Successfully"
        };
        res.redirect("/");  
    })
    .catch(err => {
        res.json({ message: err.message, type: 'danger' });
    });
})

// Show Users on Page
router.get("/", (req, res) => {
    User.find() // Get all users from the database
        .then(users => {
            res.render("index", { 
                title: "Home Page", 
                users: users, // Pass users to the view
                message: req.session.manager
            });
            // Clear the session message after passing it
            req.session.manager = null;
        })
        .catch(err => {
            res.status(500).send("Error retrieving users.");
        });
});

// Rendering Users HTML File
router.get("/add", (req,res) => {
    res.render("add_users", {title: "Add Users"})
})

// Delete User Route
router.get("/delete/:id", (req, res) => {
    const userId = req.params.id;
    User.findByIdAndDelete(userId)
        .then(() => {
            req.session.manager = {
                type: "success",
                message: "User Deleted Successfully"
            };
            // Clear the session message after passing it
            req.session.manager = null;
            res.redirect("/"); // Redirect to home page after deletion
        })
        .catch(err => {
            res.status(500).send("Error deleting user.");
        });
});

// Edit a User 
router.get("/edit/:id", async (req, res) => {
    let id = req.params.id;

    try {
        const user = await User.findById(id);
        if (user == null) {
            res.redirect("/");
        } else {
            res.render("edit_users", {
                title: "Edit User",
                user: user,
            });
        }
    } catch (err) {
        res.redirect("/");
    }
});

// Update User Route
router.post("/update/:id", upload, async (req, res) => {
    let id = req.params.id;
    let new_image = "";

    if (req.file) {
        new_image = req.file.filename;

        try {
            // Delete the old image from the filesystem
            fs.unlinkSync("./uploads/" + req.body.old_image);
        } catch (err) {
            console.log(err);
        }
    } else {
        new_image = req.body.old_image;
    }

    try {
        // Find the user by ID and update
        const result = await User.findByIdAndUpdate(id, {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: new_image,
        }, { new: true });

        // If no user found or error occurs, send a message
        if (!result) {
            return res.json({ message: "User not found", type: "danger" });
        }

        // Set session and redirect after successful update
        req.session.manager = {
            type: "success",
            message: "User Updated Successfully!",
        };
        res.redirect("/");
    } catch (err) {
        res.json({ message: err.message, type: "danger" });
    }
});


module.exports = router