export const fetchTransactions = async (address, userAddress) => {
    const response = await fetch(//http://localhost:8000
        `/api/transactions?address=${address}&userAddress=${userAddress}`
    );
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
};

export const submitTag = async (data) => {
    const response = await fetch('/api/tag', { //http://localhost:8000
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    return response.json();
};