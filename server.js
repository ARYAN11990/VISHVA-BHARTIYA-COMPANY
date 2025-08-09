const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public'))); // Updated to use the correct public folder path

// MongoDB connection using environment variable
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected successfully'))
    .catch(err => console.log('MongoDB connection error:', err));

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true }
});
const User = mongoose.model('User', userSchema);

// **New code for Contact Schema**
const contactSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true },
    message: { type: String, required: true },
    submittedAt: { type: Date, default: Date.now }
});
const Contact = mongoose.model('Contact', contactSchema);

// Signup API endpoint
app.post('/signup', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        const newUser = new User({ name, email, password });
        await newUser.save();
        res.status(200).json({ success: true, message: 'Account created successfully!' });
    } catch (error) {
        console.error('Signup error details:', error);
        if (error.code === 11000) {
            res.status(409).json({ success: false, message: 'User with this email already exists.' });
        } else {
            res.status(500).json({ success: false, message: 'Error creating user.' });
        }
    }
});

// Login API endpoint
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ email, password });

        if (user) {
            res.status(200).json({ success: true, message: 'Login successful!' });
        } else {
            res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: 'Login failed.' });
    }
});

// **New code for Contact form submission**
app.post('/contact', async (req, res) => {
    try {
        const { name, email, message } = req.body;
        const newContact = new Contact({ name, email, message });
        await newContact.save();
        console.log('New contact form submission saved:', newContact);
        res.status(200).json({ success: true, message: 'Thank you for your message! We will get back to you soon.' });
    } catch (error) {
        console.error('Contact form submission error:', error);
        res.status(500).json({ success: false, message: 'Error submitting form. Please try again.' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});