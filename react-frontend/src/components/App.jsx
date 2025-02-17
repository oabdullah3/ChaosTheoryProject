import React, { useState } from 'react';
import WalletConnection from './WalletForm';
import TransactionTable from './Transactions/TransactionTable';
import AddressForm from './AddressForm';

const App = () => {
    const [userAddress, setUserAddress] = useState(null);
    const [searchAddress, setSearchAddress] = useState(null);

    return (
        <div className="app-container">
            <h1>Wallet Transaction Viewer</h1>
            {!userAddress && <WalletConnection onConnect={setUserAddress} />}
            {userAddress && !searchAddress && (
                <AddressForm onSubmit={setSearchAddress} />
            )}
            {userAddress && searchAddress && (
                <TransactionTable 
                    address={searchAddress} 
                    userAddress={userAddress} 
                />
            )}
        </div>
    );
};

export default App;