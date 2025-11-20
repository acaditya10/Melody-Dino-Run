import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  isLoading = false, 
  className = '', 
  disabled,
  ...props 
}) => {
  const baseStyles = "px-6 py-3 rounded-lg font-retro text-sm uppercase tracking-wider transition-all transform active:scale-95 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900";
  
  const variants = {
    primary: "bg-indigo-600 hover:bg-indigo-500 text-white focus:ring-indigo-500 shadow-[4px_4px_0px_0px_rgba(79,70,229,0.5)]",
    secondary: "bg-gray-700 hover:bg-gray-600 text-gray-200 focus:ring-gray-500 border-2 border-gray-600"
  };

  return (
    <button 
      className={`${baseStyles} ${variants[variant]} ${className} ${isLoading || disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
