import React, { useEffect, useState, useRef } from 'react';
import { fetchTransactions, submitTag } from '../../utils/apiHelpers.js';
import { handleSignMessage } from '../../utils/web3Helpers.js';
import TransactionRow from './TransactionRow';
import TagForm from './TagForm';
import EthereumSpinner from './EtheriumSpinner.jsx';

const TransactionTable = ({ address, userAddress }) => {
    const [transactions, setTransactions] = useState([]);
    const [newTransactions, setNewTransactions] = useState([]);
    const [selectedAddress, setSelectedAddress] = useState(null);
    const [tagInput, setTagInput] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(true); // Add loading state

    useEffect(() => {

        const loadTransactions = async () => {
            try {
                console.log("loading....");
                setIsLoading(true);
                const data = await fetchTransactions(address, userAddress);
                setTransactions(data);
            } catch (error) {
                console.error('Error loading transactions:', error);
            } finally {
                setIsLoading(false);
            }
        };

        let socket;

        const setUpSocket = () => {
            socket = new WebSocket(`${window.location.origin.replace(/^http/, 'ws')}`);

            socket.onmessage = (event) => {
                const tx = JSON.parse(event.data);
                setNewTransactions(prev => [tx, ...prev]);
            };

            socket.onopen = () => {
                console.log('WebSocket connection established');
                const data = JSON.stringify({
                    address: address,
                    userAddress: userAddress
                });
                
                socket.send(data);
            };

            socket.onerror = (error) => {
                console.error('WebSocket error:', error);
            };

            socket.onclose = () => {
                console.log('WebSocket connection closed');
            };
        };

        if (address) {
            loadTransactions();
            setUpSocket();
        }

        return () => {
            if (socket) {
                socket.close();
            }
        };

    }, [address, userAddress]);

    useEffect(() => {
        if (selectedAddress) {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        }
    },[selectedAddress]);

    const handleTagSubmit = async (e) => {
        e.preventDefault();
        try {
            const message = `I am adding a tag to ${selectedAddress} at ${Date.now()}`;
            const signature = await handleSignMessage(message, userAddress);
            
            setIsLoading(true);
            await submitTag({
                address: selectedAddress,
                newTag: tagInput,
                signer: userAddress,
                message,
                signature
            });

            const data = await fetchTransactions(address, userAddress);
            setTransactions(data);
            setSelectedAddress(null);
            setTagInput('');
        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            {isLoading && <EthereumSpinner />}

            {!isLoading && (
                <>
                    {selectedAddress && (
                        <TagForm
                            selectedAddress={selectedAddress}
                            tagInput={tagInput}
                            setTagInput={setTagInput}
                            onSubmit={handleTagSubmit}
                            onCancel={() => setSelectedAddress(null)}
                            error={error}
                        />
                    )}

                    <div className="transaction-table-container">
                        <table className="transaction-table">
                            <thead>
                                <tr>
                                    <th>Hash</th>
                                    <th>From</th>
                                    <th>To</th>
                                    <th>Value</th>
                                    <th>Time</th>
                                </tr>
                            </thead>
                            <tbody>
                                {newTransactions.map((tx) => (
                                    <TransactionRow
                                        key={tx.hash}
                                        tx={tx}
                                        onAddressClick={setSelectedAddress}
                                    />
                                ))}
                                {transactions.map((tx) => (
                                    <TransactionRow
                                        key={tx.hash}
                                        tx={tx}
                                        onAddressClick={setSelectedAddress}
                                    />
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            
        </div>
    );
};

export default TransactionTable;