import express, { Request, Response } from "express";
import { Server as WebSocketServer } from "ws";
import path from "path";
import axios from "axios";
import dotenv from "dotenv";
import { MongoClient, ServerApiVersion, Db } from "mongodb";
import { Alchemy, Network, AlchemySubscription } from "alchemy-sdk";
import { verifyMessage } from "ethers";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8000;
app.use(express.json());
app.use(express.static(path.join(__dirname,'../dist')));

//All non-API routes should serve the index.html file
app.get(/^(?!\/api).+/, (req, res) =>{
    console.log("reaching index.html");
    res.sendFile(path.join(__dirname , '../dist/index.html'));
});

// REST API route for fetching transaction history
app.post("/api/tag", async (req: Request, res: Response) :Promise<any> => {
    const { address, newTag, signer, message, signature } = req.body;
    
    try {
        // Verify signature
        const recoveredAddress = verifyMessage(message, signature);
        if (recoveredAddress.toLowerCase() !== signer.toLowerCase()) {
            return res.status(401).json({ error: "Invalid signature" });
        }

        console.log(address, newTag);

        if (!address || !newTag) {
            return res.status(400).json({ error: "Address and tag are required" });
        }

        const userAddress = recoveredAddress.toLowerCase();

        //Update existing tag mapping
        const existingTagDocument = await db.collection('tags').findOne({ 
            userAddress,
            tag: address 
        });

        if (existingTagDocument) {
            // Check for duplicate new tag for this user
            const duplicateTag = await db.collection('tags').findOne({ 
                userAddress,
                tag: newTag,
                address: { $ne: existingTagDocument.address }
            });

            if (duplicateTag) {
                return res.status(400).json({ error: "Tag already exists for another address" });
            }

            await db.collection('tags').updateOne(
                { userAddress, tag: address },
                { $set: { tag: newTag } }
            );
            return res.status(200).json({ message: "Tag updated successfully" });
        }

        //Create new tag mapping
        // Check for existing tag for this user+address combination
        const existingAddressTag = await db.collection('tags').findOne({
            userAddress,
            address
        });

        if (existingAddressTag) {
            return res.status(400).json({ error: "Address already has a tag" });
        }

        // Check for duplicate tag for this user
        const duplicateTag = await db.collection('tags').findOne({
            userAddress,
            tag: newTag
        });

        if (duplicateTag) {
            return res.status(400).json({ error: "Tag already in use" });
        }

        // Create new tag entry
        await db.collection('tags').insertOne({
            userAddress,
            address,
            tag: newTag,
            createdAt: new Date()
        });

        res.status(200).json({ message: "Tag added successfully" });

    } catch (error) {
        console.error("Error processing tag:", error);
        res.status(500).json({ error: "Failed to process tag" });
    }
});

// Endpoint to fetch transactions
app.get("/api/transactions", async (req: Request, res: Response) :Promise<any> => {
    const { address, userAddress } = req.query;
    console.log("reaching transactions endpoint");
    if (typeof address !== 'string' || typeof userAddress !== 'string') {
        return res.status(400).json({ error: "Address and userAddress are required" });
    }

    try {
        const apiKey = process.env.ETHERSCAN_API_KEY;
        const url = `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&sort=desc&apikey=${apiKey}`;
        const response = await axios.get(url);

        if (response.data.status === "-1") {
            return res.status(500).json({ error: response.data.message });
        }

        const transactions = response.data.result;

        // Fetch all tags from the database
        const tags = await db.collection('tags').find({ 
            userAddress: userAddress.toLowerCase()
        }).toArray();
        const tagMap = new Map(tags.map(tag => [tag.address, tag.tag]));

        // Simplify transactions and replace addresses with tags if they exist
        const simplifiedTransactions = transactions.map((tx: any) => {
            const fromTag = tagMap.get(tx.from) || tx.from;
            const toTag = tagMap.get(tx.to) || tx.to;
            const timestamp = new Date(tx.timeStamp * 1000).toLocaleString();

            return {
                hash: tx.hash,
                from: fromTag,
                to: toTag,
                value: tx.value,
                timeStamp: timestamp
            };
        });
        console.log("transactions returned");
        res.json(simplifiedTransactions);
    } catch (error) {
        if (error instanceof Error) {
            console.error("Error:", error.message);
        }
        res.status(500).json({ error: "Failed to fetch transaction history" });
    }
});

// WebSocket streaming of New Transactions
const server = require("http").createServer(app);
const wss = new WebSocketServer({ server });
const settings = {
    apiKey: process.env.ALCHEMY_API_KEY,
    network: Network.ETH_MAINNET,
};
wss.on("connection", (ws) => {
    console.log("WebSocket connection established");
    const txQueue: any[] = [];
    let isProcessing = false;


    // Handle when multiple transactions are received at once
    const processQueue = async () => {
        if (txQueue.length === 0 || isProcessing) return;
        
        isProcessing = true;
        while (txQueue.length > 0) {
            const tx = txQueue.shift();
            try {
                if (ws.readyState === ws.OPEN) {
                    ws.send(JSON.stringify(tx));
                }
            } catch (error) {
                console.error('Failed to send transaction:', error);
            }
        }
        isProcessing = false;
    };

    ws.on('message', function incoming(message: Buffer){
        const parsedData = JSON.parse(message.toString());
        const address = parsedData.address;
        const userAddress = parsedData.userAddress;
        console.log('Received address:', address, typeof address);
        console.log('Received userAddress:', userAddress, typeof userAddress);
        

        const alchemy = new Alchemy(settings);
        const fetchData = async (tx:any) => {
            // Fetch all tags from the database
            const tags = await db.collection('tags').find({ 
                userAddress: userAddress.toLowerCase()
            }).toArray();
            const tagMap = new Map(tags.map(tag => [tag.address, tag.tag]));
            const fromTag = tagMap.get(tx.from) || tx.from;
            const toTag = tagMap.get(tx.to) || tx.to;
            const timestamp = new Date().toLocaleString();

            const txData = {
                hash: tx.hash,
                from: fromTag,
                to: toTag,
                value: tx.value,
                timeStamp: timestamp
            };
            txQueue.push(txData);
             processQueue();
        };
        
        alchemy.ws.on(
            {
                method: AlchemySubscription.MINED_TRANSACTIONS,
                hashesOnly: false,
            },
            (tx:any) => {
                if (
                    tx.transaction.from?.toLowerCase() === address.toLowerCase() ||
                    tx.transaction.to?.toLowerCase() === address.toLowerCase()
                ) {
                    // Add to queue instead of sending immediately
                    fetchData(tx.transaction);
                }
            }
        );
    
        alchemy.ws.on('error', (error: Error) => {
            console.error('Alchemy connection error:', error);
            ws.send(JSON.stringify({
                type: 'error',
                message: 'Failed to connect to blockchain network'
            }));
        });
    
        alchemy.ws.on("close", () => {
            console.warn("WebSocket closed.");
        });
    });

    ws.on('close', (code, reason) => {
        console.log('WebSocket closed:', code, reason.toString());
    });

    ws.on('error', (error) => {
        console.error('WebSocket error:', error);
    });

    
});

// MongoDB connection
let db: Db;
async function connectToDB() {
    const connectionString = `mongodb+srv://${process.env.MONGODB_USERNAME}:${process.env.MONGODB_PASSWORD}@cluster0.nwktk.mongodb.net/`;
    const uri = process.env.MONGODB_USERNAME ? connectionString : 'mongodb://127.0.0.1:27017';
    
    const client = new MongoClient(uri, {
        serverApi: {
            version: ServerApiVersion.v1,
            strict: true,
            deprecationErrors: true
        }
    });
    await client.connect();
    db = client.db('wallet-transaction-viewer');
};

// Start the server
async function start() {
    await connectToDB();
    server.listen(PORT, function () {
        console.log("Server is listening on port " + PORT);
    });
}

start();