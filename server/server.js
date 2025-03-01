const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { OpenAI } = require('openai');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    // Accept images only
    if (!file.originalname.match(/\.(jpg|jpeg|png|gif|heic|pdf)$/i)) {
      return cb(new Error('Only image and PDF files are allowed!'), false);
    }
    cb(null, true);
  }
});

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Endpoint to scan receipt
app.post('/api/scan-receipt', upload.single('receipt'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Read the file as base64
    const filePath = req.file.path;
    const fileBuffer = fs.readFileSync(filePath);
    const base64Image = fileBuffer.toString('base64');
    const dataURI = `data:${req.file.mimetype};base64,${base64Image}`;

    // Call OpenAI API to analyze the receipt
    const response = await openai.chat.completions.create({
      model: "gpt-4-turbo",
      messages: [
        {
          role: "system",
          content: "You are a helpful assistant that analyzes medical receipts and extracts relevant information. Extract the following information: description/name of the medical expense, amount, date, and categorize it into one of the following categories: medication, consultation, test, hospital, other."
        },
        {
          role: "user",
          content: [
            { type: "text", text: "Please analyze this medical receipt and extract the expense details in JSON format with the following fields: name, amount (as a number), date (in YYYY-MM-DD format), category (one of: medication, consultation, test, hospital, other), and notes (any additional relevant information)." },
            { type: "image_url", image_url: { url: dataURI } }
          ]
        }
      ],
      max_tokens: 1000
    });

    // Parse the response to extract expense details
    const assistantMessage = response.choices[0].message.content;
    
    // Try to extract JSON from the response
    let expenseData;
    try {
      // Look for JSON in the response
      const jsonMatch = assistantMessage.match(/```json\n([\s\S]*?)\n```/) || 
                        assistantMessage.match(/{[\s\S]*?}/);
      
      const jsonString = jsonMatch ? jsonMatch[1] || jsonMatch[0] : assistantMessage;
      expenseData = JSON.parse(jsonString);
    } catch (error) {
      console.error('Error parsing JSON from GPT response:', error);
      return res.status(500).json({ 
        error: 'Failed to parse expense data from the receipt',
        rawResponse: assistantMessage
      });
    }

    // Clean up the uploaded file
    fs.unlinkSync(filePath);

    // Return the extracted expense data
    return res.json({ 
      success: true, 
      data: expenseData
    });
  } catch (error) {
    console.error('Error scanning receipt:', error);
    return res.status(500).json({ error: 'Failed to scan receipt', details: error.message });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 