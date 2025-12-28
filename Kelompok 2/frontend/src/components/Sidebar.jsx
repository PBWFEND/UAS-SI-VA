import React from 'react';

const Sidebar = () => {
  return (
    <aside className="w-full lg:w-80">
      <div className="card-modern p-5 mb-6">
        <h4 className="font-semibold mb-3">Most followed</h4>
        <ul className="space-y-3">
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <div className="font-medium">Madalena</div>
                <div className="text-xs muted">Italia</div>
              </div>
            </div>
            <div className="text-xs muted">+2.1k</div>
          </li>
          <li className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gray-200" />
              <div>
                <div className="font-medium">Suzi Perry</div>
                <div className="text-xs muted">USA</div>
              </div>
            </div>
            <div className="text-xs muted">+1.5k</div>
          </li>
        </ul>
      </div>

      <div className="card-modern p-5">
        <h4 className="font-semibold mb-3">I'd like to cook...</h4>
        <div className="flex flex-wrap gap-2">
          <button className="px-3 py-1 bg-[color:var(--primary)]/10 text-[color:var(--primary)] rounded-full text-sm">Vegetarian</button>
          <button className="px-3 py-1 bg-[color:var(--primary)]/10 text-[color:var(--primary)] rounded-full text-sm">Dessert</button>
          <button className="px-3 py-1 bg-[color:var(--primary)]/10 text-[color:var(--primary)] rounded-full text-sm">Quick</button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
