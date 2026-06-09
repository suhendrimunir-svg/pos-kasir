import React, { useState } from 'react';
import { 
  ShoppingCart, Package, Users, LogOut, Plus, Printer, Trash2, 
  LayoutDashboard, Store, ArrowRight, CheckCircle, Lock, Wallet
} from 'lucide-react';

// --- DATA AWAL (DUMMY) ---
const initialProducts = [
  { id: '1', name: 'Kopi Susu Gula Aren', price: 18000, stock: 50, category: 'Minuman' },
  { id: '2', name: 'Roti Bakar Coklat', price: 15000, stock: 3, category: 'Makanan' }, // Stok tipis untuk notifikasi
];

const initialCustomers = [
  { id: '1', name: 'Budi Santoso', phone: '08123456789', points: 150 },
];

export default function App() {
  // STATE NAVIGASI HALAMAN UTAMA
  // 'landing' | 'login' | 'register' | 'app'
  const [currentView, setCurrentView] = useState('landing');
  
  // STATE APLIKASI KASIR
  const [user, setUser] = useState(null); 
  const [activeTab, setActiveTab] = useState('dashboard'); // Tab pertama setelah login
  
  // Data Bisnis
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);
  const [cart, setCart] = useState([]);
  const [transactions, setTransactions] = useState([]); // Menyimpan riwayat penjualan
  
  // State Shift (Buka/Tutup Kas)
  const [shift, setShift] = useState({ isOpen: false, startCash: 0, currentCash: 0, salesCount: 0 });

  // --- FUNGSI NAVIGASI LUAR ---
  const handleLogin = (username, password, role) => {
    // Simulasi Login (Nantinya diganti dengan Supabase Auth)
    setUser({ name: username, role: role, storeName: 'Toko ' + username });
    setCurrentView('app');
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentView('landing');
  };

  // --- KONTROL TAMPILAN ---
  if (currentView === 'landing') return <LandingPage onNavigate={setCurrentView} />;
  if (currentView === 'login') return <AuthScreen type="login" onNavigate={setCurrentView} onAuth={handleLogin} />;
  if (currentView === 'register') return <AuthScreen type="register" onNavigate={setCurrentView} onAuth={handleLogin} />;

  // --- KOMPONEN UTAMA (AREA PRIVAT TOKO) ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR NAVIGASI */}
      <div className="w-full md:w-64 bg-blue-900 text-white flex flex-col print:hidden">
        <div className="p-5 bg-blue-950 border-b border-blue-800">
          <div className="flex items-center gap-2 font-bold text-xl mb-1">
            <Store size={24} className="text-yellow-400"/> Lentera POS
          </div>
          <p className="text-sm font-medium text-blue-200">{user.storeName}</p>
          <div className="mt-2 text-xs bg-blue-800 rounded px-2 py-1 inline-block">
            Masuk sebagai: <span className="font-bold capitalize">{user.role}</span>
          </div>
        </div>
        
        <nav className="flex-1 p-3 space-y-1 overflow-x-auto flex md:flex-col">
          {/* Dashboard bisa diakses semua, tapi isinya dibatasi role */}
          <SidebarButton icon={LayoutDashboard} label="Dashboard" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} />
          <SidebarButton icon={ShoppingCart} label="Mesin Kasir" active={activeTab === 'pos'} onClick={() => setActiveTab('pos')} />
          <SidebarButton icon={Package} label="Inventaris" active={activeTab === 'inventory'} onClick={() => setActiveTab('inventory')} />
          <SidebarButton icon={Users} label="Pelanggan" active={activeTab === 'customers'} onClick={() => setActiveTab('customers')} />
        </nav>

        <div className="p-4 border-t border-blue-800">
           <button onClick={handleLogout} className="flex items-center justify-center w-full gap-2 p-3 bg-red-600 rounded hover:bg-red-700 transition-colors font-medium">
             <LogOut size={18} /> Keluar Aplikasi
           </button>
        </div>
      </div>

      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {activeTab === 'dashboard' && (
          <DashboardScreen transactions={transactions} products={products} role={user.role} />
        )}
        {activeTab === 'pos' && (
          <POSScreen 
            products={products} setProducts={setProducts} 
            cart={cart} setCart={setCart} 
            shift={shift} setShift={setShift}
            transactions={transactions} setTransactions={setTransactions}
            userRole={user.role}
          />
        )}
        {activeTab === 'inventory' && (
          <InventoryScreen products={products} setProducts={setProducts} role={user.role} />
        )}
        {activeTab === 'customers' && (
          <CustomerScreen customers={customers} setCustomers={setCustomers} role={user.role} />
        )}
      </div>
    </div>
  );
}

function SidebarButton({ icon: Icon, label, active, onClick }) {
  return (
    <button onClick={onClick} className={`flex items-center gap-3 p-3 w-full rounded text-left whitespace-nowrap transition-colors ${active ? 'bg-blue-600 text-white font-semibold shadow' : 'text-blue-100 hover:bg-blue-800'}`}>
      <Icon size={20} /> {label}
    </button>
  )
}

// ==========================================
// LAYER 1: HALAMAN WEB LANDING PAGE PUBLIK
// ==========================================
function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50 font-sans">
      {/* Navbar Publik */}
      <nav className="bg-white shadow-sm p-4 px-8 flex justify-between items-center">
        <div className="flex items-center gap-2 text-2xl font-black text-blue-900">
          <Store className="text-yellow-500" size={32} /> LENTERA SIAK
        </div>
        <div className="space-x-4">
          <button onClick={() => onNavigate('login')} className="text-blue-900 font-semibold hover:text-blue-700">Masuk</button>
          <button onClick={() => onNavigate('register')} className="bg-blue-600 text-white px-5 py-2 rounded-full font-bold hover:bg-blue-700 shadow-md">Daftar Gratis</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-20 flex flex-col md:flex-row items-center gap-12">
        <div className="flex-1 space-y-6">
          <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
            Sistem Kasir Pintar untuk <span className="text-blue-600">UMKM Maju</span>
          </h1>
          <p className="text-xl text-slate-600">
            Kelola ribuan toko, pantau omzet secara real-time, dan percepat transaksi kasir Anda hanya dengan satu aplikasi. Bebas ribet, aman, dan tanpa biaya instalasi.
          </p>
          <button onClick={() => onNavigate('register')} className="flex items-center gap-2 bg-yellow-500 text-slate-900 px-8 py-4 rounded-full font-black text-lg hover:bg-yellow-400 transition transform hover:scale-105 shadow-xl">
            Buat Toko Sekarang <ArrowRight />
          </button>
        </div>
        <div className="flex-1">
          <div className="bg-blue-900 rounded-2xl shadow-2xl p-4 transform rotate-2">
            <img src="https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&q=80&w=800" alt="Kasir POS" className="rounded-xl opacity-90" />
          </div>
        </div>
      </div>

      {/* Fitur Section */}
      <div className="bg-white py-20">
        <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
            <LayoutDashboard className="text-blue-500 w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Back-Office Canggih</h3>
            <p className="text-slate-600">Pantau performa penjualan, laba, dan manajemen multi-cabang dari satu dashboard utama.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
            <Lock className="text-green-500 w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Keamanan Peran (RBAC)</h3>
            <p className="text-slate-600">Pisahkan hak akses antara Kasir, Manajer, dan Pemilik Toko demi keamanan data keuangan.</p>
          </div>
          <div className="p-6 bg-slate-50 rounded-xl border border-slate-100">
            <Wallet className="text-yellow-500 w-12 h-12 mb-4" />
            <h3 className="text-xl font-bold mb-2">Manajemen Shift & Kas</h3>
            <p className="text-slate-600">Sistem Buka/Tutup Kas otomatis untuk mencegah kebocoran uang di laci kasir Anda.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// LAYER 2: HALAMAN LOGIN / REGISTER TOKO
// ==========================================
function AuthScreen({ type, onNavigate, onAuth }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('owner'); // Default saat daftar adalah owner

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!username || !password) return alert('Harap isi semua kolom');
    // Jika login biasa, biarkan pilih role. Jika daftar, otomatis jadi owner toko.
    onAuth(username, password, type === 'register' ? 'owner' : role);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-100 p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border-t-4 border-blue-600">
        <div className="flex justify-center mb-6">
           <Store className="text-blue-600 w-16 h-16" />
        </div>
        <h2 className="text-3xl font-black text-center text-slate-800 mb-2">
          {type === 'login' ? 'Selamat Datang' : 'Buat Toko Baru'}
        </h2>
        <p className="text-center text-slate-500 mb-8">
          {type === 'login' ? 'Masuk untuk mengelola bisnis Anda' : 'Langkah pertama menuju kemajuan UMKM'}
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-slate-700 mb-1 font-semibold">Nama / Username</label>
            <input required type="text" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" 
              placeholder={type === 'login' ? 'Masukkan username' : 'Nama Toko / Pemilik'}
              value={username} onChange={(e) => setUsername(e.target.value)} />
          </div>
          <div>
            <label className="block text-slate-700 mb-1 font-semibold">Password</label>
            <input required type="password" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-slate-50" 
              placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          
          {/* Opsi Role (Hanya tampil saat Login) */}
          {type === 'login' && (
            <div>
              <label className="block text-slate-700 mb-1 font-semibold">Masuk Sebagai</label>
              <select className="w-full p-3 border rounded-lg bg-slate-50 outline-none focus:ring-2 focus:ring-blue-500" value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="owner">Pemilik Toko (Back-Office)</option>
                <option value="manager">Manajer Toko</option>
                <option value="cashier">Kasir (Depan)</option>
              </select>
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg mt-4">
            {type === 'login' ? 'Masuk ke Sistem' : 'Daftar Sekarang'}
          </button>
        </form>

        <div className="mt-8 text-center text-slate-600">
          {type === 'login' ? (
            <p>Belum punya toko? <button onClick={() => onNavigate('register')} className="text-blue-600 font-bold hover:underline">Daftar Gratis</button></p>
          ) : (
            <p>Sudah punya akun? <button onClick={() => onNavigate('login')} className="text-blue-600 font-bold hover:underline">Masuk di sini</button></p>
          )}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// LAYER 3A: DASHBOARD (BACK OFFICE)
// ==========================================
function DashboardScreen({ transactions, products, role }) {
  // Hitung total pendapatan dari riwayat transaksi
  const totalRevenue = transactions.reduce((sum, trx) => sum + trx.total, 0);
  const lowStockProducts = products.filter(p => p.stock <= 5);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-800">Ringkasan Bisnis</h2>
      </div>

      {/* Kartu Metrik Utama */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-green-500">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Pendapatan</p>
          <p className="text-3xl font-black text-slate-800">
            {role === 'cashier' ? '******' : `Rp ${totalRevenue.toLocaleString('id-ID')}`}
          </p>
          {role === 'cashier' && <p className="text-xs text-red-500 mt-2">*Hanya Owner yang dapat melihat pendapatan</p>}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-blue-500">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Transaksi</p>
          <p className="text-3xl font-black text-slate-800">{transactions.length}</p>
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 border-l-4 border-l-yellow-500">
          <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">Total Produk Aktif</p>
          <p className="text-3xl font-black text-slate-800">{products.length}</p>
        </div>
      </div>

      {/* Peringatan Stok (Hanya Owner/Manager) */}
      {role !== 'cashier' && lowStockProducts.length > 0 && (
        <div className="bg-red-50 border border-red-200 p-4 rounded-xl">
          <h3 className="text-red-800 font-bold flex items-center gap-2 mb-2">
            <Package size={20} /> Peringatan Stok Menipis!
          </h3>
          <ul className="list-disc pl-5 text-red-700 text-sm space-y-1">
            {lowStockProducts.map(p => (
              <li key={p.id}><b>{p.name}</b> hanya tersisa {p.stock} item. Segera restock!</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

// ==========================================
// LAYER 3B: KASIR & MANAJEMEN SHIFT
// ==========================================
function POSScreen({ products, setProducts, cart, setCart, shift, setShift, transactions, setTransactions, userRole }) {
  const [modalAwal, setModalAwal] = useState('');

  // Jika Kas/Shift belum dibuka
  if (!shift.isOpen) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl shadow-md border max-w-sm w-full text-center">
          <Wallet className="w-16 h-16 text-blue-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Buka Kas / Shift</h2>
          <p className="text-sm text-slate-500 mb-6">Masukkan jumlah uang modal awal yang ada di laci kasir sebelum mulai berjualan.</p>
          <input 
            type="number" 
            placeholder="Rp Modal Awal (Cth: 100000)" 
            className="w-full p-3 border rounded text-center font-bold text-xl mb-4"
            value={modalAwal} onChange={(e) => setModalAwal(e.target.value)}
          />
          <button 
            onClick={() => {
              if(!modalAwal) return alert('Masukkan modal awal');
              setShift({ isOpen: true, startCash: parseInt(modalAwal), currentCash: parseInt(modalAwal), salesCount: 0 });
            }}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700"
          >
            Buka Mesin Kasir
          </button>
        </div>
      </div>
    );
  }

  // LOGIKA KASIR SEPERTI BIASA
  const addToCart = (product) => {
    if (product.stock <= 0) return alert('Stok habis!');
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
    
    // 1. Kurangi stok produk
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      return cartItem ? { ...p, stock: p.stock - cartItem.qty } : p;
    });
    setProducts(updatedProducts);
    
    // 2. Catat riwayat transaksi
    const newTransaction = { id: Date.now(), total: total, items: cart, date: new Date().toLocaleString() };
    setTransactions([...transactions, newTransaction]);

    // 3. Update Laci Kas (Tambah uang ke laci)
    setShift({...shift, currentCash: shift.currentCash + total, salesCount: shift.salesCount + 1});

    window.print(); // Print Struk
    setCart([]); // Kosongkan keranjang
  };

  const handleTutupKas = () => {
    const confirm = window.confirm(`Tutup Shift Kasir?\n\nModal Awal: Rp ${shift.startCash}\nPendapatan Kasir: Rp ${shift.currentCash - shift.startCash}\nTotal Uang di Laci Seharusnya: Rp ${shift.currentCash}`);
    if (confirm) {
      setShift({ isOpen: false, startCash: 0, currentCash: 0, salesCount: 0 });
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-4 h-full">
      {/* Daftar Produk (Kiri) */}
      <div className="flex-1 flex flex-col print:hidden">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pilih Produk</h2>
          <button onClick={handleTutupKas} className="bg-red-100 text-red-700 font-bold px-4 py-2 rounded border border-red-200 hover:bg-red-200">
            Tutup Kas / Shift
          </button>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 overflow-y-auto pr-2">
          {products.map(p => (
            <button key={p.id} onClick={() => addToCart(p)} disabled={p.stock <= 0}
              className={`p-4 border rounded-xl text-left transition-all ${p.stock > 0 ? 'bg-white hover:border-blue-500 shadow-sm' : 'bg-slate-100 opacity-50'}`}>
              <div className="font-bold text-slate-800">{p.name}</div>
              <div className="text-blue-600 font-bold mt-1">Rp {p.price.toLocaleString('id-ID')}</div>
              <div className="text-xs text-slate-500 mt-2">Sisa stok: {p.stock}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Keranjang & Struk (Kanan) */}
      <div className="w-full lg:w-96 bg-white border rounded-xl shadow-sm flex flex-col print:w-full print:border-none print:shadow-none">
        <div className="p-4 border-b bg-slate-50 rounded-t-xl print:hidden"><h2 className="font-bold text-lg">Pesanan Saat Ini</h2></div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Struk Print Only */}
          <div className="hidden print:block text-center mb-4">
            <h1 className="text-2xl font-black">LENTERA SIAK</h1>
            <p className="text-xs">Struk Pembelian Kasir</p>
            <p className="text-xs">{new Date().toLocaleString()}</p>
            <hr className="my-2 border-dashed border-black" />
          </div>

          {cart.length === 0 ? <div className="text-center text-slate-400 mt-10 print:hidden">Pilih produk di kiri</div> : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-semibold text-sm">{item.name}</div>
                    <div className="text-xs text-slate-500">{item.qty} x Rp {item.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="font-bold text-sm">Rp {(item.price * item.qty).toLocaleString('id-ID')}</div>
                  <button onClick={() => removeFromCart(item.id)} className="ml-2 text-red-500 print:hidden"><Trash2 size={16}/></button>
                </div>
              ))}
            </div>
          )}

          <div className="hidden print:block mt-6">
             <hr className="my-2 border-dashed border-black" />
             <div className="flex justify-between font-bold text-lg"><span>TOTAL:</span><span>Rp {total.toLocaleString('id-ID')}</span></div>
             <p className="text-center text-xs mt-4">Terima kasih!</p>
          </div>
        </div>

        <div className="p-4 border-t bg-slate-50 rounded-b-xl print:hidden">
          <div className="flex justify-between items-center mb-3 text-lg font-bold"><span>Total:</span><span className="text-blue-600 text-2xl">Rp {total.toLocaleString('id-ID')}</span></div>
          <button onClick={handleCheckout} disabled={cart.length === 0} className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-slate-300 flex justify-center items-center gap-2">
            <Printer size={20} /> Bayar & Cetak
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// LAYER 3C: INVENTARIS (HANYA OWNER/MANAGER BISA TAMBAH)
// ==========================================
function InventoryScreen({ products, setProducts, role }) {
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });

  const isRestricted = role === 'cashier'; // Kasir tidak boleh tambah barang

  const handleAddProduct = (e) => {
    e.preventDefault();
    setProducts([...products, { id: Date.now().toString(), name: newProduct.name, price: parseInt(newProduct.price), stock: parseInt(newProduct.stock), category: 'Umum' }]);
    setNewProduct({ name: '', price: '', stock: '' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Inventaris Barang</h2>
        {!isRestricted && (
          <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"><Plus size={18} /> Tambah Barang</button>
        )}
      </div>

      {isRestricted && <div className="mb-4 text-sm text-yellow-700 bg-yellow-50 p-3 rounded border border-yellow-200">Akses Terbatas: Sebagai Kasir, Anda hanya dapat melihat stok barang. Hanya Manajer/Pemilik yang dapat menambah barang baru.</div>}

      {showForm && !isRestricted && (
        <form onSubmit={handleAddProduct} className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex gap-3">
          <input required type="text" placeholder="Nama Produk" className="border p-2 rounded flex-1" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
          <input required type="number" placeholder="Harga" className="border p-2 rounded w-32" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
          <input required type="number" placeholder="Stok" className="border p-2 rounded w-24" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 font-bold">Simpan</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-slate-50 border-b"><tr><th className="p-4">Nama Produk</th><th className="p-4">Harga</th><th className="p-4">Sisa Stok</th></tr></thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-slate-50">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">Rp {p.price.toLocaleString('id-ID')}</td>
                <td className="p-4"><span className={`px-2 py-1 rounded text-xs font-bold ${p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>{p.stock}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ==========================================
// LAYER 3D: PELANGGAN
// ==========================================
function CustomerScreen({ customers, setCustomers, role }) {
  // Kode Pelanggan dipertahankan sama persis dengan fungsi sebelumnya
  // Semua role bisa menambah pelanggan untuk mempermudah kasir
  const [showForm, setShowForm] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  const handleAddCustomer = (e) => {
    e.preventDefault();
    setCustomers([...customers, { id: Date.now().toString(), name: newCustomer.name, phone: newCustomer.phone, points: 0 }]);
    setNewCustomer({ name: '', phone: '' });
    setShowForm(false);
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Data Pelanggan</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"><Plus size={18} /> Tambah Pelanggan</button>
      </div>

      {showForm && (
        <form onSubmit={handleAddCustomer} className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex gap-3">
          <input required type="text" placeholder="Nama Pelanggan" className="border p-2 rounded flex-1" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
          <input type="text" placeholder="No. Telepon" className="border p-2 rounded flex-1" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
          <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded font-bold">Simpan</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border">
            <div className="font-bold text-lg">{c.name}</div>
            <div className="text-slate-500 text-sm">{c.phone || 'Tidak ada nomor HP'}</div>
            <div className="mt-3 pt-3 border-t"><span className="text-xs text-slate-500 uppercase">Poin Loyalitas</span><div className="text-xl font-bold text-yellow-600">{c.points} Pts</div></div>
          </div>
        ))}
      </div>
    </div>
  );
}
