import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`card-modern p-6 ${className}`}>
      {children}
    </div>
  );
};

export default Card;
