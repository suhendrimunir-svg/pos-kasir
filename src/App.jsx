import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Users, LogOut, Plus, Printer, Trash2, LayoutDashboard, Store, CreditCard, ChevronRight, CheckCircle2, Lock, XCircle, AlertTriangle, Briefcase, CalendarClock, Wallet, Clock, UserPlus, FileText, Info, Award, PlayCircle } from 'lucide-react';

// --- DATA AWAL (DUMMY) ---
const initialProducts = [
  { id: '1', name: 'Kopi Susu Gula Aren', price: 18000, stock: 50 },
  { id: '2', name: 'Roti Bakar Coklat', price: 15000, stock: 20 },
];
const initialEmployees = [
  { id: 'e1', name: 'Siti (Kasir)', role: 'cashier', baseSalary: 3000000 },
  { id: 'e3', name: 'Rina (Sales)', role: 'sales', baseSalary: 1500000 },
];

export default function App() {
  // Navigation & Auth
  const [currentView, setCurrentView] = useState('landing'); 
  const [appUser, setAppUser] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard');
  
  // App Core States
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState([]);
  const [cart, setCart] = useState([]);
  const [employees, setEmployees] = useState(initialEmployees);
  const [attendance, setAttendance] = useState([]);
  const [commissions, setCommissions] = useState([]);
  const [shiftStatus, setShiftStatus] = useState('closed');
  const [totalSales, setTotalSales] = useState(0);

  const showMessage = (text, type = 'error') => {
    alert(text); // Menggunakan sistem alert untuk kesederhanaan di demo ini
  };

  const handleAuth = (type, data) => {
    // Simulasi Login
    if (type === 'login') {
      setAppUser({ name: 'Pemilik Toko', role: 'owner', storeName: 'Toko Lentera Siak', status: 'pro', expiryDate: new Date(Date.now() + 86400000*30).toISOString() });
      setCurrentView('app');
    } else {
      setCurrentView('pricing');
    }
  };

  // --- RENDER VIEW ---
  if (currentView === 'landing') return <LandingPage onNavigate={setCurrentView} />;
  if (currentView === 'pricing') return <PricingPage onSelect={() => setCurrentView('payment')} />;
  if (currentView === 'payment') return <PaymentPage onConfirm={() => { setAppUser({name: 'User Baru', status: 'pro', storeName: 'Toko Baru'}); setCurrentView('app'); }} />;
  if (currentView === 'auth') return <AuthPage onAuth={handleAuth} />;

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* Sidebar Nav (Disederhanakan untuk contoh) */}
      <div className="w-64 bg-slate-900 text-white p-4">
        <h2 className="font-bold text-xl mb-6">Lentera POS</h2>
        <nav className="space-y-2">
          <button onClick={() => setActiveTab('dashboard')} className="w-full text-left p-2 hover:bg-slate-800 rounded">Dashboard</button>
          <button onClick={() => setActiveTab('pos')} className="w-full text-left p-2 hover:bg-slate-800 rounded">Mesin Kasir</button>
          <button onClick={() => setActiveTab('payroll')} className="w-full text-left p-2 hover:bg-slate-800 rounded">HR & Payroll</button>
          <button onClick={() => {setCurrentView('landing'); setAppUser(null);}} className="w-full text-left p-2 text-red-400 hover:bg-slate-800 rounded">Logout</button>
        </nav>
      </div>
      <div className="flex-1 p-8">
        {activeTab === 'dashboard' && <DashboardScreen sales={totalSales} />}
        {activeTab === 'pos' && <POSScreen products={products} cart={cart} setCart={setCart} />}
        {activeTab === 'payroll' && <PayrollScreen employees={employees} commissions={commissions} />}
      </div>
    </div>
  );
}

// --- KOMPONEN LANDING PAGE ---
function LandingPage({ onNavigate }) {
  return (
    <div className="bg-white">
      <nav className="flex justify-between items-center p-6 border-b">
        <div className="font-bold text-2xl text-blue-600">Lentera Siak</div>
        <div className="space-x-4">
          <button onClick={() => onNavigate('auth')} className="text-gray-600">Masuk</button>
          <button onClick={() => onNavigate('auth')} className="bg-blue-600 text-white px-6 py-2 rounded-full">Daftar Gratis</button>
        </div>
      </nav>
      <header className="py-20 text-center px-4">
        <h1 className="text-5xl font-extrabold mb-6">Kelola Toko Jadi Mudah & Profesional</h1>
        <p className="text-gray-600 text-lg mb-10">POS, HRIS, Payroll, dan Dashboard dalam satu genggaman.</p>
        <button onClick={() => onNavigate('pricing')} className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg">Lihat Paket & Harga</button>
      </header>
      
      {/* Fitur Tutorial & Affiliate */}
      <section className="py-20 px-10 bg-slate-50">
        <h2 className="text-3xl font-bold text-center mb-12">Kenapa Memilih Kami?</h2>
        <div className="grid md:grid-cols-3 gap-8">
          <div className="p-6 bg-white rounded-xl border">
            <PlayCircle className="mb-4 text-blue-600" />
            <h3 className="font-bold text-xl mb-2">Tutorial Mudah</h3>
            <p className="text-gray-600">Kami menyediakan panduan video dan dokumen langkah demi langkah.</p>
          </div>
          <div className="p-6 bg-white rounded-xl border">
            <Award className="mb-4 text-blue-600" />
            <h3 className="font-bold text-xl mb-2">Program Afiliasi</h3>
            <p className="text-gray-600">Dapatkan komisi 20% setiap kali Anda mengajak pemilik toko lain bergabung!</p>
          </div>
          <div className="p-6 bg-white rounded-xl border">
            <Info className="mb-4 text-blue-600" />
            <h3 className="font-bold text-xl mb-2">Dukungan 24/7</h3>
            <p className="text-gray-600">Tim bantuan kami siap membantu kendala teknis Anda kapan saja.</p>
          </div>
        </div>
      </section>
    </div>
  );
}

// --- KOMPONEN PRICING ---
function PricingPage({ onSelect }) {
  return (
    <div className="py-20 px-4 bg-slate-50 min-h-screen">
      <h1 className="text-4xl font-bold text-center mb-12">Pilih Paket Langganan</h1>
      <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
        <div className="bg-white p-8 rounded-2xl shadow border">
          <h3 className="text-xl font-bold">1 Bulan</h3>
          <p className="text-3xl font-bold my-4">Rp 129.000</p>
          <button onClick={onSelect} className="w-full bg-blue-600 text-white py-2 rounded">Pilih Paket</button>
        </div>
        <div className="bg-white p-8 rounded-2xl shadow border">
          <h3 className="text-xl font-bold">6 Bulan</h3>
          <p className="text-3xl font-bold my-4">Rp 774.000</p>
          <button onClick={onSelect} className="w-full bg-blue-600 text-white py-2 rounded">Pilih Paket</button>
        </div>
        <div className="bg-blue-800 text-white p-8 rounded-2xl shadow-xl">
          <div className="text-yellow-400 font-bold mb-2">PROMO TAHUNAN</div>
          <h3 className="text-xl font-bold">1 Tahun (+30 Hari Bonus)</h3>
          <p className="text-3xl font-bold my-4"><del className="text-sm">Rp 1.548.000</del> Rp 1.299.000</p>
          <button onClick={onSelect} className="w-full bg-yellow-400 text-black py-2 rounded font-bold">Ambil Promo</button>
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN PAYMENT ---
function PaymentPage({ onConfirm }) {
  return (
    <div className="p-10 max-w-2xl mx-auto bg-white rounded-xl shadow border">
      <h2 className="text-2xl font-bold mb-6">Selesaikan Pembayaran</h2>
      <div className="p-4 bg-slate-100 rounded mb-6">
        <p className="font-bold">Transfer ke:</p>
        <p className="text-xl font-mono">SeaBank: 9010 6464 0699</p>
        <p>a.n Richky Irawan</p>
        <hr className="my-4"/>
        <p className="font-bold">Atau Scan QRIS di bawah:</p>
        <div className="w-40 h-40 bg-gray-300 flex items-center justify-center mt-2 border-2 border-dashed">QRIS CODE</div>
      </div>
      <button onClick={onConfirm} className="w-full bg-green-600 text-white py-3 rounded font-bold">Konfirmasi Pembayaran</button>
    </div>
  );
}

// --- KOMPONEN DASHBOARD (Sederhana) ---
function DashboardScreen({ sales }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6">Dashboard Toko</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-6 bg-white rounded-xl shadow border">
          <p className="text-gray-500">Total Penjualan</p>
          <p className="text-2xl font-bold">Rp {sales.toLocaleString()}</p>
        </div>
        <div className="p-6 bg-white rounded-xl shadow border">
          <p className="text-gray-500">Transaksi</p>
          <p className="text-2xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}

// --- KOMPONEN POS ---
function POSScreen({ products, cart, setCart }) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {products.map(p => (
        <button key={p.id} onClick={() => setCart([...cart, p])} className="p-4 bg-white border rounded shadow">
          {p.name} - Rp {p.price}
        </button>
      ))}
    </div>
  );
}

// --- KOMPONEN PAYROLL ---
function PayrollScreen({ employees }) {
  return (
    <div className="bg-white p-6 rounded shadow border">
      <h2 className="text-xl font-bold mb-4">Data Karyawan & Gaji</h2>
      <table className="w-full">
        <thead><tr className="text-left"><th>Nama</th><th>Role</th><th>Gaji</th></tr></thead>
        <tbody>
          {employees.map(e => (
            <tr key={e.id}><td>{e.name}</td><td>{e.role}</td><td>{e.baseSalary}</td></tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function AuthPage({ onAuth }) {
  return (
    <div className="p-10 max-w-sm mx-auto bg-white rounded shadow mt-20">
      <h2 className="text-xl font-bold mb-4">Login / Register Toko</h2>
      <button onClick={() => onAuth('login')} className="w-full bg-blue-600 text-white p-2 rounded mb-2">Login Demo</button>
      <button onClick={() => onAuth('register')} className="w-full border p-2 rounded">Daftar Toko Baru</button>
    </div>
  );
}
```

### Saran Pengembangan Fitur Masa Depan:
1. **Sistem Notifikasi Telegram/WA:** Kirim laporan penjualan harian otomatis ke HP Owner setiap jam 9 malam.
2. **Printer Thermal Bluetooth:** Menggunakan *Web Bluetooth API* agar aplikasi bisa langsung nge-print ke printer kecil tanpa kabel.
3. **Backup Database:** Fitur *"Ekspor Data ke CSV"* agar pemilik toko bisa menyimpan data mereka sendiri jika ingin berhenti berlangganan.
4. **Analisis Tren Penjualan:** Tambahkan grafik *Chart.js* di Dashboard untuk melihat jam berapa toko paling ramai dikunjungi.

Apakah Anda sudah siap untuk mengunggah kode ini ke GitHub untuk segera dipublikasikan?
