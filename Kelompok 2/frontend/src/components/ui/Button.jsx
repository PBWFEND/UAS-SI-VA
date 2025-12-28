import React from 'react';

const Button = ({ children, className = '', ...props }) => {
  return (
    <button
      {...props}
      className={
        'inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-semibold shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 ' +
        className
      }
    >
      {children}
    </button>
  );
};

export default Button;
