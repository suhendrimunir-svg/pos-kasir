import React, { useState } from 'react';
import { 
  ShoppingCart, Package, Users, LogOut, Plus, Printer, Trash2, LayoutDashboard, 
  Store, CreditCard, ChevronRight, CheckCircle2, Briefcase, CalendarClock, 
  Wallet, FileText, Barcode, MessageCircle, Receipt, TrendingUp, TrendingDown,
  UserCheck, ShieldCheck, Smartphone, Zap, Star, ArrowRight, QrCode
} from 'lucide-react';

// --- DATA INITIAL ---
const initialProducts = [
  { id: '1', barcode: '111', name: 'Kopi Susu Gula Aren', costPrice: 10000, sellPrice: 18000, stock: 50, wholesaleQty: 5, wholesalePrice: 15000 },
  { id: '2', barcode: '222', name: 'Indomie Goreng', costPrice: 2500, sellPrice: 3500, stock: 100, wholesaleQty: 40, wholesalePrice: 3000 },
];
const initialEmployees = [{ id: 'e1', name: 'Siti (Kasir)', role: 'cashier', baseSalary: 1500000 }];
const initialCustomers = [{ id: 'c1', name: 'Bapak Budi', phone: '08123', points: 10, debt: 0 }];

export default function App() {
  const [currentView, setCurrentView] = useState('landing');
  const [appUser, setAppUser] = useState(null);
  
  // Superadmin State
  const [stores, setStores] = useState([]); 
  
  // App Core States
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);
  const [employees, setEmployees] = useState(initialEmployees);
  const [expenses, setExpenses] = useState([]); // {id, desc, amount, date}
  const [transactions, setTransactions] = useState([]); // {id, total, profit, type, date}
  
  // HR States
  const [attendance, setAttendance] = useState([]);
  const [commissions, setCommissions] = useState([]);
  
  const showMessage = (msg) => alert(msg);

  // --- LOGIC AUTH & ROUTING ---
  const handleAuth = (type, data) => {
    if (type === 'login') {
      if (data.username === 'superadmin' && data.password === '123') {
        setAppUser({ role: 'superadmin', name: 'Administrator' });
        setCurrentView('admin_panel');
      } else if (data.username === 'admin' && data.password === '123') {
        setAppUser({ role: 'owner', storeName: 'Toko Demo', status: 'active' });
        setCurrentView('app');
      } else {
        showMessage('Username atau password salah! (Coba admin/123)');
      }
    } else if (type === 'register') {
      const newStore = { id: Date.now(), name: data.storeName, status: 'pending', username: data.username };
      setStores([...stores, newStore]);
      setAppUser({ role: 'owner', storeName: data.storeName, status: 'pending' });
      setCurrentView('payment');
    }
  };

  // --- VIEWS ---

  if (currentView === 'landing') return <LandingPage onNavigate={setCurrentView} />;
  
  if (currentView === 'auth') return <AuthScreen onAuth={handleAuth} />;
  
  if (currentView === 'payment') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full text-center border-t-4 border-blue-600">
          <ShieldCheck className="w-16 h-16 text-blue-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Aktivasi Akun Lifetime</h2>
          <p className="text-gray-600 mb-6 text-sm">Cukup sekali bayar, pakai selamanya tanpa langganan bulanan!</p>
          
          <div className="bg-blue-50 p-4 rounded-xl text-left mb-6">
            <p className="font-bold text-sm text-blue-800 mb-2">1. Transfer Pembayaran ke:</p>
            <div className="bg-white p-3 rounded shadow-sm border font-mono text-lg mb-2">SeaBank: 9010 6464 0699 <br/><span className="text-sm font-sans font-bold">a.n Richky Irawan</span></div>
            <div className="bg-white p-3 rounded shadow-sm border font-mono text-lg">QRIS: 0852 7496 4111</div>
          </div>

          <div className="bg-green-50 p-4 rounded-xl text-left mb-6">
            <p className="font-bold text-sm text-green-800 mb-2">2. Konfirmasi ke WhatsApp:</p>
            <p className="text-sm text-gray-700">Kirim bukti transfer ke WA Admin: <br/><b className="text-lg">0853-6377-0228</b></p>
          </div>

          <p className="text-xs text-gray-400 mb-4">Toko Anda akan diaktifkan segera setelah admin memverifikasi pembayaran Anda.</p>
          <button onClick={() => setCurrentView('landing')} className="w-full text-blue-600 font-bold hover:underline">Kembali ke Beranda</button>
        </div>
      </div>
    );
  }

  if (currentView === 'admin_panel') {
    return (
      <div className="min-h-screen bg-slate-100 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Panel Super Admin</h1>
            <button onClick={() => {setAppUser(null); setCurrentView('landing');}} className="bg-red-600 text-white px-4 py-2 rounded">Keluar</button>
          </div>
          <div className="bg-white shadow rounded-xl p-6 border">
            <h2 className="text-xl font-bold mb-4">Menunggu Verifikasi (Konfirmasi WA)</h2>
            {stores.filter(s => s.status === 'pending').length === 0 ? <p className="text-gray-500">Tidak ada pendaftaran baru.</p> : null}
            {stores.filter(s => s.status === 'pending').map(store => (
              <div key={store.id} className="flex justify-between items-center p-4 border-b bg-slate-50 rounded mb-2">
                <div><h3 className="font-bold text-lg">{store.name}</h3><p className="text-sm text-gray-500">Username: {store.username}</p></div>
                <button onClick={() => { setStores(stores.map(s => s.id === store.id ? {...s, status: 'active'} : s)); showMessage(`Toko ${store.name} berhasil diaktifkan!`); }} className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-bold">Aktifkan Toko</button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // --- MAIN APP (BACKOFFICE & POS) ---
  return (
    <div className="flex h-screen bg-slate-50 font-sans text-slate-800">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col print:hidden">
        <div className="p-6 border-b border-slate-800">
          <h2 className="font-bold text-2xl text-blue-400 flex items-center gap-2"><Store/> WarungKu</h2>
          <p className="text-xs text-slate-400 mt-1">Toko: {appUser?.storeName}</p>
        </div>
        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${activeTab === 'dashboard' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><LayoutDashboard size={18}/> Analisis WarungKu</button>
          <button onClick={() => setActiveTab('pos')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${activeTab === 'pos' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><ShoppingCart size={18}/> Kasir</button>
          <button onClick={() => setActiveTab('inventory')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${activeTab === 'inventory' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><Package size={18}/> Kelola Produk</button>
          <button onClick={() => setActiveTab('customers')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${activeTab === 'customers' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><Users size={18}/> Pelanggan & Piutang</button>
          <button onClick={() => setActiveTab('expenses')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${activeTab === 'expenses' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><Receipt size={18}/> Catat Pengeluaran</button>
          
          <div className="pt-4 mt-4 border-t border-slate-800 text-xs font-bold text-slate-500 uppercase">Karyawan & Gaji</div>
          <button onClick={() => setActiveTab('employees')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${activeTab === 'employees' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><Briefcase size={18}/> Karyawan</button>
          <button onClick={() => setActiveTab('payroll')} className={`w-full flex items-center gap-3 p-3 rounded-lg text-left transition ${activeTab === 'payroll' ? 'bg-blue-600' : 'hover:bg-slate-800'}`}><Wallet size={18}/> Gaji & Komisi</button>
        </nav>
        <div className="p-4 border-t border-slate-800">
          <button onClick={() => {setCurrentView('landing'); setAppUser(null);}} className="w-full flex items-center justify-center gap-2 bg-red-950 text-red-400 p-3 rounded hover:bg-red-900 hover:text-white transition"><LogOut size={18}/> Keluar</button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 p-6 overflow-y-auto">
        {activeTab === 'dashboard' && <DashboardScreen transactions={transactions} expenses={expenses} />}
        {activeTab === 'pos' && <POSScreen products={products} setProducts={setProducts} customers={customers} setCustomers={setCustomers} employees={employees} setCommissions={setCommissions} setTransactions={setTransactions} showMessage={showMessage} />}
        {activeTab === 'inventory' && <InventoryScreen products={products} setProducts={setProducts} showMessage={showMessage} />}
        {activeTab === 'customers' && <CustomerScreen customers={customers} setCustomers={setCustomers} />}
        {activeTab === 'expenses' && <ExpenseScreen expenses={expenses} setExpenses={setExpenses} />}
        {activeTab === 'employees' && <EmployeeScreen employees={employees} setEmployees={setEmployees} />}
        {activeTab === 'payroll' && <PayrollScreen employees={employees} commissions={commissions} />}
      </main>
    </div>
  );
}

// ==========================================
// LANDING PAGE (Sesuai Copywriting)
// ==========================================
function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 selection:bg-blue-200">
      {/* NAVBAR */}
      <nav className="flex justify-between items-center p-4 lg:px-20 bg-white/80 backdrop-blur-md border-b sticky top-0 z-50">
        <div className="font-extrabold text-2xl text-blue-700 flex items-center gap-2">
          <div className="bg-blue-600 text-white p-1.5 rounded-lg"><Store size={24}/></div> 
          WarungKu POS
        </div>
        <div className="flex items-center gap-4">
          <button onClick={() => onNavigate('auth')} className="text-slate-600 font-bold hover:text-blue-600 hidden md:block">Masuk</button>
          <button onClick={() => onNavigate('auth')} className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold shadow-lg shadow-blue-200 hover:bg-blue-700 hover:-translate-y-0.5 transition-all">Daftar Sekarang</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <header className="relative pt-24 pb-32 px-6 lg:px-20 text-center max-w-5xl mx-auto overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full bg-gradient-to-b from-blue-50 to-transparent -z-10 rounded-full blur-3xl opacity-50"></div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-800 font-bold text-sm mb-8 shadow-sm">
          <Star size={16} className="text-yellow-500 fill-yellow-500"/> Pilihan #1 UMKM & Warung Kelontong
        </div>
        <h1 className="text-5xl md:text-7xl font-black mb-8 leading-tight tracking-tight text-slate-900">
          Kasir Pintar Warung.<br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">Cukup Sekali Beli.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
          Tinggalkan cara manual! Kelola penjualan, stok barang otomatis, cetak struk, dan catat hutang pelanggan hanya dari satu aplikasi. <b>Tanpa langganan bulanan.</b>
        </p>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
          <button onClick={() => onNavigate('auth')} className="w-full sm:w-auto bg-green-500 text-white px-10 py-4 rounded-full font-extrabold text-lg shadow-xl shadow-green-200 hover:bg-green-600 hover:scale-105 transition-all flex items-center justify-center gap-2">
            Mulai Gunakan Sekarang <ArrowRight size={20}/>
          </button>
          <button onClick={() => document.getElementById('fitur').scrollIntoView({behavior: 'smooth'})} className="w-full sm:w-auto bg-white text-slate-700 border-2 border-slate-200 px-10 py-4 rounded-full font-extrabold text-lg hover:bg-slate-50 hover:border-slate-300 transition-all">
            Pelajari Fitur
          </button>
        </div>
      </header>

      {/* KENAPA MEMILIH KAMI */}
      <section className="py-12 bg-slate-900 text-white">
        <div className="max-w-6xl mx-auto px-6 grid md:grid-cols-3 gap-8 text-center">
          <div className="p-6">
            <Zap className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Sangat Praktis</h3>
            <p className="text-slate-400">Didesain khusus untuk orang awam. Fokus pada fitur yang benar-benar dipakai warung.</p>
          </div>
          <div className="p-6">
            <ShieldCheck className="w-12 h-12 text-green-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Sekali Beli (Lifetime)</h3>
            <p className="text-slate-400">Tidak ada tagihan bulanan atau tahunan. Bayar sekali di awal, aplikasi jadi milik Anda selamanya.</p>
          </div>
          <div className="p-6">
            <Smartphone className="w-12 h-12 text-blue-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold mb-2">Bebas Iklan</h3>
            <p className="text-slate-400">Fokus berjualan tanpa gangguan iklan yang tiba-tiba muncul di tengah transaksi kasir.</p>
          </div>
        </div>
      </section>

      {/* FITUR UNGGULAN */}
      <section id="fitur" className="py-24 px-6 lg:px-20 bg-slate-50">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-4xl font-black text-slate-900 mb-4">Fitur Lengkap WarungKu</h2>
          <p className="text-lg text-slate-600">Semua alat yang Anda butuhkan untuk mengembangkan warung ada di sini.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {icon: <Barcode/>, color: 'bg-blue-100 text-blue-600', title: 'Kasir & Scan Barcode', desc: 'Jualan makin cepat. Tinggal scan barcode produk pakai scanner & langsung cetak struk kertas.'},
            {icon: <Package/>, color: 'bg-green-100 text-green-600', title: 'Stok Otomatis', desc: 'Tidak perlu ngitung manual lagi. Setiap ada barang laku, stok di gudang otomatis berkurang.'},
            {icon: <TrendingUp/>, color: 'bg-amber-100 text-amber-600', title: 'Laporan Laba Rugi', desc: 'Sistem otomatis menghitung modal dan harga jual, sehingga Anda tahu untung bersih setiap harinya.'},
            {icon: <Users/>, color: 'bg-purple-100 text-purple-600', title: 'Catat Bon / Hutang', desc: 'Pelanggan sering ngutang? Catat langsung di sistem, lengkap dengan total tagihan agar tidak lupa.'},
            {icon: <MessageCircle/>, color: 'bg-teal-100 text-teal-600', title: 'Katalog WhatsApp', desc: 'Bagikan daftar harga barang dan promo terbaru langsung ke WhatsApp pelanggan hanya dengan 1 klik.'},
            {icon: <Receipt/>, color: 'bg-rose-100 text-rose-600', title: 'Harga Grosir Otomatis', desc: 'Beli 1 harga normal, beli 10 otomatis jadi harga grosir. Sangat cocok untuk warung sembako besar.'},
          ].map((f, i) => (
            <div key={i} className="p-8 border border-slate-200 rounded-3xl bg-white hover:-translate-y-2 hover:shadow-2xl hover:shadow-blue-900/5 transition-all duration-300">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 ${f.color}`}>
                {React.cloneElement(f.icon, { size: 28 })}
              </div>
              <h3 className="text-xl font-bold mb-3 text-slate-900">{f.title}</h3>
              <p className="text-slate-600 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CARA PEMBELIAN & TUTORIAL */}
      <section className="py-24 px-6 bg-white border-y border-slate-100">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-4xl font-black text-slate-900 mb-6">Bagaimana Cara Mendapatkan Aplikasinya?</h2>
            <p className="text-lg text-slate-600 mb-8 leading-relaxed">
              Proses pendaftaran sangat mudah dan transparan. Anda bisa langsung menggunakan aplikasi setelah melakukan konfirmasi pembayaran.
            </p>
            <div className="space-y-6">
              {[
                { step: '1', title: 'Daftar Akun Toko', desc: 'Klik tombol Daftar, masukkan nama toko dan buat username & password Anda.' },
                { step: '2', title: 'Lakukan Pembayaran', desc: 'Transfer biaya lisensi seumur hidup melalui Rekening Bank atau scan kode QRIS resmi kami.' },
                { step: '3', title: 'Konfirmasi via WhatsApp', desc: 'Kirimkan bukti screenshot transfer ke nomor WhatsApp Admin WarungKu.' },
                { step: '4', title: 'Toko Aktif Selamanya!', desc: 'Admin akan memverifikasi dalam 5 menit, dan toko Anda siap digunakan untuk berjualan.' }
              ].map((item, idx) => (
                <div key={idx} className="flex gap-4">
                  <div className="shrink-0 w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-lg">{item.step}</div>
                  <div>
                    <h4 className="text-xl font-bold text-slate-900 mb-1">{item.title}</h4>
                    <p className="text-slate-600">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* PANEL INFO PEMBAYARAN */}
          <div className="lg:w-1/2 w-full">
            <div className="bg-slate-50 p-8 rounded-3xl border border-slate-200 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600 rounded-bl-full -z-0 opacity-10"></div>
              <h3 className="text-2xl font-black text-slate-900 mb-6 relative z-10">Metode Pembayaran Resmi</h3>
              
              <div className="space-y-4 relative z-10">
                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-orange-100 text-orange-600 p-3 rounded-xl font-black italic text-lg">SeaBank</div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">Transfer Bank</div>
                    <div className="text-xl font-mono font-bold text-slate-900">9010 6464 0699</div>
                    <div className="text-sm font-medium text-slate-600">a.n Richky Irawan</div>
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-4">
                  <div className="bg-blue-100 text-blue-600 p-3 rounded-xl"><QrCode size={32}/></div>
                  <div>
                    <div className="text-xs font-bold text-slate-400 uppercase">E-Wallet (Dana, OVO, GoPay)</div>
                    <div className="text-xl font-mono font-bold text-slate-900">0852 7496 4111</div>
                    <div className="text-sm font-medium text-slate-600">Scan QRIS / Input Manual</div>
                  </div>
                </div>

                <div className="bg-green-50 p-5 rounded-2xl border border-green-200 mt-6">
                  <div className="text-xs font-bold text-green-800 uppercase mb-1">Konfirmasi WhatsApp</div>
                  <div className="text-xl font-black text-green-700 flex items-center gap-2">
                    <MessageCircle /> 0853-6377-0228
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING CTA */}
      <section className="py-20 px-6 text-center bg-blue-600 text-white">
        <h2 className="text-3xl font-black mb-6">Investasi Terbaik Untuk Bisnis Anda</h2>
        <p className="text-xl text-blue-100 mb-10 max-w-2xl mx-auto">Kenapa harus bayar bulanan kalau bisa beli putus? Jangan biarkan pembukuan berantakan menghambat keuntungan Anda.</p>
        
        <div className="bg-white text-slate-900 inline-block p-10 rounded-3xl shadow-2xl transform hover:scale-105 transition-transform duration-300">
          <p className="text-sm font-black text-blue-600 uppercase tracking-widest mb-4 bg-blue-50 py-1 px-4 rounded-full inline-block">PROMO LIFETIME (SEKALI BAYAR)</p>
          <div className="flex justify-center items-start gap-1 mb-2">
            <span className="text-2xl font-bold mt-2">Rp</span>
            <span className="text-6xl font-black">299<span className="text-4xl">.000</span></span>
          </div>
          <p className="text-slate-500 mb-8 font-medium">Akses selamanya. Gratis update fitur.</p>
          <ul className="text-left space-y-3 mb-8">
             <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="text-green-500" size={20}/> Kasir Tanpa Batas Transaksi</li>
             <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="text-green-500" size={20}/> Manajemen Stok & Laba Rugi</li>
             <li className="flex items-center gap-2 font-medium"><CheckCircle2 className="text-green-500" size={20}/> Dukungan Bantuan via WhatsApp</li>
          </ul>
          <button onClick={() => onNavigate('auth')} className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold text-lg hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all">
            Daftar & Beli Sekarang
          </button>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-950 text-slate-400 py-10 text-center">
        <div className="flex items-center justify-center gap-2 font-bold text-xl text-white mb-4">
          <Store /> WarungKu POS
        </div>
        <p className="text-sm">Hak Cipta © {new Date().getFullYear()} Lentera Siak. Dibuat khusus untuk memajukan UMKM Indonesia.</p>
      </footer>
    </div>
  );
}

// ==========================================
// AUTH SCREEN
// ==========================================
function AuthScreen({ onAuth }) {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({ username: '', password: '', storeName: '' });
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-900">{isLogin ? 'Masuk ke WarungKu' : 'Daftar Akun Baru'}</h2>
          <p className="text-slate-500 text-sm mt-1">{isLogin ? 'Kelola warung Anda dari mana saja' : 'Mulai rapihkan jualan Anda hari ini'}</p>
        </div>
        {!isLogin && <div className="mb-4"><label className="block text-sm font-bold mb-1">Nama Warung/Toko</label><input required className="w-full border p-3 rounded bg-slate-50" onChange={e => setForm({...form, storeName: e.target.value})} /></div>}
        <div className="mb-4"><label className="block text-sm font-bold mb-1">Username</label><input required className="w-full border p-3 rounded bg-slate-50" onChange={e => setForm({...form, username: e.target.value})} /></div>
        <div className="mb-6"><label className="block text-sm font-bold mb-1">Password</label><input type="password" required className="w-full border p-3 rounded bg-slate-50" onChange={e => setForm({...form, password: e.target.value})} /></div>
        <button onClick={() => onAuth(isLogin ? 'login' : 'register', form)} className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">{isLogin ? 'Masuk Sekarang' : 'Daftar & Lanjut Pembayaran'}</button>
        <div className="mt-6 text-center text-sm border-t pt-4">
          <button onClick={() => setIsLogin(!isLogin)} className="text-blue-600 font-bold hover:underline">{isLogin ? 'Belum punya akun? Daftar Lifetime' : 'Sudah punya akun? Masuk'}</button>
        </div>
        {isLogin && <div className="mt-4 p-3 bg-blue-50 rounded text-xs text-blue-800 text-center">Gunakan <b>admin</b> / pass: <b>123</b> untuk Demo</div>}
      </div>
    </div>
  );
}

// ==========================================
// 1. DASHBOARD (ANALISIS WARUNGKU)
// ==========================================
function DashboardScreen({ transactions, expenses }) {
  // Menghitung Omzet & Laba
  const totalOmzet = transactions.reduce((sum, trx) => sum + trx.total, 0);
  const kotorProfit = transactions.reduce((sum, trx) => sum + trx.profit, 0); // Laba Kotor (Jual - Modal)
  const totalPengeluaran = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const labaBersih = kotorProfit - totalPengeluaran;

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <h2 className="text-3xl font-extrabold mb-8">Analisis WarungKu</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2 font-bold uppercase text-xs"><TrendingUp size={16}/> Omzet (Pendapatan)</div>
          <div className="text-3xl font-extrabold text-blue-600">Rp {totalOmzet.toLocaleString('id-ID')}</div>
        </div>
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <div className="flex items-center gap-2 text-slate-500 mb-2 font-bold uppercase text-xs"><TrendingDown size={16}/> Pengeluaran Warung</div>
          <div className="text-3xl font-extrabold text-red-500">Rp {totalPengeluaran.toLocaleString('id-ID')}</div>
        </div>
        <div className={`p-6 rounded-2xl shadow-sm border ${labaBersih >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center gap-2 text-slate-600 mb-2 font-bold uppercase text-xs">Laba Bersih</div>
          <div className={`text-3xl font-extrabold ${labaBersih >= 0 ? 'text-green-700' : 'text-red-700'}`}>Rp {labaBersih.toLocaleString('id-ID')}</div>
          <div className="text-xs mt-1 text-slate-500">(Keuntungan Kotor - Pengeluaran)</div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. POS SCREEN (KASIR + BARCODE + GROSIR + HUTANG)
// ==========================================
function POSScreen({ products, setProducts, customers, setCustomers, employees, setCommissions, setTransactions, showMessage }) {
  const [cart, setCart] = useState([]);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [selectedSalesId, setSelectedSalesId] = useState('');

  // Handle Scan Barcode (atau ketik manual)
  const handleBarcodeSearch = (e) => {
    e.preventDefault();
    const product = products.find(p => p.barcode === barcodeInput || p.name.toLowerCase().includes(barcodeInput.toLowerCase()));
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      showMessage('Barang tidak ditemukan!');
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) return showMessage('Stok habis!');
    const existing = cart.find(item => item.id === product.id);
    let newCart;
    if (existing) {
      newCart = cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item);
    } else {
      newCart = [...cart, { ...product, qty: 1 }];
    }
    // Update harga grosir otomatis
    setCart(newCart.map(item => {
      // Jika jumlah memenuhi batas grosir, pakai harga grosir, jika tidak pakai harga normal
      const activePrice = (item.wholesaleQty && item.qty >= item.wholesaleQty) ? item.wholesalePrice : item.sellPrice;
      return { ...item, activePrice };
    }));
  };

  const totalTagihan = cart.reduce((sum, item) => sum + (item.activePrice * item.qty), 0);
  const totalModal = cart.reduce((sum, item) => sum + (item.costPrice * item.qty), 0);
  const profitTransaksi = totalTagihan - totalModal;

  const handleCheckout = (isDebt = false) => {
    if (cart.length === 0) return;
    if (isDebt && !selectedCustomerId) return showMessage('Pilih pelanggan dulu untuk mencatat hutang!');
    
    // Potong Stok
    setProducts(products.map(p => {
      const c = cart.find(item => item.id === p.id);
      return c ? { ...p, stock: p.stock - c.qty } : p;
    }));

    // Jika Hutang, tambahkan ke data pelanggan
    if (isDebt) {
      setCustomers(customers.map(c => c.id === selectedCustomerId ? { ...c, debt: (c.debt || 0) + totalTagihan } : c));
    }

    // Catat Transaksi untuk Laba/Rugi
    const trxId = Date.now();
    setTransactions(prev => [...prev, { id: trxId, total: totalTagihan, profit: profitTransaksi, type: isDebt ? 'debt' : 'cash', date: new Date().toISOString() }]);

    // Catat Komisi (Opsional jika ada sales)
    if (selectedSalesId) {
       setCommissions(prev => [...prev, { trxId, empId: selectedSalesId, amount: totalTagihan * 0.02 }]);
    }

    showMessage(isDebt ? 'Hutang Berhasil Dicatat!' : 'Pembayaran Berhasil! (Mencetak Struk...)');
    if(!isDebt) window.print(); // Simulasi print browser
    
    setCart([]);
    setBarcodeInput('');
    setSelectedCustomerId('');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full pb-10">
      {/* AREA KIRI: BARCODE & PRODUK */}
      <div className="flex-1 flex flex-col h-full print:hidden">
        <form onSubmit={handleBarcodeSearch} className="mb-4 flex gap-2">
          <input autoFocus value={barcodeInput} onChange={e => setBarcodeInput(e.target.value)} type="text" placeholder="Scan Barcode atau ketik nama barang..." className="flex-1 p-4 rounded-xl border border-slate-300 shadow-sm outline-none focus:ring-2 focus:ring-blue-500" />
          <button type="submit" className="bg-blue-600 text-white px-6 rounded-xl font-bold"><Barcode/></button>
        </form>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 overflow-y-auto pr-2 pb-20">
          {products.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock<=0} className={`p-4 border rounded-2xl text-left bg-white shadow-sm flex flex-col h-36 ${p.stock<=0 ? 'opacity-50' : 'hover:border-blue-500'}`}>
              <div className="font-bold text-sm line-clamp-2 mb-1">{p.name}</div>
              <div className="text-xs text-slate-500 font-mono mb-auto border-b pb-1 border-slate-100">{p.barcode || '-'}</div>
              <div className="mt-2">
                <div className="text-blue-600 font-extrabold text-lg">Rp {p.sellPrice.toLocaleString('id-ID')}</div>
                <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-bold">
                   <span>Stok: {p.stock}</span>
                   {p.wholesaleQty && <span className="text-orange-500">Grosir: ≥{p.wholesaleQty}</span>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* AREA KANAN: STRUK & BAYAR */}
      <div className="w-full lg:w-[400px] bg-white border border-slate-200 rounded-2xl shadow-sm flex flex-col print:w-full print:border-none print:shadow-none h-full max-h-screen">
        <div className="p-4 bg-slate-50 border-b rounded-t-2xl font-bold flex justify-between print:hidden"><span>Keranjang</span><span className="bg-blue-600 text-white px-2 py-0.5 rounded text-xs">{cart.length}</span></div>
        
        <div className="flex-1 p-4 overflow-y-auto">
          {/* Header Print */}
          <div className="hidden print:block text-center mb-6">
            <h2 className="text-2xl font-bold">WARUNGKU</h2>
            <p className="text-sm">Terima kasih atas belanja Anda</p>
            <hr className="my-2 border-dashed border-black"/>
          </div>

          {cart.length === 0 ? <p className="text-center text-slate-400 text-sm mt-10 print:hidden">Belum ada barang discan</p> : null}
          {cart.map(item => (
            <div key={item.id} className="flex justify-between items-start mb-3 border-b border-slate-50 pb-2">
              <div className="flex-1 pr-2">
                <div className="font-bold text-sm">{item.name}</div>
                <div className="text-xs text-slate-500">{item.qty} x Rp {item.activePrice.toLocaleString('id-ID')} 
                  {item.activePrice < item.sellPrice && <span className="ml-1 bg-orange-100 text-orange-600 px-1 rounded text-[10px] font-bold">Harga Grosir</span>}
                </div>
              </div>
              <div className="font-extrabold text-sm text-right">Rp {(item.activePrice * item.qty).toLocaleString('id-ID')}</div>
              <button onClick={() => setCart(cart.filter(i => i.id !== item.id))} className="ml-2 text-red-400 print:hidden"><Trash2 size={16}/></button>
            </div>
          ))}

          {/* Footer Print */}
          <div className="hidden print:block mt-6">
            <hr className="my-2 border-dashed border-black"/>
            <div className="flex justify-between font-bold text-lg"><span>TOTAL:</span><span>Rp {totalTagihan.toLocaleString('id-ID')}</span></div>
          </div>
        </div>

        {/* Panel Bawah (Pembayaran) */}
        <div className="p-4 bg-white border-t rounded-b-2xl print:hidden">
          <div className="mb-4">
             <select className="w-full p-2 border rounded-lg text-sm bg-slate-50 outline-none mb-2" value={selectedCustomerId} onChange={e => setSelectedCustomerId(e.target.value)}>
                <option value="">-- Pilih Pelanggan (Umum) --</option>
                {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
             </select>
          </div>
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm font-bold text-slate-500">Total Bayar:</span>
            <span className="text-3xl font-black text-blue-600">Rp {totalTagihan.toLocaleString('id-ID')}</span>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => handleCheckout(false)} disabled={cart.length === 0} className="bg-green-600 text-white font-bold py-3 rounded-xl hover:bg-green-700 disabled:opacity-50 flex justify-center items-center gap-2"><Printer size={18}/> Lunas (Cetak)</button>
            <button onClick={() => handleCheckout(true)} disabled={cart.length === 0} className="bg-amber-500 text-white font-bold py-3 rounded-xl hover:bg-amber-600 disabled:opacity-50 flex justify-center items-center gap-2">Bayar Nanti</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. KELOLA PRODUK (INVENTORY) & WA CATALOG
// ==========================================
function InventoryScreen({ products, setProducts, showMessage }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ barcode: '', name: '', costPrice: '', sellPrice: '', stock: '', wholesaleQty: '', wholesalePrice: '' });

  const handleSave = (e) => {
    e.preventDefault();
    const newProd = { id: Date.now().toString(), barcode: form.barcode, name: form.name, costPrice: Number(form.costPrice), sellPrice: Number(form.sellPrice), stock: Number(form.stock), wholesaleQty: Number(form.wholesaleQty) || null, wholesalePrice: Number(form.wholesalePrice) || null };
    setProducts([...products, newProd]);
    setShowForm(false);
    setForm({ barcode: '', name: '', costPrice: '', sellPrice: '', stock: '', wholesaleQty: '', wholesalePrice: '' });
    showMessage('Barang berhasil ditambahkan!');
  };

  const handleShareWA = () => {
    let text = "*KATALOG WARUNGKU*\n\n";
    products.forEach(p => {
      text += `📦 *${p.name}*\nHarga: Rp ${p.sellPrice.toLocaleString('id-ID')}\n`;
      if(p.wholesaleQty) text += `_Beli ${p.wholesaleQty} jadi Rp ${p.wholesalePrice.toLocaleString('id-ID')}_\n`;
      text += `\n`;
    });
    text += "Silakan balas pesan ini untuk memesan!";
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="max-w-6xl mx-auto pb-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Kelola Produk & Stok</h2>
        <div className="flex gap-2">
           <button onClick={handleShareWA} className="bg-green-600 text-white px-4 py-2 rounded flex items-center gap-2 font-bold text-sm"><MessageCircle size={16}/> Share WA</button>
           <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 font-bold text-sm"><Plus size={16}/> Tambah Produk</button>
        </div>
      </div>

      {showForm && (
        <form onSubmit={handleSave} className="bg-white p-6 rounded-xl border mb-6 grid grid-cols-2 md:grid-cols-4 gap-4 shadow-sm">
          <div className="col-span-2"><label className="text-xs font-bold mb-1 block">Nama Produk</label><input required className="w-full border p-2 rounded" value={form.name} onChange={e=>setForm({...form, name:e.target.value})}/></div>
          <div><label className="text-xs font-bold mb-1 block">Barcode (Opsional)</label><input className="w-full border p-2 rounded" value={form.barcode} onChange={e=>setForm({...form, barcode:e.target.value})}/></div>
          <div><label className="text-xs font-bold mb-1 block">Stok Awal</label><input required type="number" className="w-full border p-2 rounded" value={form.stock} onChange={e=>setForm({...form, stock:e.target.value})}/></div>
          
          <div><label className="text-xs font-bold mb-1 block text-slate-500">Harga Modal (Utk Laba)</label><input required type="number" className="w-full border p-2 rounded bg-slate-50" value={form.costPrice} onChange={e=>setForm({...form, costPrice:e.target.value})}/></div>
          <div><label className="text-xs font-bold mb-1 block text-blue-600">Harga Jual (Normal)</label><input required type="number" className="w-full border p-2 rounded border-blue-200" value={form.sellPrice} onChange={e=>setForm({...form, sellPrice:e.target.value})}/></div>
          
          <div><label className="text-xs font-bold mb-1 block text-orange-600">Batas Beli Grosir (Pcs)</label><input type="number" placeholder="Contoh: 12" className="w-full border p-2 rounded border-orange-200" value={form.wholesaleQty} onChange={e=>setForm({...form, wholesaleQty:e.target.value})}/></div>
          <div><label className="text-xs font-bold mb-1 block text-orange-600">Harga Grosir (Satuan)</label><input type="number" className="w-full border p-2 rounded border-orange-200" value={form.wholesalePrice} onChange={e=>setForm({...form, wholesalePrice:e.target.value})}/></div>
          
          <div className="col-span-full"><button type="submit" className="bg-slate-900 text-white px-6 py-2 rounded font-bold">Simpan ke Etalase</button></div>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 border-b text-slate-600"><tr><th className="p-4">Produk & Barcode</th><th className="p-4">Stok</th><th className="p-4">Harga Modal</th><th className="p-4 text-blue-600">Harga Jual</th><th className="p-4 text-orange-600">Harga Grosir</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {products.map(p => (
              <tr key={p.id}>
                <td className="p-4 font-bold">{p.name} <div className="text-xs font-normal text-slate-400">{p.barcode || 'Tanpa Barcode'}</div></td>
                <td className="p-4 font-bold">{p.stock}</td>
                <td className="p-4 text-slate-500">Rp {p.costPrice.toLocaleString('id-ID')}</td>
                <td className="p-4 font-bold text-blue-600">Rp {p.sellPrice.toLocaleString('id-ID')}</td>
                <td className="p-4 font-medium text-orange-600">{p.wholesaleQty ? `Rp ${p.wholesalePrice.toLocaleString('id-ID')} (≥${p.wholesaleQty})` : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// 4. PELANGGAN & HUTANG (PIUTANG)
// ==========================================
function CustomerScreen({ customers, setCustomers }) {
  const [form, setForm] = useState({ name: '', phone: '' });
  const handleAdd = (e) => {
    e.preventDefault();
    setCustomers([...customers, { id: Date.now().toString(), name: form.name, phone: form.phone, debt: 0 }]);
    setForm({name: '', phone: ''});
  };

  const handleBayarHutang = (id) => {
    setCustomers(customers.map(c => c.id === id ? { ...c, debt: 0 } : c));
    alert('Hutang pelanggan berhasil dilunasi!');
  };

  return (
    <div className="max-w-5xl mx-auto pb-10">
      <h2 className="text-2xl font-bold mb-6">Data Pelanggan & Catatan Hutang</h2>
      <form onSubmit={handleAdd} className="flex gap-4 mb-6 bg-white p-4 rounded-xl border">
         <input required className="border p-2 rounded flex-1" placeholder="Nama Pelanggan" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
         <input className="border p-2 rounded flex-1" placeholder="No. HP" value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} />
         <button className="bg-blue-600 text-white px-6 font-bold rounded">Tambah</button>
      </form>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {customers.map(c => (
          <div key={c.id} className={`p-6 rounded-xl border ${c.debt > 0 ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
            <h3 className="font-bold text-lg">{c.name}</h3>
            <p className="text-sm text-slate-500 mb-4">{c.phone || '-'}</p>
            <div className="flex justify-between items-end border-t pt-4">
              <div>
                 <div className="text-xs font-bold text-slate-400">Total Hutang</div>
                 <div className={`font-black text-xl ${c.debt > 0 ? 'text-red-600' : 'text-slate-800'}`}>Rp {(c.debt || 0).toLocaleString('id-ID')}</div>
              </div>
              {c.debt > 0 && <button onClick={() => handleBayarHutang(c.id)} className="bg-green-600 text-white text-xs px-3 py-1.5 rounded font-bold">Lunas</button>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 5. PENGELUARAN WARUNG
// ==========================================
function ExpenseScreen({ expenses, setExpenses }) {
  const [form, setForm] = useState({ desc: '', amount: '' });
  const handleAdd = (e) => {
    e.preventDefault();
    setExpenses([...expenses, { id: Date.now(), desc: form.desc, amount: Number(form.amount), date: new Date().toLocaleDateString('id-ID') }]);
    setForm({ desc: '', amount: '' });
  };
  return (
    <div className="max-w-4xl mx-auto pb-10">
      <h2 className="text-2xl font-bold mb-6">Catat Pengeluaran Warung</h2>
      <form onSubmit={handleAdd} className="flex gap-4 mb-6 bg-white p-4 rounded-xl border">
         <input required className="border p-2 rounded flex-1" placeholder="Keperluan (Cth: Beli Plastik, Listrik)" value={form.desc} onChange={e=>setForm({...form, desc:e.target.value})} />
         <input required type="number" className="border p-2 rounded w-48" placeholder="Jumlah (Rp)" value={form.amount} onChange={e=>setForm({...form, amount:e.target.value})} />
         <button className="bg-red-600 text-white px-6 font-bold rounded">Catat</button>
      </form>
      <div className="bg-white rounded-xl shadow-sm border p-4">
        {expenses.length === 0 ? <p className="text-slate-400 text-center">Belum ada pengeluaran dicatat.</p> : null}
        {expenses.map(e => (
          <div key={e.id} className="flex justify-between border-b py-3 last:border-0">
            <div><div className="font-bold">{e.desc}</div><div className="text-xs text-slate-500">{e.date}</div></div>
            <div className="font-bold text-red-600">- Rp {e.amount.toLocaleString('id-ID')}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ==========================================
// 6. HRIS (KARYAWAN & PAYROLL) - DARI VERSI SEBELUMNYA
// ==========================================
function EmployeeScreen({ employees, setEmployees }) {
  const [form, setForm] = useState({ name: '', role: 'cashier', baseSalary: '' });
  const handleAdd = (e) => {
    e.preventDefault();
    setEmployees([...employees, { id: Date.now().toString(), name: form.name, role: form.role, baseSalary: Number(form.baseSalary) }]);
    setForm({ name: '', role: 'cashier', baseSalary: '' });
  };
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Data Karyawan Warung</h2>
      <form onSubmit={handleAdd} className="flex gap-4 mb-6 bg-white p-4 rounded-xl border">
        <input required className="border p-2 rounded flex-1" placeholder="Nama" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} />
        <select className="border p-2 rounded" value={form.role} onChange={e=>setForm({...form, role:e.target.value})}>
           <option value="cashier">Kasir</option><option value="sales">Pelayan / Sales</option>
        </select>
        <input required type="number" className="border p-2 rounded" placeholder="Gaji Pokok (Rp)" value={form.baseSalary} onChange={e=>setForm({...form, baseSalary:e.target.value})} />
        <button className="bg-blue-600 text-white px-6 rounded font-bold">Simpan</button>
      </form>
      <div className="bg-white rounded-xl border p-4">
         {employees.map(e => <div key={e.id} className="border-b py-3 font-bold">{e.name} <span className="text-xs font-normal text-slate-500 ml-2 uppercase">({e.role})</span></div>)}
      </div>
    </div>
  );
}

function PayrollScreen({ employees, commissions }) {
  const getComm = (id) => commissions.filter(c => c.empId === id).reduce((s, c) => s + c.amount, 0);
  return (
    <div className="max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Rekap Gaji & Komisi</h2>
      <div className="bg-white rounded-xl border overflow-hidden">
        <table className="w-full text-left"><thead className="bg-slate-50 border-b"><tr><th className="p-4">Karyawan</th><th className="p-4">Gaji Pokok</th><th className="p-4 text-green-600">Komisi Tambahan</th><th className="p-4">Total Terima</th></tr></thead>
          <tbody>
            {employees.map(e => {
              const comm = getComm(e.id);
              const total = e.baseSalary + comm;
              return (
                <tr key={e.id} className="border-b"><td className="p-4 font-bold">{e.name}</td><td className="p-4">Rp {e.baseSalary.toLocaleString('id-ID')}</td><td className="p-4 font-bold text-green-600">Rp {comm.toLocaleString('id-ID')}</td><td className="p-4 font-black text-blue-600">Rp {total.toLocaleString('id-ID')}</td></tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
