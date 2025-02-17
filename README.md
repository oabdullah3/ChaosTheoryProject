# Chaos Theory Wallet Transaction History Viewer

## Description
The Chaos Theory Wallet Transaction History Viewer is a full-stack application that allows users to view and analyze wallet transactions. The backend, built with TypeScript and Node.js, handles API requests and data processing, while the frontend, built with React and Vite, provides an intuitive user interface for visualizing transaction data.

## Installation

## Frontend Setup
1. Navigate to frontend directory `cd react-frontend`
2. Install dependencies: `npm install`
3. Build the front end application : `npm run build`
4. Move the newly created dist folder to the backend directory

### Backend Setup and Running the Server
1. Navigate to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Create a `.env` file with the required environment variables
    - MONGODB_USERNAME = chaos@theory
    - MONGODB_PASSWORD = no#1
    - ETHERSCAN_API_KEY = examplekey
    - ALCHEMY_API_KEY = keyexample
    - PORT = 8000
4. Start the development server: `npm run dev`
5. Open browser and navigate to `http://localhost:{PORT}` to access the application

## Usage
1. Connect to your phantom wallet. Make sure it is installed as a browser extension.
2. After successful connection to wallet, enter the Etherium Address for which you wish to see the transaction history.
3. Click on the "Get Transactions" button to fetch the transaction history from the blockchain and have it displayed in the UI as a table.
4. Click on any from/to address to suggest a tag for it. Make sure the suggested tag is unique ans has not been suggested before. 
5. When submitting the tag, you will be prompted to verify the submission by signing it with your wallet.
6. Upon successful tag submission the transaction table is reloaded and it now displays the corresponding tags in place of it's address.

## Technologies Used
- **Backend**: Node.js, TypeScript, Express
- **Frontend**: React, Vite, Web3.js
- **Styling**: CSS
- **Web3 APIs**: EtherscanAPI, Alchemy web-sdk

## Backend Features
- **API Endpoints**: Handles GET requests for transaction history, and POST requests for tag submission
- **WebSocket Streaming**: Establishes a WebSocket connection to stream new transactions to the frontend in real-time
- **Data Processing**: Uses MongoDB Database to store and retrieve tag information for addresses
- **Error Handling**: Handles errors and exceptions, providing informative error messages to the user
- **Security**: Uses environment variables for sensitive information, and implements proper authentication and authorization mechanisms
- **Scalability**: Designed to handle a large number of concurrent requests and transactions

## Frontend Features
- **User Interface**: Provides an intuitive and user-friendly interface for viewing and analyzing transaction data
- **Real-time Updates**: Updates the transaction table in real-time using WebSocket streaming
- **Tag Submission**: Allows users to submit/edit tags for addresses, with verification using the user's wallet
- **Error Handling**: Handles errors and exceptions, providing informative error messages to the user

