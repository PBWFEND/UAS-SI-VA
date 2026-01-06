import React from 'react';

const MenuCard = ({ menu }) => {
  return (
    // UBAH 1: Hapus class "card", ganti dengan utility classes lengkap agar kotak putihnya muncul
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow border border-gray-100 flex flex-col h-full">
      
      {/* UBAH 2: Bagian Gambar (Image) */}
      <div className="h-48 w-full bg-gray-200 relative">
        {menu.image ? (
          <img 
            src={menu.image} 
            alt={menu.name} 
            className="w-full h-full object-cover"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = "https://via.placeholder.com/300?text=No+Image"; // Fallback jika gambar rusak
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <span className="text-sm">No Image Available</span>
          </div>
        )}
        
        {/* Badge Status (Tersedia/Habis) dipindah ke atas gambar agar lebih modern */}
        <span className={`absolute top-2 right-2 px-2 py-1 text-xs font-bold rounded-full shadow-sm ${
          menu.isAvailable 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {menu.isAvailable ? 'Tersedia' : 'Habis'}
        </span>
      </div>

      {/* Bagian Konten Teks */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-lg font-bold text-gray-800 line-clamp-1" title={menu.name}>
                {menu.name}
            </h3>
            <p className="text-xs text-blue-600 font-medium uppercase tracking-wide">
                {menu.category || 'Umum'}
            </p>
          </div>
        </div>
        
        {/* Deskripsi dengan batas 2 baris */}
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">
          {menu.description || 'Tidak ada deskripsi menu.'}
        </p>
        
        {/* Harga dan Tanggal */}
        <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
          <div className="text-lg font-bold text-blue-600">
            {/* Safety check: jika harga null/undefined, tampilkan 0 */}
            Rp {(menu.price || 0).toLocaleString('id-ID')}
          </div>
          <div className="text-xs text-gray-400">
             {/* Safety check: hanya tampilkan tanggal jika ada */}
             {menu.createdAt && new Date(menu.createdAt).toLocaleDateString('id-ID')}
          </div>
        </div>
      </div>
    </div>
  );
}

export default MenuCard;