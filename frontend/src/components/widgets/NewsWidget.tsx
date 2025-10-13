import React, { useState, useEffect } from 'react';
import { Newspaper, ExternalLink, Calendar } from 'lucide-react';

interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  urlToImage?: string;
}

interface NewsWidgetProps {
  category?: string;
  limit?: number;
}

export const NewsWidget: React.FC<NewsWidgetProps> = ({ 
  category = 'technology', 
  limit = 5 
}) => {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/widgets/news?category=${category}&limit=${limit}`);
        if (!response.ok) {
          throw new Error('Failed to fetch news data');
        }
        const data = await response.json();
        setNews(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch news');
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
    const interval = setInterval(fetchNews, 600000); // Update every 10 minutes
    return () => clearInterval(interval);
  }, [category, limit]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'Just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 48) return 'Yesterday';
    return date.toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="widget">
        <div className="widget-header">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary-600" />
            <h3 className="widget-title">News</h3>
          </div>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="loading-pulse text-gray-500">Loading news...</div>
        </div>
      </div>
    );
  }

  if (error || news.length === 0) {
    return (
      <div className="widget">
        <div className="widget-header">
          <div className="flex items-center gap-2">
            <Newspaper className="w-5 h-5 text-primary-600" />
            <h3 className="widget-title">News</h3>
          </div>
        </div>
        <div className="text-center py-8 text-red-500">
          <Newspaper className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Failed to load news</p>
          <p className="text-sm text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="widget">
      <div className="widget-header">
        <div className="flex items-center gap-2">
          <Newspaper className="w-5 h-5 text-primary-600" />
          <h3 className="widget-title">News</h3>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 capitalize">{category}</div>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {news.map((item, index) => (
          <div key={index} className="border-b border-gray-200 dark:border-dark-700 pb-3 last:border-b-0">
            <div className="flex gap-3">
              {item.urlToImage && (
                <img
                  src={item.urlToImage}
                  alt={item.title}
                  className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                  }}
                />
              )}
              <div className="flex-1 min-w-0">
                <h4 className="font-medium text-sm text-gray-900 dark:text-white line-clamp-2 mb-1">
                  {item.title}
                </h4>
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {item.description}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{item.source}</span>
                    <Calendar className="w-3 h-3" />
                    <span>{formatDate(item.publishedAt)}</span>
                  </div>
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-primary-600 hover:text-primary-700 transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    Read
                  </a>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
