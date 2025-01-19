import { Client, Wallet } from 'xrpl';
import { v4 as uuidv4 } from 'uuid';

export interface TradeOrder {
  id: string;
  tokenSymbol: string;
  amount: number;
  price: number;
  type: 'buy' | 'sell';
  status: 'open' | 'filled' | 'cancelled';
  timestamp: number;
  trader: string;
}

export class XRPTradingEngine {
  private xrplClient: Client;
  private traderWallet: Wallet;
  private orderBook: TradeOrder[] = [];

  constructor(xrplClient: Client, traderWallet: Wallet) {
    this.xrplClient = xrplClient;
    this.traderWallet = traderWallet;
  }

  async placeTrade(
    tokenSymbol: string, 
    amount: number, 
    price: number, 
    type: 'buy' | 'sell'
  ): Promise<TradeOrder> {
    // Validate trade parameters
    if (amount <= 0 || price <= 0) {
      throw new Error('Invalid trade amount or price');
    }

    // Create trade order
    const order: TradeOrder = {
      id: uuidv4(),
      tokenSymbol,
      amount,
      price,
      type,
      status: 'open',
      timestamp: Date.now(),
      trader: this.traderWallet.address
    };

    // Submit XRPL trade transaction
    const tradeTx = {
      TransactionType: type === 'buy' ? 'OfferCreate' : 'OfferCancel',
      Account: this.traderWallet.address,
      TakerPays: {
        currency: tokenSymbol,
        value: amount.toString()
      },
      TakerGets: {
        currency: 'XRP',
        value: (amount * price).toString()
      }
    };

    try {
      const result = await this.xrplClient.submit(tradeTx, { wallet: this.traderWallet });
      
      // Update order status based on XRPL response
      order.status = result.result.engine_result === 'tesSUCCESS' ? 'filled' : 'open';
      
      this.orderBook.push(order);
      return order;
    } catch (error) {
      order.status = 'cancelled';
      throw new Error(`Trade failed: ${error.message}`);
    }
  }

  async getOrderBook(tokenSymbol: string): Promise<TradeOrder[]> {
    // Retrieve order book from XRPL
    const orderBookResponse = await this.xrplClient.request({
      command: 'book_offers',
      taker_pays: { currency: tokenSymbol },
      taker_gets: { currency: 'XRP' }
    });

    // Transform XRPL order book to our format
    return orderBookResponse.result.offers.map(offer => ({
      id: uuidv4(),
      tokenSymbol,
      amount: parseFloat(offer.TakerPays.value),
      price: parseFloat(offer.TakerGets.value) / parseFloat(offer.TakerPays.value),
      type: 'sell',
      status: 'open',
      timestamp: Date.now(),
      trader: offer.Account
    }));
  }

  async calculateTradingFees(amount: number, price: number): Promise<{
    networkFee: number;
    platformFee: number;
    totalFee: number;
  }> {
    // XRPL transaction fee (in drops)
    const networkFee = 0.000012; // 12 drops

    // Platform trading fee (0.5%)
    const platformFee = amount * price * 0.005;

    return {
      networkFee,
      platformFee,
      totalFee: networkFee + platformFee
    };
  }

  getTradeHistory(limit: number = 50): TradeOrder[] {
    return this.orderBook
      .filter(order => order.status === 'filled')
      .sort((a, b) => b.timestamp - a.timestamp)
      .slice(0, limit);
  }
}

// Singleton trading engine creator
export const createTradingEngine = async (
  xrplRpcUrl: string = 'wss://s.altnet.rippletest.net:51233'
) => {
  const client = new Client(xrplRpcUrl);
  await client.connect();
  
  // In production, securely manage wallet creation/loading
  const wallet = Wallet.generate();
  
  return new XRPTradingEngine(client, wallet);
};
