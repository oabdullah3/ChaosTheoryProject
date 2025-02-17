import React from 'react';
import EthLogo from '../../utils/ethereum-eth-logo-diamond.svg';

const EthereumSpinner = () => { //Loading Spinner
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      height: '100%',
    }}>
      <img
        src={EthLogo}
        alt="Loading..."
        style={{
          width: '80px',
          height: '80px',
          animation: 'spin 2s linear infinite',
          filter: 'drop-shadow(0 0 8px rgba(98, 0, 234, 0.5))'
        }}
      />
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

export default EthereumSpinner;