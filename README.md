# MediSave - Medical Expense Tracker

MediSave is a comprehensive medical expense tracking application that helps you manage and monitor your healthcare expenses. The application includes a receipt scanning feature that uses OpenAI's GPT-4o-mini model to automatically extract expense details from medical receipts.

## Features

- Track and categorize medical expenses
- Scan receipts to automatically extract expense details
- Filter expenses by category
- Search for specific expenses
- View expense statistics and summaries
- AI-powered chat assistant for help with medical expenses and app usage
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
     PORT=5001
     ```

### Running the Application

1. Start both the client and server:
   ```
   npm start
   ```

   This will start the React client on port 3000 and the Express server on port 5001.

2. For development with hot-reloading on the server:
   ```
   npm run dev
   ```

## Using the Receipt Scanner

1. Navigate to the Expenses page
2. Click the "Scan Receipt" button
3. Upload a photo of your medical receipt
4. The application will analyze the receipt and extract:
   - Provider/merchant name
   - Amount
   - Date of service
   - Description of service or items
   - Category (automatically mapped to one of: medication, consultation, test, hospital, or other)
   - Insurance information (if present)
5. Review the extracted information and make any necessary adjustments
6. Click "Add Expense" to save the expense to your list

## Using the Chat Assistant

The MediSave application includes an AI-powered chat assistant that can help with:

1. Understanding how to use the application features
2. Getting information about medical expenses and healthcare costs
3. Learning about expense tracking best practices
4. Finding alternatives for medications

The chat assistant is accessible from the sidebar and uses the same OpenAI GPT-4o-mini model that powers the receipt scanner. The assistant is specifically trained to provide information related to medical expenses and the application functionality only.

## Technologies Used

- **Frontend**: React, CSS
- **Backend**: Node.js, Express
- **AI**: OpenAI GPT-4o-mini API for image analysis
- **File Handling**: Multer
- **Development**: Concurrently, Nodemon

## License

This project is licensed under the MIT License.

## Acknowledgements

- OpenAI for the GPT-4o-mini API
- React and Express communities for excellent documentation
- All contributors to this project
