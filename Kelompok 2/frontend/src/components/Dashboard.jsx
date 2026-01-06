import { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ onLogout }) => {
    const [recipes, setRecipes] = useState([]);
    const [filter, setFilter] = useState('all'); 
    const [search, setSearch] = useState('');
    
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [editId, setEditId] = useState(null);
    
    // Perhatikan: ingredients & instructions sekarang Array []
    const [form, setForm] = useState({ 
        title: '', ingredients: [''], instructions: [''], image: '', 
        category: 'Masakan Utama', cookingTime: '', servings: '' 
    });

    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    const API = 'http://uas-buku-resep-production.up.railway.app/api/recipes';
    const config = { headers: { Authorization: `Bearer ${token}` } };

    const fetchRecipes = async () => {
        try {
            const res = await axios.get(API, config);
            setRecipes(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchRecipes(); }, []);

    // --- LOGIKA FORM DINAMIS (ARRAY) ---

    // 1. Handle Tambah Baris
    const addIngredient = () => setForm({ ...form, ingredients: [...form.ingredients, ''] });
    const addInstruction = () => setForm({ ...form, instructions: [...form.instructions, ''] });

    // 2. Handle Ketik di Input Baris
    const handleIngredientChange = (index, value) => {
        const newIngredients = [...form.ingredients];
        newIngredients[index] = value;
        setForm({ ...form, ingredients: newIngredients });
    };

    const handleInstructionChange = (index, value) => {
        const newInstructions = [...form.instructions];
        newInstructions[index] = value;
        setForm({ ...form, instructions: newInstructions });
    };

    // 3. Handle Hapus Baris (Opsional, klik ikon silang)
    const removeIngredient = (index) => {
        if(form.ingredients.length > 1) {
            const newIng = form.ingredients.filter((_, i) => i !== index);
            setForm({...form, ingredients: newIng});
        }
    };
    const removeInstruction = (index) => {
        if(form.instructions.length > 1) {
            const newInst = form.instructions.filter((_, i) => i !== index);
            setForm({...form, instructions: newInst});
        }
    };

    // --- LOGIKA BUKA MODAL ---

    const openAddModal = () => {
        setIsEditMode(false);
        setForm({ 
            title: '', ingredients: [''], instructions: [''], image: '', 
            category: 'Masakan Utama', cookingTime: '', servings: '' 
        });
        setIsModalOpen(true);
    };

    const handleEdit = (recipe) => {
        setIsEditMode(true);
        setEditId(recipe.id);
        setForm({
            title: recipe.title,
            // Convert String Database ("Bawang\nGaram") -> Array (["Bawang", "Garam"])
            ingredients: recipe.ingredients ? recipe.ingredients.split('\n') : [''],
            instructions: recipe.instructions ? recipe.instructions.split('\n') : [''],
            image: recipe.image || '',
            category: recipe.category || 'Masakan Utama',
            cookingTime: recipe.cookingTime || '',
            servings: recipe.servings || ''
        });
        setIsModalOpen(true);
    };

    // --- LOGIKA SIMPAN (CONVERT ARRAY -> STRING) ---
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Gabungkan Array jadi String dipisah Enter (\n) agar Database nerima
        const payload = {
            ...form,
            ingredients: form.ingredients.join('\n'),
            instructions: form.instructions.join('\n')
        };

        try {
            if (isEditMode) {
                await axios.put(`${API}/${editId}`, payload, config);
                alert("Resep diperbarui!");
            } else {
                await axios.post(API, payload, config);
                alert("Resep dibuat!");
            }
            setIsModalOpen(false);
            fetchRecipes();
        } catch (err) { alert("Gagal menyimpan data."); }
    };

    const handleDelete = async (id) => {
        if(confirm('Hapus resep ini?')) {
            try {
                await axios.delete(`${API}/${id}`, config);
                if (selectedRecipe?.id === id) setSelectedRecipe(null);
                fetchRecipes();
            } catch (err) { alert("Gagal hapus."); }
        }
    };

    const filteredRecipes = recipes.filter(r => {
        const matchSearch = r.title.toLowerCase().includes(search.toLowerCase());
        const matchTab = filter === 'all' ? true : r.userId === user.id;
        return matchSearch && matchTab;
    });

    // Helper render list untuk detail view
    const renderList = (text, type = 'ul') => {
        if (!text) return null;
        const items = text.split('\n').filter(item => item.trim() !== '');
        if (type === 'ol') {
            return <ol style={{paddingLeft:'20px', margin:0}}>{items.map((it, i) => <li key={i} style={{marginBottom:'6px'}}>{it}</li>)}</ol>;
        }
        return <ul style={{paddingLeft:'20px', margin:0}}>{items.map((it, i) => <li key={i} style={{marginBottom:'6px'}}>{it}</li>)}</ul>;
    };

    return (
        <div>
            {/* NAVBAR */}
            <nav className="navbar">
                <div className="logo">
                    <span className="logo-icon">BR</span> Buku Resep
                </div>
                <div className="nav-user">
                    <span>Halo, {user?.name}</span>
                    <button onClick={onLogout} className="btn-logout">Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                {/* HEADER */}
                <div className="header-section">
                    <input 
                        className="search-input" placeholder="Cari resep..." 
                        value={search} onChange={e => setSearch(e.target.value)}
                    />
                    <button className="btn-add" onClick={openAddModal}>+ Tambah Resep</button>
                </div>

                {/* TABS */}
                <div className="tabs">
                    <button onClick={() => setFilter('all')} className={`tab-btn ${filter === 'all' ? 'active' : ''}`}>Semua Resep</button>
                    <button onClick={() => setFilter('my')} className={`tab-btn ${filter === 'my' ? 'active' : ''}`}>Resep Saya</button>
                </div>

                {/* GRID RESEP */}
                {filteredRecipes.length === 0 ? (
                    <div style={{textAlign: 'center', padding: '4rem', color: '#999'}}>
                        <h3>Tidak ada resep ditemukan.</h3>
                    </div>
                ) : (
                    <div className="recipe-grid">
                        {filteredRecipes.map(recipe => (
                            <div key={recipe.id} className="recipe-card">
                                <div className="card-img-wrapper">
                                    <img 
                                        src={recipe.image || "https://placehold.co/600x400?text=No+Image"} 
                                        className="card-img" 
                                        onError={(e) => e.target.src = 'https://placehold.co/600x400?text=Food'}
                                    />
                                    <span className="badge">{recipe.category || 'Umum'}</span>
                                </div>
                                <div className="card-body">
                                    <h3 className="recipe-title">{recipe.title}</h3>
                                    <small style={{color:'#888', display:'block', marginBottom:'10px'}}>Oleh: {recipe.user?.name}</small>
                                    <div className="card-meta">
                                        <span>⏱️ {recipe.cookingTime || '-'}</span>
                                        <span>👤 {recipe.servings || '-'}</span>
                                    </div>
                                    <div style={{marginTop:'15px', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                                        <span onClick={() => setSelectedRecipe(recipe)} style={{color:'#f97316', fontWeight:'bold', fontSize:'0.9rem', cursor:'pointer'}}>Lihat Detail</span>
                                        {recipe.userId === user.id && (
                                            <div className="action-buttons">
                                                <button onClick={() => handleEdit(recipe)} className="btn-edit">Edit</button>
                                                <button onClick={() => handleDelete(recipe.id)} className="btn-delete">Hapus</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* MODAL FORM */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
                            <h2 style={{margin:0}}>{isEditMode ? 'Edit Resep' : 'Tambah Resep Baru'}</h2>
                            <button onClick={() => setIsModalOpen(false)} style={{background:'none', border:'none', fontSize:'1.5rem', cursor:'pointer'}}>&times;</button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            {/* INFO DASAR */}
                            <div className="form-group">
                                <label className="form-label">Nama Resep *</label>
                                <input className="form-input" required placeholder="Nasi Goreng Spesial" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                            </div>

                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Kategori</label>
                                    <select className="form-input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                                        <option>Masakan Utama</option>
                                        <option>Makanan Pembuka</option>
                                        <option>Makanan Penutup</option>
                                        <option>Minuman</option>
                                        <option>Camilan</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Waktu Memasak</label>
                                    <input className="form-input" placeholder="Contoh: 30 menit" value={form.cookingTime} onChange={e => setForm({...form, cookingTime: e.target.value})} />
                                </div>
                            </div>
                            <div className="grid-2">
                                <div className="form-group">
                                    <label className="form-label">Jumlah Porsi</label>
                                    <input className="form-input" placeholder="Contoh: 2 porsi" value={form.servings} onChange={e => setForm({...form, servings: e.target.value})} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">URL Gambar</label>
                                    <input className="form-input" placeholder="https://..." value={form.image} onChange={e => setForm({...form, image: e.target.value})} />
                                </div>
                            </div>

                            <hr style={{margin:'20px 0', border:'none', borderTop:'1px solid #eee'}} />

                            {/* --- INPUT DINAMIS BAHAN --- */}
                            <div className="form-group">
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                                    <label className="form-label" style={{margin:0}}>Bahan-bahan *</label>
                                    <button type="button" onClick={addIngredient} className="btn-add-item">+ Tambah Bahan</button>
                                </div>
                                {form.ingredients.map((ing, index) => (
                                    <div key={index} style={{display:'flex', gap:'10px', marginBottom:'10px'}}>
                                        <input 
                                            className="form-input" 
                                            placeholder={`Bahan ${index + 1}`}
                                            value={ing} 
                                            onChange={(e) => handleIngredientChange(index, e.target.value)}
                                            required={index === 0} // Hanya baris pertama yang wajib
                                        />
                                        {form.ingredients.length > 1 && (
                                            <button type="button" onClick={() => removeIngredient(index)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'1.2rem'}}>&times;</button>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* --- INPUT DINAMIS LANGKAH (Nomor Oranye) --- */}
                            <div className="form-group" style={{marginTop:'25px'}}>
                                <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px'}}>
                                    <label className="form-label" style={{margin:0}}>Langkah-langkah *</label>
                                    <button type="button" onClick={addInstruction} className="btn-add-item">+ Tambah Langkah</button>
                                </div>
                                {form.instructions.map((inst, index) => (
                                    <div key={index} style={{display:'flex', gap:'15px', marginBottom:'15px', alignItems:'start'}}>
                                        {/* KOTAK NOMOR ORANYE */}
                                        <div className="step-number-box">
                                            {index + 1}
                                        </div>
                                        <div style={{flex:1, display:'flex', gap:'10px'}}>
                                            <input 
                                                className="form-input" 
                                                placeholder={`Langkah ${index + 1}`}
                                                value={inst} 
                                                onChange={(e) => handleInstructionChange(index, e.target.value)}
                                                required={index === 0}
                                            />
                                            {form.instructions.length > 1 && (
                                                <button type="button" onClick={() => removeInstruction(index)} style={{background:'none', border:'none', color:'#ef4444', cursor:'pointer', fontSize:'1.2rem'}}>&times;</button>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div style={{textAlign:'right', marginTop:'30px', borderTop:'1px solid #eee', paddingTop:'20px'}}>
                                <button type="button" onClick={() => setIsModalOpen(false)} style={{marginRight:'10px', padding:'10px 20px', background:'white', border:'1px solid #ccc', borderRadius:'8px', cursor:'pointer'}}>Batal</button>
                                <button type="submit" className="btn-add">
                                    {isEditMode ? 'Simpan Perubahan' : 'Simpan Resep'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* MODAL DETAIL */}
            {selectedRecipe && (
                <div className="modal-overlay" onClick={() => setSelectedRecipe(null)}>
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <div style={{display:'flex', justifyContent:'space-between', alignItems:'start', marginBottom:'20px'}}>
                            <h2 style={{margin:0, fontSize:'1.5rem'}}>{selectedRecipe.title}</h2>
                            <button onClick={() => setSelectedRecipe(null)} style={{background:'none', border:'none', fontSize:'2rem', cursor:'pointer', lineHeight:1}}>&times;</button>
                        </div>
                        {selectedRecipe.image && (
                            <img src={selectedRecipe.image} style={{width:'100%', height:'250px', objectFit:'cover', borderRadius:'12px', marginBottom:'20px'}} onError={(e) => e.target.style.display = 'none'} />
                        )}
                        <div style={{display:'flex', gap:'15px', marginBottom:'25px', paddingBottom:'15px', borderBottom:'1px solid #eee'}}>
                            <span style={{background:'#fff7ed', color:'#c2410c', padding:'6px 12px', borderRadius:'20px', fontSize:'0.85rem', fontWeight:'bold'}}>{selectedRecipe.category || 'Umum'}</span>
                            <span style={{color:'#666', display:'flex', alignItems:'center'}}>⏱️ {selectedRecipe.cookingTime || '-'}</span>
                            <span style={{color:'#666', display:'flex', alignItems:'center'}}>👤 {selectedRecipe.servings || '-'}</span>
                            <span style={{color:'#666', fontStyle:'italic', marginLeft:'auto'}}>Oleh: {selectedRecipe.user?.name}</span>
                        </div>
                        <div style={{marginBottom:'20px'}}>
                            <h4 style={{marginBottom:'10px', color:'#f97316'}}>🛒 Bahan-bahan:</h4>
                            <div style={{color:'#374151', background:'#f9fafb', padding:'15px', borderRadius:'8px'}}>{renderList(selectedRecipe.ingredients, 'ul')}</div>
                        </div>
                        <div>
                            <h4 style={{marginBottom:'10px', color:'#f97316'}}>🍳 Cara Memasak:</h4>
                            <div style={{color:'#374151'}}>{renderList(selectedRecipe.instructions, 'ol')}</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;