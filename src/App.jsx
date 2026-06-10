```react
import React, { useState, useEffect } from 'react';
import { ShoppingCart, Package, Users, LogOut, Plus, Printer, Trash2, LayoutDashboard, Store, QrCode, CreditCard, ChevronRight, CheckCircle2, Lock, XCircle, AlertTriangle, Briefcase, CalendarClock, Wallet, Clock, UserPlus, FileText, Settings, Edit, Palette, ScanBarcode, ArrowRight } from 'lucide-react';

// --- DATA AWAL (BISA DIHAPUS/DIEDIT DARI UI NANTI) ---
const initialProducts = [
  { id: '1', name: 'Kopi Susu Gula Aren', price: 18000, modal: 12000, stock: 50, grosirQty: 10, grosirPrice: 15000 },
  { id: '2', name: 'Beras Pandan Wangi 5kg', price: 65000, modal: 58000, stock: 20, grosirQty: 5, grosirPrice: 63000 },
  { id: '3', name: 'Minyak Goreng 2L', price: 34000, modal: 30000, stock: 15, grosirQty: 0, grosirPrice: 0 },
];
const initialCustomers = [{ id: '1', name: 'Budi Santoso', phone: '08123456789', hutang: 0 }];
const initialEmployees = [
  { id: 'e1', name: 'Owner', role: 'owner', baseSalary: 0 },
  { id: 'e2', name: 'Siti (Kasir)', role: 'cashier', baseSalary: 2000000 },
];

const THEMES = {
  blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', light: 'bg-blue-50' },
  emerald: { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-600', light: 'bg-emerald-50' },
  rose: { bg: 'bg-rose-600', hover: 'hover:bg-rose-700', text: 'text-rose-600', light: 'bg-rose-50' },
  violet: { bg: 'bg-violet-600', hover: 'hover:bg-violet-700', text: 'text-violet-600', light: 'bg-violet-50' },
  orange: { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', text: 'text-orange-600', light: 'bg-orange-50' }
};

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [appUser, setAppUser] = useState(null);
  const [stores, setStores] = useState([]); // Untuk Superadmin
  const [globalMessage, setGlobalMessage] = useState(null);

  // App States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);
  const [employees, setEmployees] = useState(initialEmployees);
  const [attendance, setAttendance] = useState([]);
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [expenses, setExpenses] = useState([]);
  
  // Store Settings
  const [storeSettings, setStoreSettings] = useState({ name: 'Toko Siak POS', theme: 'blue' });

  const showMessage = (text, type = 'success') => {
    setGlobalMessage({ text, type });
    setTimeout(() => setGlobalMessage(null), 3000);
  };

  const themeColors = THEMES[storeSettings.theme] || THEMES.blue;

  // --- LOGIC AUTHENTICATION ---
  const handleAuth = (type, data) => {
    if (type === 'login') {
      if (data.username === 'superadmin' && data.password === '123') {
        setAppUser({ role: 'superadmin', name: 'Super Administrator' });
        setCurrentView('admin_panel');
      } else if (data.username === 'admin' && data.password === '123') {
        const dummyExpiry = new Date();
        dummyExpiry.setDate(dummyExpiry.getDate() + 30);
        setAppUser({ role: 'owner', name: 'Bapak Owner', status: 'trial', expiryDate: dummyExpiry.toISOString() });
        setStoreSettings({ ...storeSettings, name: 'Toko Demo Utama' });
        setCurrentView('app');
      } else if (data.username === 'kasir' && data.password === '123') {
        setAppUser({ role: 'cashier', name: 'Siti Kasir', status: 'lifetime' });
        setCurrentView('app');
      } else {
        showMessage('Username/Password salah! Cek info akun demo.', 'error');
      }
    } else if (type === 'register') {
      // Pendaftaran Baru -> Otomatis TRIAL 30 Hari
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30);
      
      const newStore = { id: Date.now(), name: data.storeName, status: 'trial', expiryDate: expiry.toISOString() };
      setStores([...stores, newStore]);
      
      setAppUser({ role: 'owner', name: data.username, status: 'trial', expiryDate: expiry.toISOString() });
      setStoreSettings({ ...storeSettings, name: data.storeName });
      showMessage('Pendaftaran Berhasil! Nikmati 30 Hari Gratis.', 'success');
      setCurrentView('app'); // Langsung masuk tanpa di-lock!
    }
  };

  // --- RBAC CHECK ---
  const hasAccess = (tab) => {
    const role = appUser?.role;
    if (role === 'owner' || role === 'manager') return true;
    if (role === 'admin') return ['dashboard', 'inventory', 'customers', 'expenses'].includes(tab);
    if (role === 'gudang') return ['inventory'].includes(tab);
    if (role === 'cashier' || role === 'sales') return ['pos', 'customers', 'attendance'].includes(tab);
    return false;
  };

  // --- RENDER VIEWS ---
  if (currentView === 'landing') return <LandingPage onNavigate={setCurrentView} theme={THEMES.blue} />;
  if (currentView === 'auth') return <AuthScreen onAuth={handleAuth} theme={THEMES.blue} />;
  
  if (currentView === 'admin_panel') {
    return <SuperAdminPanel stores={stores} setStores={setStores} onLogout={() => {setAppUser(null); setCurrentView('landing');}} showMessage={showMessage} />;
  }

  if (currentView === 'payment') {
    return <PaymentInstructionScreen onBack={() => setCurrentView('app')} themeColors={themeColors} />;
  }

  // APP VIEW
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 overflow-hidden">
      {globalMessage && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl shadow-2xl text-white font-bold flex items-center gap-2 animate-bounce ${globalMessage.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {globalMessage.type === 'success' ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
          {globalMessage.text}
        </div>
      )}

      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col transition-all duration-300 print:hidden shadow-xl z-20">
        <div className={`p-6 ${themeColors.bg} border-b border-white/10 flex items-center gap-3`}>
          <div className="bg-white/20 p-2 rounded-lg"><Store size={24} className="text-white" /></div>
          <div>
            <h2 className="font-extrabold text-lg leading-tight truncate">{storeSettings.name}</h2>
            <p className="text-xs text-white/70 uppercase tracking-wider mt-1">{appUser?.role}</p>
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {hasAccess('dashboard') && <SidebarBtn icon={<LayoutDashboard size={20}/>} label="Dashboard Laba" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} theme={themeColors} />}
          {hasAccess('pos') && <SidebarBtn icon={<ShoppingCart size={20}/>} label="Mesin Kasir" active={activeTab === 'pos'} onClick={() => setActiveTab('pos')} theme={themeColors} />}
          {hasAccess('inventory') && <SidebarBtn icon={<Package size={20}/>} label="Inventaris & Grosir" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} theme={themeColors} />}
          {hasAccess('customers') && <SidebarBtn icon={<Users size={20}/>} label="Pelanggan & Piutang" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} theme={themeColors} />}
          
          {hasAccess('employees') && (
            <>
              <div className="pt-4 pb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">HR & Operasional</div>
              <SidebarBtn icon={<Briefcase size={20}/>} label="Data Karyawan" active={activeTab === 'employees'} onClick={() => setActiveTab('employees')} theme={themeColors} />
              <SidebarBtn icon={<CalendarClock size={20}/>} label="Absensi & Shift" active={activeTab === 'attendance'} onClick={() => setActiveTab('attendance')} theme={themeColors} />
            </>
          )}

          {appUser?.role === 'owner' && (
            <>
              <div className="pt-4 pb-2 px-3 text-xs font-bold text-slate-500 uppercase tracking-wider">Sistem</div>
              <SidebarBtn icon={<Settings size={20}/>} label="Pengaturan Toko" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} theme={themeColors} />
            </>
          )}
        </nav>
        <button onClick={() => {setAppUser(null); setCurrentView('landing');}} className="m-4 p-4 flex items-center justify-center gap-2 bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-bold">
          <LogOut size={20}/> Keluar
        </button>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {/* Top Trial Banner */}
        {appUser?.status === 'trial' && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-3 text-center text-sm font-bold flex justify-center items-center gap-4 shadow-md z-10">
            <AlertTriangle size={18} /> MASA PERCOBAAN GRATIS: Sisa waktu 30 Hari. 
            <button onClick={() => setCurrentView('payment')} className="bg-white text-orange-600 px-4 py-1 rounded-full text-xs hover:bg-orange-50 shadow transition-transform hover:scale-105">Upgrade Lifetime</button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto p-4 md:p-8 bg-slate-50/50 relative">
          {activeTab === 'dashboard' && <DashboardScreen transactions={transactions} expenses={expenses} theme={themeColors} />}
          {activeTab === 'pos' && <POSScreen products={products} setProducts={setProducts} customers={customers} setCustomers={setCustomers} transactions={transactions} setTransactions={setTransactions} showMessage={showMessage} theme={themeColors} />}
          {activeTab === 'inventory' && <InventoryScreen products={products} setProducts={setProducts} showMessage={showMessage} theme={themeColors} />}
          {activeTab === 'customers' && <CustomerScreen customers={customers} setCustomers={setCustomers} showMessage={showMessage} theme={themeColors} />}
          {activeTab === 'employees' && <EmployeeScreen employees={employees} setEmployees={setEmployees} showMessage={showMessage} theme={themeColors} />}
          {activeTab === 'attendance' && <AttendanceScreen employees={employees} attendance={attendance} setAttendance={setAttendance} showMessage={showMessage} theme={themeColors} />}
          {activeTab === 'settings' && <SettingsScreen storeSettings={storeSettings} setStoreSettings={setStoreSettings} themes={THEMES} showMessage={showMessage} theme={themeColors} />}
        </div>
      </main>
    </div>
  );
}

// ==========================================
// 1. LANDING PAGE & AUTH
// ==========================================
function LandingPage({ onNavigate, theme }) {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b z-50 px-6 py-4 flex justify-between items-center shadow-sm">
        <div className={`font-extrabold text-2xl flex items-center gap-2 ${theme.text}`}><Store size={28}/> Siak POS</div>
        <div className="space-x-2 md:space-x-4">
          <button onClick={() => onNavigate('auth')} className="text-slate-600 font-bold hover:text-blue-600 px-4 py-2">Masuk</button>
          <button onClick={() => onNavigate('auth')} className={`${theme.bg} text-white px-6 py-2.5 rounded-full font-bold hover:shadow-lg hover:shadow-blue-200 transition-all transform hover:-translate-y-0.5`}>Coba Gratis 30 Hari</button>
        </div>
      </nav>

      {/* Hero */}
      <div className="pt-32 pb-20 px-6 text-center max-w-5xl mx-auto">
        <div className="inline-block bg-blue-100 text-blue-700 font-bold px-4 py-1.5 rounded-full text-sm mb-6 animate-pulse">✨ Aplikasi Kasir Warung & UMKM No.1</div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">Kelola Warung Lebih Rapi.<br/>Cukup <span className={`${theme.text} underline decoration-wavy`}>Sekali Beli</span> Selamanya.</h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">Tinggalkan buku catatan manual. Catat penjualan, hutang pelanggan, stok grosir, hingga absensi karyawan secara otomatis. Tanpa biaya langganan bulanan!</p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <button onClick={() => onNavigate('auth')} className={`${theme.bg} text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-200 hover:scale-105 transition-transform flex items-center justify-center gap-2`}>
            Daftar Sekarang <ArrowRight size={20}/>
          </button>
        </div>
      </div>

      {/* Info Akun Demo */}
      <div className="max-w-4xl mx-auto mb-20 p-8 bg-white rounded-3xl shadow-xl border border-slate-100 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-2 h-full ${theme.bg}`}></div>
        <h3 className="text-2xl font-bold mb-4 flex items-center gap-2"><Lock className={theme.text}/> Penasaran? Coba Akun Demo!</h3>
        <p className="text-slate-600 mb-6">Klik tombol 'Masuk' di atas dan gunakan akun berikut untuk melihat langsung kecanggihan Siak POS tanpa perlu mendaftar.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <div className="text-xs font-bold text-slate-400 uppercase mb-1">Akses Owner/Manager</div>
             <div className="font-mono text-lg font-bold text-slate-800">admin / 123</div>
          </div>
          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
             <div className="text-xs font-bold text-slate-400 uppercase mb-1">Akses Kasir Depan</div>
             <div className="font-mono text-lg font-bold text-slate-800">kasir / 123</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AuthScreen({ onAuth, theme }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', storeName: '' });

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <div className="bg-white p-8 md:p-10 rounded-3xl shadow-2xl max-w-md w-full border border-slate-100 relative overflow-hidden">
        <div className={`absolute top-0 left-0 w-full h-2 ${theme.bg}`}></div>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">{isLogin ? 'Selamat Datang' : 'Mulai Coba Gratis'}</h2>
          <p className="text-slate-500">{isLogin ? 'Masuk ke dashboard toko Anda' : 'Buat akun dan nikmati 30 hari pertama gratis'}</p>
        </div>

        <div className="space-y-4">
          {!isLogin && (
            <div>
              <label className="block text-sm font-bold text-slate-700 mb-1">Nama Toko / Warung</label>
              <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Contoh: Toko Berkah" onChange={e => setForm({...form, storeName: e.target.value})} />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
            <input required className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="Username Anda" onChange={e => setForm({...form, username: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input required type="password" className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all" placeholder="••••••••" onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          
          <button onClick={() => onAuth(isLogin ? 'login' : 'register', form)} className={`w-full ${theme.bg} text-white font-bold py-4 rounded-xl shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all mt-6 text-lg`}>
            {isLogin ? 'Masuk Sekarang' : 'Daftar & Mulai 30 Hari Gratis'}
          </button>
        </div>

        <div className="mt-8 text-center border-t pt-6">
          <p className="text-slate-500 text-sm">
            {isLogin ? "Belum punya akun? " : "Sudah punya akun? "}
            <button onClick={() => setIsLogin(!isLogin)} className={`font-bold ${theme.text} hover:underline`}>{isLogin ? 'Daftar Gratis' : 'Masuk di sini'}</button>
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. MAIN APP COMPONENTS (DASHBOARD & POS)
// ==========================================
function DashboardScreen({ transactions, expenses, theme }) {
  // Simple Analysis
  const totalOmzet = transactions.reduce((sum, trx) => sum + trx.total, 0);
  const totalModal = transactions.reduce((sum, trx) => {
    return sum + trx.items.reduce((itemSum, item) => itemSum + (item.modal * item.qty), 0);
  }, 0);
  const kotor = totalOmzet - totalModal;
  const totalPengeluaran = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const labaBersih = kotor - totalPengeluaran;

  return (
    <div className="max-w-6xl mx-auto animate-fade-in pb-20">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Analisis WarungKu</h2>
      <p className="text-slate-500 mb-8">Ringkasan performa penjualan dan laba otomatis.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        <StatCard title="Total Omzet (Kotor)" value={`Rp ${totalOmzet.toLocaleString('id-ID')}`} color="text-blue-600" bg="bg-blue-50" />
        <StatCard title="Laba Kotor" value={`Rp ${kotor.toLocaleString('id-ID')}`} color="text-emerald-600" bg="bg-emerald-50" />
        <StatCard title="Total Pengeluaran" value={`Rp ${totalPengeluaran.toLocaleString('id-ID')}`} color="text-red-600" bg="bg-red-50" />
        <div className={`${theme.bg} p-6 rounded-3xl shadow-xl text-white transform hover:-translate-y-1 transition-transform`}>
          <div className="text-sm font-bold uppercase tracking-wider mb-2 opacity-80">Laba Bersih</div>
          <div className="text-3xl font-extrabold">Rp {labaBersih.toLocaleString('id-ID')}</div>
        </div>
      </div>
    </div>
  );
}

function POSScreen({ products, setProducts, customers, setCustomers, transactions, setTransactions, showMessage, theme }) {
  const [cart, setCart] = useState([]);
  const [selectedCust, setSelectedCust] = useState('');
  const [barcode, setBarcode] = useState('');

  // Handle Input Barcode (Tekan Enter)
  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === barcode || p.name.toLowerCase().includes(barcode.toLowerCase()));
    if (product) {
      addToCart(product);
      setBarcode('');
    } else {
      showMessage('Barang tidak ditemukan!', 'error');
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return showMessage('Stok habis!', 'error');
    let currentCart = [...cart];
    const existIndex = currentCart.findIndex(i => i.id === product.id);
    
    if (existIndex >= 0) {
      currentCart[existIndex].qty += 1;
    } else {
      currentCart.push({ ...product, qty: 1 });
    }

    // Cek Harga Grosir Otomatis
    currentCart = currentCart.map(item => {
      if (item.grosirQty > 0 && item.qty >= item.grosirQty) {
        return { ...item, appliedPrice: item.grosirPrice, isGrosir: true };
      }
      return { ...item, appliedPrice: item.price, isGrosir: false };
    });

    setCart(currentCart);
  };

  const removeFromCart = (id) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const totalCart = cart.reduce((sum, item) => sum + (item.appliedPrice * item.qty), 0);

  const handleCheckout = (isHutang = false) => {
    if (cart.length === 0) return;
    if (isHutang && !selectedCust) return showMessage('Pilih pelanggan dulu untuk catat hutang!', 'error');

    // Kurangi Stok
    const updatedProducts = products.map(p => {
      const c = cart.find(i => i.id === p.id);
      return c ? { ...p, stock: p.stock - c.qty } : p;
    });
    setProducts(updatedProducts);

    // Jika Hutang, tambah piutang ke pelanggan
    if (isHutang) {
      setCustomers(customers.map(c => c.id === selectedCust ? { ...c, hutang: c.hutang + totalCart } : c));
    }

    // Catat Transaksi
    const trx = { id: 'TRX'+Date.now(), items: cart, total: totalCart, date: new Date().toISOString(), type: isHutang ? 'Hutang' : 'Lunas', custId: selectedCust };
    setTransactions([...transactions, trx]);

    showMessage(isHutang ? 'Hutang Berhasil Dicatat!' : 'Pembayaran Lunas Berhasil!', 'success');
    setCart([]);
    setSelectedCust('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full pb-10">
      {/* Area Produk */}
      <div className="flex-1 flex flex-col">
        <form onSubmit={handleBarcodeSubmit} className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <ScanBarcode className="absolute left-4 top-4 text-slate-400" size={20} />
            <input type="text" autoFocus placeholder="Scan Barcode atau ketik nama barang... (Lalu tekan Enter)" className="w-full pl-12 pr-4 py-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-blue-500 outline-none text-lg" value={barcode} onChange={e => setBarcode(e.target.value)} />
          </div>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto">
          {products.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock <= 0} className={`p-5 rounded-3xl text-left flex flex-col justify-between transition-all border-2 border-transparent ${p.stock > 0 ? `bg-white shadow-sm hover:shadow-lg ${theme.hover} hover:text-white group` : 'bg-slate-100 opacity-50 cursor-not-allowed'}`}>
              <div className="font-bold text-slate-800 group-hover:text-white line-clamp-2 mb-4 leading-snug">{p.name}</div>
              <div>
                <div className={`text-lg font-extrabold ${theme.text} group-hover:text-white`}>Rp {p.price.toLocaleString('id-ID')}</div>
                {p.grosirQty > 0 && <div className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full inline-block mt-1">Grosir: Beli {p.grosirQty} Rp {p.grosirPrice/1000}k</div>}
                <div className="text-xs font-medium text-slate-400 mt-2 group-hover:text-blue-100">Stok: {p.stock}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Area Keranjang */}
      <div className="w-full lg:w-96 bg-white rounded-3xl shadow-xl flex flex-col border border-slate-100 overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
          <h2 className="font-extrabold text-xl">Struk Kasir</h2>
          <span className={`${theme.light} ${theme.text} text-xs font-bold px-3 py-1.5 rounded-full`}>{cart.length} Barang</span>
        </div>
        
        <div className="p-6 flex-1 overflow-y-auto bg-white space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-bold text-slate-800 leading-tight">{item.name}</div>
                <div className="text-xs text-slate-500 mt-1">{item.qty} x Rp {item.appliedPrice.toLocaleString('id-ID')}</div>
                {item.isGrosir && <div className="text-[10px] text-orange-500 font-bold">Harga Grosir Aktif</div>}
              </div>
              <div className="font-extrabold text-slate-800">Rp {(item.appliedPrice * item.qty).toLocaleString('id-ID')}</div>
              <button onClick={() => removeFromCart(item.id)} className="ml-4 text-red-300 hover:text-red-500"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100">
          <select className="w-full mb-4 p-3 rounded-xl border border-slate-200 text-sm outline-none bg-white" value={selectedCust} onChange={e => setSelectedCust(e.target.value)}>
            <option value="">-- Pilih Pelanggan (Opsional) --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>

          <div className="flex justify-between items-end mb-6">
            <span className="text-sm font-bold text-slate-500">TOTAL BAYAR</span>
            <span className={`text-3xl font-black ${theme.text}`}>Rp {totalCart.toLocaleString('id-ID')}</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleCheckout(true)} disabled={cart.length === 0} className="w-full bg-yellow-400 text-yellow-900 font-bold py-4 rounded-2xl hover:bg-yellow-500 disabled:opacity-50">Bayar Nanti (Hutang)</button>
            <button onClick={() => handleCheckout(false)} disabled={cart.length === 0} className={`w-full ${theme.bg} text-white font-bold py-4 rounded-2xl shadow-lg hover:-translate-y-1 transition-transform disabled:opacity-50 disabled:transform-none`}>Lunas & Cetak</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. INVENTORY, CUSTOMERS, HRIS (WITH EDIT/DELETE)
// ==========================================
function InventoryScreen({ products, setProducts, showMessage, theme }) {
  const [form, setForm] = useState({ id: '', name: '', price: '', modal: '', stock: '', grosirQty: '0', grosirPrice: '0' });
  const [isEditing, setIsEditing] = useState(false);

  const saveProduct = (e) => {
    e.preventDefault();
    if(isEditing) {
      setProducts(products.map(p => p.id === form.id ? { ...p, ...form, price: Number(form.price), modal: Number(form.modal), stock: Number(form.stock), grosirQty: Number(form.grosirQty), grosirPrice: Number(form.grosirPrice) } : p));
      showMessage('Produk diperbarui!');
    } else {
      setProducts([...products, { ...form, id: Date.now().toString(), price: Number(form.price), modal: Number(form.modal), stock: Number(form.stock), grosirQty: Number(form.grosirQty), grosirPrice: Number(form.grosirPrice) }]);
      showMessage('Produk ditambahkan!');
    }
    setForm({ id: '', name: '', price: '', modal: '', stock: '', grosirQty: '0', grosirPrice: '0' });
    setIsEditing(false);
  };

  const deleteProduct = (id) => {
    setProducts(products.filter(p => p.id !== id));
    showMessage('Produk dihapus!', 'success');
  }

  const shareWA = () => {
    const text = `*Katalog Toko*\n\n` + products.map(p => `- ${p.name}: Rp ${p.price.toLocaleString('id-ID')}`).join('\n');
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-3xl font-extrabold text-slate-800">Manajemen Stok & Harga</h2>
        <button onClick={shareWA} className="bg-emerald-500 text-white px-4 py-2 rounded-xl font-bold hover:bg-emerald-600 flex items-center gap-2">Share WA</button>
      </div>

      <form onSubmit={saveProduct} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input required placeholder="Nama Barang" className="border p-3 rounded-xl" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input required type="number" placeholder="Harga Jual" className="border p-3 rounded-xl" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
        <input required type="number" placeholder="Harga Modal (Kulakan)" className="border p-3 rounded-xl" value={form.modal} onChange={e => setForm({...form, modal: e.target.value})} />
        <input required type="number" placeholder="Stok" className="border p-3 rounded-xl" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
        <input type="number" placeholder="Batas Qty Grosir (Opsional)" className="border p-3 rounded-xl" value={form.grosirQty} onChange={e => setForm({...form, grosirQty: e.target.value})} />
        <input type="number" placeholder="Harga Grosir (Opsional)" className="border p-3 rounded-xl" value={form.grosirPrice} onChange={e => setForm({...form, grosirPrice: e.target.value})} />
        <div className="md:col-span-3 flex gap-2">
           <button type="submit" className={`${theme.bg} text-white px-8 py-3 rounded-xl font-bold`}>{isEditing ? 'Simpan Perubahan' : 'Tambah Barang'}</button>
           {isEditing && <button type="button" onClick={() => {setIsEditing(false); setForm({id:'', name:'', price:'', modal:'', stock:'', grosirQty:'0', grosirPrice:'0'});}} className="bg-slate-200 px-6 py-3 rounded-xl font-bold">Batal</button>}
        </div>
      </form>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b"><tr><th className="p-4">Barang</th><th className="p-4">H.Jual / H.Modal</th><th className="p-4">Stok</th><th className="p-4 text-right">Aksi</th></tr></thead>
          <tbody className="divide-y divide-slate-50">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50">
                <td className="p-4 font-bold">{p.name} {p.grosirQty > 0 && <span className="bg-orange-100 text-orange-600 text-[10px] px-2 py-1 rounded ml-2">Ada Grosir</span>}</td>
                <td className="p-4"><span className="text-blue-600 font-bold">Rp{p.price.toLocaleString('id-ID')}</span> / <span className="text-slate-400 text-sm">Rp{p.modal.toLocaleString('id-ID')}</span></td>
                <td className="p-4 font-bold">{p.stock}</td>
                <td className="p-4 text-right space-x-2">
                  <button onClick={() => {setForm(p); setIsEditing(true);}} className="text-blue-500 p-2 bg-blue-50 rounded-lg"><Edit size={16}/></button>
                  <button onClick={() => deleteProduct(p.id)} className="text-red-500 p-2 bg-red-50 rounded-lg"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerScreen({ customers, setCustomers, showMessage, theme }) {
  const [name, setName] = useState('');
  
  const addCust = (e) => {
    e.preventDefault();
    setCustomers([...customers, { id: Date.now().toString(), name, hutang: 0 }]);
    setName('');
    showMessage('Pelanggan Ditambah!');
  };
  const deleteCust = (id) => setCustomers(customers.filter(c => c.id !== id));

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-6">Buku Hutang Pelanggan</h2>
      <form onSubmit={addCust} className="flex gap-4 mb-8">
        <input required placeholder="Nama Pelanggan Baru..." className="flex-1 p-4 rounded-xl border focus:ring-2 outline-none" value={name} onChange={e=>setName(e.target.value)} />
        <button type="submit" className={`${theme.bg} text-white px-8 font-bold rounded-xl`}>Tambah</button>
      </form>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-3xl shadow-sm border flex justify-between items-center">
            <div>
              <div className="font-bold text-lg">{c.name}</div>
              <div className="text-sm font-bold mt-1">Sisa Hutang: <span className="text-red-500 font-extrabold">Rp {c.hutang.toLocaleString('id-ID')}</span></div>
            </div>
            <button onClick={() => deleteCust(c.id)} className="text-slate-400 hover:text-red-500"><Trash2 size={20}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// === NEW ATTENDANCE WITH SHIFTS ===
function AttendanceScreen({ employees, attendance, setAttendance, showMessage, theme }) {
  const today = new Date().toLocaleDateString('id-ID');
  const [selectedShift, setSelectedShift] = useState('Pagi (07.00-15.00)');

  const handleAbsen = (empId, type) => {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const existingIndex = attendance.findIndex(a => a.empId === empId && a.date === today);

    let newAtt = [...attendance];
    if (existingIndex >= 0) {
      if (type === 'in') newAtt[existingIndex] = {...newAtt[existingIndex], checkIn: time, shift: selectedShift};
      if (type === 'out') newAtt[existingIndex] = {...newAtt[existingIndex], checkOut: time};
    } else {
      newAtt.push({ id: Date.now(), empId, date: today, shift: selectedShift, checkIn: type === 'in' ? time : null, checkOut: type === 'out' ? time : null });
    }
    setAttendance(newAtt);
    showMessage(`Absen ${type === 'in' ? 'Masuk' : 'Pulang'} berhasil!`);
  };

  return (
    <div className="max-w-5xl mx-auto pb-20">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-6">Absensi & Shift Kerja</h2>
      
      <div className="bg-white p-6 rounded-3xl shadow-sm border mb-8 flex items-center gap-4">
        <label className="font-bold text-slate-600">Pilih Shift Kerja Saat Ini:</label>
        <select className="border p-2 rounded-xl outline-none font-bold" value={selectedShift} onChange={e=>setSelectedShift(e.target.value)}>
          <option value="Pagi (07.00-15.00)">Shift Pagi (07.00 - 15.00)</option>
          <option value="Sore (15.00-23.00)">Shift Sore (15.00 - 23.00)</option>
          <option value="Malam (23.00-07.00)">Shift Malam (23.00 - 07.00)</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employees.map(emp => {
          const record = attendance.find(a => a.empId === emp.id && a.date === today) || {};
          return (
            <div key={emp.id} className="bg-white p-6 rounded-3xl shadow-sm border flex flex-col justify-between">
              <div className="mb-4">
                <div className="font-extrabold text-xl">{emp.name}</div>
                <div className="text-xs text-slate-400 uppercase">{emp.role}</div>
                {record.shift && <div className="text-xs font-bold text-blue-500 bg-blue-50 px-2 py-1 rounded inline-block mt-2">{record.shift}</div>}
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                   <div className="text-[10px] font-bold text-slate-400 mb-1">JAM MASUK</div>
                   {record.checkIn ? <div className="font-bold text-emerald-600 text-lg">{record.checkIn}</div> : <button onClick={()=>handleAbsen(emp.id, 'in')} className="w-full bg-slate-100 text-slate-600 font-bold py-2 rounded-xl hover:bg-emerald-100 hover:text-emerald-700">Masuk</button>}
                </div>
                <div className="flex-1">
                   <div className="text-[10px] font-bold text-slate-400 mb-1">JAM PULANG</div>
                   {record.checkOut ? <div className="font-bold text-blue-600 text-lg">{record.checkOut}</div> : <button disabled={!record.checkIn} onClick={()=>handleAbsen(emp.id, 'out')} className="w-full bg-slate-100 text-slate-600 font-bold py-2 rounded-xl hover:bg-blue-100 hover:text-blue-700 disabled:opacity-50">Pulang</button>}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Simple Employees Screen with Delete
function EmployeeScreen({ employees, setEmployees, showMessage, theme }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('cashier');

  const addEmp = (e) => {
    e.preventDefault();
    setEmployees([...employees, { id: Date.now().toString(), name, role, baseSalary: 0 }]);
    setName(''); showMessage('Karyawan Ditambah');
  };

  return (
    <div className="max-w-4xl mx-auto pb-20">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-6">Data Karyawan & Role</h2>
      <form onSubmit={addEmp} className="flex gap-4 mb-8 bg-white p-6 border rounded-3xl">
        <input required placeholder="Nama Karyawan" className="flex-1 p-3 rounded-xl border focus:ring-2 outline-none" value={name} onChange={e=>setName(e.target.value)} />
        <select className="border p-3 rounded-xl" value={role} onChange={e=>setRole(e.target.value)}>
          <option value="manager">Manager</option>
          <option value="admin">Admin</option>
          <option value="gudang">Bag. Gudang</option>
          <option value="cashier">Kasir</option>
        </select>
        <button type="submit" className={`${theme.bg} text-white px-8 font-bold rounded-xl`}>Tambah</button>
      </form>
      
      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        {employees.map(e => (
          <div key={e.id} className="p-4 border-b flex justify-between items-center hover:bg-slate-50">
            <div><span className="font-bold">{e.name}</span> <span className="text-xs bg-slate-200 text-slate-600 px-2 py-1 rounded ml-2">{e.role}</span></div>
            {e.role !== 'owner' && <button onClick={() => setEmployees(employees.filter(x=>x.id!==e.id))} className="text-red-400 hover:text-red-600"><Trash2 size={18}/></button>}
          </div>
        ))}
      </div>
    </div>
  );
}

// SETTINGS (THEME & NAME)
function SettingsScreen({ storeSettings, setStoreSettings, themes, showMessage, theme }) {
  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-8">Pengaturan Toko</h2>
      
      <div className="mb-8">
        <label className="block text-sm font-bold text-slate-500 mb-2">Ubah Nama Toko</label>
        <div className="flex gap-2">
          <input className="flex-1 border p-4 rounded-xl font-bold text-lg" value={storeSettings.name} onChange={e => setStoreSettings({...storeSettings, name: e.target.value})} />
        </div>
      </div>

      <div>
        <label className="block text-sm font-bold text-slate-500 mb-4 flex items-center gap-2"><Palette size={18}/> Ubah Warna Tema Aplikasi</label>
        <div className="flex gap-4">
          {Object.keys(themes).map(tKey => (
            <button key={tKey} onClick={() => {setStoreSettings({...storeSettings, theme: tKey}); showMessage('Tema diubah!');}} className={`w-14 h-14 rounded-full ${themes[tKey].bg} ring-offset-4 transition-all ${storeSettings.theme === tKey ? 'ring-4 ring-slate-400 scale-110' : 'hover:scale-105'}`}></button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 4. SUPERADMIN & LIFETIME PAYMENT
// ==========================================
function PaymentInstructionScreen({ onBack, themeColors }) {
  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-2xl w-full text-center border-t-8 border-orange-500">
        <h2 className="text-3xl font-black text-slate-800 mb-4">Aktivasi Lifetime (Sekali Beli)</h2>
        <p className="text-lg text-slate-600 mb-8">Beli putus tanpa biaya bulanan lagi. Transfer ke rekening di bawah ini dan konfirmasi via WA.</p>
        
        <div className="bg-slate-50 p-6 rounded-2xl text-left border border-slate-200 mb-6">
           <div className="font-bold text-slate-500 text-sm mb-2 uppercase">Bank Transfer</div>
           <div className="text-2xl font-mono font-black text-slate-800">SeaBank 9010 6464 0699</div>
           <div className="text-slate-600">a.n Richky Irawan</div>
        </div>
        
        <div className="bg-slate-50 p-6 rounded-2xl text-left border border-slate-200 mb-8">
           <div className="font-bold text-slate-500 text-sm mb-2 uppercase">E-Wallet (GoPay, OVO, Dana, QRIS)</div>
           <div className="text-2xl font-mono font-black text-slate-800">0852 7496 4111</div>
        </div>

        <a href="https://wa.me/6285363770228" target="_blank" rel="noreferrer" className={`block w-full ${themeColors.bg} text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg transition-transform hover:-translate-y-1`}>
          Konfirmasi via WhatsApp (0853 6377 0228)
        </a>
        <button onClick={onBack} className="mt-6 text-slate-500 font-bold hover:underline">Nanti Saja, Lanjut Trial</button>
      </div>
    </div>
  );
}

function SuperAdminPanel({ stores, setStores, onLogout, showMessage }) {
  const activateStore = (id) => {
    setStores(stores.map(s => s.id === id ? {...s, status: 'lifetime'} : s));
    showMessage('Toko diaktifkan menjadi Lifetime!', 'success');
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-10">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-10 border-b border-slate-700 pb-6">
          <h1 className="text-4xl font-black text-white">Superadmin <span className="text-emerald-500">Panel</span></h1>
          <button onClick={onLogout} className="bg-red-500/20 text-red-400 px-6 py-2 rounded-full font-bold hover:bg-red-500 hover:text-white transition-colors">Keluar</button>
        </div>
        
        <div className="bg-slate-800 rounded-3xl p-8 shadow-2xl">
          <h2 className="text-xl font-bold mb-6 text-white flex items-center gap-2"><Store/> Daftar Toko Pendaftar</h2>
          {stores.length === 0 ? (
            <div className="text-center py-10 text-slate-500">Belum ada toko yang mendaftar.</div>
          ) : (
            <div className="space-y-4">
              {stores.map(store => (
                <div key={store.id} className="bg-slate-700/50 p-6 rounded-2xl flex justify-between items-center border border-slate-700">
                  <div>
                    <h3 className="font-bold text-xl text-white">{store.name}</h3>
                    <p className="text-sm text-slate-400 mt-1">Status: <span className={store.status === 'trial' ? 'text-orange-400' : 'text-emerald-400 uppercase font-bold'}>{store.status}</span></p>
                  </div>
                  {store.status === 'trial' && (
                    <button onClick={() => activateStore(store.id)} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-600 shadow-lg shadow-emerald-500/30">Aktifkan Lifetime</button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// UI HELPER COMPONENTS
const SidebarBtn = ({ icon, label, active, onClick, theme }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all font-medium ${active ? `${theme.light} ${theme.text} font-bold` : 'text-slate-400 hover:bg-white/5 hover:text-white'}`}>
    {icon} {label}
  </button>
);
const StatCard = ({ title, value, color, bg }) => (
  <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col justify-center`}>
    <div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</div>
    <div className={`text-3xl font-extrabold ${color}`}>{value}</div>
  </div>
);


```
