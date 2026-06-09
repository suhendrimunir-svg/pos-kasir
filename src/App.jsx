import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Users, LogOut, Plus, Printer, Trash2, LayoutDashboard, Store, QrCode, CreditCard, ChevronRight, CheckCircle2, Lock, XCircle, AlertTriangle, Briefcase, CalendarClock, Wallet, Clock, UserPlus, FileText, UserCheck, ShieldCheck } from 'lucide-react';

// --- DATA INITIAL ---
const initialProducts = [{ id: '1', name: 'Kopi Susu Gula Aren', price: 18000, stock: 50 }];
const initialEmployees = [{ id: 'e1', name: 'Joko (Sales)', role: 'sales', baseSalary: 1500000 }];

// --- MOCK DATABASE (Simulasi data yang tersimpan di sistem) ---
// Dalam aplikasi nyata, ini akan tersambung ke Supabase/Database.
const db = {
  registeredStores: [], // Daftar toko yang menunggu aktivasi
  activeStores: []      // Daftar toko yang sudah aktif
};

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [appUser, setAppUser] = useState(null);
  const [stores, setStores] = useState([]); // Database toko untuk Admin
  
  // App States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState(initialProducts);
  const [employees, setEmployees] = useState(initialEmployees);
  const [attendance, setAttendance] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [cart, setCart] = useState([]);
  const [shiftStatus, setShiftStatus] = useState('closed');

  const showMessage = (msg, type) => alert(msg); // Simplified for stability

  // --- LOGIC AUTH ---
  const handleAuth = (type, data) => {
    if (type === 'login') {
      if (data.username === 'superadmin' && data.password === '123') {
        setAppUser({ role: 'superadmin', name: 'Administrator' });
        setCurrentView('admin_panel');
      } else if (data.username === 'admin' && data.password === '123') {
        setAppUser({ role: 'owner', storeName: 'Toko Saya', status: 'pro' });
        setCurrentView('app');
      } else {
        showMessage('Login Gagal', 'error');
      }
    } else if (type === 'register') {
      // Daftarkan toko ke antrian admin
      const newStore = { id: Date.now(), name: data.storeName, status: 'pending', username: data.username };
      setStores([...stores, newStore]);
      setAppUser({ role: 'owner', storeName: data.storeName, status: 'pending' });
      setCurrentView('payment');
    }
  };

  // --- RENDER VIEW ---
  if (currentView === 'landing') return <LandingPage onNavigate={setCurrentView} />;
  if (currentView === 'auth') return <AuthScreen onAuth={handleAuth} />;
  
  // ADMIN PANEL
  if (currentView === 'admin_panel') {
    return (
      <div className="p-10 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Admin Panel Aktivasi Toko</h1>
        <div className="bg-white shadow rounded-xl p-6 border">
          {stores.filter(s => s.status === 'pending').map(store => (
            <div key={store.id} className="flex justify-between items-center p-4 border-b">
              <div><h3 className="font-bold">{store.name}</h3><p className="text-sm text-gray-500">Menunggu Verifikasi Bukti WA</p></div>
              <button onClick={() => { setStores(stores.map(s => s.id === store.id ? {...s, status: 'active'} : s)); showMessage('Toko Aktif!'); }} className="bg-green-600 text-white px-4 py-2 rounded">Aktifkan Toko</button>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // PAYMENT VIEW
  if (currentView === 'payment') {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4">Instruksi Pembayaran</h2>
        <div className="bg-white p-8 rounded-xl shadow border max-w-lg w-full">
          <p className="mb-4">Silakan transfer ke:</p>
          <div className="bg-blue-50 p-4 rounded mb-4 font-mono font-bold">SeaBank: 9010 6464 0699 (Richky Irawan)</div>
          <div className="bg-yellow-50 p-4 rounded mb-4 font-mono font-bold">QRIS: 0852 7496 4111</div>
          <p className="text-sm mb-6">Setelah transfer, kirim bukti ke WA: <b>0853 6377 0228</b></p>
          <button onClick={() => setCurrentView('landing')} className="w-full bg-slate-800 text-white py-3 rounded">Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  // MAIN APP
  return (
    <div className="flex h-screen bg-gray-100">
      <aside className="w-64 bg-slate-900 text-white p-6">
        <h2 className="font-bold text-xl mb-8 text-blue-400">Lentera POS</h2>
        <nav className="space-y-4">
          <button onClick={() => setActiveTab('dashboard')} className="flex items-center gap-2"><LayoutDashboard size={18}/> Dashboard</button>
          <button onClick={() => setActiveTab('pos')} className="flex items-center gap-2"><ShoppingCart size={18}/> Kasir</button>
          <button onClick={() => setActiveTab('employees')} className="flex items-center gap-2"><Briefcase size={18}/> Karyawan</button>
          <button onClick={() => {setCurrentView('landing'); setAppUser(null);}} className="text-red-400 mt-10"><LogOut size={18}/> Keluar</button>
        </nav>
      </aside>
      <main className="flex-1 p-8 overflow-y-auto">
        {activeTab === 'dashboard' && <h1 className="text-2xl font-bold">Dashboard Toko {appUser?.storeName}</h1>}
        {activeTab === 'pos' && <POSScreen products={products} employees={employees} setCommissions={setCommissions} />}
        {activeTab === 'employees' && <EmployeeScreen employees={employees} setEmployees={setEmployees} />}
      </main>
    </div>
  );
}

// --- SUB-COMPONENTS ---
function LandingPage({ onNavigate }) {
  return (
    <div className="text-center p-20">
      <h1 className="text-5xl font-bold mb-6">Lentera Siak POS</h1>
      <p className="mb-8 text-xl">Sistem Kasir, Inventaris, dan HRIS Terpadu.</p>
      <div className="space-x-4">
        <button onClick={() => onNavigate('auth')} className="bg-blue-600 text-white px-8 py-3 rounded-full font-bold">Daftar Toko Gratis</button>
        <button className="border border-blue-600 px-8 py-3 rounded-full font-bold">Lihat Tutorial</button>
      </div>
      <div className="mt-20 grid grid-cols-3 gap-8">
        <div className="p-6 bg-white shadow rounded-xl">Harga Paket 1 Bulan: Rp 129.000</div>
        <div className="p-6 bg-white shadow rounded-xl">Harga Paket 6 Bulan: Rp 774.000</div>
        <div className="p-6 bg-white shadow rounded-xl">Harga Paket 1 Tahun: Rp 1.299.000 (Bonus 30 Hari)</div>
      </div>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', storeName: '' });
  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow">
      <h2 className="text-2xl font-bold mb-6">{isLogin ? 'Masuk' : 'Daftar'}</h2>
      <input className="w-full border p-2 mb-4" placeholder="Username" onChange={e => setForm({...form, username: e.target.value})} />
      <input className="w-full border p-2 mb-4" type="password" placeholder="Password" onChange={e => setForm({...form, password: e.target.value})} />
      {!isLogin && <input className="w-full border p-2 mb-4" placeholder="Nama Toko" onChange={e => setForm({...form, storeName: e.target.value})} />}
      <button onClick={() => onAuth(isLogin ? 'login' : 'register', form)} className="w-full bg-blue-600 text-white py-2 rounded">{isLogin ? 'Masuk' : 'Daftar Sekarang'}</button>
      <button onClick={() => setIsLogin(!isLogin)} className="mt-4 text-sm text-blue-600 underline">Klik untuk {isLogin ? 'Daftar' : 'Masuk'}</button>
    </div>
  );
}

function POSScreen({ products, employees, setCommissions }) {
  const [cart, setCart] = useState([]);
  const [salesId, setSalesId] = useState('');
  return (
    <div className="grid grid-cols-2 gap-8">
       <div>
         <h2 className="font-bold mb-4">Produk</h2>
         {products.map(p => <button key={p.id} onClick={() => setCart([...cart, p])} className="p-4 bg-white shadow border rounded-lg mr-2">{p.name}</button>)}
       </div>
       <div className="bg-white p-6 shadow rounded-lg">
         <select className="w-full border p-2 mb-4" onChange={e => setSalesId(e.target.value)}>
           <option value="">Pilih Sales (Untuk Komisi)</option>
           {employees.filter(e => e.role === 'sales').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
         </select>
         <button onClick={() => alert('Transaksi Berhasil!')} className="w-full bg-green-600 text-white py-3 rounded">Bayar</button>
       </div>
    </div>
  );
}

function EmployeeScreen({ employees, setEmployees }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
       <h2 className="font-bold text-xl mb-4">Data Karyawan</h2>
       {employees.map(e => <div key={e.id} className="border-b py-2">{e.name} - {e.role}</div>)}
    </div>
  );
}
