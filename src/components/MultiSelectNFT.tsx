import React, { useState } from 'react';
import { CheckCircle } from 'lucide-react';

interface NFT {
  id: string;
  name?: string;
  inscription_id?: string;
  image?: string;
}

interface Props {
  nfts: NFT[];
  onActionComplete?: () => void;
}

const MultiSelectNFT: React.FC<Props> = ({ nfts = [], onActionComplete }) => {
  const [selectedNFTs, setSelectedNFTs] = useState<NFT[]>([]);
  const [actionType, setActionType] = useState<'send' | 'list'>('send');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [listingPrice, setListingPrice] = useState('');

  const handleNFTSelect = (nft: NFT) => {
    setSelectedNFTs((prev) =>
      prev.some((item) => item.id === nft.id) ? prev.filter((item) => item.id !== nft.id) : [...prev, nft],
    );
  };

  const handleAction = async () => {
    try {
      if (selectedNFTs.length === 0) {
        throw new Error('Please select at least one NFT');
      }

      if (actionType === 'send' && !recipientAddress) {
        throw new Error('Please enter a recipient address');
      }

      if (actionType === 'list' && !listingPrice) {
        throw new Error('Please enter a listing price');
      }

      // Get the wallet instance
      const wallet = (window as any).yours;
      if (!wallet) {
        throw new Error('Wallet not connected');
      }

      if (actionType === 'send') {
        const txData = {
          type: 'sendNFTs',
          nfts: selectedNFTs.map((nft) => ({
            id: nft.inscription_id || nft.id,
            recipient: recipientAddress,
          })),
        };

        await wallet.sendNFTs(txData);
      } else {
        const listingData = {
          type: 'listNFTs',
          nfts: selectedNFTs.map((nft) => ({
            id: nft.inscription_id || nft.id,
            price: parseFloat(listingPrice),
          })),
        };

        await wallet.listNFTs(listingData);
      }

      // Reset selection after successful action
      setSelectedNFTs([]);
      setRecipientAddress('');
      setListingPrice('');

      // Notify parent component
      if (onActionComplete) {
        onActionComplete();
      }
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error occurred');
      throw error;
    }
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setActionType('send')}
          className={`px-4 py-2 rounded transition-colors ${
            actionType === 'send' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          Send Multiple
        </button>
        <button
          onClick={() => setActionType('list')}
          className={`px-4 py-2 rounded transition-colors ${
            actionType === 'list' ? 'bg-blue-500 text-white' : 'bg-gray-200 hover:bg-gray-300'
          }`}
        >
          List Multiple
        </button>
      </div>

      {actionType === 'send' && (
        <input
          type="text"
          placeholder="Recipient Address"
          value={recipientAddress}
          onChange={(e) => setRecipientAddress(e.target.value)}
          className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
        />
      )}

      {actionType === 'list' && (
        <input
          type="number"
          placeholder="Listing Price (in sats)"
          value={listingPrice}
          onChange={(e) => setListingPrice(e.target.value)}
          className="w-full p-2 border rounded focus:border-blue-500 focus:outline-none"
        />
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {nfts.map((nft) => (
          <div
            key={nft.id}
            onClick={() => handleNFTSelect(nft)}
            className={`relative p-2 border rounded cursor-pointer hover:border-blue-500 ${
              selectedNFTs.some((item) => item.id === nft.id) ? 'border-blue-500' : 'border-gray-200'
            }`}
          >
            <div className="aspect-square bg-gray-100">
              {nft.image && <img src={nft.image} alt={nft.name || 'NFT'} className="w-full h-full object-cover" />}
            </div>

            {selectedNFTs.some((item) => item.id === nft.id) && (
              <CheckCircle className="absolute top-2 right-2 w-6 h-6 text-blue-500" />
            )}
          </div>
        ))}
      </div>

      <button
        onClick={handleAction}
        disabled={selectedNFTs.length === 0}
        className="w-full py-2 bg-blue-500 text-white rounded disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-blue-600 transition-colors"
      >
        {actionType === 'send'
          ? `Send ${selectedNFTs.length} Selected NFT${selectedNFTs.length !== 1 ? 's' : ''}`
          : `List ${selectedNFTs.length} Selected NFT${selectedNFTs.length !== 1 ? 's' : ''}`}
      </button>
    </div>
  );
};

export default MultiSelectNFT;