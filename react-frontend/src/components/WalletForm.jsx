import React, { useState } from 'react';
import { getProvider } from '../utils/web3Helpers.js';

const WalletConnection = ({ onConnect }) => {
    const [error, setError] = useState(null);

    const handleConnect = async () => {
        const provider = getProvider();
        if (provider) {
            try {
                const accounts = await provider.request({ method: "eth_requestAccounts" });
                console.log(accounts[0]);
                onConnect(accounts[0]);
            } catch (err) {
                setError(err.message);
            }
        }
    };

    return (
        <div className="wallet-form">
            <button onClick={handleConnect}>Connect to your Phantom Wallet</button>
            {error && <p className="error">{error}</p>}
        </div>
    );
};

export default WalletConnection;