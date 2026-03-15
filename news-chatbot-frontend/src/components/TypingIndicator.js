import React from 'react';
import { FaRobot } from 'react-icons/fa';
import '../styles/TypingIndicator.css';

const TypingIndicator = () => {
  return (
    <div className="typing-indicator-wrapper">
      <div className="typing-avatar">
        <FaRobot />
      </div>
      <div className="typing-content">
        <div className="typing-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;