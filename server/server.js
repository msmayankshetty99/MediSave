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
    console.log('Receipt scan request received');
    
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }
    
    console.log('File uploaded:', req.file.path);
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ success: false, error: 'OpenAI API key is not configured' });
    }
    
    console.log('Processing receipt with OpenAI...');
    
    // Read the file
    const fileBuffer = fs.readFileSync(req.file.path);
    const base64Image = fileBuffer.toString('base64');
    
    // Prepare the prompt for GPT-4o-mini
    const prompt = `
      You are a medical expense analyzer. Extract the following information from this receipt image:
      - Date of service
      - Provider/Merchant name
      - Total amount
      - Service description or items purchased
      - Any insurance information if present
      
      Format the response as a JSON object with these fields:
      {
        "date": "YYYY-MM-DD",
        "provider": "Provider Name",
        "amount": 123.45,
        "description": "Brief description of service or items",
        "category": "medication", 
        "insuranceInfo": "Any relevant insurance details or null if none"
      }
      
      For the category field, you MUST use one of these exact values (all lowercase):
      - "medication" - for prescriptions, over-the-counter drugs, medical supplies
      - "consultation" - for doctor visits, specialist appointments
      - "test" - for lab work, x-rays, scans, diagnostics
      - "hospital" - for hospital stays, emergency room visits, surgeries
      - "other" - for any medical expense that doesn't fit the above categories
      
      Choose the most appropriate category based on the receipt content.
    `;
    
    try {
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: prompt
          },
          {
            role: "user",
            content: [
              {
                type: "image_url",
                image_url: {
                  url: `data:${req.file.mimetype};base64,${base64Image}`
                }
              }
            ]
          }
        ],
        max_tokens: 500
      });
      
      console.log('OpenAI response received');
      
      // Parse the response
      let parsedData;
      try {
        const content = response.choices[0].message.content;
        console.log('OpenAI content:', content);
        
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedData = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed JSON data:', parsedData);
        } else {
          console.error('Could not extract JSON from OpenAI response');
          return res.status(500).json({ success: false, error: 'Failed to parse receipt data' });
        }
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        return res.status(500).json({ success: false, error: 'Failed to parse receipt data' });
      }
      
      // Return the extracted data
      return res.json({ success: true, data: parsedData });
      
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return res.status(500).json({ success: false, error: 'Failed to process receipt with AI' });
    } finally {
      // Clean up the uploaded file
      if (req.file && req.file.path) {
        try {
          fs.unlinkSync(req.file.path);
          console.log('Temporary file deleted:', req.file.path);
        } catch (unlinkError) {
          console.error('Error deleting temporary file:', unlinkError);
        }
      }
    }
  } catch (err) {
    console.error('Server error processing receipt:', err);
    return res.status(500).json({ success: false, error: 'Server error processing receipt' });
  }
});

// Endpoint to generate expense insights
app.post('/api/expense-insights', async (req, res) => {
  try {
    const expenseData = req.body;
    
    if (!expenseData || !expenseData.categories || !expenseData.recentExpenses) {
      return res.status(400).json({ success: false, error: 'Invalid expense data provided' });
    }
    
    console.log('Generating expense insights...');
    
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error('OpenAI API key is missing');
      return res.status(500).json({ success: false, error: 'OpenAI API key is not configured' });
    }
    
    // Prepare the prompt for GPT-4o-mini
    const prompt = `
      You are a medical expense analysis assistant. Analyze the following medical expense data and provide insights and recommendations to help the user reduce their healthcare costs.
      
      Expense Categories:
      ${expenseData.categories.map(cat => `- ${cat.name}: $${cat.total.toFixed(2)}`).join('\n')}
      
      Total Expenses: $${expenseData.totalExpenses.toFixed(2)}
      
      Recent Expenses:
      ${expenseData.recentExpenses.map(exp => `- ${exp.name}: $${exp.amount.toFixed(2)} (${exp.category})`).join('\n')}
      
      Based on this data, please provide:
      1. A brief analysis of the spending patterns
      2. 3-5 specific, actionable recommendations to help reduce medical expenses
      3. A short summary of potential savings
      
      Format your response as a JSON object with these fields:
      {
        "analysis": "Your analysis of spending patterns...",
        "recommendations": ["Recommendation 1", "Recommendation 2", "Recommendation 3", ...],
        "summary": "Summary of potential savings..."
      }
    `;
    
    try {
      // Call OpenAI API
      const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: prompt
          }
        ],
        max_tokens: 800
      });
      
      console.log('OpenAI response received');
      
      // Parse the response
      let insights;
      try {
        const content = response.choices[0].message.content;
        console.log('OpenAI content:', content);
        
        // Try to extract JSON from the response
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          insights = JSON.parse(jsonMatch[0]);
          console.log('Successfully parsed JSON data:', insights);
        } else {
          console.error('Could not extract JSON from OpenAI response');
          return res.status(500).json({ success: false, error: 'Failed to parse insights data' });
        }
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        return res.status(500).json({ success: false, error: 'Failed to parse insights data' });
      }
      
      // Return the insights
      return res.json({ success: true, insights });
      
    } catch (openaiError) {
      console.error('OpenAI API error:', openaiError);
      return res.status(500).json({ success: false, error: 'Failed to generate insights with AI' });
    }
  } catch (err) {
    console.error('Server error generating insights:', err);
    return res.status(500).json({ success: false, error: 'Server error generating insights' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 