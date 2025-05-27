const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://abdulrafay9908:<db_password>@cluster0.zyqegts.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
    console.log('MongoDB Connected Successfully');
  } catch (error) {
    console.error(error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
