import React, { useState, useEffect } from 'react';
import { Camera, Clock, Users, MapPin, LogOut, Sparkles, X, Heart, GraduationCap, Zap, UserPlus, LogIn, Calendar, CheckCircle2, Search, Bell, Menu, ChevronRight } from 'lucide-react';
import axios from 'axios';

// --- DATA LAYANAN LENGKAP & REALISTIS ---
const SERVICE_CATEGORIES = [
  {
    id: 'selfphoto',
    title: 'SELF PHOTO STUDIO',
    desc: 'Bebaskan ekspresimu tanpa fotografer. Gunakan remot shutter.',
    color: 'bg-yellow-400',
    icon: <Zap />,
    variants: [
      { name: 'Wide Box (Grey)', price: 85000, img: 'https://images.unsplash.com/photo-1628155930542-3c7a64e2c833?auto=format&fit=crop&w=400&q=80' },
      { name: 'Circle Box (Color)', price: 95000, img: 'https://images.unsplash.com/photo-1554048612-b6a482bc67e5?auto=format&fit=crop&w=400&q=80' }, 
      { name: 'Holo Background', price: 110000, img: 'https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?auto=format&fit=crop&w=400&q=80' }
    ]
  },
  {
    id: 'studio',
    title: 'PRO STUDIO',
    desc: 'Ditangani fotografer profesional dengan lighting studio.',
    color: 'bg-indigo-400',
    icon: <Camera />,
    variants: [
      { name: 'Personal Portrait', price: 250000, img: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80' },
      { name: 'Family Group', price: 450000, img: 'https://images.unsplash.com/photo-1609220136736-443140cffec6?auto=format&fit=crop&w=400&q=80' },
      { name: 'Maternity', price: 550000, img: 'https://images.unsplash.com/photo-1555252333-9f8e92e65df9?auto=format&fit=crop&w=400&q=80' }
    ]
  },
  {
    id: 'graduation',
    title: 'GRADUATION',
    desc: 'Abadikan momen kelulusanmu dengan elegan.',
    color: 'bg-emerald-400',
    icon: <GraduationCap />,
    variants: [
      { name: 'Wisuda Solo', price: 350000, img: 'https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=400&q=80' }, 
      { name: 'Wisuda w/ Family', price: 600000, img: 'https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=400&q=80' }
    ]
  },
  {
    id: 'wedding',
    title: 'WEDDING & PREWED',
    desc: 'Momen sekali seumur hidup yang tak terlupakan.',
    color: 'bg-rose-400',
    icon: <Heart />,
    variants: [
      { name: 'Prewed Outdoor', price: 1500000, img: 'https://images.unsplash.com/photo-1515934751635-c81c6bc9a2d8?auto=format&fit=crop&w=400&q=80' },
      { name: 'Prewed Indoor', price: 2000000, img: 'https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=400&q=80' },
      { name: 'Engagement', price: 3500000, img: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=400&q=80' }
    ]
  },
  {
    id: 'photoid',
    title: 'PHOTO ID / VISA',
    desc: 'Foto formal untuk dokumen resmi (KTP, Visa, Nikah).',
    color: 'bg-slate-300',
    icon: <UserPlus />,
    variants: [
      { name: 'Pas Foto WNI', price: 50000, img: 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=400&q=80' },
      { name: 'Visa International', price: 75000, img: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80' }
    ]
  }
];

function App() {
  const [view, setView] = useState('landing');
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [bookings, setBookings] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null); 
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  const [form, setForm] = useState({ 
    packageType: '', 
    location: 'Studio Pusat - Jakarta', 
    duration: '15 Menit', 
    peopleCount: 2, 
    bookingDate: '' 
  });

  const fetchBookings = async () => {
    try {
      const res = await axios.get('http://localhost:3000/api/bookings', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setBookings(res.data);
    } catch (err) { console.error("Error fetching data"); }
  };

  useEffect(() => { if (isLoggedIn) fetchBookings(); }, [isLoggedIn]);

  const handleSearchKeyPress = (e) => {
    if (e.key === 'Enter') {
      const foundCategory = SERVICE_CATEGORIES.find(cat => 
        cat.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        cat.variants.some(v => v.name.toLowerCase().includes(searchTerm.toLowerCase()))
      );
      
      if (foundCategory) {
        const element = document.getElementById(foundCategory.id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  };

  const handleSelectVariant = (categoryTitle, variant) => {
    if (!isLoggedIn) {
      alert("Eits! Login dulu ya untuk booking VibeGraph.");
      setView('login');
      window.scrollTo(0, 0);
    } else {
      setSelectedCategory(categoryTitle);
      setSelectedVariant(variant);
      setForm({ ...form, packageType: `${categoryTitle} - ${variant.name}` });
      setShowModal(true);
    }
  };

  const logout = () => { localStorage.clear(); setIsLoggedIn(false); setView('landing'); };

  if (view === 'login') return <AuthPage type="login" onAuth={() => { setIsLoggedIn(true); setView('landing'); }} setView={setView} />;
  if (view === 'register') return <AuthPage type="register" onAuth={() => setView('login')} setView={setView} />;

  return (
    <div className="min-h-screen bg-[#FDFCF0] text-black font-sans selection:bg-black selection:text-white">
      
      {/* HEADER BAR */}
      <header className="p-4 border-b-4 border-black sticky top-0 bg-black text-white z-40 flex flex-col md:flex-row gap-4 justify-between items-center px-4 md:px-8 shadow-[0px_4px_0px_0px_rgba(79,70,229,1)]">
        <div className="flex items-center gap-6 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2 cursor-pointer group" onClick={() => setView('landing')}>
            <div className="bg-indigo-600 p-1.5 rounded-lg text-white group-hover:rotate-12 transition-transform">
              <Zap size={20} fill="white"/>
            </div>
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter italic uppercase text-white">VIBEGRAPH.</h1>
          </div>
          <div className="hidden md:flex items-center gap-1 text-[10px] font-black border-2 border-white px-3 py-1 rounded-full bg-transparent text-white cursor-pointer hover:bg-white hover:text-black transition-all">
            <MapPin size={12}/> SUMEDANG, ID
          </div>
        </div>

        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-4 top-3 text-slate-400" size={18}/>
          <input 
            type="text" 
            placeholder="Cari & tekan Enter..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyDown={handleSearchKeyPress}
            className="w-full pl-12 pr-4 py-2.5 border-2 border-white/20 rounded-xl font-bold text-sm bg-white/10 text-white focus:bg-white/20 focus:outline-none focus:border-indigo-400 transition-all placeholder:text-slate-500" 
          />
        </div>

        <nav className="flex items-center gap-4 font-black uppercase text-xs md:text-sm w-full md:w-auto justify-end">
           {isLoggedIn ? (
             <div className="flex items-center gap-4">
               <button onClick={() => setView('dashboard')} className="flex items-center gap-2 text-white hover:text-yellow-400 transition-colors">
                 <div className="relative">
                    <Bell size={20}/>
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-indigo-500 rounded-full border-2 border-black"></span>
                 </div>
                 <span className="hidden lg:inline">PESANAN</span>
               </button>
               <div className="h-6 w-0.5 bg-white/20 hidden md:block"></div>
               <button onClick={logout} className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-xl border-2 border-black shadow-[4px_4px_0px_0px_rgba(255,255,255,0.2)] hover:shadow-none transition-all text-[10px]">
                  <LogOut size={18} />
                  <span>KELUAR</span>
               </button>
             </div>
           ) : (
            <div className="flex gap-2 w-full md:w-auto">
              <button onClick={() => setView('login')} className="flex-1 md:flex-none py-2 px-5 border-2 border-white rounded-xl hover:bg-white hover:text-black transition-all font-black">MASUK</button>
              <button onClick={() => setView('register')} className="flex-1 md:flex-none py-2 px-5 bg-indigo-600 text-white rounded-xl border-2 border-white hover:bg-yellow-400 hover:text-black transition-all font-black">DAFTAR</button>
            </div>
           )}
        </nav>
      </header>

      <div className="pb-20">
        {view === 'dashboard' ? (
          <Dashboard bookings={bookings} onBack={() => setView('landing')} />
        ) : (
          <LandingPage onVariantSelect={handleSelectVariant} searchTerm={searchTerm} />
        )}
      </div>

      <Footer />

      {/* MODAL BOOKING */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white border-[6px] border-black w-full max-w-lg rounded-[40px] p-10 shadow-[20px_20px_0px_0px_rgba(0,0,0,1)] relative text-black">
            <button onClick={() => setShowModal(false)} className="absolute right-6 top-6 p-2 border-4 border-black rounded-full hover:bg-red-400"><X size={20} /></button>
            
            <h2 className="text-3xl font-black italic uppercase mb-6">Konfirmasi Booking</h2>
            
            <form onSubmit={async (e) => {
              e.preventDefault();
              try {
                await axios.post('http://localhost:3000/api/bookings', form, {
                  headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
                });
                alert("Booking Berhasil!");
                setShowModal(false); setView('dashboard'); fetchBookings();
              } catch(err) { 
              // --- PENANGANAN ERROR VALIDASI BOOKING ---
                const errorData = err.response?.data;
                if (errorData?.errors) {
                  const messages = errorData.errors.map(item => item.msg).join("\n");
                  alert("Data tidak valid:\n" + messages);
                } else {
                  alert(errorData?.message || "Gagal membuat booking.");
                }
              }
            }} className="space-y-4">
              
              {/* Info Paket */}
              <div className="bg-slate-50 p-4 border-2 border-black rounded-2xl flex gap-4 items-center">
                <img src={selectedVariant?.img} className="w-16 h-16 rounded-lg object-cover border-2 border-black" alt="Preview"/>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase">Paket Terpilih</p>
                  <p className="text-sm font-black uppercase leading-tight">{form.packageType}</p>
                </div>
              </div>

              {/* PILIHAN LOKASI (BARU) */}
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Pilih Cabang Studio</label>
                <select 
                  className="w-full p-3 border-4 border-black rounded-xl font-bold bg-white"
                  value={form.location}
                  onChange={e => setForm({...form, location: e.target.value})}
                >
                  <option value="Studio Pusat - Jakarta">Studio Pusat - Jakarta</option>
                  <option value="Vibegraph - Bandung">Vibegraph - Bandung</option>
                  <option value="Vibegraph - Sumedang">Vibegraph - Sumedang</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Jumlah Orang */}
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Jumlah Orang</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={form.peopleCount} 
                    className="w-full p-3 border-4 border-black rounded-xl font-bold" 
                    onChange={e => setForm({...form, peopleCount: parseInt(e.target.value)})} 
                    required 
                  />
                </div>

                {/* Durasi */}
                <div>
                  <label className="block text-[10px] font-black uppercase mb-1">Durasi</label>
                  <select 
                    className="w-full p-3 border-4 border-black rounded-xl font-bold bg-white" 
                    value={form.duration} 
                    onChange={e => setForm({...form, duration: e.target.value})}
                  >
                    <option value="15 Menit">15 Menit</option>
                    <option value="30 Menit">30 Menit</option>
                    <option value="1 Jam">1 Jam</option>
                    <option value="2 Jam">2 Jam</option>
                  </select>
                </div>
              </div>

              {/* Tanggal */}
              <div>
                <label className="block text-[10px] font-black uppercase mb-1">Tanggal Booking</label>
                <input 
                  type="date" 
                  className="w-full p-3 border-4 border-black rounded-xl font-bold" 
                  onChange={e => setForm({...form, bookingDate: e.target.value})} 
                  required 
                />
              </div>

              <button type="submit" className="w-full bg-black text-white py-4 rounded-xl font-black text-xl border-4 border-black shadow-[6px_6px_0px_0px_rgba(79,70,229,1)] hover:shadow-none transition-all">
                BOOKING SEKARANG
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function LandingPage({ onVariantSelect, searchTerm }) {
  const filteredServices = SERVICE_CATEGORIES.map(category => ({
    ...category,
    variants: category.variants.filter(v => 
      v.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      category.title.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(cat => cat.variants.length > 0);

  // Fungsi scroll ke layanan
  const scrollToLayanan = () => {
    const element = document.getElementById('layanan-start');
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <main className="max-w-7xl mx-auto p-4 md:p-8">
      <section className="text-center py-16 md:py-24 bg-indigo-600 text-white border-4 border-black rounded-[40px] shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] mb-20 relative overflow-hidden">
        <Sparkles size={100} className="absolute top-10 left-10 text-yellow-400 opacity-20 animate-pulse" />
        <div className="relative z-10 px-4 flex flex-col items-center">
          <div className="inline-block bg-white text-black px-4 py-1 rounded-full font-black text-xs md:text-sm mb-6 border-2 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">✨ #1 CREATIVE STUDIO</div>
          <h2 className="text-5xl md:text-8xl font-black uppercase tracking-tighter leading-none mb-6">CAPTURE YOUR <br /> <span className="text-yellow-400">REAL VIBES.</span></h2>
          <p className="text-lg md:text-xl font-bold text-indigo-100 mb-10 max-w-2xl mx-auto">VibeGraph menghadirkan pengalaman foto studio modern.</p>
          
          {/* TOMBOL LAYANAN KAMI */}
          <button 
            onClick={scrollToLayanan}
            className="bg-black text-white px-8 py-4 border-4 border-white rounded-none font-black text-xl uppercase shadow-[6px_6px_0px_0px_rgba(255,255,255,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 transition-all"
          >
            LIHAT LAYANAN KAMI
          </button>
          
          <p className="mt-8 text-[10px] font-bold opacity-70 uppercase tracking-widest">© 2026 KELOMPOK 5 SI-VA • UAS PEMROGRAMAN BERBASIS WEB BACK END</p>
        </div>
      </section>

      <div id="layanan-start" className="space-y-20">
        {filteredServices.map((category) => (
          <section key={category.id} id={category.id} className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-8 px-2">
              <div className={`p-3 rounded-xl border-2 border-black ${category.color} shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] text-black`}>{category.icon}</div>
              <h3 className="text-3xl md:text-4xl font-black italic uppercase tracking-tighter">{category.title}</h3>
            </div>
            <div className="flex overflow-x-auto pb-8 gap-6 snap-x snap-mandatory px-2">
              {category.variants.map((variant, index) => (
                <div key={index} className="flex-none w-72 snap-center bg-white border-4 border-black rounded-[30px] overflow-hidden shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-2 transition-transform duration-300">
                  <div className="h-64 overflow-hidden border-b-4 border-black relative">
                    <img src={variant.img} alt={variant.name} className="w-full h-full object-cover"/>
                    <div className="absolute top-3 right-3 bg-white/90 px-3 py-1 rounded-full text-xs font-black border-2 border-black text-black">Rp {variant.price / 1000}K</div>
                  </div>
                  <div className="p-6 text-black">
                    <h4 className="text-xl font-black uppercase mb-4 leading-tight">{variant.name}</h4>
                    <button onClick={() => onVariantSelect(category.title, variant)} className="w-full py-3 bg-black text-white font-black rounded-xl hover:bg-indigo-600 transition-colors uppercase text-sm">Booking</button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        ))}
        {filteredServices.length === 0 && (
          <div className="text-center py-20 font-black text-2xl uppercase opacity-20">Layanan tidak ditemukan...</div>
        )}
      </div>
    </main>
  );
}

function AuthPage({ type, onAuth, setView }) {
    const [formData, setFormData] = useState({ name: '', email: '', password: '' });
    const handleSubmit = async (e) => {
  e.preventDefault();
  const endpoint = type === 'login' ? 'http://localhost:3000/api/login' : 'http://localhost:3000/api/register';
  
  try {
    const res = await axios.post(endpoint, formData);
    if (type === 'login') {
      localStorage.setItem('token', res.data.token);
      onAuth();
    } else { 
      alert('Daftar Berhasil! Silakan login.'); 
      setView('login'); 
    }
      } catch (err) {
        console.error("Full Error:", err); // Cek di F12 Console untuk melihat struktur asli

        // Cek apakah ada response dari server
        if (err.response) {
          const data = err.response.data;

          // 1. Jika error datang dari express-validator (array errors)
          if (data.errors && Array.isArray(data.errors)) {
            const messages = data.errors.map(item => item.msg).join("\n");
            return alert("Validasi Gagal:\n" + messages);
          }

          // 2. Jika error berupa message biasa (misal: "Email sudah digunakan")
          if (data.message) {
            return alert("Gagal: " + data.message);
          }
        }
        
        // 3. Jika tidak ada koneksi ke server atau error lainnya
        alert("Koneksi gagal atau server mati. Pastikan backend jalan!");
      }
    };
    return (
      <div className="min-h-screen bg-[#FDFCF0] flex items-center justify-center p-6 border-[12px] border-indigo-600">
        <div className="max-w-sm w-full bg-white border-4 border-black p-10 rounded-[40px] shadow-[15px_15px_0px_0px_rgba(0,0,0,1)] text-black">
          <h1 className="text-4xl font-black italic mb-6 text-center uppercase">{type}</h1>
          <form onSubmit={handleSubmit} className="space-y-4">
            {type === 'register' && <input placeholder="NAMA" className="w-full p-3 border-4 border-black rounded-xl font-bold" onChange={e=>setFormData({...formData, name:e.target.value})} required/>}
            <input type="email" placeholder="EMAIL" className="w-full p-3 border-4 border-black rounded-xl font-bold" onChange={e=>setFormData({...formData, email:e.target.value})} required/>
            <input type="password" placeholder="PASSWORD" className="w-full p-3 border-4 border-black rounded-xl font-bold" onChange={e=>setFormData({...formData, password:e.target.value})} required/>
            <button className="w-full bg-black text-white py-4 rounded-xl font-black text-xl shadow-[5px_5px_0px_0px_rgba(79,70,229,1)] uppercase">{type}</button>
          </form>
          <p onClick={() => setView(type==='login'?'register':'login')} className="text-center mt-4 font-bold cursor-pointer underline">Ganti Mode</p>
        </div>
      </div>
    );
}

function Dashboard({ bookings, onBack }) {
    return (
      <main className="max-w-4xl mx-auto p-8 text-black">
        <button onClick={onBack} className="mb-8 font-black underline flex items-center gap-2"><ChevronRight className="rotate-180"/> KEMBALI</button>
        <h2 className="text-4xl font-black italic uppercase mb-8">PESANAN SAYA</h2>
        <div className="space-y-4">
          {bookings.map((b, i) => (
            <div key={i} className="bg-white border-4 border-black p-6 rounded-3xl flex justify-between items-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
               <div>
                  <h4 className="text-xl font-black uppercase">{b.packageType}</h4>
                  <p className="text-xs font-bold text-slate-500">{new Date(b.bookingDate).toLocaleDateString()} • {b.location}</p>
               </div>
               <span className="bg-green-400 border-2 border-black px-3 py-1 rounded-full font-black text-[10px]">CONFIRMED</span>
            </div>
          ))}
        </div>
      </main>
    );
}

function Footer() {
  return (
    <footer className="p-12 border-t-4 border-black bg-black text-white text-center mt-20">
      <div className="flex flex-col items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="bg-indigo-600 p-1 rounded-lg">
            <Zap size={20} fill="white"/>
          </div>
          <h2 className="text-3xl font-black italic tracking-tighter uppercase text-white">VIBEGRAPH.</h2>
        </div>
        
        <div className="max-w-md text-slate-400 font-bold text-xs uppercase tracking-widest leading-relaxed">
          Penyedia layanan visual terbaik untuk setiap momen berharga Anda. 
          Dari Self-Photo hingga Wedding Pro.
        </div>
        
        <div className="w-20 h-1 bg-indigo-600 my-4 rounded-full"></div>
        
        <p className="text-slate-500 font-black uppercase text-[10px]">
          © 2026 KELOMPOK 5 SI-VA • UAS Pemrograman Berbasis Web Back End
        </p>
      </div>
    </footer>
  );
}

export default App;