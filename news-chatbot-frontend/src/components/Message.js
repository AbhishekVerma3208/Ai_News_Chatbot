import React from 'react';
import { FaRobot, FaUser, FaClock } from 'react-icons/fa';
import { formatDistanceToNow } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import '../styles/Message.css';

const Message = ({ message, children }) => {
  const isBot = message.type === 'bot';
  const timestamp = formatDistanceToNow(new Date(message.timestamp), {
    addSuffix: true,
  });

  return (
    <div className={`message-wrapper ${isBot ? 'bot' : 'user'}`}>
      <div className="message-avatar">
        {isBot ? <FaRobot /> : <FaUser />}
      </div>
      <div className="message-content">
        <div className="message-header">
          <span className="message-sender">
            {isBot ? 'AI News Assistant' : 'You'}
          </span>
          <span className="message-timestamp">
            <FaClock /> {timestamp}
          </span>
        </div>
        <div className="message-bubble">
          {typeof message.content === 'string' ? (
            <ReactMarkdown>{message.content}</ReactMarkdown>
          ) : (
            <>
              <ReactMarkdown>{message.content.text}</ReactMarkdown>
              {children}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;