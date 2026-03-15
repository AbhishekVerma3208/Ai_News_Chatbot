import React from 'react';
import { FaLightbulb } from 'react-icons/fa';
import '../styles/SuggestionChips.css';

const SuggestionChips = ({ suggestions, onSuggestionClick }) => {
  return (
    <div className="suggestions-container">
      <div className="suggestions-label">
        <FaLightbulb /> Suggested:
      </div>
      <div className="suggestions-wrapper">
        {suggestions.map((suggestion, index) => (
          <button
            key={index}
            className="suggestion-chip"
            onClick={() => onSuggestionClick(suggestion)}
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};

export default SuggestionChips;