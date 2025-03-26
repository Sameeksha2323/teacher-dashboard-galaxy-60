
import React from 'react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  return (
    <header className="w-full bg-ishanya-green text-white p-4 shadow-md animate-fade-in">
      <div className="container mx-auto flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
      </div>
    </header>
  );
};

export default Header;
