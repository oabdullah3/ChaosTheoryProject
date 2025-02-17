import React from 'react';

const AddressForm = ({ onSubmit }) => {
    const [inputValue, setInputValue] = React.useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(inputValue);
        setInputValue('');
    };

    return (
        <div className = "address-form">
            <h3>Enter the Etherium Wallet to Search</h3>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Enter Ethereum address"
                    className='address-input'
                />
                <div className="form-buttons">
                    <button type="submit">View Transactions</button>
                </div>
            </form>
        </div>
    );
};

export default AddressForm;