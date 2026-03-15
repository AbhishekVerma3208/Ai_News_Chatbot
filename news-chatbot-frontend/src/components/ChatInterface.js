import React, { useState, useRef, useEffect } from 'react';
import Message from './Message';
import NewsCard from './NewsCard';
import SuggestionChips from './SuggestionChips';
import TypingIndicator from './TypingIndicator';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import Settings from './Settings';
import {
  FaPaperPlane,
  FaRobot,
  FaSun,
  FaMoon,
  FaBars,
  FaTimes,
  FaNewspaper,
  FaGlobe,
  FaHashtag,
  FaFire,
  FaUserCircle,
  FaCog,
  FaSignOutAlt,
  FaSearch,
  FaExclamationTriangle,
  FaBookmark,
  FaClock,
  FaHistory,
  FaTrash,
  FaChevronDown
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import '../styles/ChatInterface.css';

// Default categories data (fallback)
const DEFAULT_CATEGORIES = [
  { id: 'general', name: 'General', description: 'Top headlines from all categories' },
  { id: 'business', name: 'Business', description: 'Finance, markets, and economy' },
  { id: 'entertainment', name: 'Entertainment', description: 'Celebrity, movies, and music' },
  { id: 'health', name: 'Health', description: 'Medical, wellness, and healthcare' },
  { id: 'science', name: 'Science', description: 'Research, discoveries, and innovation' },
  { id: 'sports', name: 'Sports', description: 'Latest scores and sports news' },
  { id: 'technology', name: 'Technology', description: 'Tech news and gadgets' }
];

// Default countries data with proper codes (fallback)
const DEFAULT_COUNTRIES = [
  { code: 'ae', name: 'UAE' },
  { code: 'ar', name: 'Argentina' },
  { code: 'at', name: 'Austria' },
  { code: 'au', name: 'Australia' },
  { code: 'be', name: 'Belgium' },
  { code: 'bg', name: 'Bulgaria' },
  { code: 'br', name: 'Brazil' },
  { code: 'ca', name: 'Canada' },
  { code: 'ch', name: 'Switzerland' },
  { code: 'cn', name: 'China' },
  { code: 'co', name: 'Colombia' },
  { code: 'cu', name: 'Cuba' },
  { code: 'cz', name: 'Czech Republic' },
  { code: 'de', name: 'Germany' },
  { code: 'eg', name: 'Egypt' },
  { code: 'fr', name: 'France' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'gr', name: 'Greece' },
  { code: 'hk', name: 'Hong Kong' },
  { code: 'hu', name: 'Hungary' },
  { code: 'id', name: 'Indonesia' },
  { code: 'ie', name: 'Ireland' },
  { code: 'il', name: 'Israel' },
  { code: 'in', name: 'India' },
  { code: 'it', name: 'Italy' },
  { code: 'jp', name: 'Japan' },
  { code: 'kr', name: 'South Korea' },
  { code: 'lt', name: 'Lithuania' },
  { code: 'lv', name: 'Latvia' },
  { code: 'ma', name: 'Morocco' },
  { code: 'mx', name: 'Mexico' },
  { code: 'my', name: 'Malaysia' },
  { code: 'ng', name: 'Nigeria' },
  { code: 'nl', name: 'Netherlands' },
  { code: 'no', name: 'Norway' },
  { code: 'nz', name: 'New Zealand' },
  { code: 'ph', name: 'Philippines' },
  { code: 'pl', name: 'Poland' },
  { code: 'pt', name: 'Portugal' },
  { code: 'ro', name: 'Romania' },
  { code: 'rs', name: 'Serbia' },
  { code: 'ru', name: 'Russia' },
  { code: 'sa', name: 'Saudi Arabia' },
  { code: 'se', name: 'Sweden' },
  { code: 'sg', name: 'Singapore' },
  { code: 'si', name: 'Slovenia' },
  { code: 'sk', name: 'Slovakia' },
  { code: 'th', name: 'Thailand' },
  { code: 'tr', name: 'Turkey' },
  { code: 'tw', name: 'Taiwan' },
  { code: 'ua', name: 'Ukraine' },
  { code: 'us', name: 'United States' },
  { code: 've', name: 'Venezuela' },
  { code: 'za', name: 'South Africa' }
];

const ChatInterface = ({ categories = DEFAULT_CATEGORIES, countries = DEFAULT_COUNTRIES }) => {
  const { user, logout, updateUser } = useAuth();
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isDarkMode, setIsDarkMode] = useState(() => {
    const saved = localStorage.getItem('theme');
    return saved ? saved === 'dark' : false;
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [searchHistory, setSearchHistory] = useState([]);
  const [bookmarkedNews, setBookmarkedNews] = useState([]);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const [selectedCountry, setSelectedCountry] = useState(() => {
    return user?.preferences?.preferredCountry || 'us';
  });
  const [selectedCategory, setSelectedCategory] = useState(() => {
    return user?.preferences?.preferredCategory || 'general';
  });
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);

  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const userMenuRef = useRef(null);
  const sidebarRef = useRef(null);
  const countryDropdownRef = useRef(null);
  const categoryDropdownRef = useRef(null);

  // Log props to debug
  useEffect(() => {
    console.log('Categories:', categories);
    console.log('Countries:', countries);
  }, [categories, countries]);

  // Theme effect
  useEffect(() => {
    document.body.setAttribute('data-theme', isDarkMode ? 'dark' : 'light');
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  // Responsive check
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
      if (window.innerWidth > 768) {
        setIsSidebarOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Load user data from MongoDB/localStorage
  useEffect(() => {
    const loadUserData = async () => {
      try {
        // Load from MongoDB if user is authenticated
        if (user) {
          try {
            const bookmarksRes = await apiService.auth.getBookmarks();
            if (bookmarksRes.bookmarks) {
              setBookmarkedNews(bookmarksRes.bookmarks);
            }

            const historyRes = await apiService.auth.getHistory();
            if (historyRes.history) {
              setSearchHistory(historyRes.history.map(h => h.query));
            }

            // Set preferences
            if (user.preferences) {
              setSelectedCountry(user.preferences.preferredCountry || 'us');
              setSelectedCategory(user.preferences.preferredCategory || 'general');
            }
          } catch (error) {
            console.error('Error loading user data from MongoDB:', error);
            // Fallback to localStorage
            loadFromLocalStorage();
          }
        } else {
          loadFromLocalStorage();
        }
      } catch (error) {
        console.error('Error loading user data:', error);
      }
    };

    const loadFromLocalStorage = () => {
      const savedHistory = localStorage.getItem('searchHistory');
      if (savedHistory) {
        setSearchHistory(JSON.parse(savedHistory));
      }

      const savedBookmarks = localStorage.getItem('bookmarkedNews');
      if (savedBookmarks) {
        setBookmarkedNews(JSON.parse(savedBookmarks));
      }
    };

    loadUserData();
  }, [user]);

  // Save search history
  useEffect(() => {
    if (searchHistory.length > 0) {
      localStorage.setItem('searchHistory', JSON.stringify(searchHistory.slice(0, 20)));
    }
  }, [searchHistory]);

  // Save bookmarks
  useEffect(() => {
    localStorage.setItem('bookmarkedNews', JSON.stringify(bookmarkedNews));
  }, [bookmarkedNews]);

  // Welcome message
  useEffect(() => {
    setMessages([
      {
        id: 'welcome',
        type: 'bot',
        content: {
          text: `👋 Hello ${user?.fullName || 'there'}! I'm your AI News Assistant. I can help you find news about:
          
• Technology, Sports, Business, Entertainment, Health, and Science
• News from specific countries
• Topics you're interested in

Try asking me something like:
• "Show me latest technology news"
• "What's happening in sports?"
• "News about artificial intelligence"
• "Business headlines"`,
        },
        timestamp: new Date(),
      },
    ]);
  }, [user]);

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (countryDropdownRef.current && !countryDropdownRef.current.contains(event.target)) {
        setShowCountryDropdown(false);
      }
      if (categoryDropdownRef.current && !categoryDropdownRef.current.contains(event.target)) {
        setShowCategoryDropdown(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
        setShowUserMenu(false);
      }
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && isMobile && isSidebarOpen) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, isSidebarOpen]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
    toast.success(`Switched to ${!isDarkMode ? 'dark' : 'light'} mode`);
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      content: { text: inputMessage },
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    
    // Add to search history
    setSearchHistory(prev => {
      const filtered = prev.filter(item => item !== inputMessage);
      const newHistory = [inputMessage, ...filtered].slice(0, 20);
      
      // Save to MongoDB if user is authenticated
      if (user) {
        apiService.auth.addSearchHistory(inputMessage).catch(console.error);
      }
      
      return newHistory;
    });

    const sentMessage = inputMessage;
    setInputMessage('');
    setIsLoading(true);

    try {
      setMessages(prev => [...prev, { id: 'typing', type: 'typing', content: {} }]);

      console.log('📤 Sending message:', sentMessage);
      console.log('📍 Selected country:', selectedCountry);
      console.log('📂 Selected category:', selectedCategory);
      
      // Pass the selected country and category to the API
      const response = await apiService.news.sendMessage(
        sentMessage, 
        selectedCountry, 
        selectedCategory
      );
      
      console.log('📥 Response:', response);

      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      if (response && response.success) {
        const botMessage = {
          id: (Date.now() + 1).toString(),
          type: 'bot',
          content: {
            text: response.response || 'Here are the news articles:',
            articles: response.articles || [],
          },
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, botMessage]);
        setSuggestions(response.suggestions || []);

        if (!response.articles?.length) {
          toast.error('No articles found. Try a different query!');
        } else {
          toast.success(`Found ${response.articles.length} articles!`);
        }
      } else {
        throw new Error(response?.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('❌ Error in handleSendMessage:', error);
      setMessages(prev => prev.filter(msg => msg.id !== 'typing'));

      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        content: { text: 'Sorry, I encountered an error. Please try again.' },
        timestamp: new Date(),
      }]);

      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputMessage(suggestion);
    setTimeout(() => handleSendMessage(), 100);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleBookmark = async (article) => {
    setBookmarkedNews(prev => {
      const exists = prev.find(item => item.url === article.url);
      let newBookmarks;
      
      if (exists) {
        newBookmarks = prev.filter(item => item.url !== article.url);
        toast.success('Removed from bookmarks');
        
        // Remove from MongoDB
        if (user) {
          apiService.auth.removeBookmark(article.url).catch(console.error);
        }
      } else {
        newBookmarks = [article, ...prev].slice(0, 50);
        toast.success('Added to bookmarks');
        
        // Add to MongoDB
        if (user) {
          apiService.auth.addBookmark(article).catch(console.error);
        }
      }
      
      return newBookmarks;
    });
  };

  const clearHistory = async () => {
    setSearchHistory([]);
    localStorage.removeItem('searchHistory');
    
    if (user) {
      try {
        await apiService.auth.clearHistory();
      } catch (error) {
        console.error('Error clearing history from MongoDB:', error);
      }
    }
    
    toast.success('Search history cleared');
  };

  const clearBookmarks = async () => {
    setBookmarkedNews([]);
    localStorage.removeItem('bookmarkedNews');
    
    toast.success('Bookmarks cleared');
  };

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    await logout();
  };

  const handleCountryChange = (countryCode) => {
    setSelectedCountry(countryCode);
    setShowCountryDropdown(false);
    
    // Get country name
    const countryName = countries.find(c => c.code === countryCode)?.name || countryCode;
    
    // Update user preferences if logged in
    if (user) {
      apiService.auth.updatePreferences({
        ...user.preferences,
        preferredCountry: countryCode
      }).catch(console.error);
    }
    
    toast.success(`Country changed to ${countryName}`);
  };

  const handleCategoryChange = (categoryId) => {
    setSelectedCategory(categoryId);
    setShowCategoryDropdown(false);
    
    // Get category name
    const categoryName = categories.find(c => c.id === categoryId)?.name || categoryId;
    
    // Update user preferences if logged in
    if (user) {
      apiService.auth.updatePreferences({
        ...user.preferences,
        preferredCategory: categoryId
      }).catch(console.error);
    }
    
    toast.success(`Category changed to ${categoryName}`);
  };

  const renderSidebar = () => (
    <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`} ref={sidebarRef}>
      <div className="sidebar-header">
        <div className="sidebar-header-content">
          <FaRobot className="sidebar-logo" />
          <h3>Menu</h3>
        </div>
        <button className="close-sidebar" onClick={toggleSidebar}>
          <FaTimes />
        </button>
      </div>

      <div className="sidebar-tabs">
        <button
          className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
          onClick={() => {
            setActiveTab('chat');
            if (isMobile) setIsSidebarOpen(false);
          }}
        >
          <FaRobot /> Chat
        </button>
        <button
          className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          onClick={() => setActiveTab('history')}
        >
          <FaHistory /> History
        </button>
        <button
          className={`tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
          onClick={() => setActiveTab('bookmarks')}
        >
          <FaBookmark /> Bookmarks
        </button>
        <button
          className={`tab-btn ${activeTab === 'categories' ? 'active' : ''}`}
          onClick={() => setActiveTab('categories')}
        >
          <FaHashtag /> Categories
        </button>
        <button
          className={`tab-btn ${activeTab === 'countries' ? 'active' : ''}`}
          onClick={() => setActiveTab('countries')}
        >
          <FaGlobe /> Countries
        </button>
        <button
          className={`tab-btn ${activeTab === 'trending' ? 'active' : ''}`}
          onClick={() => setActiveTab('trending')}
        >
          <FaFire /> Trending
        </button>
      </div>

      <div className="sidebar-content">
        {activeTab === 'history' && (
          <div className="history-list">
            <div className="list-header">
              <h4>Recent Searches</h4>
              {searchHistory.length > 0 && (
                <button className="clear-btn" onClick={clearHistory}>
                  <FaTrash /> Clear
                </button>
              )}
            </div>
            {searchHistory.length > 0 ? (
              searchHistory.map((query, index) => (
                <div
                  key={index}
                  className="list-item"
                  onClick={() => {
                    setInputMessage(query);
                    setIsSidebarOpen(false);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  <FaSearch className="item-icon" />
                  <span className="item-text">{query}</span>
                </div>
              ))
            ) : (
              <p className="empty-message">No search history yet</p>
            )}
          </div>
        )}

        {activeTab === 'bookmarks' && (
          <div className="bookmarks-list">
            <div className="list-header">
              <h4>Saved Articles</h4>
              {bookmarkedNews.length > 0 && (
                <button className="clear-btn" onClick={clearBookmarks}>
                  <FaTrash /> Clear
                </button>
              )}
            </div>
            {bookmarkedNews.length > 0 ? (
              bookmarkedNews.map((article, index) => (
                <div key={index} className="bookmark-item">
                  <div className="bookmark-title">{article.title}</div>
                  <div className="bookmark-meta">
                    <span className="bookmark-source">
                      <FaNewspaper /> {article.source?.name || 'Unknown'}
                    </span>
                    <a
                      href={article.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bookmark-link"
                    >
                      Read
                    </a>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-message">No bookmarked articles</p>
            )}
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="categories-list">
            {categories.length > 0 ? (
              categories.map((cat) => (
                <div
                  key={cat.id}
                  className={`category-item ${selectedCategory === cat.id ? 'active' : ''}`}
                  onClick={() => {
                    handleCategoryChange(cat.id);
                    setInputMessage(`${cat.name} news`);
                    setIsSidebarOpen(false);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  <span className="category-name">{cat.name}</span>
                  <span className="category-desc">{cat.description}</span>
                </div>
              ))
            ) : (
              <p className="empty-message">No categories available</p>
            )}
          </div>
        )}

        {activeTab === 'countries' && (
          <div className="countries-list">
            {countries.length > 0 ? (
              countries.map((country) => (
                <div
                  key={country.code}
                  className={`country-item ${selectedCountry === country.code ? 'active' : ''}`}
                  onClick={() => {
                    handleCountryChange(country.code);
                    setInputMessage(`News from ${country.name}`);
                    setIsSidebarOpen(false);
                    setTimeout(() => handleSendMessage(), 100);
                  }}
                >
                  <span className="country-name">{country.name}</span>
                  <span className="country-code">{country.code?.toUpperCase()}</span>
                </div>
              ))
            ) : (
              <p className="empty-message">No countries available</p>
            )}
          </div>
        )}

        {activeTab === 'trending' && (
          <div className="trending-list">
            {['Technology', 'Sports', 'Business', 'Entertainment', 'Health', 'Science'].map((item) => (
              <div
                key={item}
                className="trending-item"
                onClick={() => {
                  setInputMessage(`${item} news`);
                  setIsSidebarOpen(false);
                  setTimeout(() => handleSendMessage(), 100);
                }}
              >
                <FaFire className="trending-icon" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="sidebar-footer">
        <div className="user-info-mini">
          <FaUserCircle className="user-avatar-mini" />
          <div className="user-details-mini">
            <span className="user-name-mini">{user?.fullName || 'Guest'}</span>
            <span className="user-email-mini">{user?.email || 'guest@newsbot.com'}</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className={`chat-interface ${isDarkMode ? 'dark' : 'light'}`}>
      {/* Sidebar Overlay for Mobile */}
      {isSidebarOpen && isMobile && (
        <div className="sidebar-overlay" onClick={toggleSidebar} />
      )}

      {/* Sidebar */}
      {renderSidebar()}

      {/* Settings Modal */}
      {showSettings && (
        <Settings onClose={() => setShowSettings(false)} />
      )}

      {/* Main Content */}
      <div className="main-content">
        <div className="chat-header">
          <div className="header-left">
            <button className="menu-btn" onClick={toggleSidebar}>
              <FaBars />
            </button>
            <div className="header-content">
              <FaRobot className="header-icon" />
              <div>
                <h1>AI News Chatbot</h1>
                <p>Ask me anything about news!</p>
              </div>
            </div>
          </div>

          <div className="header-right">
            {/* Country Selector */}
            <div className="selector-container" ref={countryDropdownRef}>
              <button 
                className="selector-btn"
                onClick={() => {
                  console.log('Country button clicked');
                  setShowCountryDropdown(!showCountryDropdown);
                }}
              >
                <FaGlobe />
                <span>{countries.find(c => c.code === selectedCountry)?.name || 'Select Country'}</span>
                <FaChevronDown className={`dropdown-arrow ${showCountryDropdown ? 'open' : ''}`} />
              </button>
              {showCountryDropdown && (
                <div className="dropdown-menu">
                  {countries.length > 0 ? (
                    countries.map(country => (
                      <button
                        key={country.code}
                        className={`dropdown-item ${selectedCountry === country.code ? 'active' : ''}`}
                        onClick={() => handleCountryChange(country.code)}
                      >
                        <span>{country.name}</span>
                        <span className="country-code">{country.code.toUpperCase()}</span>
                      </button>
                    ))
                  ) : (
                    <div className="dropdown-item">No countries available</div>
                  )}
                </div>
              )}
            </div>

            {/* Category Selector */}
            <div className="selector-container" ref={categoryDropdownRef}>
              <button 
                className="selector-btn"
                onClick={() => {
                  console.log('Category button clicked');
                  setShowCategoryDropdown(!showCategoryDropdown);
                }}
              >
                <FaHashtag />
                <span>{categories.find(c => c.id === selectedCategory)?.name || 'Select Category'}</span>
                <FaChevronDown className={`dropdown-arrow ${showCategoryDropdown ? 'open' : ''}`} />
              </button>
              {showCategoryDropdown && (
                <div className="dropdown-menu">
                  {categories.length > 0 ? (
                    categories.map(category => (
                      <button
                        key={category.id}
                        className={`dropdown-item ${selectedCategory === category.id ? 'active' : ''}`}
                        onClick={() => handleCategoryChange(category.id)}
                      >
                        {category.name}
                      </button>
                    ))
                  ) : (
                    <div className="dropdown-item">No categories available</div>
                  )}
                </div>
              )}
            </div>

            <div className="header-stats">
              <span className="stat-badge">
                {countries.length} Countries
              </span>
              <span className="stat-badge">
                {categories.length} Categories
              </span>
            </div>

            <button className="theme-toggle" onClick={toggleTheme}>
              {isDarkMode ? <FaSun /> : <FaMoon />}
            </button>

            <div className="user-menu" ref={userMenuRef}>
              <button
                className="user-btn"
                onClick={() => setShowUserMenu(!showUserMenu)}
              >
                <FaUserCircle className="user-avatar-small" />
                <span className="user-name-small">{user?.fullName?.split(' ')[0] || 'User'}</span>
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info">
                    <FaUserCircle className="user-avatar" />
                    <div className="user-details">
                      <div className="user-fullname">{user?.fullName || 'Guest User'}</div>
                      <div className="user-email">{user?.email || 'guest@newsbot.com'}</div>
                    </div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button 
                    className="dropdown-item"
                    onClick={() => {
                      setShowSettings(true);
                      setShowUserMenu(false);
                    }}
                  >
                    <FaCog /> Settings
                  </button>
                  <button
                    className="dropdown-item logout"
                    onClick={() => setShowLogoutConfirm(true)}
                  >
                    <FaSignOutAlt /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="messages-container">
          {messages.map((message) => {
            if (message.type === 'typing') {
              return <TypingIndicator key={message.id} />;
            }
            return (
              <Message
                key={message.id}
                message={message}
              >
                {message.content.articles && message.content.articles.length > 0 && (
                  <div className="articles-grid">
                    {message.content.articles.map((article, index) => (
                      <NewsCard
                        key={index}
                        article={article}
                        onBookmark={handleBookmark}
                        isBookmarked={bookmarkedNews.some(b => b.url === article.url)}
                      />
                    ))}
                  </div>
                )}
              </Message>
            );
          })}
          <div ref={messagesEndRef} />
        </div>

        {suggestions.length > 0 && (
          <SuggestionChips
            suggestions={suggestions}
            onSuggestionClick={handleSuggestionClick}
          />
        )}

        <div className="input-container">
          <div className="input-wrapper">
            <textarea
              ref={inputRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type your message here..."
              rows="1"
              disabled={isLoading}
            />
            <button
              onClick={handleSendMessage}
              disabled={!inputMessage.trim() || isLoading}
              className={isLoading ? 'loading' : ''}
            >
              {isLoading ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <FaPaperPlane />
              )}
            </button>
          </div>
          <div className="input-footer">
            <span>Press Enter to send</span>
            <span className="input-hint">
              <FaClock /> Shift + Enter for new line
            </span>
          </div>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <FaExclamationTriangle className="modal-icon" />
            <h3>Sign Out</h3>
            <p>Are you sure you want to sign out?</p>
            <div className="modal-actions">
              <button
                className="modal-btn cancel"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button
                className="modal-btn confirm"
                onClick={handleLogout}
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatInterface;