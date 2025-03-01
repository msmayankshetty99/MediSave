# MediSave - Medical Expense Tracker

MediSave is a comprehensive medical expense tracking application that helps you manage and monitor your healthcare expenses. The application includes a receipt scanning feature that uses GPT-4 Vision to automatically extract expense details from medical receipts.

## Features

- Track and categorize medical expenses
- Scan receipts to automatically extract expense details
- Filter expenses by category
- Search for specific expenses
- View expense statistics and summaries
- Dark/light mode support
- Responsive design for mobile and desktop

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm (v6 or higher)
- OpenAI API key (for receipt scanning)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/MediSave.git
   cd MediSave
   ```

2. Install dependencies for the root, client, and server:
   ```
   npm run install-all
   ```

3. Set up environment variables:
   - Create a `.env` file in the server directory
   - Add your OpenAI API key:
     ```
     OPENAI_API_KEY=your_openai_api_key_here
     PORT=5000
     ```

### Running the Application

1. Start both the client and server:
   ```
   npm start
   ```

   This will start the React client on port 3000 and the Express server on port 5000.

2. For development with hot-reloading on the server:
   ```
   npm run dev
   ```

## Using the Receipt Scanner

1. Navigate to the Expenses page
2. Click the "Scan Receipt" button
3. Upload a photo of your medical receipt
4. The application will analyze the receipt and extract:
   - Description/name of the expense
   - Amount
   - Date
   - Category (medication, doctor visit, medical tests, hospital, or other)
   - Any additional notes
5. Review the extracted information and make any necessary adjustments
6. Click "Add Expense" to save the expense to your list

## Technologies Used

- **Frontend**: React, Chart.js, CSS
- **Backend**: Node.js, Express
- **AI**: OpenAI GPT-4 Vision API
- **File Handling**: Multer
- **Development**: Concurrently, Nodemon

## License

This project is licensed under the ISC License.

## Acknowledgements

- OpenAI for the GPT-4 Vision API
- React and Express communities for excellent documentation
- All contributors to this project
