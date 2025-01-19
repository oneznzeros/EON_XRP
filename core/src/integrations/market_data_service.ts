import axios from 'axios';
import { createLogger, transports, format } from 'winston';

export class MarketDataService {
  private logger: any;
  private cacheExpiration: number = 5 * 60 * 1000; // 5 minutes
  private priceCache: Map<string, CachedPrice> = new Map();

  constructor() {
    this.logger = createLogger({
      level: 'info',
      format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.splat(),
        format.json()
      ),
      transports: [
        new transports.Console(),
        new transports.File({ filename: 'market_data.log' })
      ]
    });
  }

  // Fetch real-time price from multiple free sources
  async getTokenPrice(
    tokenSymbol: string, 
    baseCurrency: string = 'USD'
  ): Promise<TokenPriceData> {
    const cacheKey = `${tokenSymbol}-${baseCurrency}`;
    const cachedPrice = this.priceCache.get(cacheKey);

    // Return cached price if still valid
    if (cachedPrice && (Date.now() - cachedPrice.timestamp) < this.cacheExpiration) {
      return cachedPrice.data;
    }

    const sources = [
      this.fetchCoinGeckoPrice(tokenSymbol, baseCurrency),
      this.fetchCoinCapPrice(tokenSymbol, baseCurrency)
    ];

    try {
      // Try multiple sources, return first successful result
      const prices = await Promise.any(sources);

      // Cache the result
      this.priceCache.set(cacheKey, {
        timestamp: Date.now(),
        data: prices
      });

      return prices;
    } catch (error) {
      this.logger.error('Price retrieval failed', { 
        tokenSymbol, 
        error 
      });
      
      // Fallback to last cached price or throw error
      if (cachedPrice) {
        return cachedPrice.data;
      }

      throw new Error(`Unable to fetch price for ${tokenSymbol}`);
    }
  }

  // Fetch price from CoinGecko (free API)
  private async fetchCoinGeckoPrice(
    tokenSymbol: string, 
    baseCurrency: string
  ): Promise<TokenPriceData> {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/simple/price?ids=${tokenSymbol.toLowerCase()}&vs_currencies=${baseCurrency.toLowerCase()}&include_market_cap=true&include_24hr_vol=true&include_24hr_change=true`
      );

      const data = response.data[tokenSymbol.toLowerCase()];
      
      return {
        price: data[baseCurrency.toLowerCase()],
        marketCap: data[`${baseCurrency.toLowerCase()}_market_cap`],
        volume24h: data[`${baseCurrency.toLowerCase()}_24h_vol`],
        priceChange24h: data[`${baseCurrency.toLowerCase()}_24h_change`]
      };
    } catch (error) {
      this.logger.warn('CoinGecko price fetch failed', { 
        tokenSymbol, 
        error 
      });
      throw error;
    }
  }

  // Fetch price from CoinCap (free API)
  private async fetchCoinCapPrice(
    tokenSymbol: string, 
    baseCurrency: string
  ): Promise<TokenPriceData> {
    try {
      const response = await axios.get(
        `https://api.coincap.io/v2/assets/${tokenSymbol.toLowerCase()}`
      );

      const data = response.data.data;
      
      return {
        price: parseFloat(data.priceUsd),
        marketCap: parseFloat(data.marketCapUsd),
        volume24h: parseFloat(data.volumeUsd24Hr),
        priceChange24h: parseFloat(data.changePercent24Hr)
      };
    } catch (error) {
      this.logger.warn('CoinCap price fetch failed', { 
        tokenSymbol, 
        error 
      });
      throw error;
    }
  }

  // Get historical price data
  async getHistoricalPrices(
    tokenSymbol: string, 
    days: number = 30
  ): Promise<HistoricalPricePoint[]> {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/${tokenSymbol.toLowerCase()}/market_chart?vs_currency=usd&days=${days}`
      );

      return response.data.prices.map(([timestamp, price]) => ({
        timestamp: new Date(timestamp),
        price
      }));
    } catch (error) {
      this.logger.error('Historical price retrieval failed', { 
        tokenSymbol, 
        days, 
        error 
      });
      return [];
    }
  }
}

// Type Definitions
interface TokenPriceData {
  price: number;
  marketCap: number;
  volume24h: number;
  priceChange24h: number;
}

interface HistoricalPricePoint {
  timestamp: Date;
  price: number;
}

interface CachedPrice {
  timestamp: number;
  data: TokenPriceData;
}

// Singleton instance
export const marketDataService = new MarketDataService();
