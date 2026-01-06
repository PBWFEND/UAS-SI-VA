import React from 'react';
import Button from './ui/Button';

const Header = ({ query, setQuery }) => {
  return (
    <header className="header w-full py-6">
      <div className="max-w-6xl mx-auto px-6 flex items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="logo flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[color:var(--primary)] flex items-center justify-center text-white font-bold">BR</div>
            <div>
              <div className="font-semibold">Buku Resep</div>
              <div className="text-xs muted">Digital Cookbook</div>
            </div>
          </div>
        </div>

        <div className="flex-1">
          <div className="max-w-2xl mx-auto">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search recipes..."
              className="search-input w-full"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button className="px-3 py-1 text-sm muted bg-transparent border border-[color:rgba(16,16,16,0.06)]">Sign up</Button>
          <Button className="px-3 py-1 text-sm font-medium bg-[color:var(--primary)] text-white">Login</Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
