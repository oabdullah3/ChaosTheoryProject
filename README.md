# Chaos Theory Wallet Transaction History Viewer

![image](https://github.com/user-attachments/assets/4a9168cd-6002-4b3e-866e-6fea081aad1d)



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
- **Frontend**: React, Vite
- **Styling**: CSS
- **Web3 APIs**: EtherscanAPI, Alchemy web-sdk

## How the front-end works
- When user clicks the connect to wallet button, the standard getProvider() function is called to access the Phantom browser extension, and the request method is called on this provider to access the etherium account, which is confirmed by the user through a pop-up window.
- Once the user's address is obtained, React's state varibale are used to dynamically remove the connect button and load the form component for user to enter the address they wish to search and obtain transaction history for.
- Once user submits the search address, React's state variable are finally used again to remove the address form and to dynamically load the transactions component.
- When the TransactionTable component is first loaded the useEffect hook runs and is used to fetch transactions from the backend for the search address. The user address is provided to display tags that were defined by that user.
- Simultaneously the WebSocket connection is also established with the backend. When the socket opens, a message is sent to the backend containing the user address and the search address, which are used to stream new transactions.
- The fetched transactions are added to a state variable, which is mapped to table rows within the table element. There is a seperate state variable array to store incoming transactions, and this array is mapped before the initial transactions mapped, such that new transctions are displayed on top of the table.
- The useEffect hook has a dependency on the address variable, hence inital transactions are only fetched once.
- In each transaction row, the from and to addresses are clickable links that enable the TagForm to be visible.
- In the tag form you can submit a tag for the selected address. When you hit submit the phantom wallet pops up and ask for a signature, which is then used to verify the submission at the backend.
- The user address, selected address, suggested tag, wallet signature, and the tag message are all sent to the backend server as part of the post fetch api call.
- Once the tag is successfully submitted by the backend, the transactions are fetched again to reflect the new tag submission in the table display.
- User can click on an existing tag, and submit a new tag in it's place to change the tag, provided no other address has the same tag.
- There is a custom loading spinner that is displayed whenever the application is waiting for transactions data to be returned.

## How the backend works
- The typescript backend uses express.static to serve the front-end build. It also use an app.get endpoint to serve all non-API calls (all calls that dont start with /api) the index.html file that was obtained after building the react front-end
- It connects to a MongoDB atlas cluster using the cluster's connection string to create a client through MongoClient and then connecting to the client through client.connect().
- Get Transactions API endpoint:
    1. This endpoints takes in search address and user address as query parameters.
    2. It uses the etherscan api to RESTfully fetch all transaction data on the ETH mainnet corresponding to the search address.
    3. It then maps the each of the returned transactions to a simplified transaction object which only contains the hash, from+to address, value, and timeStamp.
    4. During the mapping process, the from/to address are searched up in the database to check for any defined by the user address for these addresses.
    5. If tags are found they are assigned to the from/to address instead. The simplified transaction array is returned by the API.
- Post Tag API endpoint:
    1. This endpoint takes in address, newTag, signer, message, signature as body parameters.
    2. The ethers.verifyMessage method takes in message+signature and returns the signer address.
    3. If this is the same as the signer parameter value then the user is successfully validated.
    4. After validation there are two scenarios: Either the address is being tagged for the first time or the address has an existing tag being changed.
    5. Both these cases are handled via MongoDB querying logic to succcessfully update the tag information in the database.
- WebSocket Server
    1. The express app and the http module are used to create a server, which is in turn used to create the WebSocket server.
    2. When a user connects to this websocket server, several functions are defined for this webscoket connection.
    3. When the user sends a message to the websocket (which in our case is only when sending the user address and search address), an alchemy instance is created.
    4. This instance has a web socket listener which uses the method AlchemySubscription.MINED_TRANSACTIONS to fetch streaming transactions.
    5. Conditionals are used to filter out the stream and extract addresses corresponding to the search address.
    6. Corresponding transactions are added to a queue array to handle multiple transactions arriving at the same time.
    7. The processQueue function sends transactions in the queue back to the frontend using ws.send.
    8. Before sending, the from/to addresses are mapped to tags from databse if possible.

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

