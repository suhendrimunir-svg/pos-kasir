import React, { useState } from 'react';
import { ShoppingCart, Package, Users, LogOut, LayoutDashboard, Store, ChevronRight, CheckCircle2, Lock, XCircle, AlertTriangle, Briefcase, CalendarClock, Settings, Edit, Palette, ScanBarcode, ArrowRight, MessageCircle, Trash2, Printer, Phone, BarChart3, Smartphone, Zap, ShieldCheck } from 'lucide-react';

const initialProducts = [
  { id: '1', name: 'Kopi Susu Gula Aren', price: 18000, modal: 12000, stock: 50, grosirQty: 10, grosirPrice: 15000 },
  { id: '2', name: 'Beras Pandan Wangi 5kg', price: 65000, modal: 58000, stock: 20, grosirQty: 5, grosirPrice: 63000 },
];
const initialCustomers = [{ id: '1', name: 'Budi Santoso', phone: '08123456789', hutang: 0 }];
const initialEmployees = [
  { id: 'e1', name: 'Owner', role: 'owner', baseSalary: 0 },
  { id: 'e2', name: 'Siti (Kasir)', role: 'cashier', baseSalary: 2000000 },
];

const THEMES = {
  blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600', light: 'bg-blue-50' },
  emerald: { bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-600', light: 'bg-emerald-50' },
  orange: { bg: 'bg-orange-600', hover: 'hover:bg-orange-700', text: 'text-orange-600', light: 'bg-orange-50' },
  violet: { bg: 'bg-violet-600', hover: 'hover:bg-violet-700', text: 'text-violet-600', light: 'bg-violet-50' }
};

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [appUser, setAppUser] = useState(null);
  const [stores, setStores] = useState([]); 
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
  const [storeSettings, setStoreSettings] = useState({ 
    name: 'Toko Siak POS', 
    theme: 'blue',
    customNotes: 'Belum ada fitur custom tambahan.'
  });

  const showMessage = (text, type = 'success') => {
    setGlobalMessage({ text, type });
    setTimeout(() => setGlobalMessage(null), 3000);
  };

  const themeColors = THEMES[storeSettings.theme] || THEMES.blue;

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
      const expiry = new Date();
      expiry.setDate(expiry.getDate() + 30); 
      
      const newStore = { id: Date.now(), name: data.storeName, status: 'trial', expiryDate: expiry.toISOString() };
      setStores([...stores, newStore]);
      
      setAppUser({ role: 'owner', name: data.username, status: 'trial', expiryDate: expiry.toISOString() });
      setStoreSettings({ ...storeSettings, name: data.storeName });
      showMessage('Pendaftaran Berhasil! Nikmati 30 Hari Gratis.', 'success');
      setCurrentView('app');
    }
  };

  const hasAccess = (tab) => {
    const role = appUser?.role;
    if (role === 'owner' || role === 'manager') return true;
    if (role === 'admin') return ['dashboard', 'inventory', 'customers', 'expenses'].includes(tab);
    if (role === 'gudang') return ['inventory'].includes(tab);
    if (role === 'cashier' || role === 'sales') return ['pos', 'customers', 'attendance'].includes(tab);
    return false;
  };

  if (currentView === 'landing') return <LandingPage onNavigate={setCurrentView} theme={THEMES.blue} />;
  if (currentView === 'auth') return <AuthScreen onAuth={handleAuth} theme={THEMES.blue} />;
  if (currentView === 'admin_panel') return <SuperAdminPanel stores={stores} setStores={setStores} onLogout={() => {setAppUser(null); setCurrentView('landing');}} showMessage={showMessage} />;
  if (currentView === 'payment') return <PaymentInstructionScreen onBack={() => setCurrentView('app')} themeColors={themeColors} />;

  // APP VIEW (BACK OFFICE & POS)
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

      {/* MAIN CONTENT */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        {appUser?.status === 'trial' && (
          <div className="bg-gradient-to-r from-amber-400 to-orange-500 text-white p-3 text-center text-sm font-bold flex justify-center items-center gap-4 shadow-md z-10">
            <AlertTriangle size={18} /> MASA PERCOBAAN GRATIS: Sisa waktu 30 Hari. 
            <button onClick={() => setCurrentView('payment')} className="bg-white text-orange-600 px-4 py-1 rounded-full text-xs hover:bg-orange-50 shadow transition-transform hover:scale-105">Aktivasi Lifetime</button>
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
// 1. LANDING PAGE (PROFESIONAL / ENTERPRISE)
// ==========================================
function LandingPage({ onNavigate, theme }) {
  const adminWaUrl = "https://wa.me/6285363770228?text=Halo%20Admin%20Siak%20POS,%20saya%20butuh%20bantuan%20atau%20ingin%20konsultasi%20aplikasi.";
  const confirmWaUrl = "https://wa.me/6285363770228?text=Halo%20Admin%20Siak%20POS,%20saya%20ingin%20konfirmasi%20pembayaran%20untuk%20Aktivasi%20Lifetime.";

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800">
      {/* --- NAVBAR --- */}
      <nav className="fixed top-0 w-full bg-white/95 backdrop-blur-md border-b z-50 px-6 lg:px-12 py-4 flex justify-between items-center shadow-sm">
        <div className={`font-extrabold text-2xl flex items-center gap-2 ${theme.text}`}><Store size={28}/> Siak POS</div>
        <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
          <a href="#fitur" className="hover:text-blue-600">Fitur</a>
          <a href="#harga" className="hover:text-blue-600">Harga</a>
          <a href="#demo" className="hover:text-blue-600">Akun Demo</a>
        </div>
        <div className="space-x-3 flex items-center">
          <button onClick={() => onNavigate('auth')} className="text-slate-700 font-bold hover:text-blue-600 px-4 py-2 transition-colors">Masuk</button>
          <button onClick={() => onNavigate('auth')} className={`${theme.bg} text-white px-6 py-2.5 rounded-full font-bold hover:shadow-lg transition-all transform hover:-translate-y-0.5`}>Coba Gratis 30 Hari</button>
        </div>
      </nav>

      {/* --- HERO SECTION --- */}
      <section className="pt-32 pb-20 px-6 lg:px-12 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex-1 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 font-bold px-4 py-2 rounded-full text-sm mb-6">
            <Zap size={16}/> Aplikasi Kasir UMKM & Retail Terbaik
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 mb-6 leading-tight">
            Kelola Bisnis Lebih Rapi.<br/>Cukup <span className={`${theme.text} underline decoration-wavy`}>Sekali Beli</span> Selamanya.
          </h1>
          <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto lg:mx-0">
            Terintegrasi penuh. Mulai dari kasir cerdas, manajemen stok grosir, laporan laba rugi otomatis, pencatatan piutang, hingga absensi karyawan dalam satu platform. Tanpa biaya bulanan!
          </p>
          <div className="flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
            <button onClick={() => onNavigate('auth')} className={`${theme.bg} text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl shadow-blue-200 hover:scale-105 transition-transform flex items-center justify-center gap-2`}>
              Coba Gratis Sekarang <ArrowRight size={20}/>
            </button>
            <a href={adminWaUrl} target="_blank" rel="noreferrer" className="bg-white border border-slate-300 text-slate-700 px-8 py-4 rounded-full font-bold text-lg hover:border-green-500 hover:text-green-600 transition-colors flex items-center justify-center gap-2 shadow-sm">
              <MessageCircle size={20}/> Hubungi Tim Support
            </a>
          </div>
        </div>
        
        {/* Hero Image / Mockup Simulasi */}
        <div className="flex-1 w-full max-w-lg relative">
          <div className="absolute inset-0 bg-blue-400 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <div className="bg-white p-4 rounded-3xl shadow-2xl border border-slate-100 relative z-10 transform rotate-2 hover:rotate-0 transition-transform duration-500">
            <div className="bg-slate-100 rounded-2xl h-80 flex flex-col items-center justify-center border-dashed border-2 border-slate-300 relative overflow-hidden">
               <BarChart3 size={80} className="text-blue-200 mb-4" />
               <div className="font-bold text-slate-400">Dashboard Laba Rugi Real-Time</div>
               {/* Hiasan UI Mockup */}
               <div className="absolute bottom-4 left-4 right-4 bg-white p-3 rounded-xl shadow-sm flex justify-between items-center">
                  <div className="flex items-center gap-2"><div className="w-8 h-8 bg-green-100 rounded-full"></div><div><div className="w-20 h-2 bg-slate-200 rounded mb-1"></div><div className="w-12 h-2 bg-slate-200 rounded"></div></div></div>
                  <div className="w-16 h-4 bg-green-200 rounded"></div>
               </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- FITUR UNGGULAN (FEATURES GRID) --- */}
      <section id="fitur" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Fitur Lengkap Untuk Segala Jenis Usaha</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">Dirancang berdasarkan pengalaman nyata UMKM, memastikan Anda mendapatkan alat ukur yang paling dibutuhkan tanpa kerumitan berlebih.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon={<ScanBarcode size={32} className="text-blue-600"/>} title="Kasir Cepat & Barcode" desc="Proses checkout super cepat menggunakan pemindai barcode. Cetak struk atau bagikan ke WA." />
            <FeatureCard icon={<Package size={32} className="text-emerald-600"/>} title="Manajemen Stok & Grosir" desc="Atur harga modal, harga jual, dan harga grosir otomatis. Pantau sisa stok secara real-time." />
            <FeatureCard icon={<BarChart3 size={32} className="text-orange-600"/>} title="Laporan Laba Otomatis" desc="Sistem akan menghitung laba bersih Anda berdasarkan harga modal dan pengeluaran harian." />
            <FeatureCard icon={<Users size={32} className="text-purple-600"/>} title="Catat Piutang (Hutang)" desc="Tidak perlu buku catatan! Catat pelanggan yang berhutang dan pantau sisa pembayarannya." />
            <FeatureCard icon={<Briefcase size={32} className="text-rose-600"/>} title="HRIS & Absensi Karyawan" desc="Kelola data karyawan, batasi hak akses aplikasi, dan catat absensi masuk/pulang sesuai shift." />
            <FeatureCard icon={<Smartphone size={32} className="text-teal-600"/>} title="Share Katalog WA" desc="Satu klik untuk membagikan daftar produk lengkap dengan harganya ke WhatsApp pelanggan." />
          </div>
        </div>
      </section>

      {/* --- MENGAPA MEMILIH KAMI (BENEFITS) --- */}
      <section className="py-20 bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1 space-y-8">
            <h2 className="text-3xl md:text-4xl font-extrabold leading-tight">Alasan Ribuan UMKM Beralih ke Siak POS</h2>
            <div className="space-y-6">
              <div className="flex gap-4"><CheckCircle2 className="text-emerald-400 shrink-0 mt-1"/><p><b>Sekali Beli, Pakai Selamanya.</b> Lupakan tagihan langganan bulanan atau tahunan yang memberatkan.</p></div>
              <div className="flex gap-4"><ShieldCheck className="text-emerald-400 shrink-0 mt-1"/><p><b>Aman & Tanpa Iklan.</b> Data toko Anda dijamin aman dan tampilan aplikasi 100% bersih dari iklan mengganggu.</p></div>
              <div className="flex gap-4"><Settings className="text-emerald-400 shrink-0 mt-1"/><p><b>Dapat Disesuaikan (Custom).</b> Butuh fitur tambahan khusus untuk toko Anda? Kami siap membuatkannya!</p></div>
            </div>
          </div>
          <div className="flex-1 bg-slate-800 p-8 rounded-3xl border border-slate-700 shadow-2xl">
            <h3 className="text-2xl font-bold mb-6 text-blue-400 text-center">Cara Mulai Sangat Mudah</h3>
            <ul className="space-y-6">
              <li className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">1</div> Daftar akun gratis</li>
              <li className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">2</div> Nikmati 30 Hari Percobaan penuh</li>
              <li className="flex items-center gap-4"><div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold">3</div> Lakukan pembayaran untuk Aktivasi Lifetime</li>
            </ul>
          </div>
        </div>
      </section>

      {/* --- HARGA & PEMBAYARAN (PRICING) --- */}
      <section id="harga" className="py-20 bg-slate-50">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-4">Harga Promo Terbatas</h2>
            <p className="text-lg text-slate-600">Investasi terbaik untuk memajukan bisnis Anda hari ini.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Box Harga */}
            <div className="bg-white p-8 rounded-3xl shadow-xl border border-blue-100 flex flex-col justify-center text-center relative overflow-hidden transform hover:-translate-y-2 transition-transform">
              <div className="absolute top-0 right-0 bg-orange-500 text-white text-xs font-bold px-6 py-2 rounded-bl-xl shadow-md">PROMO LIFETIME</div>
              <h3 className="text-2xl font-extrabold mb-2 text-slate-800 mt-4">Paket Sekali Beli</h3>
              <p className="text-slate-500 mb-6">Akses semua fitur selamanya, tanpa syarat tambahan.</p>
              <div className="text-slate-400 line-through text-lg mb-1 font-bold">Rp 1.500.000</div>
              <div className="text-5xl font-black text-blue-600 mb-8">Rp 1.299.000</div>
              <button onClick={() => onNavigate('auth')} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 transition-colors shadow-lg text-lg">Ambil Promo Sekarang</button>
              <p className="text-xs text-slate-400 mt-4">*Sudah termasuk layanan support via WhatsApp</p>
            </div>

            {/* Info Pembayaran */}
            <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200">
              <h3 className="text-xl font-bold mb-6 text-slate-800 border-b pb-4">Instruksi Pembayaran & Aktivasi</h3>
              <p className="text-sm text-slate-600 mb-6">Jika Anda sudah mendaftar dan ingin mengubah status dari Trial ke Lifetime, silakan transfer melalui salah satu metode berikut:</p>
              
              <div className="space-y-4 mb-6">
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1 flex justify-between"><span>Bank Transfer</span><span className="text-orange-500">SeaBank</span></div>
                  <div className="text-xl font-mono text-slate-800 font-extrabold tracking-wider">9010 6464 0699</div>
                  <div className="text-sm text-slate-600">a.n Richky Irawan</div>
                </div>
                
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                  <div className="text-xs text-slate-500 font-bold uppercase mb-1 flex justify-between"><span>E-Wallet / QRIS</span><span className="text-blue-500">GoPay/OVO/Dana</span></div>
                  <div className="text-xl font-mono text-slate-800 font-extrabold tracking-wider">0852 7496 4111</div>
                </div>
              </div>

              <a href={confirmWaUrl} target="_blank" rel="noreferrer" className="block text-center bg-green-500 text-white py-3 rounded-xl font-bold hover:bg-green-600 transition-colors shadow-md">
                Kirim Bukti Transfer ke WA
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* --- AKUN DEMO (TRIAL PREVIEW) --- */}
      <section id="demo" className="py-20 bg-blue-600 text-white text-center">
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-3xl font-extrabold mb-6 flex items-center justify-center gap-3"><Lock size={32}/> Coba Akun Demo Sekarang!</h2>
          <p className="text-blue-100 mb-10 text-lg">Ingin melihat kehebatan aplikasi dari dalam sebelum mendaftar? Gunakan akun di bawah ini pada menu Masuk.</p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
               <div className="text-xs font-bold text-blue-200 uppercase mb-2">Simulasi Akses Owner / Manager</div>
               <div className="text-2xl font-mono font-bold text-white mb-1">admin</div>
               <div className="text-slate-300">Password: 123</div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
               <div className="text-xs font-bold text-blue-200 uppercase mb-2">Simulasi Akses Kasir Operasional</div>
               <div className="text-2xl font-mono font-bold text-white mb-1">kasir</div>
               <div className="text-slate-300">Password: 123</div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 py-8 text-center text-sm border-t border-slate-800">
        <p>© 2026 Siak POS System. All rights reserved. Solusi UMKM Pintar.</p>
      </footer>
    </div>
  );
}

// Komponen Helper untuk Feature Card di Landing Page
const FeatureCard = ({ icon, title, desc }) => (
  <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 hover:shadow-xl hover:border-blue-100 transition-all transform hover:-translate-y-1">
    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center shadow-sm mb-6">{icon}</div>
    <h3 className="text-xl font-bold text-slate-800 mb-3">{title}</h3>
    <p className="text-slate-600 leading-relaxed">{desc}</p>
  </div>
);

// ==========================================
// 2. AUTH SCREEN
// ==========================================
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
              <input required className="w-full p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Contoh: Toko Berkah" onChange={e => setForm({...form, storeName: e.target.value})} />
            </div>
          )}
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Username</label>
            <input required className="w-full p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="Username Anda" onChange={e => setForm({...form, username: e.target.value})} />
          </div>
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1">Password</label>
            <input required type="password" className="w-full p-4 bg-slate-50 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none" placeholder="••••••••" onChange={e => setForm({...form, password: e.target.value})} />
          </div>
          <button onClick={() => onAuth(isLogin ? 'login' : 'register', form)} className={`w-full ${theme.bg} text-white font-bold py-4 rounded-xl shadow-lg hover:-translate-y-0.5 transition-all mt-6 text-lg`}>
            {isLogin ? 'Masuk Sekarang' : 'Daftar & Mulai 30 Hari Gratis'}
          </button>
        </div>
        <div className="mt-8 text-center border-t pt-6">
          <button onClick={() => setIsLogin(!isLogin)} className={`font-bold ${theme.text} hover:underline`}>{isLogin ? 'Belum punya akun? Daftar Gratis' : 'Sudah punya akun? Masuk di sini'}</button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. BACK OFFICE & POS (DIAMANKAN, TIDAK DIUBAH FUNGSINYA)
// ==========================================
function DashboardScreen({ transactions, expenses, theme }) {
  const totalOmzet = transactions.reduce((sum, trx) => sum + trx.total, 0);
  const totalModal = transactions.reduce((sum, trx) => sum + trx.items.reduce((itemSum, item) => itemSum + (item.modal * item.qty), 0), 0);
  const kotor = totalOmzet - totalModal;
  const totalPengeluaran = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const labaBersih = kotor - totalPengeluaran;

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-2">Analisis WarungKu</h2>
      <p className="text-slate-500 mb-8">Ringkasan penjualan dan laba otomatis hari ini.</p>
      
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

  const handleBarcodeSubmit = (e) => {
    e.preventDefault();
    const product = products.find(p => p.id === barcode || p.name.toLowerCase().includes(barcode.toLowerCase()));
    if (product) { addToCart(product); setBarcode(''); } 
    else { showMessage('Barang tidak ditemukan!', 'error'); }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return showMessage('Stok habis!', 'error');
    let currentCart = [...cart];
    const existIndex = currentCart.findIndex(i => i.id === product.id);
    
    if (existIndex >= 0) currentCart[existIndex].qty += 1;
    else currentCart.push({ ...product, qty: 1 });

    currentCart = currentCart.map(item => {
      if (item.grosirQty > 0 && item.qty >= item.grosirQty) return { ...item, appliedPrice: item.grosirPrice, isGrosir: true };
      return { ...item, appliedPrice: item.price, isGrosir: false };
    });
    setCart(currentCart);
  };

  const totalCart = cart.reduce((sum, item) => sum + (item.appliedPrice * item.qty), 0);

  const handleCheckout = (isHutang = false) => {
    if (cart.length === 0) return;
    if (isHutang && !selectedCust) return showMessage('Pilih pelanggan dulu untuk catat hutang!', 'error');

    const updatedProducts = products.map(p => {
      const c = cart.find(i => i.id === p.id);
      return c ? { ...p, stock: p.stock - c.qty } : p;
    });
    setProducts(updatedProducts);

    if (isHutang) setCustomers(customers.map(c => c.id === selectedCust ? { ...c, hutang: c.hutang + totalCart } : c));

    setTransactions([...transactions, { id: 'TRX'+Date.now(), items: cart, total: totalCart, type: isHutang ? 'Hutang' : 'Lunas', custId: selectedCust }]);
    showMessage(isHutang ? 'Hutang Berhasil Dicatat!' : 'Pembayaran Lunas Berhasil!', 'success');
    setCart([]); setSelectedCust('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full pb-10">
      <div className="flex-1 flex flex-col">
        <form onSubmit={handleBarcodeSubmit} className="mb-6 flex gap-2">
          <div className="relative flex-1">
            <ScanBarcode className="absolute left-4 top-4 text-slate-400" size={20} />
            <input type="text" autoFocus placeholder="Scan Barcode / ketik nama (Tekan Enter)" className="w-full pl-12 pr-4 py-4 rounded-2xl shadow-sm outline-none text-lg border" value={barcode} onChange={e => setBarcode(e.target.value)} />
          </div>
        </form>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 overflow-y-auto">
          {products.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock <= 0} className={`p-5 rounded-3xl text-left flex flex-col justify-between transition-all border-2 border-transparent ${p.stock > 0 ? `bg-white shadow-sm hover:shadow-lg ${theme.hover} hover:text-white group` : 'bg-slate-100 opacity-50'}`}>
              <div className="font-bold text-slate-800 group-hover:text-white mb-4">{p.name}</div>
              <div>
                <div className={`text-lg font-extrabold ${theme.text} group-hover:text-white`}>Rp {p.price.toLocaleString('id-ID')}</div>
                {p.grosirQty > 0 && <div className="text-[10px] font-bold text-orange-500 bg-orange-50 px-2 py-0.5 rounded-full inline-block mt-1">Grosir: Beli {p.grosirQty} Rp {p.grosirPrice/1000}k</div>}
                <div className="text-xs font-medium text-slate-400 mt-2">Stok: {p.stock}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="w-full lg:w-96 bg-white rounded-3xl shadow-xl flex flex-col border overflow-hidden">
        <div className="p-6 bg-slate-50 flex justify-between items-center border-b"><h2 className="font-extrabold text-xl">Struk Kasir</h2><span className="bg-slate-200 text-xs font-bold px-3 py-1.5 rounded-full">{cart.length} Brg</span></div>
        <div className="p-6 flex-1 overflow-y-auto space-y-4">
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-start">
              <div className="flex-1">
                <div className="font-bold text-slate-800">{item.name}</div>
                <div className="text-xs text-slate-500">{item.qty} x Rp {item.appliedPrice.toLocaleString('id-ID')}</div>
                {item.isGrosir && <div className="text-[10px] text-orange-500 font-bold">Harga Grosir</div>}
              </div>
              <div className="font-extrabold text-slate-800">Rp {(item.appliedPrice * item.qty).toLocaleString('id-ID')}</div>
              <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="ml-4 text-red-400"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
        <div className="p-6 bg-slate-50 border-t">
          <select className="w-full mb-4 p-3 rounded-xl border bg-white" value={selectedCust} onChange={e => setSelectedCust(e.target.value)}>
            <option value="">-- Pilih Pelanggan (Hutang) --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <div className="flex justify-between items-end mb-6"><span className="text-sm font-bold text-slate-500">TOTAL</span><span className={`text-3xl font-black ${theme.text}`}>Rp {totalCart.toLocaleString('id-ID')}</span></div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => handleCheckout(true)} disabled={cart.length === 0} className="bg-yellow-400 text-yellow-900 font-bold py-4 rounded-2xl">Hutang</button>
            <button onClick={() => handleCheckout(false)} disabled={cart.length === 0} className={`${theme.bg} text-white font-bold py-4 rounded-2xl shadow-lg`}>Lunas & Cetak</button>
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryScreen({ products, setProducts, showMessage, theme }) {
  const [form, setForm] = useState({ id: '', name: '', price: '', modal: '', stock: '', grosirQty: '0', grosirPrice: '0' });
  const saveProduct = (e) => {
    e.preventDefault();
    setProducts([...products, { ...form, id: Date.now().toString(), price: Number(form.price), modal: Number(form.modal), stock: Number(form.stock), grosirQty: Number(form.grosirQty), grosirPrice: Number(form.grosirPrice) }]);
    setForm({ id: '', name: '', price: '', modal: '', stock: '', grosirQty: '0', grosirPrice: '0' });
    showMessage('Produk ditambahkan!');
  };

  return (
    <div className="max-w-6xl mx-auto pb-20">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-6">Inventaris & Grosir</h2>
      <form onSubmit={saveProduct} className="bg-white p-6 rounded-3xl shadow-sm border mb-8 grid grid-cols-1 md:grid-cols-3 gap-4">
        <input required placeholder="Nama Barang" className="border p-3 rounded-xl" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
        <input required type="number" placeholder="Harga Jual" className="border p-3 rounded-xl" value={form.price} onChange={e => setForm({...form, price: e.target.value})} />
        <input required type="number" placeholder="Harga Modal (Utk Laba)" className="border p-3 rounded-xl" value={form.modal} onChange={e => setForm({...form, modal: e.target.value})} />
        <input required type="number" placeholder="Stok" className="border p-3 rounded-xl" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} />
        <input type="number" placeholder="Batas Grosir (Opsional)" className="border p-3 rounded-xl" value={form.grosirQty} onChange={e => setForm({...form, grosirQty: e.target.value})} />
        <input type="number" placeholder="Harga Grosir (Opsional)" className="border p-3 rounded-xl" value={form.grosirPrice} onChange={e => setForm({...form, grosirPrice: e.target.value})} />
        <div className="md:col-span-3 flex gap-2"><button type="submit" className={`${theme.bg} text-white px-8 py-3 rounded-xl font-bold`}>Simpan Barang</button></div>
      </form>

      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        <table className="w-full text-left"><thead className="bg-slate-50 border-b"><tr><th className="p-4">Barang</th><th className="p-4">Stok</th><th className="p-4">Aksi</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b"><td className="p-4 font-bold">{p.name}</td><td className="p-4">{p.stock}</td><td className="p-4"><button onClick={() => setProducts(products.filter(x=>x.id!==p.id))} className="text-red-500"><Trash2 size={18}/></button></td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CustomerScreen({ customers, setCustomers, showMessage, theme }) {
  const [name, setName] = useState('');
  const addCust = (e) => { e.preventDefault(); setCustomers([...customers, { id: Date.now().toString(), name, hutang: 0 }]); setName(''); showMessage('Pelanggan Ditambah!'); };
  return (
    <div className="max-w-4xl mx-auto pb-20"><h2 className="text-3xl font-extrabold mb-6">Piutang Pelanggan</h2>
      <form onSubmit={addCust} className="flex gap-4 mb-8"><input required placeholder="Nama Pelanggan" className="flex-1 p-4 rounded-xl border" value={name} onChange={e=>setName(e.target.value)} /><button type="submit" className={`${theme.bg} text-white px-8 font-bold rounded-xl`}>Tambah</button></form>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-6 rounded-3xl border flex justify-between items-center">
            <div><div className="font-bold text-lg">{c.name}</div><div className="text-sm font-bold">Hutang: <span className="text-red-500">Rp {c.hutang.toLocaleString('id-ID')}</span></div></div>
            <button onClick={() => setCustomers(customers.filter(x=>x.id!==c.id))} className="text-slate-400 hover:text-red-500"><Trash2/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function EmployeeScreen({ employees, setEmployees, theme }) {
  const [name, setName] = useState(''); const [role, setRole] = useState('cashier');
  const addEmp = (e) => { e.preventDefault(); setEmployees([...employees, { id: Date.now().toString(), name, role, baseSalary: 0 }]); setName(''); };
  return (
    <div className="max-w-4xl mx-auto pb-20"><h2 className="text-3xl font-extrabold mb-6">Data Karyawan</h2>
      <form onSubmit={addEmp} className="flex gap-4 mb-8 bg-white p-6 border rounded-3xl"><input required placeholder="Nama Karyawan" className="flex-1 p-3 rounded-xl border" value={name} onChange={e=>setName(e.target.value)} /><select className="border p-3 rounded-xl" value={role} onChange={e=>setRole(e.target.value)}><option value="admin">Admin</option><option value="cashier">Kasir</option></select><button type="submit" className={`${theme.bg} text-white px-8 font-bold rounded-xl`}>Tambah</button></form>
      <div className="bg-white rounded-3xl shadow-sm border overflow-hidden">
        {employees.map(e => (
          <div key={e.id} className="p-4 border-b flex justify-between items-center"><div><span className="font-bold">{e.name}</span> <span className="text-xs bg-slate-200 px-2 py-1 rounded ml-2">{e.role}</span></div>{e.role !== 'owner' && <button onClick={() => setEmployees(employees.filter(x=>x.id!==e.id))} className="text-red-400"><Trash2 size={18}/></button>}</div>
        ))}
      </div>
    </div>
  );
}

function AttendanceScreen({ employees, attendance, setAttendance, showMessage }) {
  const today = new Date().toLocaleDateString('id-ID');
  const [shift, setShift] = useState('Pagi');
  const handleAbsen = (empId, type) => {
    const time = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    let newAtt = [...attendance];
    const idx = newAtt.findIndex(a => a.empId === empId && a.date === today);
    if (idx >= 0) { if (type==='in') newAtt[idx].checkIn = time; else newAtt[idx].checkOut = time; }
    else newAtt.push({ id: Date.now(), empId, date: today, shift, checkIn: type==='in'?time:null, checkOut: type==='out'?time:null });
    setAttendance(newAtt); showMessage('Absen dicatat');
  };
  return (
    <div className="max-w-5xl mx-auto pb-20"><h2 className="text-3xl font-extrabold mb-6">Absensi & Shift</h2>
      <div className="bg-white p-6 rounded-3xl border mb-8"><select className="border p-2 rounded-xl" value={shift} onChange={e=>setShift(e.target.value)}><option value="Pagi">Shift Pagi</option><option value="Sore">Shift Sore</option></select></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {employees.map(emp => {
          const rec = attendance.find(a => a.empId === emp.id && a.date === today) || {};
          return (
            <div key={emp.id} className="bg-white p-6 rounded-3xl border">
              <div className="font-extrabold text-xl mb-4">{emp.name} {rec.shift && <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">{rec.shift}</span>}</div>
              <div className="flex gap-4"><div className="flex-1"><button onClick={()=>handleAbsen(emp.id, 'in')} className="w-full bg-emerald-100 text-emerald-700 py-2 rounded-xl">Masuk {rec.checkIn}</button></div><div className="flex-1"><button onClick={()=>handleAbsen(emp.id, 'out')} className="w-full bg-blue-100 text-blue-700 py-2 rounded-xl">Pulang {rec.checkOut}</button></div></div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SettingsScreen({ storeSettings, setStoreSettings, themes, showMessage, theme }) {
  const requestWaUrl = `https://wa.me/6285363770228?text=Halo%20Admin%20Siak%20POS,%20saya%20dari%20toko%20${storeSettings.name}%20ingin%20request%20penambahan%20fitur%20custom.`;

  return (
    <div className="max-w-2xl mx-auto bg-white p-8 rounded-3xl shadow-sm border border-slate-100 pb-20">
      <h2 className="text-3xl font-extrabold text-slate-800 mb-8">Pengaturan Toko</h2>
      <div className="mb-8"><label className="block text-sm font-bold mb-2">Nama Toko</label><input className="w-full border p-4 rounded-xl font-bold text-lg" value={storeSettings.name} onChange={e => setStoreSettings({...storeSettings, name: e.target.value})} /></div>
      <div className="mb-10"><label className="block text-sm font-bold mb-4">Warna Tema Aplikasi</label><div className="flex gap-4">
          {Object.keys(themes).map(tKey => (<button key={tKey} onClick={() => {setStoreSettings({...storeSettings, theme: tKey}); showMessage('Tema diubah!');}} className={`w-14 h-14 rounded-full ${themes[tKey].bg} ring-offset-4 transition-all ${storeSettings.theme === tKey ? 'ring-4 scale-110' : ''}`}></button>))}
      </div></div>

      <div className="border-t pt-8 mt-8">
        <h3 className="font-bold text-xl mb-2 flex items-center gap-2"><Briefcase className="text-blue-500"/> Modul Kustom (Bisa Request)</h3>
        <p className="text-sm text-slate-500 mb-6">Butuh fitur khusus yang belum ada? (Misal: Catatan nomor rak, integrasi expedisi, ukuran baju, dll). Anda bisa merequest langsung ke developer kami.</p>
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-4 text-sm font-mono text-slate-600">
           Status Custom Toko Saat ini: <br/><strong>{storeSettings.customNotes}</strong>
        </div>
        <a href={requestWaUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 bg-green-500 text-white px-6 py-3 rounded-xl font-bold hover:bg-green-600 transition-colors">
          <Phone size={18}/> Request Fitur Custom via WA
        </a>
      </div>
    </div>
  );
}

// ==========================================
// 4. LIFETIME PAYMENT & SUPERADMIN
// ==========================================
function PaymentInstructionScreen({ onBack, themeColors }) {
  const confirmWaUrl = "https://wa.me/6285363770228?text=Halo%20Admin%20Siak%20POS,%20saya%20sudah%20transfer%20untuk%20Aktivasi%20Lifetime.%20Ini%20bukti%20transfernya:";
  return (
    <div className="min-h-screen bg-slate-50 p-6 flex flex-col items-center justify-center">
      <div className="bg-white p-10 rounded-3xl shadow-xl max-w-2xl w-full text-center border-t-8 border-orange-500">
        <h2 className="text-3xl font-black text-slate-800 mb-4">Aktivasi Lifetime (Sekali Beli)</h2>
        <div className="bg-slate-50 p-6 rounded-2xl text-left border mb-6"><div className="font-bold text-slate-500 mb-2 uppercase">Bank Transfer</div><div className="text-2xl font-mono font-black">SeaBank 9010 6464 0699</div><div>a.n Richky Irawan</div></div>
        <div className="bg-slate-50 p-6 rounded-2xl text-left border mb-8"><div className="font-bold text-slate-500 mb-2 uppercase">E-Wallet / QRIS</div><div className="text-2xl font-mono font-black">0852 7496 4111</div></div>
        <a href={confirmWaUrl} target="_blank" rel="noreferrer" className={`block w-full ${themeColors.bg} text-white font-bold py-4 rounded-xl text-lg hover:shadow-lg`}>Konfirmasi Bukti Transfer (WA)</a>
        <button onClick={onBack} className="mt-6 text-slate-500 font-bold hover:underline">Nanti Saja, Lanjut Trial</button>
      </div>
    </div>
  );
}

function SuperAdminPanel({ stores, setStores, onLogout, showMessage }) {
  return (
    <div className="min-h-screen bg-slate-900 text-slate-200 p-10"><div className="max-w-5xl mx-auto"><div className="flex justify-between mb-10 border-b border-slate-700 pb-6"><h1 className="text-4xl font-black text-white">Superadmin Panel</h1><button onClick={onLogout} className="text-red-400">Keluar</button></div>
      <div className="bg-slate-800 rounded-3xl p-8"><h2 className="text-xl font-bold mb-6 flex gap-2"><Store/> Toko Mendaftar</h2>
        {stores.map(store => (
          <div key={store.id} className="bg-slate-700 p-6 rounded-2xl flex justify-between items-center mb-4">
            <div><h3 className="font-bold text-xl">{store.name}</h3><p className="text-slate-400">{store.status}</p></div>
            {store.status === 'trial' && <button onClick={() => {setStores(stores.map(s => s.id === store.id ? {...s, status: 'lifetime'} : s)); showMessage('Toko Lifetime Aktif!');}} className="bg-emerald-500 text-white px-6 py-3 rounded-xl font-bold">Aktifkan Lifetime</button>}
          </div>
        ))}
      </div></div></div>
  );
}

const SidebarBtn = ({ icon, label, active, onClick, theme }) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 p-3 rounded-xl font-medium ${active ? `${theme.light} ${theme.text} font-bold` : 'text-slate-400 hover:bg-white/10'}`}>{icon} {label}</button>
);
const StatCard = ({ title, value, color, bg }) => (
  <div className={`bg-white p-6 rounded-3xl shadow-sm border border-slate-100`}><div className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-2">{title}</div><div className={`text-3xl font-extrabold ${color}`}>{value}</div></div>
);
