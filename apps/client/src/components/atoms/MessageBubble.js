import React from 'react';

const MessageBubble = ({ message, me }) => {
  const alignment = me ? 'justify-end' : 'justify-start';
  const bgColor = me ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800';
  const time = message.timestamp?.toDate
    ? message.timestamp.toDate().toLocaleTimeString()
    : '';

  return (
    <div className={`flex ${alignment} mb-2`}>
      <div className={`${bgColor} rounded-lg p-2 max-w-xs`}> 
        <div>{message.text}</div>
        <div className="text-xs text-gray-600 text-right">{time}</div>
      </div>
    </div>
  );
};

export default MessageBubble; 