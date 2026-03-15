import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import { 
  FaGlobe, 
  FaPalette, 
  FaBell, 
  FaLanguage,
  FaSave,
  FaTimes,
  FaCheck
} from 'react-icons/fa';
import { toast } from 'react-hot-toast';
import '../styles/Settings.css';

const Settings = ({ onClose }) => {
  const { user, updateUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    preferredCountry: user?.preferences?.preferredCountry || 'us',
    preferredCategory: user?.preferences?.preferredCategory || 'general',
    theme: user?.preferences?.theme || 'light',
    language: user?.preferences?.language || 'en',
    notifications: user?.preferences?.notifications !== false
  });
  
  const [countries, setCountries] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    loadOptions();
  }, []);

  const loadOptions = async () => {
    try {
      const [countriesRes, categoriesRes] = await Promise.all([
        apiService.news.getCountries(),
        apiService.news.getCategories()
      ]);
      
      setCountries(countriesRes.countries || []);
      setCategories(categoriesRes.categories || []);
    } catch (error) {
      console.error('Failed to load options:', error);
    }
  };

  const handleChange = (key, value) => {
    setPreferences(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await apiService.auth.updatePreferences(preferences);
      if (response.preferences) {
        updateUser({ ...user, preferences: response.preferences });
        toast.success('Preferences updated successfully');
        
        // Apply theme immediately
        document.body.setAttribute('data-theme', preferences.theme);
        localStorage.setItem('theme', preferences.theme);
        
        onClose();
      }
    } catch (error) {
      toast.error('Failed to update preferences');
      console.error('Update error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-modal">
      <div className="settings-content">
        <div className="settings-header">
          <h2>Settings</h2>
          <button className="close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="settings-form">
          <div className="settings-section">
            <h3>
              <FaGlobe /> News Preferences
            </h3>
            
            <div className="form-group">
              <label>Preferred Country</label>
              <select
                value={preferences.preferredCountry}
                onChange={(e) => handleChange('preferredCountry', e.target.value)}
                className="form-select"
              >
                {countries.map(country => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
              <small>News will prioritize this country</small>
            </div>

            <div className="form-group">
              <label>Preferred Category</label>
              <select
                value={preferences.preferredCategory}
                onChange={(e) => handleChange('preferredCategory', e.target.value)}
                className="form-select"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <small>Default news category</small>
            </div>
          </div>

          <div className="settings-section">
            <h3>
              <FaPalette /> Appearance
            </h3>
            
            <div className="theme-options">
              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="light"
                  checked={preferences.theme === 'light'}
                  onChange={(e) => handleChange('theme', e.target.value)}
                />
                <span className="theme-preview light">
                  <span className="theme-dot light"></span>
                  Light
                </span>
              </label>
              
              <label className="theme-option">
                <input
                  type="radio"
                  name="theme"
                  value="dark"
                  checked={preferences.theme === 'dark'}
                  onChange={(e) => handleChange('theme', e.target.value)}
                />
                <span className="theme-preview dark">
                  <span className="theme-dot dark"></span>
                  Dark
                </span>
              </label>
            </div>
          </div>

          <div className="settings-section">
            <h3>
              <FaLanguage /> Language & Notifications
            </h3>
            
            <div className="form-group">
              <label>Language</label>
              <select
                value={preferences.language}
                onChange={(e) => handleChange('language', e.target.value)}
                className="form-select"
              >
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
                <option value="hi">Hindi</option>
              </select>
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  checked={preferences.notifications}
                  onChange={(e) => handleChange('notifications', e.target.checked)}
                />
                <FaBell /> Enable notifications
              </label>
            </div>
          </div>

          <div className="settings-actions">
            <button type="button" className="cancel-btn" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="save-btn" disabled={loading}>
              {loading ? (
                <div className="loading-spinner-small"></div>
              ) : (
                <>
                  <FaSave /> Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Settings;