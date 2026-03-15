import React, { useState } from 'react';
import { 
  FaExternalLinkAlt, 
  FaClock, 
  FaUser, 
  FaNewspaper,
  FaBookmark,
  FaRegBookmark,
  FaShare,
  FaCalendarAlt,
  FaImage
} from 'react-icons/fa';
import '../styles/NewsCard.css';

const NewsCard = ({ article, onBookmark, isBookmarked }) => {
  const [imageError, setImageError] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleBookmarkClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onBookmark(article);
  };

  const handleShareClick = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: article.title,
          text: article.description,
          url: article.url
        });
      } catch (error) {
        console.log('Share cancelled');
      }
    } else {
      await navigator.clipboard.writeText(article.url);
      alert('Link copied to clipboard!');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (error) {
      return '';
    }
  };

  // Get image URL from multiple possible properties
  const getImageUrl = () => {
    // Check all possible image property names
    const possibleImageProps = ['urlToImage', 'image', 'thumbnail', 'urlToimage', 'Image'];
    
    for (const prop of possibleImageProps) {
      if (article[prop] && typeof article[prop] === 'string' && article[prop].startsWith('http')) {
        return article[prop];
      }
    }
    
    return null;
  };

  const imageUrl = getImageUrl();
  const hasValidImage = !imageError && imageUrl;

  return (
    <div 
      className="news-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="news-card-image">
        {hasValidImage ? (
          <img
            src={imageUrl}
            alt={article.title || 'News article'}
            onError={() => setImageError(true)}
            loading="lazy"
          />
        ) : (
          <div className="image-placeholder">
            <FaNewspaper />
            <span>No Image</span>
          </div>
        )}
        <div className={`card-actions ${isHovered ? 'visible' : ''}`}>
          <button 
            className={`action-btn bookmark-btn ${isBookmarked ? 'active' : ''}`}
            onClick={handleBookmarkClick}
            title={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
          >
            {isBookmarked ? <FaBookmark /> : <FaRegBookmark />}
          </button>
          <button 
            className="action-btn share-btn"
            onClick={handleShareClick}
            title="Share"
          >
            <FaShare />
          </button>
        </div>
      </div>
      
      <div className="news-card-content">
        <h3 className="news-title" title={article.title}>
          {article.title || 'Untitled Article'}
        </h3>
        
        {article.description && (
          <p className="news-description">
            {article.description.length > 150
              ? `${article.description.substring(0, 150)}...`
              : article.description}
          </p>
        )}
        
        <div className="news-meta">
          <div className="meta-item" title={article.source?.name}>
            <FaNewspaper className="meta-icon" />
            <span>{article.source?.name || 'Unknown Source'}</span>
          </div>
          
          {article.author && article.author !== 'Unknown Author' && article.author !== 'Unknown' && (
            <div className="meta-item" title={article.author}>
              <FaUser className="meta-icon" />
              <span>
                {article.author.length > 20 
                  ? article.author.substring(0, 20) + '...' 
                  : article.author}
              </span>
            </div>
          )}
          
          {article.publishedAt && (
            <div className="meta-item" title={formatDate(article.publishedAt)}>
              <FaCalendarAlt className="meta-icon" />
              <span>{formatDate(article.publishedAt)}</span>
            </div>
          )}
        </div>
        
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          className="read-more-btn"
          onClick={(e) => e.stopPropagation()}
        >
          Read Full Article
          <FaExternalLinkAlt />
        </a>
      </div>
    </div>
  );
};

export default NewsCard;