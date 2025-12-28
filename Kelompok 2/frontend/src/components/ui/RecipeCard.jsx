import React from 'react';

const RecipeCard = ({ recipe = {}, onDelete, isOwner = false }) => {
  const placeholder = '/src/assets/placeholder-food.jpg';
  return (
    <div className="rounded-lg overflow-hidden shadow-sm bg-white border">
      <div className="h-40 w-full relative bg-gray-100">
        <img src={recipe.image || placeholder} alt={recipe.title} className="object-cover w-full h-full" />
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1">{recipe.title || 'Untitled'}</h3>
        <p className="text-sm muted line-clamp-3 mb-3">{recipe.instructions || 'No description provided.'}</p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="pill">{recipe.category || 'Makanan'}</div>
            <div className="small muted">{recipe.duration || '30m'}</div>
          </div>
          {isOwner && <button onClick={() => onDelete && onDelete(recipe.id)} className="text-[color:var(--accent)] text-sm">Hapus</button>}
        </div>
      </div>
    </div>
  );
};

export default RecipeCard;
