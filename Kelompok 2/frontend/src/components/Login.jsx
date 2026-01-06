import { useState } from 'react';
import axios from 'axios';

const Login = ({ onLogin }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [isRegister, setIsRegister] = useState(false);

    const handleAuth = async (e) => {
        e.preventDefault();
        try {
            const endpoint = isRegister 
                ? 'https://uas-buku-resep-production.up.railway.app/api/auth/register' 
                : 'https://uas-buku-resep-production.up.railway.app/api/auth/login';
            
            const payload = isRegister ? { name, email, password } : { email, password };
            const res = await axios.post(endpoint, payload);

            if (isRegister) {
                alert("Registrasi Berhasil! Silakan Login.");
                setIsRegister(false);
            } else {
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('user', JSON.stringify(res.data.user));
                onLogin();
            }
        } catch (err) { alert("Gagal! Cek email/password."); }
    };

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="text-center">
                    <h1 style={{fontSize:'2rem', margin:'0 0 10px', color:'#f97316'}}>
                        {isRegister ? 'Daftar Akun' : 'Selamat Datang'}
                    </h1>
                    <p style={{color:'#666', marginBottom:'30px'}}>Aplikasi Buku Resep Digital</p>
                </div>

                {/* Tambahkan autoComplete="off" di sini untuk mematikan saran browser */}
                <form onSubmit={handleAuth} autoComplete="off">
                    
                    {isRegister && (
                        <div className="form-group">
                            <label className="form-label">Nama Lengkap</label>
                            <input 
                                className="form-input" 
                                type="text" 
                                placeholder="Masukan Nama Anda" 
                                value={name} 
                                onChange={e => setName(e.target.value)} 
                                required 
                                autoComplete="off" // Matikan auto-fill nama
                            />
                        </div>
                    )}

                    <div className="form-group">
                        <label className="form-label">Email</label>
                        <input 
                            className="form-input" 
                            type="email" 
                            placeholder="Masukan Email Anda" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                            autoComplete="off" // Matikan auto-fill email
                            name="email_off"   // Trik tambahan agar browser bingung dan tidak auto-fill
                        />
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input 
                            className="form-input" 
                            type="password" 
                            placeholder="••••••••" 
                            value={password} 
                            onChange={e => setPassword(e.target.value)} 
                            required 
                            autoComplete="new-password" // Trik ampuh: browser mengira ini password baru, jadi tidak diisi otomatis
                        />
                    </div>

                    <button type="submit" className="btn-full">
                        {isRegister ? 'Daftar Sekarang' : 'Masuk Aplikasi'}
                    </button>
                </form>

                <p className="text-center" style={{marginTop:'20px', fontSize:'0.9rem'}}>
                    {isRegister ? 'Sudah punya akun?' : 'Belum punya akun?'}
                    <button onClick={() => setIsRegister(!isRegister)} style={{background:'none', border:'none', color:'#f97316', fontWeight:'bold', cursor:'pointer', marginLeft:'5px'}}>
                        {isRegister ? 'Login' : 'Daftar'}
                    </button>
                </p>
            </div>
        </div>
    );
};
export default Login;