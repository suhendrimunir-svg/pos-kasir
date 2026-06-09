import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Users, LogOut, Plus, Printer, Trash2, LayoutDashboard, Store, QrCode, CreditCard, ChevronRight, CheckCircle2, Lock, XCircle, AlertTriangle, Briefcase, CalendarClock, Wallet, Clock, UserPlus, FileText } from 'lucide-react';

// --- DATA AWAL (DUMMY) ---
const initialProducts = [
  { id: '1', name: 'Kopi Susu Gula Aren', price: 18000, stock: 50, category: 'Minuman' },
  { id: '2', name: 'Roti Bakar Coklat', price: 15000, stock: 20, category: 'Makanan' },
];

const initialCustomers = [
  { id: '1', name: 'Budi Santoso', phone: '08123456789', points: 150 },
];

// Data Karyawan Awal (Termasuk Owner)
const initialEmployees = [
  { id: 'e1', name: 'Siti (Kasir Utama)', role: 'cashier', phone: '08111', baseSalary: 3000000 },
  { id: 'e2', name: 'Joko (Gudang)', role: 'gudang', phone: '08222', baseSalary: 2500000 },
  { id: 'e3', name: 'Rina (Sales/Pelayan 1)', role: 'sales', phone: '08333', baseSalary: 1500000 },
  { id: 'e4', name: 'Andi (Sales/Pelayan 2)', role: 'sales', phone: '08444', baseSalary: 1500000 },
];

const pricingPackages = [
  { id: '1_month', name: 'Paket 1 Bulan', price: 129000, durationDays: 30, originalPrice: null },
  { id: '6_months', name: 'Paket 6 Bulan', price: 774000, durationDays: 180, originalPrice: null },
  { id: '1_year', name: 'Paket 1 Tahun', price: 1299000, durationDays: 395, originalPrice: 1548000 },
];

export default function App() {
  // Navigation & Auth States
  const [currentView, setCurrentView] = useState('landing'); // landing, auth, pricing, payment, pending_verification, app
  const [appUser, setAppUser] = useState(null); 
  
  // App Core States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);
  const [cart, setCart] = useState([]);
  
  // HR & Payroll States
  const [employees, setEmployees] = useState(initialEmployees);
  const [attendance, setAttendance] = useState([]); // { empId, date, checkIn, checkOut }
  const [commissions, setCommissions] = useState([]); // { trxId, empId, amount }

  // Shift & Cash Drawer States
  const [shiftStatus, setShiftStatus] = useState('closed'); 
  const [startCash, setStartCash] = useState(0);
  const [totalSales, setTotalSales] = useState(0);
  const [totalTransactions, setTotalTransactions] = useState(0);

  const [selectedPackage, setSelectedPackage] = useState(null);
  const [globalMessage, setGlobalMessage] = useState(null);

  const showMessage = (text, type = 'error') => {
    setGlobalMessage({ text, type });
    setTimeout(() => setGlobalMessage(null), 3000);
  };

  const handleAuth = (type, data) => {
    if (type === 'login') {
      if (data.username === 'admin' && data.password === '123') {
        const dummyExpiry = new Date();
        dummyExpiry.setDate(dummyExpiry.getDate() + 14);
        setAppUser({ name: 'Pemilik Toko', role: 'owner', storeName: 'Toko Lentera Siak', status: 'pro', expiryDate: dummyExpiry.toISOString() });
        setCurrentView('app');
      } else if (data.username === 'kasir' && data.password === '123') {
        const dummyExpiry = new Date();
        dummyExpiry.setDate(dummyExpiry.getDate() + 14);
        setAppUser({ name: 'Siti (Kasir)', role: 'cashier', storeName: 'Toko Lentera Siak', status: 'pro', expiryDate: dummyExpiry.toISOString() });
        setCurrentView('app');
      } else {
        showMessage('Username atau password salah! (Coba admin/123)', 'error');
      }
    } else if (type === 'register') {
      setAppUser({ name: 'Pemilik Baru', role: 'owner', storeName: data.storeName, status: 'pending_payment' });
      setCurrentView('pricing'); // Langsung lempar ke layar harga
    }
  };

  const handleLogout = () => {
    setAppUser(null);
    setShiftStatus('closed');
    setCurrentView('landing');
  };

  const handleBuyPackage = (pkgId) => {
    setSelectedPackage(pkgId);
    setCurrentView('payment');
  };

  // KUNCI APLIKASI: Setelah bayar, status menjadi "Menunggu Verifikasi"
  const handleConfirmPayment = () => {
    setAppUser({ ...appUser, status: 'pending_verification', selectedPkg: selectedPackage });
    setCurrentView('pending_verification');
  };

  // SIMULASI ADMIN MENGKONFIRMASI PEMBAYARAN
  const simulateAdminApproval = () => {
    const pkg = pricingPackages.find(p => p.id === appUser.selectedPkg);
    const expiryDate = new Date();
    // Beri masa aktif + bonus 14 hari trial di depan
    expiryDate.setDate(expiryDate.getDate() + (pkg?.durationDays || 14) + 14);
    
    setAppUser({ ...appUser, status: 'pro', expiryDate: expiryDate.toISOString() });
    setCurrentView('app');
    showMessage(`Pembayaran Diterima! Akses Toko Terbuka.`, 'success');
  };

  // Pengecekan Akses Role
  const hasAccess = (tab) => {
    const role = appUser?.role;
    if (role === 'owner' || role === 'manager' || role === 'admin') return true; // Super users
    if (tab === 'pos') return ['cashier', 'sales'].includes(role);
    if (tab === 'inventory') return ['gudang'].includes(role);
    if (tab === 'customers') return ['cashier', 'sales'].includes(role);
    return false;
  };

  // Pengecekan Masa Aktif
  let isExpired = false;
  if (appUser && (appUser.status === 'pro' || appUser.status === 'trial_expired')) {
    const now = new Date();
    const expiry = new Date(appUser.expiryDate);
    if (now > expiry || appUser.status === 'trial_expired') {
      isExpired = true;
    }
  }

  // Wrapper View
  if (currentView === 'landing') return <LandingPage onNavigate={setCurrentView} />;
  if (currentView === 'auth') return <AuthScreen onAuth={handleAuth} globalMessage={globalMessage} />;
  if (currentView === 'pricing') return <PricingScreen onSelectPackage={handleBuyPackage} />;
  if (currentView === 'payment') return <PaymentScreen pkgId={selectedPackage} onConfirm={handleConfirmPayment} onBack={() => setCurrentView('pricing')} />;
  
  // HALAMAN KUNCI VERIFIKASI PEMBAYARAN
  if (currentView === 'pending_verification') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-lg w-full text-center border-t-4 border-yellow-500">
          <Clock className="w-16 h-16 text-yellow-500 mx-auto mb-4 animate-pulse" />
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Menunggu Verifikasi</h2>
          <p className="text-slate-600 mb-6">Pembayaran Anda sedang kami proses. Aplikasi toko Anda <b>({appUser.storeName})</b> masih terkunci hingga pembayaran dikonfirmasi oleh tim Admin Lentera Siak.</p>
          <div className="bg-slate-100 p-4 rounded-lg mb-6 text-sm text-slate-500 text-left">
            💡 <b>Info:</b> Dalam sistem aslinya, proses ini otomatis memakan waktu 1-5 menit. Untuk keperluan simulasi (demo), silakan klik tombol di bawah ini untuk mensimulasikan konfirmasi admin.
          </div>
          <button onClick={simulateAdminApproval} className="w-full bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 shadow-lg shadow-green-200 transition-colors">
            (Simulasi) Konfirmasi Pembayaran Berhasil
          </button>
        </div>
      </div>
    );
  }

  // JIKA MASA AKTIF HABIS (LOCK)
  if (isExpired && (appUser.role === 'owner' || appUser.role === 'manager')) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-2xl max-w-lg w-full text-center border-t-4 border-red-600">
          <Lock className="text-red-600 w-16 h-16 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Masa Aktif Habis</h2>
          <p className="text-gray-600 mb-6">Masa langganan toko Anda telah berakhir. Kasir sementara dinonaktifkan. Silakan perpanjang paket untuk melanjutkan bisnis Anda.</p>
          <button onClick={() => setCurrentView('pricing')} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition-colors">
            Perpanjang Langganan Sekarang
          </button>
        </div>
      </div>
    );
  } else if (isExpired) {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-xl shadow-xl max-w-md w-full text-center">
          <AlertTriangle className="text-red-600 w-16 h-16 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-800 mb-2">Sistem Terkunci</h2>
          <p className="text-gray-600 mb-6">Masa berlangganan aplikasi habis. Silakan hubungi Pemilik/Manager Toko untuk melakukan perpanjangan.</p>
          <button onClick={handleLogout} className="w-full bg-gray-200 text-gray-800 font-bold py-2 rounded hover:bg-gray-300">Keluar Sistem</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      {/* GLOBAL MESSAGE BOX */}
      {globalMessage && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium flex items-center gap-2 transition-all ${globalMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
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
          {hasAccess('dashboard') && (
            <button onClick={() => setActiveTab('dashboard')} className={`flex items-center gap-3 p-3 mb-1 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'dashboard' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <LayoutDashboard size={20} /> Dashboard
            </button>
          )}
          {hasAccess('pos') && (
            <button onClick={() => setActiveTab('pos')} className={`flex items-center gap-3 p-3 mb-1 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'pos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <ShoppingCart size={20} /> Mesin Kasir
            </button>
          )}
          {hasAccess('inventory') && (
            <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-3 p-3 mb-1 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'inventory' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Package size={20} /> Inventaris
            </button>
          )}
          {hasAccess('customers') && (
            <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-3 p-3 mb-1 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'customers' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
              <Users size={20} /> Pelanggan
            </button>
          )}

          {/* HR & BACKOFFICE (Khusus Owner/Manager/Admin) */}
          {hasAccess('hr') && (
            <>
              <div className="mt-4 mb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">HR & Penggajian</div>
              <button onClick={() => setActiveTab('employees')} className={`flex items-center gap-3 p-3 mb-1 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'employees' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Briefcase size={20} /> Data Karyawan
              </button>
              <button onClick={() => setActiveTab('attendance')} className={`flex items-center gap-3 p-3 mb-1 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'attendance' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <CalendarClock size={20} /> Absensi
              </button>
              <button onClick={() => setActiveTab('payroll')} className={`flex items-center gap-3 p-3 mb-1 rounded-lg whitespace-nowrap transition-colors ${activeTab === 'payroll' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <Wallet size={20} /> Rekap Gaji & Bonus
              </button>
            </>
          )}
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-3 p-4 bg-red-950 text-red-400 hover:bg-red-900 hover:text-white transition-colors border-t border-slate-800">
          <LogOut size={20} /> Keluar Sistem
        </button>
      </div>

      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <div className="flex-1 p-4 md:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && <DashboardScreen user={appUser} sales={totalSales} trxCount={totalTransactions} setAppUser={setAppUser} onSimulateLock={() => setAppUser({...appUser, expiryDate: new Date(Date.now() - 86400000).toISOString(), status: 'trial_expired'})} />}
          {activeTab === 'pos' && <POSScreen products={products} cart={cart} setCart={setCart} setProducts={setProducts} shiftStatus={shiftStatus} setShiftStatus={setShiftStatus} startCash={startCash} setStartCash={setStartCash} setTotalSales={setTotalSales} setTotalTransactions={setTotalTransactions} showMessage={showMessage} employees={employees} setCommissions={setCommissions} />}
          {activeTab === 'inventory' && <InventoryScreen products={products} setProducts={setProducts} role={appUser.role} showMessage={showMessage} />}
          {activeTab === 'customers' && <CustomerScreen customers={customers} setCustomers={setCustomers} role={appUser.role} showMessage={showMessage} />}
          {activeTab === 'employees' && <EmployeeScreen employees={employees} setEmployees={setEmployees} showMessage={showMessage} />}
          {activeTab === 'attendance' && <AttendanceScreen employees={employees} attendance={attendance} setAttendance={setAttendance} showMessage={showMessage} />}
          {activeTab === 'payroll' && <PayrollScreen employees={employees} commissions={commissions} attendance={attendance} />}
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// KOMPONEN LANDING, AUTH, PRICING, & PAYMENT 
// ============================================================================
function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-white font-sans text-slate-800">
      <nav className="flex justify-between items-center p-6 lg:px-20 border-b border-slate-100">
        <div className="flex items-center gap-2 font-bold text-2xl text-blue-700"><Store className="w-8 h-8" /> Lentera Siak</div>
        <div className="space-x-4">
          <button onClick={() => onNavigate('auth')} className="text-slate-600 font-medium hover:text-blue-600">Masuk</button>
          <button onClick={() => onNavigate('auth')} className="bg-blue-600 text-white px-6 py-2 rounded-full font-bold hover:bg-blue-700 shadow-md">Daftar Toko Gratis</button>
        </div>
      </nav>
      <header className="flex flex-col lg:flex-row items-center gap-12 p-6 lg:px-20 lg:py-24 bg-gradient-to-b from-blue-50 to-white">
        <div className="flex-1 space-y-6 text-center lg:text-left">
          <div className="inline-block bg-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-sm font-bold tracking-wide">🚀 POS KASIR + HRIS UMKM</div>
          <h1 className="text-4xl lg:text-5xl font-extrabold leading-tight text-slate-900">Satu Aplikasi, Kelola Kasir, Stok, dan Gaji Karyawan Anda.</h1>
          <p className="text-lg text-slate-600 max-w-xl mx-auto lg:mx-0">Sistem ERP mini tanpa ribet. Mulai dari kasir cerdas, manajemen multi-role, komisi pelayan, hingga rekapan absensi otomatis.</p>
          <button onClick={() => onNavigate('auth')} className="bg-blue-600 text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-300 flex items-center justify-center gap-2 mx-auto lg:mx-0">
            Daftar Sekarang <ChevronRight size={20} />
          </button>
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
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative">
      {globalMessage && (<div className="absolute top-4 right-4 bg-red-600 text-white px-6 py-3 rounded shadow-lg font-medium flex items-center gap-2"><XCircle size={20} /> {globalMessage.text}</div>)}
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-slate-100">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-full mb-4"><Store size={24} /></div>
          <h2 className="text-2xl font-bold text-slate-900">{isLogin ? 'Masuk Back Office' : 'Daftar Toko Baru'}</h2>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <div><label className="block text-slate-700 mb-1 text-sm font-semibold">Nama Toko</label><input required type="text" className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.storeName} onChange={(e) => setFormData({...formData, storeName: e.target.value})} /></div>
          )}
          <div><label className="block text-slate-700 mb-1 text-sm font-semibold">Username</label><input required type="text" className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.username} onChange={(e) => setFormData({...formData, username: e.target.value})} /></div>
          <div><label className="block text-slate-700 mb-1 text-sm font-semibold">Password</label><input required type="password" className="w-full p-3 bg-slate-50 border rounded-lg outline-none focus:ring-2 focus:ring-blue-500" value={formData.password} onChange={(e) => setFormData({...formData, password: e.target.value})} /></div>
          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3.5 rounded-lg hover:bg-blue-700 mt-2">{isLogin ? 'Masuk' : 'Daftar & Pilih Paket'}</button>
        </form>
        <div className="mt-6 text-center text-sm text-slate-600">
          <button onClick={() => setIsLogin(!isLogin)} className="font-bold text-blue-600 hover:underline">{isLogin ? 'Daftar Toko Baru' : 'Sudah punya akun? Masuk'}</button>
        </div>
        {isLogin && (
           <div className="mt-8 p-4 bg-slate-50 border border-slate-100 text-sm text-slate-500 rounded-lg">
             <p className="font-bold mb-2 text-slate-700">Gunakan Akun Demo:</p>
             <div className="flex justify-between border-b pb-2 mb-2"><span className="font-mono">admin / 123</span> <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-xs">Owner/HR</span></div>
             <div className="flex justify-between"><span className="font-mono">kasir / 123</span> <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs">Kasir</span></div>
           </div>
        )}
      </div>
    </div>
  );
}

function PricingScreen({ onSelectPackage }) {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 font-sans text-slate-800">
      <div className="max-w-5xl mx-auto text-center mb-12">
        <h1 className="text-3xl md:text-5xl font-extrabold text-slate-900 mb-4">Aktivasi Akun Toko Anda</h1>
        <p className="text-lg text-slate-600 max-w-2xl mx-auto">Silakan pilih paket berlangganan untuk membuka semua fitur Kasir, Inventaris, dan HRIS.</p>
      </div>
      <div className="max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Paket 1 Bulan */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-xl font-bold mb-2">Paket 1 Bulan</h3>
          <div className="text-3xl font-extrabold mb-4 text-blue-600">Rp 129k</div>
          <button onClick={() => onSelectPackage('1_month')} className="w-full py-3 px-4 bg-blue-50 text-blue-700 font-bold rounded-xl mt-auto hover:bg-blue-100">Pilih Paket</button>
        </div>
        {/* Paket 6 Bulan */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col">
          <h3 className="text-xl font-bold mb-2">Paket 6 Bulan</h3>
          <div className="text-3xl font-extrabold mb-4 text-blue-600">Rp 774k</div>
          <button onClick={() => onSelectPackage('6_months')} className="w-full py-3 px-4 bg-blue-50 text-blue-700 font-bold rounded-xl mt-auto hover:bg-blue-100">Pilih Paket</button>
        </div>
        {/* Paket 1 Tahun */}
        <div className="bg-blue-600 p-6 rounded-2xl shadow-xl border-2 border-blue-400 flex flex-col text-white transform md:-translate-y-4">
          <div className="bg-yellow-400 text-yellow-900 text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl absolute top-0 right-0">PROMO + BONUS 30 HARI</div>
          <h3 className="text-xl font-bold mb-2 mt-2">Paket 1 Tahun</h3>
          <div className="text-3xl font-extrabold mb-4">Rp 1.299k</div>
          <button onClick={() => onSelectPackage('1_year')} className="w-full py-3 px-4 bg-yellow-400 hover:bg-yellow-500 text-yellow-900 font-extrabold rounded-xl mt-auto transition-colors">Ambil Promo</button>
        </div>
      </div>
    </div>
  );
}

function PaymentScreen({ pkgId, onConfirm, onBack }) {
  const pkg = pricingPackages.find(p => p.id === pkgId);
  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl max-w-3xl w-full flex flex-col md:flex-row overflow-hidden border border-slate-200">
        <div className="bg-slate-50 w-full md:w-1/3 p-6 md:p-8 border-b md:border-r border-slate-200">
          <button onClick={onBack} className="text-sm font-bold text-slate-500 hover:text-slate-800 mb-6 flex items-center gap-1">← Kembali</button>
          <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">Tagihan</h3>
          <h2 className="text-xl font-bold text-slate-900 mb-1">{pkg.name}</h2>
          <div className="font-bold text-3xl text-blue-600 mt-4">Rp {pkg.price.toLocaleString('id-ID')}</div>
        </div>
        <div className="w-full md:w-2/3 p-6 md:p-8">
          <h2 className="text-2xl font-bold text-slate-900 mb-6">Pembayaran Manual</h2>
          <div className="bg-slate-50 p-6 rounded-xl border border-slate-200 mb-8">
            <div className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-4">Transfer ke Rekening Berikut:</div>
            <div className="flex items-center gap-4 bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
              <div className="w-16 h-16 bg-orange-100 text-orange-600 rounded-lg flex items-center justify-center font-black text-xl italic tracking-tighter">SeaBank</div>
              <div>
                <div className="text-2xl font-mono font-bold text-slate-900 tracking-wider">9010 6464 0699</div>
                <div className="text-sm text-slate-500 font-medium">a.n <span className="text-slate-800">Richky Irawan</span></div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4">Setelah menekan tombol di bawah, aplikasi Anda akan berada dalam status <b>Menunggu Verifikasi</b> hingga admin mengecek mutasi masuk.</p>
          </div>
          <button onClick={onConfirm} className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 rounded-xl text-lg shadow-lg">Saya Sudah Bayar</button>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// KOMPONEN APLIKASI UTAMA (BACK OFFICE & POS)
// ============================================================================
function DashboardScreen({ user, sales, trxCount, onSimulateLock }) {
  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex flex-col md:flex-row justify-between md:items-end mb-8 gap-4 border-b pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-slate-800">Dashboard</h2>
          <p className="text-slate-500 mt-1">Ringkasan operasional untuk <b>{user.storeName}</b>.</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-slate-500">Status Langganan: <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded uppercase tracking-wide">AKTIF</span></div>
          <button onClick={onSimulateLock} className="mt-2 text-[10px] bg-red-100 text-red-600 px-2 py-1 rounded hover:bg-red-200 font-bold uppercase transition-colors">Test Masa Habis</button>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Total Pendapatan (Shift Ini)</div>
          <div className="text-3xl font-extrabold text-green-600">Rp {sales.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="text-sm text-slate-500 font-bold uppercase tracking-wider mb-1">Jumlah Transaksi</div>
          <div className="text-3xl font-extrabold text-blue-600">{trxCount} <span className="text-lg text-slate-400 font-medium">Struk</span></div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// POS (KASIR)
// ---------------------------
function POSScreen({ products, cart, setCart, setProducts, shiftStatus, setShiftStatus, startCash, setStartCash, setTotalSales, setTotalTransactions, showMessage, employees, setCommissions }) {
  const [tempStartCash, setTempStartCash] = useState('');
  const [selectedSalesId, setSelectedSalesId] = useState(''); // Tracking pelayan

  // Filter karyawan yang punya role sales/pelayan
  const salesStaff = employees.filter(e => e.role === 'sales');

  if (shiftStatus === 'closed') {
    return (
      <div className="flex flex-col items-center justify-center h-full max-w-md mx-auto pt-20">
        <div className="bg-white p-8 rounded-2xl shadow-lg border w-full text-center">
          <h2 className="text-2xl font-bold mb-2">Buka Laci Kasir</h2>
          <p className="text-slate-500 text-sm mb-6">Masukkan modal awal (uang receh) di laci.</p>
          <input type="number" className="w-full text-center text-2xl font-bold p-4 border rounded-xl bg-slate-50 mb-4 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Rp 0" value={tempStartCash} onChange={(e) => setTempStartCash(e.target.value)} />
          <button onClick={() => { setStartCash(Number(tempStartCash)); setShiftStatus('open'); }} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors">Mulai Jualan</button>
        </div>
      </div>
    );
  }

  const addToCart = (product) => {
    if (product.stock <= 0) return showMessage('Stok habis!', 'error');
    const existing = cart.find(item => item.id === product.id);
    if (existing) setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    else setCart([...cart, { ...product, qty: 1 }]);
  };
  const total = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCheckout = () => {
    if (cart.length === 0) return;
    if (salesStaff.length > 0 && !selectedSalesId) {
      return showMessage('Mohon pilih Pelayan/Sales yang menangani pesanan ini!', 'error');
    }
    
    // Update Stok
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.qty } : p;
    });
    setProducts(updatedProducts);
    setTotalSales(prev => prev + total);
    setTotalTransactions(prev => prev + 1);
    
    // Hitung Komisi (Misal: 2% dari total struk)
    if (selectedSalesId) {
       const trxId = 'TRX-' + Date.now();
       const commissionAmt = total * 0.02; 
       setCommissions(prev => [...prev, { trxId, empId: selectedSalesId, amount: commissionAmt, totalSales: total }]);
       showMessage(`Transaksi Berhasil! Komisi Rp ${commissionAmt.toLocaleString('id-ID')} masuk ke target Sales.`, 'success');
    } else {
       showMessage(`Transaksi Berhasil!`, 'success');
    }

    setCart([]);
    setSelectedSalesId('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      <div className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
           <h2 className="text-2xl font-extrabold text-slate-800">Mesin Kasir</h2>
           <button onClick={() => { setShiftStatus('closed'); setTempStartCash(''); }} className="text-sm font-bold text-red-600 bg-red-50 px-4 py-2 rounded-lg border border-red-200 hover:bg-red-100 transition-colors">Tutup Laci</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-10">
          {products.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock <= 0} className={`p-4 border rounded-2xl text-left h-32 flex flex-col transition-all ${p.stock > 0 ? 'bg-white hover:border-blue-500 hover:shadow-md' : 'bg-slate-100 opacity-50'}`}>
              <div className="font-bold text-slate-800 line-clamp-2 mb-auto">{p.name}</div>
              <div>
                <div className="text-blue-600 font-extrabold">Rp {p.price.toLocaleString('id-ID')}</div>
                <div className="text-xs font-medium text-slate-400 mt-1">Sisa: {p.stock}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="w-full lg:w-96 bg-white border rounded-2xl flex flex-col shadow-sm">
        <div className="p-4 border-b bg-slate-50 flex justify-between items-center rounded-t-2xl"><h2 className="font-bold">Keranjang</h2><span className="bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded-full">{cart.length} Item</span></div>
        <div className="p-4 flex-1 overflow-y-auto">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-start border-b border-slate-50 pb-3 mb-3">
              <div className="flex-1 pr-2"><div className="font-bold text-sm leading-tight">{item.name}</div><div className="text-xs text-slate-500 mt-1">{item.qty} x Rp {item.price.toLocaleString('id-ID')}</div></div>
              <div className="font-extrabold text-sm whitespace-nowrap">Rp {(item.price * item.qty).toLocaleString('id-ID')}</div>
              <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="ml-3 text-red-400 hover:text-red-600"><Trash2 size={16} /></button>
            </div>
          ))}
          {cart.length === 0 && <div className="text-center text-slate-400 mt-10">Belum ada barang</div>}
        </div>
        
        {/* Pilihan Pelayan Untuk Komisi */}
        {salesStaff.length > 0 && cart.length > 0 && (
          <div className="p-4 border-t border-slate-100 bg-amber-50">
            <label className="block text-xs font-bold text-amber-800 mb-2 uppercase">Pelayan/Sales (Untuk Bonus)</label>
            <select className="w-full border border-amber-200 rounded p-2 text-sm outline-none bg-white focus:ring-2 focus:ring-amber-500" value={selectedSalesId} onChange={(e) => setSelectedSalesId(e.target.value)}>
              <option value="">-- Pilih Pelayan --</option>
              {salesStaff.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
        )}

        <div className="p-4 border-t bg-white rounded-b-2xl">
          <div className="flex justify-between items-end mb-4"><span className="text-sm font-bold text-slate-500">Total</span><span className="text-2xl font-extrabold text-blue-600">Rp {total.toLocaleString('id-ID')}</span></div>
          <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-green-600 text-white font-bold py-4 rounded-xl hover:bg-green-700 disabled:bg-slate-200 disabled:text-slate-400 flex justify-center items-center gap-2 transition-colors"><Printer size={20} /> Cetak & Bayar</button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------
// INVENTARIS & PELANGGAN 
// ---------------------------
function InventoryScreen({ products, setProducts, role, showMessage }) {
  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <h2 className="text-3xl font-extrabold text-slate-800">Inventaris Stok</h2>
      </div>
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b"><tr><th className="p-4 text-sm font-bold text-slate-600">Nama Produk</th><th className="p-4 text-sm font-bold text-slate-600">Harga</th><th className="p-4 text-sm font-bold text-center">Stok</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-800">{p.name}</td>
                <td className="p-4">Rp {p.price.toLocaleString('id-ID')}</td>
                <td className="p-4 text-center"><span className={`px-3 py-1 rounded-full text-xs font-bold ${p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{p.stock}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerScreen({ customers }) {
  return (
    <div className="max-w-5xl mx-auto pb-10">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-8 border-b pb-6">Data Pelanggan</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 hover:border-blue-300 transition-colors">
            <div className="font-extrabold text-xl text-slate-800">{c.name}</div>
            <div className="text-slate-500 text-sm mt-1 mb-4">{c.phone || '-'}</div>
            <div className="pt-4 border-t flex justify-between items-center"><span className="text-xs font-bold text-slate-400">POIN LOYALITAS</span><span className="font-black text-yellow-500 text-lg">{c.points} Pts</span></div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ============================================================================
// MODUL BARU: HR & PENGGAJIAN (Karyawan, Absensi, Payroll)
// ============================================================================
function EmployeeScreen({ employees, setEmployees, showMessage }) {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', role: 'cashier', phone: '', baseSalary: '' });

  const roleLabels = {
    'manager': 'Manager Toko',
    'admin': 'Admin/Backoffice',
    'gudang': 'Staff Gudang',
    'cashier': 'Kasir Utama',
    'sales': 'Sales / Pelayan'
  };

  const handleAdd = (e) => {
    e.preventDefault();
    if (!formData.name) return;
    setEmployees([...employees, { id: 'e' + Date.now(), name: formData.name, role: formData.role, phone: formData.phone, baseSalary: Number(formData.baseSalary) || 0 }]);
    setShowForm(false);
    setFormData({ name: '', role: 'cashier', phone: '', baseSalary: '' });
    showMessage('Data Karyawan berhasil ditambahkan!', 'success');
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div>
           <h2 className="text-3xl font-extrabold text-slate-800">Manajemen Karyawan</h2>
           <p className="text-slate-500 mt-1">Kelola data staf dan pembagian peran (role) di toko Anda.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 hover:bg-blue-700 font-bold shadow-md transition-colors">
          <UserPlus size={18} /> Tambah Karyawan
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 mb-8 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
          <div><label className="block text-xs font-bold text-slate-500 mb-1">Nama Lengkap</label><input required className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} /></div>
          <div><label className="block text-xs font-bold text-slate-500 mb-1">Peran (Role)</label>
            <select className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})}>
              <option value="manager">Manager Toko</option>
              <option value="admin">Admin</option>
              <option value="gudang">Staff Gudang</option>
              <option value="cashier">Kasir</option>
              <option value="sales">Sales / Pelayan (Dapat Komisi)</option>
            </select>
          </div>
          <div><label className="block text-xs font-bold text-slate-500 mb-1">No. HP</label><input className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
          <div><label className="block text-xs font-bold text-slate-500 mb-1">Gaji Pokok (Rp)</label><input type="number" required className="w-full border p-2 rounded outline-none focus:ring-2 focus:ring-blue-500" value={formData.baseSalary} onChange={e => setFormData({...formData, baseSalary: e.target.value})} /></div>
          <div className="col-span-full mt-2"><button type="submit" className="bg-green-600 text-white px-6 py-2 rounded font-bold w-full md:w-auto hover:bg-green-700 transition-colors">Simpan Karyawan</button></div>
        </form>
      )}

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b"><tr><th className="p-4 font-bold text-slate-600">Nama</th><th className="p-4 font-bold text-slate-600">Peran</th><th className="p-4 font-bold text-slate-600">Gaji Pokok</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map(emp => (
              <tr key={emp.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold text-slate-800">{emp.name}<div className="text-xs text-slate-400 font-normal">{emp.phone}</div></td>
                <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold border border-blue-100">{roleLabels[emp.role] || emp.role}</span></td>
                <td className="p-4 text-slate-600 font-medium">Rp {emp.baseSalary.toLocaleString('id-ID')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function AttendanceScreen({ employees, attendance, setAttendance, showMessage }) {
  const today = new Date().toLocaleDateString('id-ID');

  const handleAbsen = (empId, type) => {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const existingIndex = attendance.findIndex(a => a.empId === empId && a.date === today);

    let newAttendance = [...attendance];
    if (existingIndex >= 0) {
      if (type === 'in' && !newAttendance[existingIndex].checkIn) newAttendance[existingIndex].checkIn = time;
      if (type === 'out' && !newAttendance[existingIndex].checkOut) newAttendance[existingIndex].checkOut = time;
    } else {
      newAttendance.push({ empId, date: today, checkIn: type === 'in' ? time : null, checkOut: type === 'out' ? time : null });
    }
    setAttendance(newAttendance);
    showMessage(`Absensi ${type === 'in' ? 'Masuk' : 'Pulang'} berhasil dicatat!`, 'success');
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div><h2 className="text-3xl font-extrabold text-slate-800">Absensi Harian</h2><p className="text-slate-500 mt-1">Tanggal Hari Ini: <span className="font-bold text-blue-600">{today}</span></p></div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {employees.map(emp => {
          const record = attendance.find(a => a.empId === emp.id && a.date === today) || {};
          return (
            <div key={emp.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
              <div className="font-bold text-lg mb-1">{emp.name}</div>
              <div className="text-xs text-slate-400 mb-4 uppercase tracking-wider">{emp.role}</div>
              
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-500 mb-1">JAM MASUK</div>
                  {record.checkIn ? <div className="text-lg font-bold text-green-600">{record.checkIn}</div> : <button onClick={() => handleAbsen(emp.id, 'in')} className="bg-green-100 text-green-700 px-3 py-1 rounded text-sm font-bold w-full hover:bg-green-200 transition-colors">Catat</button>}
                </div>
                <div className="flex-1">
                  <div className="text-xs font-bold text-slate-500 mb-1">JAM PULANG</div>
                  {record.checkOut ? <div className="text-lg font-bold text-blue-600">{record.checkOut}</div> : <button onClick={() => handleAbsen(emp.id, 'out')} disabled={!record.checkIn} className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm font-bold w-full hover:bg-blue-200 disabled:opacity-50 transition-colors">Catat</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PayrollScreen({ employees, commissions }) {
  // Hitung komisi per karyawan
  const getCommission = (empId) => commissions.filter(c => c.empId === empId).reduce((sum, c) => sum + c.amount, 0);

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8 border-b pb-6">
        <div><h2 className="text-3xl font-extrabold text-slate-800">Rekap Gaji & Bonus</h2><p className="text-slate-500 mt-1">Estimasi gaji bulanan dan akumulasi komisi pelayan/sales (2% per transaksi).</p></div>
        <button className="bg-slate-800 text-white px-4 py-2 rounded font-bold flex items-center gap-2 hover:bg-slate-700 transition-colors"><FileText size={18}/> Cetak Slip</button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b"><tr><th className="p-4 font-bold text-slate-600">Karyawan</th><th className="p-4 font-bold text-slate-600">Gaji Pokok</th><th className="p-4 font-bold text-slate-600 text-green-600">Total Komisi (Bonus)</th><th className="p-4 font-bold text-slate-600">Total Take Home Pay</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {employees.map(emp => {
              const bonus = getCommission(emp.id);
              const total = emp.baseSalary + bonus;
              return (
                <tr key={emp.id} className="hover:bg-slate-50">
                  <td className="p-4 font-bold text-slate-800">{emp.name} <span className="block text-xs font-normal text-slate-400 mt-1 uppercase">{emp.role}</span></td>
                  <td className="p-4 text-slate-600">Rp {emp.baseSalary.toLocaleString('id-ID')}</td>
                  <td className="p-4 font-bold text-green-600">Rp {bonus.toLocaleString('id-ID')}</td>
                  <td className="p-4 font-extrabold text-blue-600 text-lg">Rp {total.toLocaleString('id-ID')}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
