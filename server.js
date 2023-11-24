const express = require('express');
const port = 3000;
const cors = require('cors');
const mongoose = require('mongoose');
const crypto = require('crypto');
const multer = require('multer');
const contractInteraction = require('./contractInteraction');

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection (Use environmental variables for sensitive data)
mongoose.connect('mongodb+srv://ParthShethji:NiLhbR8oMjZzMrX2@medichainai.xh9pcap.mongodb.net/', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
    console.log('Connected to MongoDB');
});

// User Schema
const userSchema = new mongoose.Schema({
    role: String,
    ethereumAddress: String,
    encryptedDocument: Buffer,
    documentFileName: String,
});

const User = mongoose.model('User', userSchema);

// Define multer storage for file uploads
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Generate a strong and secure encryption key
const generateEncryptionKey = () => {
    return crypto.randomBytes(32).toString('hex'); // 32 bytes (256 bits) key size
};

const encryptionKey = generateEncryptionKey();
console.log('Encryption Key:', encryptionKey);

// Encryption settings
const algorithm = 'aes-256-cbc';
const iv = crypto.randomBytes(16);

const validateUploadedFile = (uploadedDocument) => {
    const allowedFileTypes = ['application/pdf', 'image/jpeg', 'image/png'];
    if (!allowedFileTypes.includes(uploadedDocument.mimetype)) {
        return 'Invalid file type';
    }

    if (uploadedDocument.size > 10 * 1024 * 1024) {
        return 'File too large';
    }

    return null;
};

const uploadAndEncryptDocument = async (user, uploadedDocument) => {
    try {
        // Validate the uploaded file
        const validationError = validateUploadedFile(uploadedDocument);
        if (validationError) {
            throw new Error(validationError);
        }

        // Encrypt the uploaded document
        const cipher = crypto.createCipheriv(algorithm, Buffer.from(encryptionKey, 'hex'), iv);
        let encryptedDocument = Buffer.concat([cipher.update(uploadedDocument.buffer), cipher.final()]);

        // Save the encrypted document and document filename to the user document
        user.encryptedDocument = encryptedDocument;
        user.documentFileName = uploadedDocument.originalname;

        await user.save();
    } catch (error) {
        throw error;
    }
};

app.post('/upload', upload.single('document'), async (req, res) => {
    try {
        const uploadedDocument = req.file;

        if (!uploadedDocument) {
            return res.status(400).json({ error: 'No document uploaded' });
        }

        const ethereumAddress = req.header('ethereumAddress'); // Get the Ethereum address from the request header

        // Find the user by Ethereum address in your MongoDB database
        const user = await User.findOne({ ethereumAddress });

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Ensure you have the correct variable holding the document details from MongoDB
        const documentDetails = {
            _id: user._id, // Assuming user._id is the correct ID for the document
            // Add other document details if needed
        };

        await uploadAndEncryptDocument(user, uploadedDocument);
        await contractInteraction.createDocument('0x' + documentDetails._id, '0x' + encryptionKey, { gas: 200   0000 });

        res.json({ message: 'Document uploaded and encrypted successfully' });
    } catch (error) {
        console.error('Error during document upload:', error);
        res.status(500).json({ error: 'An unexpected error occurred' });
    }
});

app.get('/user', async (req, res) => {
    try {
        const users = await User.find();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error fetching users' });
    }
});

app.post('/user', async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        res.json({ message: 'User data saved successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error saving user data' });
    }
});

app.post('/grant-access', async (req, res) => {
    const { documentId, user } = req.body;
    await contractInteraction.grantAccess(documentId, user);
    res.json({ message: 'Access granted successfully' });
  });
  
  app.post('/revoke-access', async (req, res) => {
    const { documentId, user } = req.body;
    await contractInteraction.revokeAccess(documentId, user);
    res.json({ message: 'Access revoked successfully' });
  });

app.get('/api', (req, res) => {
    res.json({ message: 'Hello world from Parth' });
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
