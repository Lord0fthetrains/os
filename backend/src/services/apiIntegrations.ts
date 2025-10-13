import axios from 'axios';

export interface WeatherData {
  current: {
    temp: number;
    humidity: number;
    pressure: number;
    description: string;
    icon: string;
  };
  forecast: {
    date: string;
    temp: { min: number; max: number };
    description: string;
    icon: string;
  }[];
}

export interface NewsItem {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
  source: string;
  urlToImage?: string;
}

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  market_cap: number;
  image: string;
}

export interface GitHubRepo {
  name: string;
  full_name: string;
  description: string;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  language: string;
  updated_at: string;
}

export class ApiIntegrations {
  private weatherApiKey: string;
  private newsApiKey: string;

  constructor() {
    this.weatherApiKey = process.env.OPENWEATHER_API_KEY || '';
    this.newsApiKey = process.env.NEWS_API_KEY || '';
  }

  async getWeatherData(city: string = 'London'): Promise<WeatherData> {
    if (!this.weatherApiKey) {
      throw new Error('OpenWeather API key not configured');
    }

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${this.weatherApiKey}&units=metric`
      );

      const current = response.data.list[0];
      const forecast = response.data.list
        .filter((item: any, index: number) => index % 8 === 0)
        .slice(0, 5)
        .map((item: any) => ({
          date: item.dt_txt.split(' ')[0],
          temp: {
            min: item.main.temp_min,
            max: item.main.temp_max
          },
          description: item.weather[0].description,
          icon: item.weather[0].icon
        }));

      return {
        current: {
          temp: Math.round(current.main.temp),
          humidity: current.main.humidity,
          pressure: current.main.pressure,
          description: current.weather[0].description,
          icon: current.weather[0].icon
        },
        forecast
      };
    } catch (error) {
      console.error('Error fetching weather data:', error);
      throw error;
    }
  }

  async getNewsData(category: string = 'technology', limit: number = 10): Promise<NewsItem[]> {
    if (!this.newsApiKey) {
      throw new Error('News API key not configured');
    }

    try {
      const response = await axios.get(
        `https://newsapi.org/v2/top-headlines?category=${category}&pageSize=${limit}&apiKey=${this.newsApiKey}`
      );

      return response.data.articles.map((article: any) => ({
        title: article.title,
        description: article.description,
        url: article.url,
        publishedAt: article.publishedAt,
        source: article.source.name,
        urlToImage: article.urlToImage
      }));
    } catch (error) {
      console.error('Error fetching news data:', error);
      throw error;
    }
  }

  async getCryptoPrices(limit: number = 10): Promise<CryptoPrice[]> {
    try {
      const response = await axios.get(
        `https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=${limit}&page=1&sparkline=false`
      );

      return response.data.map((coin: any) => ({
        id: coin.id,
        symbol: coin.symbol.toUpperCase(),
        name: coin.name,
        current_price: coin.current_price,
        price_change_percentage_24h: coin.price_change_percentage_24h,
        market_cap: coin.market_cap,
        image: coin.image
      }));
    } catch (error) {
      console.error('Error fetching crypto data:', error);
      throw error;
    }
  }

  async getGitHubRepos(username: string, limit: number = 5): Promise<GitHubRepo[]> {
    try {
      const response = await axios.get(
        `https://api.github.com/users/${username}/repos?sort=updated&per_page=${limit}`
      );

      return response.data.map((repo: any) => ({
        name: repo.name,
        full_name: repo.full_name,
        description: repo.description,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
        open_issues_count: repo.open_issues_count,
        language: repo.language,
        updated_at: repo.updated_at
      }));
    } catch (error) {
      console.error('Error fetching GitHub data:', error);
      throw error;
    }
  }

  async getSystemStatus(): Promise<{ service: string; status: string; responseTime: number }[]> {
    const services = [
      { name: 'GitHub', url: 'https://api.github.com' },
      { name: 'Docker Hub', url: 'https://hub.docker.com' },
      { name: 'NPM', url: 'https://registry.npmjs.org' }
    ];

    const results = await Promise.allSettled(
      services.map(async (service) => {
        const start = Date.now();
        try {
          await axios.get(service.url, { timeout: 5000 });
          const responseTime = Date.now() - start;
          return {
            service: service.name,
            status: 'online',
            responseTime
          };
        } catch (error) {
          return {
            service: service.name,
            status: 'offline',
            responseTime: Date.now() - start
          };
        }
      })
    );

    return results
      .filter((result): result is PromiseFulfilledResult<any> => result.status === 'fulfilled')
      .map(result => result.value);
  }
}
