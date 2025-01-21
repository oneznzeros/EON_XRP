import React, { useState } from 'react';
import Head from 'next/head';
import axios from 'axios';

export default function Home() {
  const [walletAddress, setWalletAddress] = useState('');
  const [transactionStatus, setTransactionStatus] = useState('');
  const [networkStatus, setNetworkStatus] = useState('');

  const createWallet = async () => {
    try {
      const response = await axios.post('/api/create-wallet');
      setWalletAddress(response.data.address);
    } catch (error) {
      console.error('Wallet creation failed', error);
    }
  };

  const checkNetworkStatus = async () => {
    try {
      const response = await axios.get('/api/network-status');
      setNetworkStatus(JSON.stringify(response.data, null, 2));
    } catch (error) {
      console.error('Network status check failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-6 flex flex-col justify-center sm:py-12">
      <Head>
        <title>EonXRP Platform</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-light-blue-500 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-700 sm:text-lg sm:leading-7">
                <h2 className="text-3xl font-extrabold text-center">EonXRP Platform</h2>
                
                <div className="flex flex-col space-y-4">
                  <button 
                    onClick={createWallet}
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Create XRP Wallet
                  </button>

                  {walletAddress && (
                    <div className="bg-green-100 p-4 rounded">
                      <p>Wallet Address: {walletAddress}</p>
                    </div>
                  )}

                  <button 
                    onClick={checkNetworkStatus}
                    className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
                  >
                    Check Network Status
                  </button>

                  {networkStatus && (
                    <pre className="bg-gray-200 p-4 rounded text-sm">
                      {networkStatus}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
