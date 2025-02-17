import React from 'react';
import { ethers } from 'ethers';

const TransactionRow = ({ tx, onAddressClick }) => {
    return (
        <tr key={tx.hash} className="transaction-row">
            <td>{tx.hash}</td>
            <td>
                <span
                    className="address-link"
                    onClick={() => onAddressClick(tx.from)}
                >
                    {tx.from}
                </span>
            </td>
            <td>
                <span
                    className="address-link"
                    onClick={() => onAddressClick(tx.to)}
                >
                    {tx.to}
                </span>
            </td>
            <td className="eth-value">{ethers.formatEther(tx.value)} ETH</td>
            <td>{tx.timeStamp}</td>
        </tr>
    );
};

export default TransactionRow;