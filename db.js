const mongoose = require("mongoose");

const connectDB = async () => {
    if (mongoose.connection.readyState === 0) {
        await mongoose.connect(process.env.DB_URI)
        .then(() => console.log("Connected to Database"))
        .catch((error) => console.log("Error connecting to Database:", error));
      
    }
};

connectDB();
module.exports = mongoose;
