import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Users, LogOut, Plus, Printer, Trash2, LayoutDashboard, Store, QrCode, CreditCard, ChevronRight, CheckCircle2, Lock, XCircle, AlertTriangle } from 'lucide-react';

// --- DATA AWAL (DUMMY) ---
const initialProducts = [
  { id: '1', name: 'Kopi Susu Gula Aren', price: 18000, stock: 50, category: 'Minuman' },
  { id: '2', name: 'Roti Bakar Coklat', price: 15000, stock: 20, category: 'Makanan' },
];

const initialCustomers = [
  { id: '1', name: 'Budi Santoso', phone: '08123456789', points: 150 },
];

const pricingPackages = [
  { id: '1_month', name: 'Paket 1 Bulan', price: 129000, durationDays: 30, originalPrice: null },
  { id: '6_months', name: 'Paket 6 Bulan', price: 774000, durationDays: 180, originalPrice: null },
  { id: '1_year', name: 'Paket 1 Tahun', price: 1299000, durationDays: 395, originalPrice: 1548000 }, // 365 hari + bonus 30 hari = 395 hari
];

export default function App() {
  // Navigation & Auth States
  const [currentView, setCurrentView] = useState('landing'); // landing, auth, pricing, payment, app
  const [appUser, setAppUser] = useState(null); // Data toko/user yang sedang login
  
  // App Core States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);
  const [cart, setCart] = useState([]);
  
  // Shift & Cash Drawer States
  const [shiftStatus, setShiftStatus] = useState('closed'); // 'closed', 'open'
  const [startCash, setStartCash] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

  // Payment/Checkout States
  const [selectedPackage, setSelectedPackage] = useState(null);
  
  // Global Message State
  const [globalMessage, setGlobalMessage] = useState(null);

  const showMessage = (text, type = 'error') => {
    setGlobalMessage({ text, type });
    setTimeout(() => setGlobalMessage(null), 3000);
  };

  const handleAuth = (type, data) => {
    if (type === 'login') {
      if (data.username === 'admin' && data.password === '123') {
        const dummyExpiry = new Date();
        dummyExpiry.setDate(dummyExpiry.getDate() + 14); // Default sisa 14 hari
        setAppUser({ name: 'Pemilik Toko', role: 'owner', storeName: 'Toko Lentera Siak', status: 'trial', expiryDate: dummyExpiry.toISOString() });
        setCurrentView('app');
      } else if (data.username === 'kasir' && data.password === '123') {
        const dummyExpiry = new Date();
        dummyExpiry.setDate(dummyExpiry.getDate() + 14);
        setAppUser({ name: 'Kasir Shift 1', role: 'cashier', storeName: 'Toko Lentera Siak', status: 'trial', expiryDate: dummyExpiry.toISOString() });
        setCurrentView('app');
      } else {
        showMessage('Username atau password salah! (Coba admin/123)', 'error');
      }
    } else if (type === 'register') {
      // Simpan sementara data user, lalu lempar ke layar langganan
      setAppUser({ name: 'Pemilik Baru', role: 'owner', storeName: data.storeName, status: 'pending' });
      setCurrentView('pricing');
    }
  };

  const handleLogout = () => {
    setAppUser(null);
    setShiftStatus('closed');
    setCurrentView('landing');
  };

  const handleSelectTrial = () => {
    const expiryDate = new Date();
    expiryDate.setDate(expiryDate.getDate() + 14); // 14 Hari Masa Percobaan
    setAppUser({ ...appUser, status: 'trial', expiryDate: expiryDate.toISOString() });
    setCurrentView('app');
  };

  const handleBuyPackage = (pkgId) => {
    setSelectedPackage(pkgId);
    setCurrentView('payment');
  };

  const handleConfirmPayment = () => {
    const pkg = pricingPackages.find(p => p.id === selectedPackage);
    const expiryDate = new Date();
    
    // Jika paket baru aktif, tambahkan durasi hari. 
    // Bonus 14 Hari Trial juga diberikan di depan jika baru mendaftar
    let totalDays = pkg.durationDays;
    if (appUser.status === 'pending') {
      totalDays += 14; 
    }
    
    expiryDate.setDate(expiryDate.getDate() + totalDays);
    setAppUser({ ...appUser, status: 'pro', expiryDate: expiryDate.toISOString() });
    setCurrentView('app');
    showMessage(`Pembayaran Berhasil! Paket aktif sampai ${expiryDate.toLocaleDateString()}`, 'success');
  };

  // Pengecekan Masa Aktif
  let isExpired = false;
  let trialDaysLeft = 0;
  
  if (appUser && (appUser.status === 'trial' || appUser.status === 'trial_expired' || appUser.status === 'pro')) {
    const now = new Date();
    const expiry = new Date(appUser.expiryDate);
    if (now > expiry || appUser.status === 'trial_expired') {
      isExpired = true;
    } else {
      const diffTime = Math.abs(expiry - now);
      trialDaysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    }
  }

  // Wrapper View
  if (currentView === 'landing') return <LandingPage onNavigate={setCurrentView} />;
  if (currentView === 'auth') return <AuthScreen onAuth={handleAuth} globalMessage={globalMessage} />;
  if (currentView === 'pricing') return <PricingScreen onSelectTrial={handleSelectTrial} onSelectPackage={handleBuyPackage} />;
  if (currentView === 'payment') return <PaymentScreen pkgId={selectedPackage} onConfirm={handleConfirmPayment} onBack={() => setCurrentView('pricing')} />;

  // Jika sudah masuk APP tapi masa aktif habis
  if (isExpired && appUser.role === 'owner') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full text-center border-t-4 border-red-600">
          <div className="mx-auto w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <Lock className="text-red-600 w-10 h-10" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Masa Aktif Habis</h2>
          <p className="text-gray-600 mb-6">Masa percobaan atau langganan toko Anda telah berakhir. Kasir sementara dinonaktifkan. Silakan perpanjang paket untuk melanjutkan bisnis Anda.</p>
          <button onClick={() => setCurrentView('pricing')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Perpanjang Sekarang
          </button>
        </div>
      </div>
    );
  } else if (isExpired && appUser.role === 'cashier') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
          <AlertTriangle className="text-red-600 w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sistem Terkunci</h2>
          <p className="text-gray-600 mb-6">Masa berlangganan aplikasi habis. Silakan hubungi Pemilik Toko untuk melakukan perpanjangan.</p>
          <button onClick={handleLogout} className="w-full bg-gray-200 text-gray-800 font-bold py-2 rounded hover:bg-gray-300">Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* GLOBAL MESSAGE BOX */}
      {globalMessage && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded shadow-lg text-white font-medium flex items-center gap-2 transition-all ${globalMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {globalMessage.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          {globalMessage.text}
        </div>
      )}

      {/* SIDEBAR NAVIGASI */}
      <div className="w-full md:w-64 bg-slate-900 text-white flex flex-col print:hidden">
        <div className="p-4 bg-slate-950 font-bold text-xl text-center md:text-left flex items-center gap-2">
          <Store className="text-blue-400" /> Lentera POS
        </div>
        <div className="p-4 border-b border-slate-800 mb-2">
          <div className="text-sm text-slate-400">Toko Aktif:</div>
          <div className="font-medium text-white truncate">{appUser.storeName}</div>
          <div className="text-xs font-normal text-blue-400 mt-1 uppercase tracking-wider">👤 {appUser.name} ({appUser.role})</div>
        </div>
        
        <nav className="flex-1 p-2 flex md:flex-col overflow-x-auto">
          <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 p-3 mb-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <LayoutDashboard size={20} /> Dashboard
          </button>
          <button onClick={() => setActiveTab('pos')} className={`flex items-center gap-3 p-3 mb-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'pos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <ShoppingCart size={20} /> Mesin Kasir
          </button>
          <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-3 p-3 mb-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Package size={20} /> Inventaris
          </button>
          <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-3 p-3 mb-2 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'customers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <Users size={20} /> Pelanggan
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 p-4 bg-red-950 text-red-400 hover:bg-red-900 hover:text-white transition-colors border-t border-slate-800">
          <LogOut size={20} /> Keluar Sistem
        </button>
      </div>

      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        
        {/* BANNER TRIAL/STATUS (Hanya tampil untuk Owner) */}
        {appUser.status === 'trial' && appUser.role === 'owner' && (
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 text-sm font-medium flex justify-between items-center print:hidden border-b border-yellow-200">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} /> Masa Coba Gratis Anda tersisa {trialDaysLeft} hari lagi.
            </div>
            <button onClick={() => setCurrentView('pricing')} className="bg-yellow-500 text-white px-3 py-1 rounded text-xs font-bold hover:bg-yellow-600 transition-colors">
              Upgrade ke Pro
            </button>
          </div>
        )}

        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardScreen 
              user={appUser} 
              sales={totalSales} 
              trxCount={totalTransactions} 
              setAppUser={setAppUser}
              onSimulateLock={() => {
                const expiredDate = new Date();
                expiredDate.setDate(expiredDate.getDate() - 1);
                setAppUser({...appUser, expiryDate: expiredDate.toISOString(), status: 'trial_expired'});
              }}
            />
          )}
          {activeTab === 'pos' && (
            <POSScreen 
              products={products} cart={cart} setCart={setCart} setProducts={setProducts} 
              shiftStatus={shiftStatus} setShiftStatus={setShiftStatus}
              startCash={startCash} setStartCash={setStartCash}
              setTotalSales={setTotalSales} setTotalTransactions={setTotalTransactions}
              showMessage={showMessage}
            />
          )}
          {activeTab === 'inventory' && (
            <InventoryScreen products={products} setProducts={setProducts} role={appUser.role} showMessage={showMessage} />
          )}
          {activeTab === 'customers' && (
            <CustomerScreen customers={customers} setCustomers={setCustomers} role={appUser.role} showMessage={showMessage} />
          )}
        </div>
      </div>
    </div>
  );
}

function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <nav className="flex justify-between items-center p-6 lg:px-20 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-2xl text-blue-700">
          <Store className="w-8 h-8" /> Lentera Siak
        </div>
        <div className="space-x-4">
          <button onClick={() => onNavigate('auth')} className="text-slate-600 font-medium hover:text-blue-600">Masuk</button>
          <button onClick={() => onNavigate('auth')} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200">Daftar Gratis</button>
        </div>
      </nav>

      <header className="flex flex-col lg:flex-row items-center gap-12 p-6 lg:px-20 lg:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">🚀 POS KASIR MODERN UMKM</div>
          <h1 className="text-4xl lg:text-6xl font-extrabold leading-tight text-slate-900">Kelola Toko Lebih Mudah, <span className="text-blue-600">Untung Lebih Berlimpah.</span></h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">Tinggalkan pencatatan buku manual. Beralih ke sistem kasir pintar Lentera Siak dengan fitur pantau stok, laporan real-time, dan manajemen kasir multi-cabang.</p>
          <div className="pt-4 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
            <button onClick={() => onNavigate('auth')} className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 transition-transform hover:-translate-y-1 shadow-lg shadow-blue-300 flex items-center justify-center gap-2">
              Mulai Coba Gratis 14 Hari <ChevronRight size={20} />
            </button>
          </div>
        </div>
        <div className="flex-1">
          <div className="bg-white p-4 rounded-2xl shadow-2xl border border-slate-100 rotate-2 hover:rotate-0 transition-transform duration-500">
            {/* Visual Dashboard Palsu */}
            <div className="flex justify-between items-center border-b pb-4 mb-4">
              <div className="flex gap-2"><div className="w-3 h-3 rounded-full bg-red-400"/><div className="w-3 h-3 rounded-full bg-yellow-400"/><div className="w-3 h-3 rounded-full bg-green-400"/></div>
              <div className="text-xs text-slate-400 font-mono">lentera-siak.com/pos</div>
            </div>
            <div className="flex gap-4">
              <div className="w-1/3 bg-slate-50 p-4 rounded-xl space-y-3">
                <div className="h-4 bg-slate-200 rounded w-full"></div>
                <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                <div className="h-4 bg-slate-200 rounded w-3/4"></div>
              </div>
              <div className="w-2/3 flex flex-col gap-4">
                <div className="flex gap-4">
                  <div className="flex-1 bg-blue-50 h-24 rounded-xl p-4 border border-blue-100 flex flex-col justify-end"><div className="text-xl font-bold text-blue-700">Rp 4.2M</div><div className="text-xs text-blue-500">Pendapatan</div></div>
                  <div className="flex-1 bg-green-50 h-24 rounded-xl p-4 border border-green-100 flex flex-col justify-end"><div className="text-xl font-bold text-green-700">124</div><div className="text-xs text-green-500">Transaksi</div></div>
                </div>
                <div className="h-32 bg-slate-50 rounded-xl border border-slate-100"></div>
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}

function AuthScreen({ onAuth, globalMessage }) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', password: '', storeName: '' });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLogin) {
      onAuth('login', formData);
    } else {
      if (!formData.storeName || !formData.username || !formData.password) return;
      onAuth('register', formData);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans relative">
      
      {/* GLOBAL MESSAGE CATCHER */}
      {globalMessage && (
        <div className="absolute top-4 right-4 bg-red-600 text-white px-6 py-3 rounded shadow-lg font-medium flex items-center gap-2">
          <XCircle size={20} /> {globalMessage.text}
        </div>
      )}

      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4">
            <Store size={24} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">{isLogin ? 'Masuk ke Back Office' : 'Daftar Toko Baru'}</h2>
          <p className="text-slate-500 text-sm mt-1">{isLogin ? 'Silakan masuk dengan akun kasir atau pemilik.' : 'Mulai digitalisasi usaha Anda sekarang.'}</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-slate-700 mb-1 text-sm font-semibold">Nama Toko / Usaha</label>
              <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="Contoh: Kopi Maju Jaya"
                value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})}
              />
            </div>
          )}
          <div>
            <label className="block text-slate-700 mb-1 text-sm font-semibold">Username</label>
            <input required type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="admin / kasir"
              value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})}
            />
          </div>
          <div>
            <label className="block text-slate-700 mb-1 text-sm font-semibold">Password</label>
            <input required type="password" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" placeholder="••••••••"
              value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})}
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 transition-colors shadow-md shadow-blue-200 mt-2">
            {isLogin ? 'Masuk Sekarang' : 'Daftar & Lanjutkan'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600">
          {isLogin ? "Belum punya akun?" : "Sudah memiliki akun?"} {' '}
          <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-blue-600 hover:underline">
            {isLogin ? 'Daftar Toko Gratis' : 'Masuk di sini'}
          </button>
        </div>

        {isLogin && (
           <div className="mt-8 p-4 bg-slate-50 border border-slate-100 text-sm text-slate-500 rounded-lg">
           <p className="font-bold mb-2 text-slate-700">Akun Demo Cepat:</p>
           <div className="flex justify-between border-b pb-2 mb-2"><span className="font-mono">admin / 123</span> <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">Owner</span></div>
           <div className="flex justify-between"><span className="font-mono">kasir / 123</span> <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Kasir</span></div>
         </div>
        )}
      </div>
    </div>
  );
}

function PricingScreen({ onSelectTrial, onSelectPackage }) {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-800">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Pilih Paket Bisnis Anda</h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">Tingkatkan efisiensi toko dengan fitur kasir premium. Mulai secara gratis, tingkatkan kapan saja sesuai kebutuhan usaha Anda.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Paket 1: Trial (14 Hari) */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
            <h3 className="text-xl font-bold mb-2 text-slate-700">Paket Pemula</h3>
            <div className="text-3xl font-extrabold mb-4 text-slate-900">Gratis</div>
            <p className="text-slate-500 text-sm mb-6 h-10">Coba semua fitur unggulan secara gratis selama 14 hari penuh.</p>
            <ul className="space-y-3 mb-8 flex-1 text-sm text-slate-700">
              <li className="flex items-start gap-2"><CheckCircle2 className="text-green-500 w-5 h-5 shrink-0"/> Akses POS Utama</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="text-green-500 w-5 h-5 shrink-0"/> Manajemen 100 Produk</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="text-green-500 w-5 h-5 shrink-0"/> Laporan Harian Dasar</li>
            </ul>
            <button onClick={onSelectTrial} className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl transition-colors">
              Mulai Coba Gratis 14 Hari
            </button>
          </div>

          {/* Paket 2: 1 Bulan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative">
            <h3 className="text-xl font-bold mb-2 text-slate-700">Paket 1 Bulan</h3>
            <div className="text-3xl font-extrabold mb-4 text-blue-600">Rp 129k<span className="text-lg text-slate-400 font-normal">/bln</span></div>
            <p className="text-slate-500 text-sm mb-6 h-10">Cocok untuk mengelola bisnis per bulan dengan fleksibilitas.</p>
            <ul className="space-y-3 mb-8 flex-1 text-sm text-slate-700">
              <li className="flex items-start gap-2"><CheckCircle2 className="text-blue-500 w-5 h-5 shrink-0"/> Semua Fitur Terbuka</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="text-blue-500 w-5 h-5 shrink-0"/> Produk Tanpa Batas</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="text-blue-500 w-5 h-5 shrink-0"/> Ekspor Laporan Excel</li>
            </ul>
            <button onClick={() => onSelectPackage('1_month')} className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl transition-colors">
              Pilih Paket
            </button>
          </div>

          {/* Paket 3: 6 Bulan */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col relative">
            <h3 className="text-xl font-bold mb-2 text-slate-700">Paket 6 Bulan</h3>
            <div className="text-3xl font-extrabold mb-4 text-blue-600">Rp 774k<span className="text-lg text-slate-400 font-normal">/6bln</span></div>
            <p className="text-slate-500 text-sm mb-6 h-10">Lebih tenang dengan pembayaran per semester.</p>
            <ul className="space-y-3 mb-8 flex-1 text-sm text-slate-700">
              <li className="flex items-start gap-2"><CheckCircle2 className="text-blue-500 w-5 h-5 shrink-0"/> Keuntungan Paket 1 Bulan</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="text-blue-500 w-5 h-5 shrink-0"/> Prioritas Customer Support</li>
            </ul>
            <button onClick={() => onSelectPackage('6_months')} className="w-full py-3 px-4 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-700 font-bold rounded-xl transition-colors">
              Pilih Paket
            </button>
          </div>

          {/* Paket 4: 1 Tahun (PROMO) */}
          <div className="bg-blue-600 p-6 rounded-2xl shadow-xl border-2 border-blue-400 flex flex-col relative transform md:-translate-y-4">
            <div className="absolute top-0 right-0 bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl uppercase tracking-wider">
              Terbaik & Paling Hemat
            </div>
            <h3 className="text-xl font-bold mb-2 text-blue-100">Paket 1 Tahun (PROMO)</h3>
            <div className="text-slate-300 line-through text-lg font-medium">Rp 1.548.000</div>
            <div className="text-3xl font-extrabold mb-4 text-white">Rp 1.299k<span className="text-lg text-blue-300 font-normal">/thn</span></div>
            <p className="text-blue-100 text-sm mb-6 h-10">Investasi jangka panjang dengan harga termurah + ekstra masa aktif.</p>
            <ul className="space-y-3 mb-8 flex-1 text-sm text-blue-50">
              <li className="flex items-start gap-2"><CheckCircle2 className="text-yellow-400 w-5 h-5 shrink-0"/> Semua Fitur Terbuka</li>
              <li className="flex items-start gap-2"><CheckCircle2 className="text-yellow-400 w-5 h-5 shrink-0"/> Akses Multi-Cabang</li>
              <li className="flex items-start gap-2 bg-blue-800/50 p-2 rounded-lg text-yellow-300 font-bold"><CheckCircle2 className="text-yellow-400 w-5 h-5 shrink-0"/> BONUS MASA AKTIF 30 HARI</li>
            </ul>
            <button onClick={() => onSelectPackage('1_year')} className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-extrabold rounded-xl transition-colors shadow-lg shadow-blue-900/50">
              Ambil Promo Sekarang
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}

function PaymentScreen({ pkgId, onConfirm, onBack }) {
  const pkg = pricingPackages.find(p => p.id === pkgId);
  const [method, setMethod] = useState('bank'); // 'bank' or 'qris'

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 font-sans text-slate-800">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full flex flex-col md:flex-row overflow-hidden border border-slate-200">
        
        {/* Ringkasan Pesanan */}
        <div className="bg-slate-50 w-full md:w-1/3 p-6 md:p-8 border-b md:border-b-0 md:border-r border-slate-200">
          <button onClick={onBack} className="text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 flex items-center gap-1">← Kembali</button>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Ringkasan Pesanan</h3>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{pkg.name}</h2>
          <div className="text-sm text-slate-600 mb-6">Masa aktif: <span className="font-bold text-blue-600">{pkg.durationDays} Hari</span> {pkgId === '1_year' && '(Termasuk Bonus 30 Hari)'}</div>
          
          <hr className="border-slate-200 mb-6" />
          
          <div className="flex justify-between text-slate-500 text-sm mb-2"><span>Harga Dasar</span> <span>Rp {pkg.originalPrice ? pkg.originalPrice.toLocaleString() : pkg.price.toLocaleString()}</span></div>
          {pkg.originalPrice && (
            <div className="flex justify-between text-green-600 text-sm mb-2 font-medium"><span>Diskon Promo</span> <span>- Rp {(pkg.originalPrice - pkg.price).toLocaleString()}</span></div>
          )}
          <div className="flex justify-between font-bold text-lg text-slate-900 mt-4 pt-4 border-t border-slate-200"><span>Total Tagihan</span> <span>Rp {pkg.price.toLocaleString('id-ID')}</span></div>
        </div>

        {/* Instruksi Pembayaran */}
        <div className="w-full md:w-2/3 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Metode Pembayaran</h2>
          
          <div className="flex gap-4 mb-6">
            <button onClick={() => setMethod('bank')} className={`flex-1 py-3 border-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${method === 'bank' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              <CreditCard size={20} /> Transfer Bank
            </button>
            <button onClick={() => setMethod('qris')} className={`flex-1 py-3 border-2 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${method === 'qris' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 text-slate-500 hover:border-slate-300'}`}>
              <QrCode size={20} /> QRIS / E-Wallet
            </button>
          </div>

          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8 min-h-[220px]">
            {method === 'bank' ? (
              <div className="animate-fade-in">
                <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Transfer ke Rekening Berikut</div>
                <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm mb-4">
                  <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-black text-xl italic tracking-tighter">SeaBank</div>
                  <div>
                    <div className="text-2xl font-mono font-bold text-slate-900 tracking-wider">9010 6464 0699</div>
                    <div className="text-sm text-slate-500 font-medium">a.n <span className="text-slate-800">Richky Irawan</span></div>
                  </div>
                </div>
                <p className="text-xs text-slate-500">Pastikan nominal transfer sesuai hingga 3 digit terakhir. Proses verifikasi biasanya memakan waktu 1-5 menit.</p>
              </div>
            ) : (
              <div className="animate-fade-in flex flex-col items-center justify-center text-center">
                <div className="bg-white p-4 rounded-xl border-2 border-slate-200 shadow-sm inline-block mb-4">
                  <QrCode size={120} className="text-slate-800" />
                </div>
                <div className="text-sm font-bold text-slate-800 mb-1">Scan QRIS menggunakan aplikasi pembayaran Anda.</div>
                <div className="text-xs text-slate-500 flex gap-2 justify-center mt-2">
                   <span className="bg-slate-200 px-2 py-1 rounded">Dana</span>
                   <span className="bg-slate-200 px-2 py-1 rounded">OVO</span>
                   <span className="bg-slate-200 px-2 py-1 rounded">GoPay</span>
                   <span className="bg-slate-200 px-2 py-1 rounded">Spay</span>
                </div>
              </div>
            )}
          </div>

          <button onClick={onConfirm} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg transition-colors shadow-lg shadow-green-200 flex items-center justify-center gap-2">
            <CheckCircle2 /> Saya Sudah Bayar
          </button>
        </div>

      </div>
    </div>
  );
}

function DashboardScreen({ user, sales, trxCount, setAppUser, onSimulateLock }) {
  const isOwner = user.role === 'owner';
  
  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Dashboard Back Office</h2>
          <p className="text-slate-500 mt-1">Ringkasan aktivitas hari ini untuk <b>{user.storeName}</b>.</p>
        </div>
        <div className="text-right flex flex-col items-end gap-2">
          <div className="text-sm text-slate-500">Status Layanan: <span className="font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wide">{user.status}</span></div>
          {/* Tombol Rahasia Untuk Simulasi Lock System */}
          <button onClick={onSimulateLock} className="text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 font-bold uppercase">Test Simulasi Waktu Habis</button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Total Pendapatan (Shift Ini)</div>
          <div className="text-3xl font-extrabold text-green-600">
            {isOwner ? `Rp ${sales.toLocaleString('id-ID')}` : 'Rp *******'}
          </div>
          {!isOwner && <p className="text-xs text-red-500 mt-2">*Hak akses ditolak. Hanya untuk Owner.</p>}
        </div>
        
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Jumlah Transaksi</div>
          <div className="text-3xl font-extrabold text-blue-600">{trxCount} <span className="text-lg text-slate-400 font-medium">Struk</span></div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 bg-gradient-to-br from-slate-800 to-slate-900 text-white">
          <div className="text-sm text-slate-400 font-bold uppercase tracking-wider mb-1">Shift Aktif Kasir</div>
          <div className="text-xl font-bold mb-2">Kasir Sedang Buka</div>
          <div className="text-xs text-slate-400">Pastikan hitung uang laci di menu Mesin Kasir sebelum tutup toko.</div>
        </div>
      </div>
      
      {/* Chart Kosong (Placeholder) */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-64 flex flex-col justify-center items-center text-slate-400">
         <LayoutDashboard size={48} className="mb-4 opacity-50" />
         <p>Grafik Analitik Penjualan (Fitur Pro)</p>
      </div>
    </div>
  );
}

function POSScreen({ products, cart, setCart, setProducts, shiftStatus, setShiftStatus, startCash, setStartCash, setTotalSales, setTotalTransactions, showMessage }) {
  
  // Fitur Buka Kas
  const [tempStartCash, setTempStartCash] = useState('');
  if (shiftStatus === 'closed') {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto text-center pt-20">
        <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-100 w-full">
          <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4"><Store size={32} /></div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Buka Shift Kasir</h2>
          <p className="text-slate-500 text-sm mb-6">Masukkan modal awal uang kembalian yang ada di laci kasir saat ini.</p>
          <input type="number" className="w-full text-center text-2xl font-bold p-4 border rounded-xl bg-slate-50 mb-4 focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Rp 0"
            value={tempStartCash} onChange={(e) => setTempStartCash(e.target.value)}
          />
          <button 
            onClick={() => {
              if(!tempStartCash) return showMessage('Mohon isi modal awal, minimal 0.', 'error');
              setStartCash(Number(tempStartCash));
              setShiftStatus('open');
            }}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-colors"
          >
            Mulai Jualan
          </button>
        </div>
      </div>
    );
  }

  // Fungsi Transaksi POS
  const addToCart = (product) => {
    if (product.stock <= 0) {
      showMessage(`Stok ${product.name} habis!`, 'error');
      return;
    }
    const existing = cart.find(item => item.id === product.id);
    if (existing) {
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const removeFromCart = (id) => setCart(cart.filter(item => item.id !== id));
  
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    // Kurangi stok
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.qty } : p;
    });
    setProducts(updatedProducts);
    
    // Update Rekapan
    setTotalSales(prev => prev + total);
    setTotalTransactions(prev => prev + 1);
    
    // Print dialog
    window.print();
    setCart([]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Daftar Produk (Kiri) */}
      <div className="flex-1 print:hidden flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-extrabold text-slate-800">Menu Kasir</h2>
           <button onClick={() => {
             // Tutup Shift
             const cashInDrawer = startCash; // Dalam logic asli harusnya startCash + totalCashSales. Untuk simulasi kita buat sederhana
             showMessage(`Shift ditutup. Uang di laci: Rp ${cashInDrawer.toLocaleString()}`, 'success');
             setShiftStatus('closed');
             setTempStartCash('');
           }} className="text-sm font-bold text-red-600 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg border border-red-200">Tutup Shift Kasir</button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-10">
          {products.map(p => (
            <button 
              key={p.id} 
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              className={`p-4 border rounded-2xl text-left transition-all flex flex-col h-32 ${p.stock > 0 ? 'bg-white hover:border-blue-500 hover:shadow-md' : 'bg-slate-100 opacity-50 cursor-not-allowed'}`}
            >
              <div className="font-bold text-slate-800 line-clamp-2 leading-tight mb-auto">{p.name}</div>
              <div>
                <div className="text-blue-600 font-extrabold">Rp {p.price.toLocaleString('id-ID')}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">Sisa: {p.stock}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Keranjang & Struk (Kanan) */}
      <div className="w-full lg:w-96 bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col print:w-full print:border-none print:shadow-none">
        <div className="p-4 border-b bg-slate-50 rounded-t-2xl print:hidden flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">Keranjang</h2>
          <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{cart.length} Item</span>
        </div>
        
        {/* Area Struk yang akan di-print */}
        <div className="p-4 flex-1 overflow-y-auto bg-white">
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-2xl font-bold">LENTERA STORE</h1>
            <p className="text-sm text-gray-500">Jl. Teknologi No. 99, Jakarta</p>
            <p className="text-sm text-gray-500">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
            <hr className="my-2 border-dashed border-gray-400" />
          </div>

          {cart.length === 0 ? (
            <div className="text-center flex flex-col items-center justify-center h-full text-slate-400 print:hidden opacity-50">
               <ShoppingCart size={48} className="mb-4" />
               <p className="font-medium">Belum ada barang</p>
            </div>
          ) : (
            <div className="space-y-4">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-start border-b border-slate-50 pb-3 last:border-0">
                  <div className="flex-1 pr-2">
                    <div className="font-bold text-sm text-slate-800 leading-tight mb-1">{item.name}</div>
                    <div className="text-xs text-slate-500 font-medium">{item.qty} x Rp {item.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="font-extrabold text-sm text-slate-800 whitespace-nowrap">Rp {(item.price * item.qty).toLocaleString('id-ID')}</div>
                  <button onClick={() => removeFromCart(item.id)} className="ml-3 mt-0.5 text-red-400 hover:text-red-600 print:hidden bg-red-50 p-1 rounded">
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="hidden print:block mt-6">
             <hr className="my-2 border-dashed border-gray-400" />
             <div className="flex justify-between font-bold text-lg">
                <span>TOTAL:</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
             </div>
             <p className="text-center text-sm mt-6">Terima kasih atas kunjungan Anda!</p>
          </div>
        </div>

        <div className="p-4 border-t border-slate-100 bg-white rounded-b-2xl print:hidden">
          <div className="flex justify-between items-end mb-4">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Tagihan</span>
            <span className="text-2xl font-extrabold text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed flex justify-center items-center gap-2 transition-colors shadow-lg shadow-green-100"
          >
            <Printer size={20} /> Cetak Struk & Bayar
          </button>
        </div>
      </div>
    </div>
  );
}

function InventoryScreen({ products, setProducts, role, showMessage }) {
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });
  const isOwner = role === 'owner';

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProduct.name || !newProduct.price || !newProduct.stock) return;
    
    const product = {
      id: Date.now().toString(),
      name: newProduct.name,
      price: parseInt(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: 'Umum'
    };
    
    setProducts([...products, product]);
    setNewProduct({ name: '', price: '', stock: '' });
    setShowForm(false);
    showMessage('Produk berhasil ditambahkan!', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
           <h2 className="text-3xl font-extrabold text-slate-800">Inventaris Stok</h2>
           <p className="text-slate-500 mt-1">Kelola data barang dagangan Anda.</p>
        </div>
        {isOwner && (
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-bold shadow-md shadow-blue-100 transition-colors">
            <Plus size={18} /> Tambah Produk
          </button>
        )}
      </div>

      {!isOwner && <div className="mb-6 bg-amber-50 text-amber-700 p-4 rounded-lg text-sm border border-amber-200 font-medium">Anda login sebagai Kasir. Fitur Tambah Produk dinonaktifkan.</div>}

      {showForm && isOwner && (
        <form onSubmit={handleAddProduct} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-end animate-fade-in">
          <div className="flex-1 w-full"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Produk</label><input required type="text" className="w-full border p-3 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} /></div>
          <div className="w-full md:w-40"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Harga (Rp)</label><input required type="number" className="w-full border p-3 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} /></div>
          <div className="w-full md:w-32"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Stok Awal</label><input required type="number" className="w-full border p-3 rounded-lg bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} /></div>
          <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold shadow-md w-full md:w-auto mt-4 md:mt-0">Simpan</button>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="p-4 text-sm font-bold text-slate-600">Nama Produk</th>
              <th className="p-4 text-sm font-bold text-slate-600">Harga Jual</th>
              <th className="p-4 text-sm font-bold text-slate-600 text-center">Sisa Stok</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4 font-bold text-slate-800">{p.name}</td>
                <td className="p-4 font-medium text-slate-600">Rp {p.price.toLocaleString('id-ID')}</td>
                <td className="p-4 text-center">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {p.stock} Pcs
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerScreen({ customers, setCustomers, role, showMessage }) {
  const [showForm, setShowForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  const handleAddCustomer = (e) => {
    e.preventDefault();
    if (!newCustomer.name) return;
    
    setCustomers([...customers, {
      id: Date.now().toString(),
      name: newCustomer.name,
      phone: newCustomer.phone,
      points: 0
    }]);
    setNewCustomer({ name: '', phone: '' });
    setShowForm(false);
    showMessage('Pelanggan berhasil didaftarkan!', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
           <h2 className="text-3xl font-extrabold text-slate-800">Data Pelanggan</h2>
           <p className="text-slate-500 mt-1">Kelola poin loyalitas pelanggan setia Anda.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-bold shadow-md shadow-blue-100 transition-colors">
          <Plus size={18} /> Tambah Member
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddCustomer} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 flex flex-col md:flex-row gap-4 items-end animate-fade-in">
          <div className="flex-1 w-full"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nama Lengkap</label><input required type="text" className="w-full border p-3 rounded-lg bg-slate-50 focus:bg-white outline-none" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} /></div>
          <div className="flex-1 w-full"><label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nomor WhatsApp / HP</label><input type="text" className="w-full border p-3 rounded-lg bg-slate-50 focus:bg-white outline-none" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} /></div>
          <button type="submit" className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 font-bold shadow-md w-full md:w-auto mt-4 md:mt-0">Daftar Member</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col hover:border-blue-300 transition-colors">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mb-4">{c.name.charAt(0)}</div>
            <div className="font-extrabold text-xl text-slate-800">{c.name}</div>
            <div className="text-slate-500 text-sm mt-1 mb-6 font-medium">{c.phone || 'Tidak ada nomor HP'}</div>
            <div className="mt-auto pt-4 border-t border-slate-100 flex justify-between items-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Loyalty Points</span>
              <div className="text-xl font-black text-yellow-500">{c.points} Pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
