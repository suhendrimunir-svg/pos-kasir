import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Package, Users, LogOut, Plus, Printer, Trash2, LayoutDashboard, 
  Store, CreditCard, ChevronRight, CheckCircle2, Briefcase, CalendarClock, 
  Wallet, FileText, Barcode, MessageCircle, Receipt, TrendingUp, TrendingDown,
  UserCheck, ShieldCheck, Smartphone, Zap, Star, ArrowRight, QrCode, Lock, 
  AlertTriangle, XCircle, UserPlus, MapPin, Settings, Bell
} from 'lucide-react';

const initialProducts = [
  { id: '1', barcode: '111', name: 'Kopi Susu Gula Aren', costPrice: 10000, sellPrice: 18000, stock: 50, wholesaleQty: 5, wholesalePrice: 15000 },
  { id: '2', barcode: '222', name: 'Indomie Goreng', costPrice: 2500, sellPrice: 3500, stock: 100, wholesaleQty: 40, wholesalePrice: 3000 },
];

const initialEmployees = [
  { id: 'e1', name: 'Siti (Kasir)', role: 'cashier', baseSalary: 1500000 },
  { id: 'e2', name: 'Joko (Gudang)', role: 'gudang', baseSalary: 2000000 },
  { id: 'e3', name: 'Budi (Manager)', role: 'manager', baseSalary: 3500000 },
];

const initialCustomers = [{ id: 'c1', name: 'Bapak Budi', phone: '08123', points: 10, debt: 0 }];

// Tema Warna Aplikasi
const THEMES = {
  blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', light: 'bg-blue-50', border: 'border-blue-200', side: 'bg-slate-900' },
  green: { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-600', light: 'bg-emerald-50', border: 'border-emerald-200', side: 'bg-emerald-950' },
  red: { bg: 'bg-rose-600', hover: 'hover:bg-rose-700', text: 'text-rose-600', light: 'bg-rose-50', border: 'border-rose-200', side: 'bg-rose-950' },
  purple: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700', text: 'text-purple-600', light: 'bg-purple-50', border: 'border-purple-200', side: 'bg-purple-950' },
  orange: { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', text: 'text-orange-600', light: 'bg-orange-50', border: 'border-orange-200', side: 'bg-orange-950' }
};

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [appUser, setAppUser] = useState(null);
  
  // Superadmin Database (Simulasi Pendaftaran Toko)
  const [stores, setStores] = useState([]); 
  
  // Global Notification State
  const [toast, setToast] = useState(null);
  
  // App Core States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);
  const [employees, setEmployees] = useState(initialEmployees);
  const [expenses, setExpenses] = useState([]); 
  const [transactions, setTransactions] = useState([]); 
  const [commissions, setCommissions] = useState([]);
  const [attendance, setAttendance] = useState([]);
  
  // Store Settings State
  const [storeSettings, setStoreSettings] = useState({
    name: 'SIAK POS Demo',
    theme: 'blue',
    branches: [{ id: 'b1', name: 'Cabang Utama' }]
  });

  // Helper untuk memunculkan notifikasi
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleAuth = (type, data) => {
    if (type === 'login') {
      // 1. Superadmin Login
      if (data.username === 'superadmin' && data.password === '123') {
        setAppUser({ role: 'superadmin', name: 'Administrator' });
        setCurrentView('admin_panel');
        showToast('Login Superadmin Berhasil', 'success');
        return;
      }

      // 2. Cek toko yang baru didaftarkan (Dinamis)
      const registeredStore = stores.find(s => s.username === data.username && s.password === data.password);
      if (registeredStore) {
        if (registeredStore.status === 'pending') {
          // Jika belum diaktifkan Superadmin
          setAppUser({ role: 'owner', storeName: registeredStore.name, status: 'pending' });
          setCurrentView('payment');
          showToast('Toko Anda belum diverifikasi admin.', 'error');
        } else {
          // Jika sudah aktif
          setAppUser({ role: 'owner', name: 'Owner', storeName: registeredStore.name, status: 'active', theme: registeredStore.theme || 'blue' });
          setStoreSettings(prev => ({ ...prev, name: registeredStore.name }));
          setCurrentView('app');
          showToast(`Selamat datang di ${registeredStore.name}`, 'success');
        }
        return;
      }

      // 3. Fallback Demo Akun
      if (data.username === 'admin' && data.password === '123') {
        setAppUser({ role: 'owner', name: 'Owner', storeName: storeSettings.name, status: 'active' });
        setCurrentView('app');
        showToast('Login Berhasil sebagai Owner', 'success');
      } else if (data.username === 'kasir' && data.password === '123') {
        setAppUser({ role: 'cashier', name: 'Siti (Kasir)', storeName: storeSettings.name, status: 'active' });
        setCurrentView('app');
        showToast('Login Berhasil sebagai Kasir', 'success');
      } else {
        showToast('Username atau password salah!', 'error');
      }
      
    } else if (type === 'register') {
      const newStore = { 
        id: Date.now(), 
        name: data.storeName, 
        username: data.username, 
        password: data.password, // Menyimpan pass agar bisa login
        status: 'pending',
        theme: 'blue'
      };
      setStores([...stores, newStore]);
      setAppUser({ role: 'owner', storeName: data.storeName, status: 'pending' });
      setCurrentView('payment');
      showToast('Pendaftaran Berhasil! Silakan lakukan pembayaran.', 'success');
    }
  };

  const userRole = appUser?.role || 'cashier';
  const themeObj = THEMES[storeSettings.theme] || THEMES.blue;

  // Fungsi untuk membatasi tampilan menu di Sidebar
  const checkAccess = (tab) => {
    if (userRole === 'superadmin') return true;
    if (userRole === 'owner' || userRole === 'manager') return true; // Full Access
    if (userRole === 'admin') return ['dashboard', 'inventory', 'customers', 'expenses'].includes(tab);
    if (userRole === 'gudang') return ['inventory'].includes(tab);
    if (userRole === 'cashier' || userRole === 'sales') return ['pos', 'customers', 'expenses'].includes(tab);
    return false;
  };

  if (currentView === 'landing') return <LandingPage onNavigate={setCurrentView} />;
  
  if (currentView === 'auth') return (
    <div className="relative">
      <ToastNotification toast={toast} />
      <AuthScreen onAuth={handleAuth} />
    </div>
  );
  
  if (currentView === 'payment') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <ToastNotification toast={toast} />
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-2xl w-full border-t-4 border-blue-600">
          <ShieldCheck className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-3xl font-black mb-2 text-center text-slate-800">Aktivasi SIAK POS (Sekali Beli)</h2>
          <p className="text-slate-600 mb-8 text-center">Toko <b>{appUser?.storeName}</b> berhasil didaftarkan! Selesaikan pembayaran untuk membuka akses aplikasi.</p>
          
          <div className="grid md:grid-cols-2 gap-6 mb-8">
            <div className="bg-orange-50 p-6 rounded-2xl border border-orange-200">
              <p className="font-bold text-sm text-orange-800 mb-4 uppercase tracking-wider">1. Transfer Bank</p>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-orange-100 flex items-center gap-4">
                <div className="font-black text-xl italic text-orange-600">SeaBank</div>
                <div>
                  <div className="font-mono text-xl font-bold">9010 6464 0699</div>
                  <div className="text-sm font-medium">a.n Richky Irawan</div>
                </div>
              </div>
            </div>

            <div className="bg-blue-50 p-6 rounded-2xl border border-blue-200">
              <p className="font-bold text-sm text-blue-800 mb-4 uppercase tracking-wider">2. E-Wallet / QRIS</p>
              <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100 flex items-center gap-4">
                <QrCode className="text-blue-600 w-10 h-10" />
                <div>
                  <div className="font-bold text-sm text-slate-500">GoPay</div>
                  <div className="font-mono text-xl font-bold">0852 7496 4111</div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-6 rounded-2xl text-center border border-green-200 mb-8">
            <p className="font-bold text-sm text-green-800 mb-2 uppercase tracking-wider">Konfirmasi Manual Ke WhatsApp</p>
            <p className="text-slate-700 mb-2">Kirim bukti screenshot transfer Anda ke nomor WA Super Admin:</p>
            <div className="text-2xl font-black text-green-700 flex items-center justify-center gap-2">
              <MessageCircle /> 0853-6377-0228
            </div>
          </div>

          <button onClick={() => setCurrentView('landing')} className="w-full text-slate-500 font-bold hover:text-slate-800 text-center flex justify-center items-center gap-2">
            Kembali ke Beranda
          </button>
        </div>
      </div>
    );
  }

  if (currentView === 'admin_panel') {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <ToastNotification toast={toast} />
        <div className="max-w-5xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <div>
               <h1 className="text-3xl font-black text-slate-800">Panel Super Admin</h1>
               <p className="text-slate-500">SIAK POS - Verifikasi Pendaftaran Toko</p>
            </div>
            <button onClick={() => {setAppUser(null); setCurrentView('landing');}} className="bg-red-600 text-white px-6 py-2 rounded-lg font-bold shadow hover:bg-red-700 flex items-center gap-2"><LogOut size={18}/> Keluar</button>
          </div>

          <div className="bg-white shadow-sm rounded-2xl p-6 border border-slate-200">
            <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><Bell className="text-amber-500"/> Menunggu Verifikasi Pembayaran</h2>
            {stores.filter(s => s.status === 'pending').length === 0 ? (
              <div className="text-center p-10 bg-slate-50 rounded-xl text-slate-400 font-medium">Tidak ada pendaftaran toko baru.</div>
            ) : null}
            
            <div className="space-y-4">
              {stores.filter(s => s.status === 'pending').map(store => (
                <div key={store.id} className="flex flex-col md:flex-row justify-between items-center p-5 border bg-slate-50 rounded-xl">
                  <div className="mb-4 md:mb-0 text-center md:text-left">
                    <h3 className="font-bold text-xl text-slate-800">{store.name}</h3>
                    <p className="text-sm text-slate-500 mt-1">Username Pemilik: <span className="font-mono font-bold text-slate-700">{store.username}</span></p>
                  </div>
                  <button 
                    onClick={() => { 
                      setStores(stores.map(s => s.id === store.id ? {...s, status: 'active'} : s)); 
                      showToast(`Toko ${store.name} berhasil diaktifkan!`, 'success'); 
                    }} 
                    className="w-full md:w-auto bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-green-200 flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 size={20}/> Aktifkan Toko
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8 bg-white shadow-sm rounded-2xl p-6 border border-slate-200 opacity-70">
             <h2 className="text-lg font-bold mb-4">Toko Aktif</h2>
             {stores.filter(s => s.status === 'active').map(store => (
                <div key={store.id} className="border-b py-3 font-medium text-slate-600">{store.name} <span className="text-xs ml-2 bg-green-100 text-green-700 px-2 py-0.5 rounded">Aktif</span></div>
             ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800 relative">
      <ToastNotification toast={toast} />
      
      {/* Sidebar */}
      <aside className={`w-64 ${themeObj.side} text-white flex flex-col print:hidden transition-colors duration-300`}>
        <div className="p-6 border-b border-white/10">
          <h2 className="font-black text-2xl flex items-center gap-2 text-white">
            <Store className="opacity-80"/> SIAK POS
          </h2>
          <div className="mt-4 bg-black/20 p-3 rounded-lg">
             <p className="text-xs text-slate-300 uppercase tracking-wider mb-1">Toko Aktif</p>
             <p className="font-bold text-white truncate">{storeSettings.name}</p>
             <p className="text-[10px] text-slate-300 mt-1 capitalize border-t border-white/10 pt-1">
               👤 {appUser?.name} ({userRole})
             </p>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {checkAccess('dashboard') && <SidebarButton icon={<LayoutDashboard size={18}/>} label="Analisis Siak POS" isActive={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} themeObj={themeObj} />}
          {checkAccess('pos') && <SidebarButton icon={<ShoppingCart size={18}/>} label="Mesin Kasir" isActive={activeTab === 'pos'} onClick={() => setActiveTab('pos')} themeObj={themeObj} />}
          {checkAccess('inventory') && <SidebarButton icon={<Package size={18}/>} label="Kelola Stok (Gudang)" isActive={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} themeObj={themeObj} />}
          {checkAccess('customers') && <SidebarButton icon={<Users size={18}/>} label="Pelanggan & Piutang" isActive={activeTab === 'customers'} onClick={() => setActiveTab('customers')} themeObj={themeObj} />}
          {checkAccess('expenses') && <SidebarButton icon={<Receipt size={18}/>} label="Pengeluaran Warung" isActive={activeTab === 'expenses'} onClick={() => setActiveTab('expenses')} themeObj={themeObj} />}
          
          {(checkAccess('employees') || checkAccess('payroll') || checkAccess('settings')) && (
            <div className="pt-4 mt-4 border-t border-white/10 text-[10px] font-black text-white/40 uppercase tracking-widest px-3 mb-2">Back Office (Admin)</div>
          )}
          
          {checkAccess('employees') && <SidebarButton icon={<Briefcase size={18}/>} label="Data Karyawan" isActive={activeTab === 'employees'} onClick={() => setActiveTab('employees')} themeObj={themeObj} />}
          {checkAccess('payroll') && <SidebarButton icon={<Wallet size={18}/>} label="Gaji & Absensi" isActive={activeTab === 'payroll'} onClick={() => setActiveTab('payroll')} themeObj={themeObj} />}
          {checkAccess('settings') && <SidebarButton icon={<Settings size={18}/>} label="Pengaturan Toko" isActive={activeTab === 'settings'} onClick={() => setActiveTab('settings')} themeObj={themeObj} />}
        </nav>

        <div className="p-4 border-t border-white/10">
          <button onClick={() => {setCurrentView('landing'); setAppUser(null);}} className="w-full flex items-center justify-center gap-2 bg-red-500/20 text-red-300 p-3 rounded-xl hover:bg-red-500/40 hover:text-white transition-colors font-bold">
            <LogOut size={18}/> Keluar
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardScreen transactions={transactions} expenses={expenses} themeObj={themeObj} storeName={storeSettings.name} />}
        {activeTab === 'pos' && <POSScreen products={products} setProducts={setProducts} customers={customers} setCustomers={setCustomers} employees={employees} setCommissions={setCommissions} setTransactions={setTransactions} showToast={showToast} themeObj={themeObj} storeSettings={storeSettings} />}
        {activeTab === 'inventory' && <InventoryScreen products={products} setProducts={setProducts} showToast={showToast} themeObj={themeObj} />}
        {activeTab === 'customers' && <CustomerScreen customers={customers} setCustomers={setCustomers} themeObj={themeObj} />}
        {activeTab === 'expenses' && <ExpenseScreen expenses={expenses} setExpenses={setExpenses} themeObj={themeObj} showToast={showToast} />}
        {activeTab === 'employees' && <EmployeeScreen employees={employees} setEmployees={setEmployees} showToast={showToast} themeObj={themeObj} />}
        {activeTab === 'payroll' && <PayrollScreen employees={employees} commissions={commissions} attendance={attendance} setAttendance={setAttendance} showToast={showToast} themeObj={themeObj} />}
        {activeTab === 'settings' && <SettingsScreen storeSettings={storeSettings} setStoreSettings={setStoreSettings} showToast={showToast} themeObj={themeObj} />}
      </main>
    </div>
  );
}

// Komponen Pembantu
function ToastNotification({ toast }) {
  if (!toast) return null;
  const isSuccess = toast.type === 'success';
  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-white font-bold animate-bounce-short ${isSuccess ? 'bg-green-600' : 'bg-red-600'}`}>
      {isSuccess ? <CheckCircle2 /> : <XCircle />}
      {toast.message}
    </div>
  );
}

function SidebarButton({ icon, label, isActive, onClick, themeObj }) {
  return (
    <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl text-left font-medium transition-all duration-200 ${isActive ? `${themeObj.bg} text-white shadow-lg` : 'text-slate-300 hover:bg-white/10 hover:text-white'}`}>
      {icon} {label}
    </button>
  );
}

// ==========================================
// LANDING PAGE SIAK POS
// ==========================================
function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-200">
      <nav className="flex justify-between items-center p-4 lg:px-20 bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="font-black text-2xl text-blue-700 flex items-center gap-2">
          <div className="bg-blue-600 text-white p-2 rounded-xl"><Store size={24}/></div> 
          SIAK POS
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('auth')} className="text-slate-600 font-bold hover:text-blue-600 hidden md:block">Masuk Dashboard</button>
          <button onClick={() => onNavigate('auth')} className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all">Daftar Sekarang</button>
        </div>
      </nav>

      <header className="relative pt-24 pb-32 px-6 lg:px-20 text-center max-w-5xl mx-auto">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-50 to-transparent -z-10 rounded-full blur-3xl opacity-50"></div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-bold text-sm mb-8 shadow-sm">
          <Star size={16} className="text-yellow-500 fill-yellow-500"/> Aplikasi Kasir UMKM & Multi Cabang Terbaik
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight text-slate-900">
          Kasir Pintar Bisnis Anda.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Cukup Sekali Beli.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Sistem Point of Sale lengkap dengan fitur HRIS, penggajian, pembatasan akses karyawan (Admin, Gudang, Kasir), dan kelola banyak cabang. <b>Tanpa langganan bulanan.</b>
        </p>
        <button onClick={() => onNavigate('auth')} className="bg-green-500 text-white px-10 py-4 rounded-full font-extrabold text-lg shadow-xl shadow-green-200 hover:bg-green-600 transition-all flex items-center justify-center gap-2 mx-auto">
          Daftar Toko & Beli Sekarang <ArrowRight size={20}/>
        </button>
      </header>

      {/* Bagian Penjelasan Cara Kerja & Bayar */}
      <section className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Bagaimana Cara Mengaktifkan SIAK POS?</h2>
            <div className="space-y-6">
              {[
                { step: '1', title: 'Daftar Akun Toko', desc: 'Klik Daftar Sekarang, masukkan nama toko dan buat username Anda.' },
                { step: '2', title: 'Lakukan Pembayaran', desc: 'Transfer biaya lisensi seumur hidup melalui SeaBank atau scan QRIS/GoPay resmi kami.' },
                { step: '3', title: 'Konfirmasi via WhatsApp', desc: 'Kirimkan bukti transfer ke WA Admin Super: 0853-6377-0228.' },
                { step: '4', title: 'Toko Aktif Selamanya!', desc: 'Admin akan memverifikasi, dan Anda beserta karyawan siap berjualan.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0 w-12 h-12 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-black text-xl">{item.step}</div>
                  <div><h4 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h4><p className="text-slate-600">{item.desc}</p></div>
                </div>
              ))}
            </div>
          </div>
          
          <div className="lg:w-1/2 w-full">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-xl">
              <h3 className="text-2xl font-black text-slate-900 mb-6">Metode Pembayaran Resmi</h3>
              <div className="space-y-4">
                <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
                  <div className="bg-orange-100 text-orange-600 p-3 rounded-xl font-black italic text-lg">SeaBank</div>
                  <div><div className="text-xs font-bold text-slate-400">TRANSFER BANK</div><div className="text-xl font-mono font-bold">9010 6464 0699</div><div className="text-sm font-medium">a.n Richky Irawan</div></div>
                </div>
                <div className="bg-white p-5 rounded-2xl shadow-sm border flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><QrCode size={32}/></div>
                  <div><div className="text-xs font-bold text-slate-400">GOPAY / QRIS</div><div className="text-xl font-mono font-bold">0852 7496 4111</div><div className="text-sm font-medium">Scan QRIS / Input Manual</div></div>
                </div>
                <div className="bg-green-50 p-5 rounded-2xl border border-green-200 mt-6">
                  <div className="text-xs font-bold text-green-800 mb-1">KONFIRMASI WHATSAPP</div>
                  <div className="text-xl font-black text-green-700 flex items-center gap-2"><MessageCircle /> 0853-6377-0228</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Harga */}
      <section className="py-20 px-6 text-center bg-slate-900 text-white">
        <h2 className="text-3xl font-black mb-10">Harga Paket Lifetime (Sekali Bayar)</h2>
        <div className="bg-white text-slate-900 inline-block p-10 rounded-3xl shadow-2xl max-w-sm w-full">
          <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 bg-blue-50 py-1 px-4 rounded-full inline-block">PROMO SPESIAL</p>
          <div className="flex justify-center items-start gap-1 mb-2">
            <span className="text-2xl font-bold mt-2">Rp</span><span className="text-6xl font-black">299<span className="text-4xl">k</span></span>
          </div>
          <p className="text-slate-500 mb-8 font-medium">Akses selamanya. Multi Akses Karyawan.</p>
          <button onClick={() => onNavigate('auth')} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg transition-all">Daftar & Beli Sekarang</button>
        </div>
      </section>
    </div>
  );
}

function AuthScreen({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', storeName: '' });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-slate-200">
        <div className="text-center mb-8">
          <div className="bg-blue-100 text-blue-600 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4"><Store size={32}/></div>
          <h2 className="text-2xl font-black text-slate-900">{isLogin ? 'Masuk ke Siak POS' : 'Daftar Toko Baru'}</h2>
          <p className="text-slate-500 mt-2">{isLogin ? 'Login sesuai role Anda (Owner/Manager/Kasir)' : 'Langkah pertama memajukan bisnis Anda'}</p>
        </div>
        <form onSubmit={e => { e.preventDefault(); onAuth(isLogin ? 'login' : 'register', form); }} className="space-y-5">
          {!isLogin && <div><label className="block text-sm font-bold mb-2 text-slate-700">Nama Toko / Bisnis</label><input required className="w-full border-2 border-slate-200 p-3.5 rounded-xl bg-slate-50 focus:border-blue-500 outline-none transition" onChange={e => setForm({...form, storeName: e.target.value})} /></div>}
          <div><label className="block text-sm font-bold mb-2 text-slate-700">Username</label><input required className="w-full border-2 border-slate-200 p-3.5 rounded-xl bg-slate-50 focus:border-blue-500 outline-none transition" onChange={e => setForm({...form, username: e.target.value})} /></div>
          <div><label className="block text-sm font-bold mb-2 text-slate-700">Password</label><input type="password" required className="w-full border-2 border-slate-200 p-3.5 rounded-xl bg-slate-50 focus:border-blue-500 outline-none transition" onChange={e => setForm({...form, password: e.target.value})} /></div>
          <button type="submit" className="w-full bg-blue-600 text-white font-black py-4 rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition text-lg">{isLogin ? 'Masuk Sekarang' : 'Daftar & Lanjut Pembayaran'}</button>
        </form>
        <div className="mt-8 text-center text-sm border-t pt-6">
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-bold hover:underline text-base">{isLogin ? 'Belum punya akun? Daftar Lifetime' : 'Sudah punya akun? Masuk'}</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 1. DASHBOARD & SETTINGS
// ==========================================
function SettingsScreen({ storeSettings, setStoreSettings, showToast, themeObj }) {
  const [branchName, setBranchName] = useState('');

  const handleAddBranch = (e) => {
    e.preventDefault();
    if(!branchName) return;
    setStoreSettings(prev => ({...prev, branches: [...prev.branches, { id: Date.now(), name: branchName }]}));
    setBranchName('');
    showToast('Toko Cabang Berhasil Ditambahkan', 'success');
  };

  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h2 className="text-3xl font-black mb-8 text-slate-800">Pengaturan Toko</h2>
      
      <div className="grid md:grid-cols-2 gap-8">
        {/* Identitas Toko */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><Store/> Identitas Utama</h3>
          <div className="mb-4">
            <label className="block text-sm font-bold mb-2 text-slate-500">Ubah Nama Toko</label>
            <input className="w-full border p-3 rounded-xl bg-slate-50" value={storeSettings.name} onChange={e => setStoreSettings({...storeSettings, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-slate-500">Pilih Warna Tema Aplikasi</label>
            <div className="flex gap-3">
              {Object.keys(THEMES).map(t => (
                <button key={t} onClick={() => setStoreSettings({...storeSettings, theme: t})} className={`w-10 h-10 rounded-full border-4 ${storeSettings.theme === t ? 'border-slate-800 scale-110' : 'border-transparent'} ${THEMES[t].bg} transition-all`}></button>
              ))}
            </div>
          </div>
        </div>

        {/* Multi Cabang */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-lg mb-4 flex items-center gap-2"><MapPin/> Kelola Cabang Toko</h3>
          <form onSubmit={handleAddBranch} className="flex gap-2 mb-4">
            <input required placeholder="Nama Cabang Baru" className="border p-3 rounded-xl flex-1 bg-slate-50" value={branchName} onChange={e => setBranchName(e.target.value)} />
            <button className={`${themeObj.bg} text-white px-4 rounded-xl font-bold`}>Tambah</button>
          </form>
          <div className="space-y-2">
            {storeSettings.branches.map(b => (
              <div key={b.id} className="p-3 border rounded-lg bg-slate-50 font-medium flex items-center gap-2"><Store size={16} className="text-slate-400"/> {b.name}</div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardScreen({ transactions, expenses, themeObj, storeName }) {
  const totalOmzet = transactions.reduce((sum, trx) => sum + trx.total, 0);
  const kotorProfit = transactions.reduce((sum, trx) => sum + trx.profit, 0); 
  const totalPengeluaran = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const labaBersih = kotorProfit - totalPengeluaran;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <h2 className="text-3xl font-black mb-2 text-slate-800">Analisis {storeName}</h2>
      <p className="text-slate-500 mb-8">Ringkasan operasional dan keuangan toko.</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2 font-bold uppercase text-xs"><TrendingUp size={16}/> Omzet (Pendapatan)</div>
          <div className={`text-3xl font-black ${themeObj.text}`}>Rp {totalOmzet.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2 font-bold uppercase text-xs"><TrendingDown size={16}/> Pengeluaran Warung</div>
          <div className="text-3xl font-black text-red-500">Rp {totalPengeluaran.toLocaleString('id-ID')}</div>
        </div>
        <div className={`p-6 rounded-2xl shadow-sm border ${labaBersih >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 text-slate-600 mb-2 font-bold uppercase text-xs">Laba Bersih</div>
          <div className={`text-3xl font-black ${labaBersih >= 0 ? 'text-green-700' : 'text-red-700'}`}>Rp {labaBersih.toLocaleString('id-ID')}</div>
          <div className="text-xs mt-1 text-slate-500 font-medium">(Keuntungan Kotor - Pengeluaran)</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. POS SCREEN (KASIR PINTAR)
// ==========================================
function POSScreen({ products, setProducts, customers, setCustomers, employees, setCommissions, setTransactions, showToast, themeObj, storeSettings }) {
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedSalesId, setSelectedSalesId] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(storeSettings.branches[0]?.name || '');

  const handleBarcodeSearch = (e) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcodeInput || p.name.toLowerCase().includes(barcodeInput.toLowerCase()));
    if (product) { addToCart(product); setBarcodeInput(''); } 
    else showToast('Barang tidak ditemukan!', 'error');
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return showToast('Stok habis!', 'error');
    const existing = cart.find(item => item.id === product.id);
    let newCart = existing ? cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item) : [...cart, { ...product, qty: 1 }];
    
    // Logika Harga Grosir
    setCart(newCart.map(item => ({ ...item, activePrice: (item.wholesaleQty && item.qty >= item.wholesaleQty) ? item.wholesalePrice : item.sellPrice })));
  };

  const totalTagihan = cart.reduce((sum, item) => sum + (item.activePrice * item.qty), 0);
  const totalModal = cart.reduce((sum, item) => sum + (item.costPrice * item.qty), 0);
  const profitTransaksi = totalTagihan - totalModal;

  const handleCheckout = (isDebt = false) => {
    if (cart.length === 0) return;
    if (isDebt && !selectedCustomerId) return showToast('Pilih pelanggan dulu untuk mencatat hutang!', 'error');
    
    setProducts(products.map(p => {
      const c = cart.find(item => item.id === p.id);
      return c ? { ...p, stock: p.stock - c.qty } : p;
    }));

    if (isDebt) setCustomers(customers.map(c => c.id === selectedCustomerId ? { ...c, debt: (c.debt || 0) + totalTagihan } : c));
    
    const trxId = Date.now();
    setTransactions(prev => [...prev, { id: trxId, total: totalTagihan, profit: profitTransaksi, type: isDebt ? 'debt' : 'cash', date: new Date().toISOString() }]);

    // Komisi Sales/Pelayan
    if (selectedSalesId) setCommissions(prev => [...prev, { trxId, empId: selectedSalesId, amount: totalTagihan * 0.02 }]);

    showToast(isDebt ? 'Hutang Berhasil Dicatat!' : 'Pembayaran Berhasil! (Mencetak...)', 'success');
    if(!isDebt) window.print();
    
    setCart([]); setBarcodeInput(''); setSelectedCustomerId(''); setSelectedSalesId('');
  };

  return (
    <div className="flex flex-col xl:flex-row gap-6 h-full pb-10">
      <div className="flex-1 flex flex-col h-full print:hidden">
        <div className="flex gap-2 mb-4">
          <form onSubmit={handleBarcodeSearch} className="flex-1 flex gap-2">
            <input autoFocus value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} type="text" placeholder="Scan Barcode / Ketik Barang..." className="flex-1 p-4 rounded-2xl border border-slate-200 shadow-sm outline-none focus:ring-2 focus:ring-blue-500 font-medium" />
            <button type="submit" className={`${themeObj.bg} text-white px-6 rounded-2xl font-bold shadow-lg`}><Barcode/></button>
          </form>
          <select className="p-4 rounded-2xl border bg-white font-bold text-slate-600 outline-none shadow-sm" value={selectedBranch} onChange={e => setSelectedBranch(e.target.value)}>
             {storeSettings.branches.map(b => <option key={b.id} value={b.name}>{b.name}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4 overflow-y-auto pb-20 pr-2 custom-scrollbar">
          {products.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock<=0} className={`p-4 border border-slate-200 rounded-3xl text-left shadow-sm flex flex-col h-36 transition-all ${p.stock<=0 ? 'opacity-50 bg-slate-50' : `bg-white hover:border-${themeObj.text.split('-')[1]}-500 hover:shadow-md`}`}>
              <div className="font-bold text-sm line-clamp-2 mb-1 text-slate-800">{p.name}</div>
              <div className="text-[10px] text-slate-400 font-mono mb-auto">{p.barcode || '-'}</div>
              <div className="mt-2">
                <div className={`font-black text-lg ${themeObj.text}`}>Rp {p.sellPrice.toLocaleString('id-ID')}</div>
                <div className="flex justify-between text-[10px] font-bold mt-1"><span className="text-slate-500">Stok: {p.stock}</span>{p.wholesaleQty && <span className="text-orange-500">Grosir: ≥{p.wholesaleQty}</span>}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full xl:w-[420px] bg-white border border-slate-200 rounded-3xl shadow-sm flex flex-col print:w-full print:border-none print:shadow-none h-full max-h-screen">
        <div className={`p-5 ${themeObj.light} border-b ${themeObj.border} rounded-t-3xl font-black flex justify-between print:hidden`}><span>Keranjang Kasir</span><span className={`${themeObj.bg} text-white px-3 py-1 rounded-full text-xs`}>{cart.length}</span></div>
        
        <div className="flex-1 p-5 overflow-y-auto custom-scrollbar">
          {/* Struk Print Area */}
          <div className="hidden print:block text-center mb-6">
            <h2 className="text-2xl font-black uppercase">{storeSettings.name}</h2>
            <p className="text-sm font-medium">{selectedBranch}</p>
            <p className="text-xs text-gray-500">Tgl: {new Date().toLocaleDateString('id-ID')}</p>
            <hr className="my-3 border-dashed border-black"/>
          </div>

          {cart.length === 0 ? <div className="text-center text-slate-400 text-sm mt-10 print:hidden font-medium">Belum ada barang di keranjang</div> : null}
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-start mb-4 pb-2 border-b border-slate-50">
              <div className="flex-1 pr-2">
                <div className="font-bold text-sm text-slate-800">{item.name}</div>
                <div className="text-xs text-slate-500 font-medium">{item.qty} x Rp {item.activePrice.toLocaleString('id-ID')} {item.activePrice < item.sellPrice && <span className="ml-1 bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded text-[9px] font-black tracking-wider uppercase">Grosir</span>}</div>
              </div>
              <div className="font-black text-sm text-slate-900">Rp {(item.activePrice * item.qty).toLocaleString('id-ID')}</div>
              <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="ml-3 text-red-400 hover:text-red-600 print:hidden"><Trash2 size={16}/></button>
            </div>
          ))}

          <div className="hidden print:block mt-6">
            <hr className="my-3 border-dashed border-black"/>
            <div className="flex justify-between font-black text-lg"><span>TOTAL:</span><span>Rp {totalTagihan.toLocaleString('id-ID')}</span></div>
            <p className="text-center text-xs mt-4">Terima Kasih Atas Kunjungan Anda</p>
          </div>
        </div>

        <div className="p-5 bg-white border-t rounded-b-3xl print:hidden">
          <div className="grid grid-cols-2 gap-2 mb-4">
             <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Pelanggan</label>
                <select className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold outline-none" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}>
                  <option value="">-- Umum --</option>
                  {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
             </div>
             <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Pelayan / Sales</label>
                <select className="w-full p-2.5 border border-slate-200 rounded-xl text-sm bg-slate-50 font-bold outline-none" value={selectedSalesId} onChange={e => setSelectedSalesId(e.target.value)}>
                  <option value="">-- Tanpa Sales --</option>
                  {employees.filter(e => e.role === 'sales').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
             </div>
          </div>
          
          <div className="flex justify-between items-center mb-4 bg-slate-50 p-4 rounded-2xl border border-slate-100">
            <span className="text-sm font-bold text-slate-500 uppercase tracking-wider">Total Tagihan</span>
            <span className={`text-3xl font-black ${themeObj.text}`}>Rp {totalTagihan.toLocaleString('id-ID')}</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleCheckout(false)} disabled={cart.length === 0} className={`${themeObj.bg} text-white font-black py-4 rounded-2xl hover:opacity-90 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg`}><Printer size={18}/> Cetak Lunas</button>
            <button onClick={() => handleCheckout(true)} disabled={cart.length === 0} className="bg-amber-500 text-white font-black py-4 rounded-2xl hover:bg-amber-600 disabled:opacity-50 flex justify-center items-center gap-2 shadow-lg">Bayar Nanti</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. INVENTORY & CUSTOMERS
// ==========================================
function InventoryScreen({ products, setProducts, showToast, themeObj }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ barcode: '', name: '', costPrice: '', sellPrice: '', stock: '', wholesaleQty: '', wholesalePrice: '' });

  const handleSave = (e) => {
    e.preventDefault();
    setProducts([...products, { id: Date.now().toString(), barcode: form.barcode, name: form.name, costPrice: Number(form.costPrice), sellPrice: Number(form.sellPrice), stock: Number(form.stock), wholesaleQty: Number(form.wholesaleQty) || null, wholesalePrice: Number(form.wholesalePrice) || null }]);
    setShowForm(false); setForm({ barcode: '', name: '', costPrice: '', sellPrice: '', stock: '', wholesaleQty: '', wholesalePrice: '' });
    showToast('Barang berhasil ditambahkan ke Gudang!', 'success');
  };

  const handleShareWA = () => {
    let text = "*KATALOG KAMI*\n\n";
    products.forEach(p => {
      text += `📦 *${p.name}*\nHarga: Rp ${p.sellPrice.toLocaleString('id-ID')}\n${p.wholesaleQty ? `_Grosir (Beli ${p.wholesaleQty}): Rp ${p.wholesalePrice.toLocaleString('id-ID')}_\n` : ''}\n`;
    });
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-black text-slate-800">Gudang & Stok</h2>
        <div className="flex gap-3">
           <button onClick={handleShareWA} className="bg-green-600 text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-md hover:bg-green-700"><MessageCircle size={18}/> Share WA</button>
           <button onClick={() => setShowForm(!showForm)} className={`${themeObj.bg} text-white px-5 py-2.5 rounded-xl flex items-center gap-2 font-bold shadow-md hover:opacity-90`}><Plus size={18}/> Tambah Produk</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white p-8 rounded-3xl border border-slate-200 mb-8 grid grid-cols-2 md:grid-cols-4 gap-5 shadow-sm">
          <div className="col-span-2"><label className="text-xs font-bold mb-1 block text-slate-600">Nama Produk</label><input required className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 outline-none focus:border-slate-400" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/></div>
          <div><label className="text-xs font-bold mb-1 block text-slate-600">Barcode</label><input className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 outline-none focus:border-slate-400" value={form.barcode} onChange={e=>setForm({...form, barcode:e.target.value})}/></div>
          <div><label className="text-xs font-bold mb-1 block text-slate-600">Stok Awal</label><input required type="number" className="w-full border-2 border-slate-200 p-3 rounded-xl bg-slate-50 outline-none focus:border-slate-400" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})}/></div>
          
          <div><label className="text-xs font-bold mb-1 block text-slate-400">Harga Modal (Utk Laba)</label><input required type="number" className="w-full border-2 border-slate-100 p-3 rounded-xl bg-slate-100 outline-none" value={form.costPrice} onChange={e=>setForm({...form, costPrice:e.target.value})}/></div>
          <div><label className={`text-xs font-black mb-1 block ${themeObj.text}`}>Harga Jual (Normal)</label><input required type="number" className={`w-full border-2 ${themeObj.border} p-3 rounded-xl ${themeObj.light} outline-none`} value={form.sellPrice} onChange={e=>setForm({...form, sellPrice:e.target.value})}/></div>
          
          <div><label className="text-xs font-bold mb-1 block text-orange-600">Batas Grosir (Pcs)</label><input type="number" className="w-full border-2 border-orange-200 p-3 rounded-xl bg-orange-50 outline-none" value={form.wholesaleQty} onChange={e=>setForm({...form, wholesaleQty:e.target.value})}/></div>
          <div><label className="text-xs font-bold mb-1 block text-orange-600">Harga Grosir/Pcs</label><input type="number" className="w-full border-2 border-orange-200 p-3 rounded-xl bg-orange-50 outline-none" value={form.wholesalePrice} onChange={e=>setForm({...form, wholesalePrice:e.target.value})}/></div>
          
          <div className="col-span-full pt-2"><button type="submit" className="bg-slate-900 text-white px-8 py-3.5 rounded-xl font-black w-full md:w-auto">Simpan ke Etalase</button></div>
        </form>
      )}

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]"><tr><th className="p-5">Produk & Barcode</th><th className="p-5">Stok</th><th className="p-5">Harga Modal</th><th className={`p-5 ${themeObj.text}`}>Harga Jual</th><th className="p-5 text-orange-600">Grosir</th></tr></thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {products.map(p => (
              <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                <td className="p-5"><div className="font-bold text-base text-slate-900">{p.name}</div><div className="text-xs font-normal text-slate-400 font-mono mt-0.5">{p.barcode || 'Tanpa Barcode'}</div></td>
                <td className="p-5 font-black text-lg">{p.stock}</td>
                <td className="p-5 text-slate-400">Rp {p.costPrice.toLocaleString('id-ID')}</td>
                <td className={`p-5 font-black text-base ${themeObj.text}`}>Rp {p.sellPrice.toLocaleString('id-ID')}</td>
                <td className="p-5 text-orange-600 font-bold">{p.wholesaleQty ? `Rp ${p.wholesalePrice.toLocaleString('id-ID')} (≥${p.wholesaleQty})` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerScreen({ customers, setCustomers, themeObj }) {
  const [form, setForm] = useState({ name: '', phone: '' });
  const handleAdd = (e) => {
    e.preventDefault();
    setCustomers([...customers, { id: Date.now().toString(), name: form.name, phone: form.phone, debt: 0, points: 0 }]);
    setForm({name: '', phone: ''});
  };

  const handleBayarHutang = (id) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, debt: 0 } : c));
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <h2 className="text-3xl font-black mb-8 text-slate-800">Buku Pelanggan & Piutang</h2>
      <form onSubmit={handleAdd} className="flex gap-4 mb-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
         <input required className="border-2 border-slate-200 p-3 rounded-xl flex-1 bg-slate-50 outline-none focus:border-slate-400 font-medium" placeholder="Nama Pelanggan" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
         <input className="border-2 border-slate-200 p-3 rounded-xl flex-1 bg-slate-50 outline-none focus:border-slate-400 font-medium" placeholder="No. HP" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
         <button className={`${themeObj.bg} text-white px-8 font-black rounded-xl shadow-md hover:opacity-90`}>Tambah</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {customers.map(c => (
          <div key={c.id} className={`p-6 rounded-3xl border-2 shadow-sm ${c.debt > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-slate-200'}`}>
            <h3 className="font-black text-xl text-slate-800">{c.name}</h3>
            <p className="text-sm font-medium text-slate-500 mb-6 mt-1">{c.phone || 'Tanpa Nomor HP'}</p>
            <div className="flex justify-between items-end border-t border-slate-200/60 pt-4">
              <div>
                 <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider mb-1">Total Hutang</div>
                 <div className={`font-black text-2xl ${c.debt > 0 ? 'text-red-600' : 'text-slate-800'}`}>Rp {(c.debt || 0).toLocaleString('id-ID')}</div>
              </div>
              {c.debt > 0 && <button onClick={() => handleBayarHutang(c.id)} className="bg-green-500 hover:bg-green-600 text-white text-xs px-4 py-2 rounded-lg font-black uppercase tracking-wider shadow-sm">Lunas</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ExpenseScreen({ expenses, setExpenses, themeObj, showToast }) {
  const [form, setForm] = useState({ desc: '', amount: '' });
  const handleAdd = (e) => {
    e.preventDefault();
    setExpenses([...expenses, { id: Date.now(), desc: form.desc, amount: Number(form.amount), date: new Date().toLocaleDateString('id-ID') }]);
    setForm({ desc: '', amount: '' });
    showToast('Pengeluaran dicatat', 'success');
  };
  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h2 className="text-3xl font-black mb-8 text-slate-800">Catat Pengeluaran Warung</h2>
      <form onSubmit={handleAdd} className="flex gap-4 mb-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
         <input required className="border-2 border-slate-200 p-3 rounded-xl flex-1 bg-slate-50 font-medium outline-none" placeholder="Keperluan (Cth: Beli Plastik, Listrik)" value={form.desc} onChange={e=>setForm({...form, desc:e.target.value})} />
         <input required type="number" className="border-2 border-slate-200 p-3 rounded-xl w-48 bg-slate-50 font-medium outline-none" placeholder="Jumlah (Rp)" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} />
         <button className="bg-red-600 text-white px-8 font-black rounded-xl hover:bg-red-700 shadow-md">Catat</button>
      </form>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-6">
        {expenses.length === 0 ? <p className="text-slate-400 text-center font-medium py-4">Belum ada pengeluaran dicatat.</p> : null}
        {expenses.map(e => (
          <div key={e.id} className="flex justify-between items-center border-b border-slate-100 py-4 last:border-0">
            <div><div className="font-bold text-slate-800 text-lg">{e.desc}</div><div className="text-xs font-medium text-slate-400 mt-1">{e.date}</div></div>
            <div className="font-black text-red-600 text-xl">- Rp {e.amount.toLocaleString('id-ID')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 4. HRIS & PENGGAJIAN
// ==========================================
function EmployeeScreen({ employees, setEmployees, showToast, themeObj }) {
  const [form, setForm] = useState({ name: '', role: 'cashier', baseSalary: '' });
  
  const handleAdd = (e) => {
    e.preventDefault();
    setEmployees([...employees, { id: Date.now().toString(), name: form.name, role: form.role, baseSalary: Number(form.baseSalary) }]);
    setForm({ name: '', role: 'cashier', baseSalary: '' });
    showToast('Karyawan Berhasil Ditambahkan', 'success');
  };

  const ROLE_LABELS = {
    manager: 'Manager Toko', admin: 'Admin Operasional', gudang: 'Staff Gudang', cashier: 'Kasir', sales: 'Pelayan / Sales'
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <h2 className="text-3xl font-black mb-8 text-slate-800">Manajemen Karyawan (RBAC)</h2>
      <form onSubmit={handleAdd} className="flex flex-col md:flex-row gap-4 mb-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <input required className="border-2 border-slate-200 p-3 rounded-xl flex-1 bg-slate-50 font-medium outline-none" placeholder="Nama Lengkap" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <select className="border-2 border-slate-200 p-3 rounded-xl font-bold text-slate-600 bg-slate-50 outline-none" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
           {Object.keys(ROLE_LABELS).map(key => <option key={key} value={key}>{ROLE_LABELS[key]}</option>)}
        </select>
        <input required type="number" className="border-2 border-slate-200 p-3 rounded-xl bg-slate-50 font-medium outline-none" placeholder="Gaji Pokok (Rp)" value={form.baseSalary} onChange={e=>setForm({...form, baseSalary:e.target.value})} />
        <button className={`${themeObj.bg} text-white px-8 font-black rounded-xl shadow-md hover:opacity-90`}>Simpan</button>
      </form>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500"><tr><th className="p-6">Nama Karyawan</th><th className="p-6">Role Akses</th><th className="p-6">Gaji Pokok</th></tr></thead>
           <tbody className="divide-y divide-slate-100 font-medium">
             {employees.map(e => (
               <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                 <td className="p-6 font-bold text-slate-800 text-lg">{e.name}</td>
                 <td className="p-6"><span className={`${themeObj.light} ${themeObj.text} border ${themeObj.border} px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider`}>{ROLE_LABELS[e.role] || e.role}</span></td>
                 <td className="p-6 text-slate-600">Rp {e.baseSalary.toLocaleString('id-ID')}</td>
               </tr>
             ))}
           </tbody>
        </table>
      </div>
    </div>
  );
}

function PayrollScreen({ employees, commissions, attendance, setAttendance, showToast, themeObj }) {
  const today = new Date().toLocaleDateString('id-ID');
  
  const handleAbsen = (empId, isMasuk) => {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    const existing = attendance.find(a => a.empId === empId && a.date === today);
    if(existing) {
      if(!isMasuk && !existing.out) existing.out = time;
      setAttendance([...attendance]);
    } else if(isMasuk) {
      setAttendance([...attendance, { empId, date: today, in: time, out: null }]);
    }
    showToast(`Absen ${isMasuk ? 'Masuk' : 'Keluar'} Tersimpan`, 'success');
  };

  const getComm = (id) => commissions.filter(c => c.empId === id).reduce((s, c) => s + c.amount, 0);

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <h2 className="text-3xl font-black mb-8 text-slate-800">Absensi & Rekap Gaji</h2>
      
      {/* Panel Absensi */}
      <h3 className="font-bold text-xl mb-4 text-slate-700">Absen Hari Ini ({today})</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
         {employees.map(e => {
           const rec = attendance.find(a => a.empId === e.id && a.date === today) || {};
           return (
             <div key={e.id} className="bg-white p-6 rounded-3xl shadow-sm border border-slate-200">
               <div className="font-black text-lg text-slate-800 mb-4">{e.name} <span className="text-xs font-bold text-slate-400 uppercase ml-2">({e.role})</span></div>
               <div className="flex gap-4">
                 <div className="flex-1">
                   <div className="text-[10px] font-black text-slate-400 uppercase mb-2">Jam Masuk</div>
                   {rec.in ? <div className="font-bold text-green-600 bg-green-50 p-2 rounded-lg text-center border border-green-200">{rec.in}</div> : <button onClick={() => handleAbsen(e.id, true)} className="w-full bg-slate-100 hover:bg-green-100 hover:text-green-700 font-bold text-slate-600 p-2 rounded-lg transition-colors">Catat</button>}
                 </div>
                 <div className="flex-1">
                   <div className="text-[10px] font-black text-slate-400 uppercase mb-2">Jam Keluar</div>
                   {rec.out ? <div className="font-bold text-blue-600 bg-blue-50 p-2 rounded-lg text-center border border-blue-200">{rec.out}</div> : <button disabled={!rec.in} onClick={() => handleAbsen(e.id, false)} className="w-full bg-slate-100 hover:bg-blue-100 hover:text-blue-700 disabled:opacity-50 font-bold text-slate-600 p-2 rounded-lg transition-colors">Catat</button>}
                 </div>
               </div>
             </div>
           )
         })}
      </div>

      {/* Payroll */}
      <h3 className="font-bold text-xl mb-4 text-slate-700">Estimasi Payroll & Bonus Bulan Ini</h3>
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
           <thead className="bg-slate-50 border-b border-slate-200 font-bold text-xs uppercase tracking-wider text-slate-500">
             <tr><th className="p-6">Karyawan</th><th className="p-6">Gaji Pokok</th><th className="p-6 text-green-600">Bonus Penjualan</th><th className="p-6 text-blue-600">Total Diterima</th></tr>
           </thead>
           <tbody className="divide-y divide-slate-100 font-medium">
             {employees.map(e => {
               const comm = getComm(e.id);
               return (
                 <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                   <td className="p-6 font-bold text-slate-800 text-lg">{e.name}</td>
                   <td className="p-6 text-slate-600">Rp {e.baseSalary.toLocaleString('id-ID')}</td>
                   <td className="p-6 font-black text-green-600">Rp {comm.toLocaleString('id-ID')}</td>
                   <td className={`p-6 font-black text-xl ${themeObj.text}`}>Rp {(e.baseSalary + comm).toLocaleString('id-ID')}</td>
                 </tr>
               )
             })}
           </tbody>
        </table>
      </div>
    </div>
  );
}
