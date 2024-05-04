const express = require('express');
const mongoose = require('mongoose');
const multer = require('multer');
const cors = require('cors');
const path = require('path');

const app = express();

require('dotenv').config();

// Enable CORS
app.use(cors());

// Connect to MongoDB
mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@foodieappcluster.idjfgnr.mongodb.net/FoodieAppDatabase?retryWrites=true&w=majority&appName=FoodieAppCluster`)
.then(console.log("MongoDB Connected Successfully!"))
  .catch((error) => {
    console.log("Error connecting to MongoDB", error);
  });
const db = mongoose.connection;

// Define a schema for user data
const userSchema = new mongoose.Schema({
  phoneNumber: { type: String, unique: true }, // phoneNumber must be unique
  name: String,
  profilePhoto: String, // Store image path
  coverPhoto: String,   // Store image path
  gender: String,
  country: String
});

const User = mongoose.model('QviqUser', userSchema);

// Set up multer for handling file uploads
const upload = multer({ dest: 'uploads/' });

// Route to handle form submission
app.post('/api/signup', upload.fields([{ name: 'profilePhoto' }, { name: 'coverPhoto' }]), async (req, res) => {
  try {
    const { name, phoneNumber, gender, country } = req.body;
    const existingUser = await User.findOne({ phoneNumber });
    
    if (existingUser) {
      return res.status(400).json({ message: 'User with this phone number already exists' });
    }

    const profilePhoto = req.files['profilePhoto'][0].filename; // Change to filename
    const coverPhoto = req.files['coverPhoto'][0].filename; // Change to filename

    const newUser = new User({ name, phoneNumber, profilePhoto, coverPhoto, gender, country });
    await newUser.save();

    res.status(201).json({ message: 'User created successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get all users
app.get('/api/users', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Route to get a single user by mobile number
app.get('/api/user/:phoneNumber', async (req, res) => {
  try {
    const { phoneNumber } = req.params;
    const user = await User.findOne({ phoneNumber });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Serve static files (profile photos)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/',(req,res)=>{
    res.send("Hello World");
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
