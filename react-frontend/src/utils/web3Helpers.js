import {Buffer} from 'buffer';

export const getProvider = () => {
    if ('phantom' in window) {
        const provider = window.phantom?.ethereum;
        if (provider) {
            return provider;
        }
    }
    window.open('https://phantom.app/', '_blank');
    return null;
};

export const handleSignMessage = async (message, userAddress) => {
    const provider = getProvider();
    if (!provider) throw new Error("Wallet not connected");
    
    const msg = `0x${Buffer.from(message, 'utf8').toString('hex')}`;
    return provider.request({
        method: 'personal_sign',
        params: [msg, userAddress],
    });
};