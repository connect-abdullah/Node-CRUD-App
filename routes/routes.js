const express = require("express");
const router = express.Router();
const User = require("../models/users");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../cloudinary");

// Configure multer storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: "uploads",
        format: async () => "jpg",
        public_id: (req, file) => Date.now(),
    },
});

const upload = multer({ storage }).single("image");

// Insert User to Database Route
router.post("/add", upload, async (req, res) => {
    try {
        const user = new User({
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            image: req.file.path, // Cloudinary URL
        });
        await user.save();

        req.session.manager = {
            type: "success",
            message: "User Added Successfully",
        };
        res.redirect("/");
    } catch (error) {
        res.status(500).json({ message: error.message, type: "danger" });
    }
});

// Show Users on Page
router.get("/", (req, res) => {
    User.find()
        .then((users) => {
            const message = req.session.manager;  // Get the message
            req.session.manager = null;  // Clear the message immediately

            res.render("index", {
                title: "Home Page",
                users: users,
                message: message,  // Pass the message if it exists
            });
        })
        .catch((err) => {
            res.status(500).send("Error retrieving users.");
        });
});


// Rendering Add User Page
router.get("/add", (req, res) => {
    res.render("add_users", { title: "Add Users" });
});

// Delete User Route
router.get("/delete/:id", async (req, res) => {
    try {
        await User.findByIdAndDelete(req.params.id);

        // Set the session message for successful deletion
        req.session.manager = {
            type: "success",
            message: "User Deleted Successfully",
        };

        // Redirect to the home page
        res.redirect("/");
    } catch (err) {
        res.status(500).send("Error deleting user.");
    }
});

// Edit a User
router.get("/edit/:id", async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            res.redirect("/");
        } else {
            res.render("edit_users", { title: "Edit User", user: user });
        }
    } catch (err) {
        res.redirect("/");
    }
});

// Update User Route
router.post("/update/:id", upload, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: "User not found", type: "danger" });
        }

        const updatedImage = req.file ? req.file.path : user.image;
        user.name = req.body.name;
        user.email = req.body.email;
        user.phone = req.body.phone;
        user.image = updatedImage;

        await user.save();

        req.session.manager = {
            type: "success",
            message: "User Updated Successfully",
        };
        res.redirect("/");
    } catch (err) {
        res.status(500).json({ message: err.message, type: "danger" });
    }
});

module.exports = router;
