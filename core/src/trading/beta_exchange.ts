import { feeEngine } from '../tokenomics/fee_engine';
import { v4 as uuidv4 } from 'uuid';

export interface Token {
  symbol: string;
  name: string;
  totalSupply: number;
  creator: string;
  createdAt: number;
}

export interface TradeOrder {
  id: string;
  tokenSymbol: string;
  amount: number;
  price: number;
  type: 'buy' | 'sell';
  status: 'open' | 'filled' | 'cancelled';
  timestamp: number;
}

export class EONXRPBetaExchange {
  private tokens: Map<string, Token> = new Map();
  private orderBook: TradeOrder[] = [];

  createToken(
    name: string, 
    symbol: string, 
    totalSupply: number, 
    creator: string
  ): Token {
    // Check token creation fee
    const creationFee = feeEngine.calculateTokenCreationFee();
    
    const newToken: Token = {
      symbol,
      name,
      totalSupply,
      creator,
      createdAt: Date.now()
    };

    this.tokens.set(symbol, newToken);
    return newToken;
  }

  placeTradeOrder(
    tokenSymbol: string, 
    amount: number, 
    price: number, 
    type: 'buy' | 'sell',
    trader: string
  ): TradeOrder {
    // Validate token exists
    if (!this.tokens.has(tokenSymbol)) {
      throw new Error(`Token ${tokenSymbol} does not exist`);
    }

    // Calculate trading fees
    const { totalFee } = feeEngine.calculateTradingFees(amount * price);

    const order: TradeOrder = {
      id: uuidv4(),
      tokenSymbol,
      amount,
      price,
      type,
      status: 'open',
      timestamp: Date.now()
    };

    this.orderBook.push(order);

    // Record transaction for fee tracking
    feeEngine.recordTokenTransaction(tokenSymbol, amount * price);

    return order;
  }

  matchTradeOrders(): void {
    // Simple matching algorithm
    const buyOrders = this.orderBook.filter(order => order.type === 'buy' && order.status === 'open');
    const sellOrders = this.orderBook.filter(order => order.type === 'sell' && order.status === 'open');

    for (const buyOrder of buyOrders) {
      const matchingSellOrder = sellOrders.find(
        sellOrder => 
          sellOrder.tokenSymbol === buyOrder.tokenSymbol && 
          sellOrder.price <= buyOrder.price
      );

      if (matchingSellOrder) {
        // Execute trade
        buyOrder.status = 'filled';
        matchingSellOrder.status = 'filled';
      }
    }
  }

  getTokens(): Token[] {
    return Array.from(this.tokens.values());
  }

  getOpenOrders(tokenSymbol?: string): TradeOrder[] {
    return this.orderBook.filter(
      order => order.status === 'open' && 
      (!tokenSymbol || order.tokenSymbol === tokenSymbol)
    );
  }

  getTradingMetrics(tokenSymbol?: string): {
    totalVolume: number;
    uniqueTokens: number;
    openOrders: number;
  } {
    const relevantOrders = tokenSymbol 
      ? this.orderBook.filter(order => order.tokenSymbol === tokenSymbol)
      : this.orderBook;

    return {
      totalVolume: relevantOrders.reduce((sum, order) => sum + (order.amount * order.price), 0),
      uniqueTokens: this.tokens.size,
      openOrders: relevantOrders.filter(order => order.status === 'open').length
    };
  }
}

// Singleton instance for global access
export const betaExchange = new EONXRPBetaExchange();
