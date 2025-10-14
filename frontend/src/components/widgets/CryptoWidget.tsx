import React, { useState, useEffect } from 'react';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { apiCall } from '../../utils/api';

interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

interface CryptoWidgetProps {
  limit?: number;
}

export const CryptoWidget: React.FC<CryptoWidgetProps> = ({ limit = 5 }) => {
  const [crypto, setCrypto] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCrypto = async () => {
      try {
        setLoading(true);
        const response = await apiCall(`/api/widgets/crypto?limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch crypto data');
        }
        const data = await response.json();
        setCrypto(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch crypto data');
      } finally {
        setLoading(false);
      }
    };

    fetchCrypto();
    const interval = setInterval(fetchCrypto, 60000); // Update every minute
    return () => clearInterval(interval);
  }, [limit]);

  const formatPrice = (price: number) => {
    if (price < 0.01) return `$${price.toFixed(6)}`;
    if (price < 1) return `$${price.toFixed(4)}`;
    if (price < 100) return `$${price.toFixed(2)}`;
    return `$${price.toLocaleString()}`;
  };

  const formatMarketCap = (marketCap: number) => {
    const sizes = ['', 'K', 'M', 'B', 'T'];
    const i = Math.floor(Math.log(marketCap) / Math.log(1000));
    return `$${(marketCap / Math.pow(1000, i)).toFixed(1)}${sizes[i]}`;
  };

  if (loading) {
    return (
      <div className="widget">
        <div className="widget-header">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-600" />
            <h3 className="widget-title">Crypto Prices</h3>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="loading-pulse text-gray-500">Loading crypto...</div>
        </div>
      </div>
    );
  }

  if (error || crypto.length === 0) {
    return (
      <div className="widget">
        <div className="widget-header">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary-600" />
            <h3 className="widget-title">Crypto Prices</h3>
          </div>
        </div>
        <div className="text-center py-8 text-red-500">
          <DollarSign className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Failed to load crypto data</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary-600" />
          <h3 className="widget-title">Crypto Prices</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">Live prices</div>
      </div>

      <div className="space-y-3">
        {crypto.map((coin) => (
          <div key={coin.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-dark-700 rounded-lg">
            <div className="flex items-center gap-3">
              <img
                src={coin.image}
                alt={coin.name}
                className="w-8 h-8 rounded-full"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M8 12h8"/></svg>';
                }}
              />
              <div>
                <div className="font-medium text-sm text-gray-900 dark:text-white">
                  {coin.symbol.toUpperCase()}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  {coin.name}
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="font-semibold text-sm text-gray-900 dark:text-white">
                {formatPrice(coin.current_price)}
              </div>
              <div className={`flex items-center gap-1 text-xs ${
                coin.price_change_percentage_24h >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {coin.price_change_percentage_24h >= 0 ? (
                  <TrendingUp className="w-3 h-3" />
                ) : (
                  <TrendingDown className="w-3 h-3" />
                )}
                {Math.abs(coin.price_change_percentage_24h).toFixed(2)}%
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {formatMarketCap(coin.market_cap)}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-3 border-t border-gray-200 dark:border-dark-700">
        <div className="text-xs text-center text-gray-500 dark:text-gray-400">
          Data provided by CoinGecko
        </div>
      </div>
    </div>
  );
};
