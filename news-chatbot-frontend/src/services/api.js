import axios from 'axios';

const NODE_API_URL = process.env.REACT_APP_API_URL || 'http://172.23.2.8:5001';
const PYTHON_API_URL = process.env.REACT_APP_PYTHON_API_URL || 'http://172.23.2.8:5000';

console.log('🔗 Node.js API URL:', NODE_API_URL);
console.log('🐍 Python API URL:', PYTHON_API_URL);

// Node.js API instance (for auth and user data)
const nodeApi = axios.create({
  baseURL: NODE_API_URL,
  withCredentials: true,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Python API instance (for news)
const pythonApi = axios.create({
  baseURL: PYTHON_API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Request interceptor for Node.js API
nodeApi.interceptors.request.use(
  (config) => {
    console.log(`🚀 Node.js Request: ${config.method?.toUpperCase()} ${config.url}`);
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Request interceptor for Python API
pythonApi.interceptors.request.use(
  (config) => {
    console.log(`🐍 Python Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for Node.js
nodeApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Node.js Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }

    if (error.response) {
      console.error('❌ Node.js Server error:', error.response.status, error.response.data);
      return Promise.reject(error.response.data || { message: 'Server error' });
    } else if (error.request) {
      console.error('❌ Node.js No response received');
      return Promise.reject(new Error('Cannot connect to Node.js server. Please check if it\'s running on port 5001.'));
    } else {
      console.error('❌ Node.js Request error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
  }
);

// Response interceptor for Python
pythonApi.interceptors.response.use(
  (response) => {
    console.log(`✅ Python Response: ${response.status} from ${response.config.url}`);
    return response;
  },
  (error) => {
    if (error.code === 'ECONNABORTED') {
      return Promise.reject(new Error('Request timeout. Please try again.'));
    }

    if (error.response) {
      console.error('❌ Python Server error:', error.response.status, error.response.data);
      return Promise.reject(error.response.data || { message: 'Server error' });
    } else if (error.request) {
      console.error('❌ Python No response received');
      return Promise.reject(new Error('Cannot connect to Python server. Please check if it\'s running on port 5000.'));
    } else {
      console.error('❌ Python Request error:', error.message);
      return Promise.reject(new Error('Network error. Please check your connection.'));
    }
  }
);

export const apiService = {
  // Node.js API endpoints (Auth & User)
  auth: {
    testConnection: async () => {
      try {
        const response = await nodeApi.get('/health');
        return response.data;
      } catch (error) {
        console.error('Node.js connection test failed:', error);
        throw error;
      }
    },

    register: async (userData) => {
      try {
        const response = await nodeApi.post('/api/auth/register', userData);
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return response.data;
      } catch (error) {
        console.error('Registration error:', error);
        throw error;
      }
    },

    login: async (email, password) => {
      try {
        const response = await nodeApi.post('/api/auth/login', { email, password });
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
        return response.data;
      } catch (error) {
        console.error('Login error:', error);
        throw error;
      }
    },

    logout: async () => {
      try {
        await nodeApi.post('/api/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      } finally {
        localStorage.removeItem('token');
      }
    },

    getCurrentUser: async () => {
      try {
        const response = await nodeApi.get('/api/auth/me');
        return response.data.user;
      } catch (error) {
        console.error('Get current user error:', error);
        throw error;
      }
    },

    updateProfile: async (userData) => {
      try {
        const response = await nodeApi.put('/api/auth/profile', userData);
        return response.data.user;
      } catch (error) {
        console.error('Update profile error:', error);
        throw error;
      }
    },

    // Preferences
    updatePreferences: async (preferences) => {
      try {
        const response = await nodeApi.put('/api/auth/preferences', preferences);
        return response.data;
      } catch (error) {
        console.error('Update preferences error:', error);
        throw error;
      }
    },

    getPreferences: async () => {
      try {
        const response = await nodeApi.get('/api/auth/preferences');
        return response.data;
      } catch (error) {
        console.error('Get preferences error:', error);
        throw error;
      }
    },

    // Bookmarks
    addBookmark: async (article) => {
      try {
        const response = await nodeApi.post('/api/auth/bookmarks', article);
        return response.data;
      } catch (error) {
        console.error('Add bookmark error:', error);
        throw error;
      }
    },

    removeBookmark: async (url) => {
      try {
        const response = await nodeApi.delete(`/api/auth/bookmarks/${encodeURIComponent(url)}`);
        return response.data;
      } catch (error) {
        console.error('Remove bookmark error:', error);
        throw error;
      }
    },

    getBookmarks: async () => {
      try {
        const response = await nodeApi.get('/api/auth/bookmarks');
        return response.data;
      } catch (error) {
        console.error('Get bookmarks error:', error);
        throw error;
      }
    },

    // Search History
    addSearchHistory: async (query) => {
      try {
        const response = await nodeApi.post('/api/auth/history', { query });
        return response.data;
      } catch (error) {
        console.error('Add history error:', error);
        throw error;
      }
    },

    getHistory: async () => {
      try {
        const response = await nodeApi.get('/api/auth/history');
        return response.data;
      } catch (error) {
        console.error('Get history error:', error);
        throw error;
      }
    },

    clearHistory: async () => {
      try {
        const response = await nodeApi.delete('/api/auth/history');
        return response.data;
      } catch (error) {
        console.error('Clear history error:', error);
        throw error;
      }
    }
  },

  // Python API endpoints (News)
  news: {
    testConnection: async () => {
      try {
        const response = await pythonApi.get('/health');
        return response.data;
      } catch (error) {
        console.error('Python connection test failed:', error);
        throw error;
      }
    },

    getCategories: async () => {
      try {
        const response = await pythonApi.get('/api/categories');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch categories from Python:', error);
        // Return default categories as fallback
        return {
          categories: [
            { id: 'general', name: 'General', description: 'Top headlines from various sources' },
            { id: 'technology', name: 'Technology', description: 'Latest tech news and innovations' },
            { id: 'sports', name: 'Sports', description: 'Sports news and updates' },
            { id: 'business', name: 'Business', description: 'Business and financial news' },
            { id: 'entertainment', name: 'Entertainment', description: 'Entertainment news and gossip' },
            { id: 'health', name: 'Health', description: 'Health and wellness news' },
            { id: 'science', name: 'Science', description: 'Scientific discoveries and research' }
          ]
        };
      }
    },

    getCountries: async () => {
      try {
        const response = await pythonApi.get('/api/countries');
        return response.data;
      } catch (error) {
        console.error('Failed to fetch countries from Python:', error);
        // Return default countries as fallback
        return {
          countries: [
            { code: 'us', name: 'United States' },
            { code: 'gb', name: 'United Kingdom' },
            { code: 'in', name: 'India' },
            { code: 'ca', name: 'Canada' },
            { code: 'au', name: 'Australia' },
            { code: 'de', name: 'Germany' },
            { code: 'fr', name: 'France' },
            { code: 'jp', name: 'Japan' }
          ]
        };
      }
    },

    sendMessage: async (message, country = 'us', category = 'general') => {
      console.log('📤 Sending message to Python API:', { message, country, category });
      
      // Try Python API first (it only expects message)
      try {
        const response = await pythonApi.post('/api/chat', { message });
        console.log('✅ Python API response:', response.data);
        return response.data;
      } catch (pythonError) {
        console.error('❌ Python API failed:', pythonError);
        
        // Try Node.js API as fallback (it can handle country/category)
        try {
          const nodeResponse = await nodeApi.post('/api/news/chat', { 
            message,
            country,
            category 
          });
          console.log('✅ Node.js fallback response:', nodeResponse.data);
          return {
            ...nodeResponse.data,
            source: 'nodejs-fallback'
          };
        } catch (nodeError) {
          console.error('❌ Node.js fallback also failed:', nodeError);
          
          // Return mock data for testing
          return {
            success: true,
            response: `Here are some articles about "${message}":`,
            articles: [
              {
                title: `Latest News About ${message}`,
                description: `This is a sample article about ${message}. In a real scenario, this would be fetched from the news API.`,
                url: 'https://example.com',
                source: { name: 'Sample News' },
                urlToImage: 'https://via.placeholder.com/400x200?text=News',
                publishedAt: new Date().toISOString(),
                author: 'News Bot'
              },
              {
                title: `Breaking: ${message} Updates`,
                description: `Stay tuned for the latest updates on ${message}. This is a placeholder article.`,
                url: 'https://example.com',
                source: { name: 'Breaking News' },
                urlToImage: 'https://via.placeholder.com/400x200?text=Breaking',
                publishedAt: new Date().toISOString(),
                author: 'News Desk'
              }
            ],
            suggestions: ['Technology', 'Sports', 'Business', 'Entertainment']
          };
        }
      }
    },

    searchNews: async (query) => {
      console.log('📤 Searching news:', query);
      
      // Try Python API first
      try {
        const response = await pythonApi.get('/api/search', {
          params: { q: query }
        });
        console.log('✅ Python search response:', response.data);
        return response.data;
      } catch (pythonError) {
        console.error('❌ Python search failed:', pythonError);
        
        // Try Node.js API as fallback
        try {
          const nodeResponse = await nodeApi.get('/api/news/search', {
            params: { q: query }
          });
          console.log('✅ Node.js fallback search response:', nodeResponse.data);
          return {
            ...nodeResponse.data,
            source: 'nodejs-fallback'
          };
        } catch (nodeError) {
          console.error('❌ Node.js fallback search also failed:', nodeError);
          throw new Error('Search service is unavailable. Please try again later.');
        }
      }
    },

    getNewsByCountry: async (countryCode) => {
      try {
        const response = await nodeApi.get(`/api/news/country/${countryCode}`);
        return response.data;
      } catch (error) {
        console.error('Get news by country error:', error);
        throw error;
      }
    },

    getNewsByCategory: async (category) => {
      try {
        const response = await nodeApi.get(`/api/news/category/${category}`);
        return response.data;
      } catch (error) {
        console.error('Get news by category error:', error);
        throw error;
      }
    }
  }
};

// Add a global error handler for unhandled promise rejections
window.addEventListener('unhandledrejection', (event) => {
  console.error('Unhandled Promise Rejection:', event.reason);
});