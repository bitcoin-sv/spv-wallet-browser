interface NFTActionHookReturn {
    sendNFTs: (nfts: any[], recipient: string) => Promise<void>;
    listNFTs: (nfts: any[], price: number) => Promise<void>;
  }
  
  export const useNFTActions = (): NFTActionHookReturn => {
    const sendNFTs = async (nfts: any[], recipient: string) => {
      try {
        const wallet = (window as any).yours;
        if (!wallet) throw new Error('Wallet not connected');
  
        const txData = {
          type: 'sendNFTs',
          nfts: nfts.map(nft => ({
            id: nft.inscription_id || nft.id,
            recipient
          }))
        };
  
        await wallet.sendNFTs(txData);
      } catch (error) {
        console.error('Error sending NFTs:', error);
        throw error;
      }
    };
  
    const listNFTs = async (nfts: any[], price: number) => {
      try {
        const wallet = (window as any).yours;
        if (!wallet) throw new Error('Wallet not connected');
  
        const listingData = {
          type: 'listNFTs',
          nfts: nfts.map(nft => ({
            id: nft.inscription_id || nft.id,
            price
          }))
        };
  
        await wallet.listNFTs(listingData);
      } catch (error) {
        console.error('Error listing NFTs:', error);
        throw error;
      }
    };
  
    return { sendNFTs, listNFTs };
  };