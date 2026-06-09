import { supabase } from './supabaseClient';

// Di dalam komponen App:
const [products, setProducts] = useState([]);

useEffect(() => {
  const fetchProducts = async () => {
    const { data, error } = await supabase
      .from('products')
      .select('*');
    if (data) setProducts(data);
  };
  fetchProducts();
}, []); { 
  ShoppingCart, Search, Plus, Minus, Trash2, Tag, User, 
  CreditCard, Wallet, QrCode, Printer, LogOut, Home, 
  Package, Users, BarChart3, Bot, X, Save, ScanBarcode, CheckCircle2
} from 'lucide-react';

// --- DATA AWAL (MOCK DATA) ---
const initialUsers = [
  { username: 'admin', password: '123', role: 'owner', name: 'Budi Owner' },
  { username: 'kasir', password: '123', role: 'cashier', name: 'Siti Kasir' },
];

const initialProducts = [
  { id: 1, sku: '899001', name: 'Kopi Susu Gula Aren', category: 'Minuman', price: 18000, stock: 45 },
  { id: 2, sku: '899002', name: 'Teh Tarik Malaka', category: 'Minuman', price: 15000, stock: 12 },
  { id: 3, sku: '899003', name: 'Roti Bakar Coklat', category: 'Makanan', price: 20000, stock: 30 },
  { id: 4, sku: '899004', name: 'Kentang Goreng', category: 'Makanan', price: 15000, stock: 5 },
  { id: 5, sku: '899005', name: 'Mie Goreng Spesial', category: 'Makanan', price: 25000, stock: 20 },
];

const initialCustomers = [
  { id: 1, name: 'Andi Saputra', phone: '08123456789', points: 150 },
  { id: 2, name: 'Rina Melati', phone: '08987654321', points: 45 },
];

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState(initialUsers);
  
  // State Data Utama
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);

  // Jika belum login, tampilkan halaman Auth
  if (!currentUser) {
    return <AuthScreen users={users} setUsers={setUsers} onLogin={setCurrentUser} />;
  }

  // Jika sudah login, tampilkan Dashboard Utama
  return (
    <MainDashboard 
      currentUser={currentUser} 
      onLogout={() => setCurrentUser(null)}
      products={products} setProducts={setProducts}
      customers={customers} setCustomers={setCustomers}
    />
  );
}

// ==========================================
// 1. KOMPONEN AUTHENTICATION (LOGIN/DAFTAR)
// ==========================================
function AuthScreen({ users, setUsers, onLogin }) {
  const [isLoginView, setIsLoginView] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('cashier');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    if (isLoginView) {
      const user = users.find(u => u.username === username && u.password === password);
      if (user) {
        onLogin(user);
      } else {
        setError('Username atau password salah!');
      }
    } else {
      if (users.find(u => u.username === username)) {
        setError('Username sudah terdaftar!');
        return;
      }
      const newUser = { username, password, role, name };
      setUsers([...users, newUser]);
      onLogin(newUser); // Langsung login setelah daftar
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md">
        <div className="text-center mb-8">
          <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShoppingCart className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Lentera POS</h1>
          <p className="text-slate-500">{isLoginView ? 'Masuk ke akun Anda' : 'Daftar akun baru'}</p>
        </div>

        {error && <div className="bg-red-100 text-red-600 p-3 rounded-lg mb-4 text-sm text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLoginView && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
              <input type="text" required value={name} onChange={e => setName(e.target.value)}
                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="John Doe" />
            </div>
          )}
          
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Username</label>
            <input type="text" required value={username} onChange={e => setUsername(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="admin" />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input type="password" required value={password} onChange={e => setPassword(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500" placeholder="***" />
          </div>

          {!isLoginView && (
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Peran (Role)</label>
              <select value={role} onChange={e => setRole(e.target.value)} className="w-full p-3 border border-slate-300 rounded-lg">
                <option value="cashier">Kasir</option>
                <option value="manager">Manajer</option>
                <option value="owner">Pemilik (Owner)</option>
              </select>
            </div>
          )}

          <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition">
            {isLoginView ? 'Masuk' : 'Daftar & Masuk'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm">
          <span className="text-slate-500">{isLoginView ? 'Belum punya akun?' : 'Sudah punya akun?'} </span>
          <button onClick={() => { setIsLoginView(!isLoginView); setError(''); }} className="text-blue-600 font-bold hover:underline">
            {isLoginView ? 'Daftar Baru' : 'Login Disini'}
          </button>
        </div>

        {isLoginView && (
           <div className="mt-6 p-4 bg-slate-100 rounded-lg text-xs text-slate-500 text-center">
             <p className="font-bold mb-1">Akun Demo:</p>
             <p>Owner: admin / 123 | Kasir: kasir / 123</p>
           </div>
        )}
      </div>
    </div>
  );
}

// ==========================================
// 2. KOMPONEN DASHBOARD UTAMA
// ==========================================
function MainDashboard({ currentUser, onLogout, products, setProducts, customers, setCustomers }) {
  const [activeTab, setActiveTab] = useState('pos');

  const navItems = [
    { id: 'pos', label: 'Kasir', icon: Home },
    { id: 'inventory', label: 'Stok', icon: Package },
    { id: 'customers', label: 'Pelanggan', icon: Users },
    { id: 'analytics', label: 'Laporan', icon: BarChart3, restricted: ['cashier'] },
    { id: 'ai', label: 'AI Asisten', icon: Bot, restricted: ['cashier'] },
  ];

  return (
    <div className="flex h-screen bg-slate-100 font-sans print:bg-white">
      {/* Sidebar Desktop (Disembunyikan saat print) */}
      <aside className="w-20 lg:w-64 bg-white border-r border-slate-200 flex-col hidden md:flex print:hidden">
        <div className="p-4 border-b border-slate-200 flex items-center justify-center lg:justify-start">
          <ShoppingCart className="w-8 h-8 text-blue-600" />
          <span className="ml-3 font-bold text-xl hidden lg:block text-slate-800">Lentera POS</span>
        </div>
        <div className="p-4 flex-1 space-y-2">
          {navItems.map(item => {
            if (item.restricted?.includes(currentUser.role)) return null;
            return (
              <button key={item.id} onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center p-3 rounded-xl transition-all ${
                  activeTab === item.id ? 'bg-blue-50 text-blue-600' : 'text-slate-500 hover:bg-slate-50'
                }`}
              >
                <item.icon className="w-6 h-6 mx-auto lg:mx-0" />
                <span className="ml-3 font-medium hidden lg:block">{item.label}</span>
              </button>
            );
          })}
        </div>
        <div className="p-4 border-t border-slate-200">
          <div className="hidden lg:block mb-4">
            <p className="text-sm font-bold text-slate-800">{currentUser.name}</p>
            <p className="text-xs text-slate-500 capitalize">{currentUser.role}</p>
          </div>
          <button onClick={onLogout} className="w-full flex items-center justify-center p-3 text-red-500 hover:bg-red-50 rounded-xl transition-all">
            <LogOut className="w-6 h-6" />
            <span className="ml-3 font-medium hidden lg:block">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Konten Utama */}
      <main className="flex-1 overflow-hidden print:overflow-visible">
        {activeTab === 'pos' && <PosView products={products} setProducts={setProducts} customers={customers} setCustomers={setCustomers} />}
        {activeTab === 'inventory' && <InventoryView products={products} setProducts={setProducts} role={currentUser.role} />}
        {activeTab === 'customers' && <CustomersView customers={customers} setCustomers={setCustomers} role={currentUser.role} />}
        {activeTab === 'analytics' && <AnalyticsView />}
        {activeTab === 'ai' && <AiView />}
      </main>

      {/* Bottom Nav Mobile (Disembunyikan saat print) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-2 print:hidden z-40">
        {navItems.map(item => {
          if (item.restricted?.includes(currentUser.role)) return null;
          return (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`p-2 flex flex-col items-center ${activeTab === item.id ? 'text-blue-600' : 'text-slate-500'}`}>
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-[10px] font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}

// ==========================================
// 3. KOMPONEN KASIR (POS) & CETAK STRUK
// ==========================================
function PosView({ products, setProducts, customers, setCustomers }) {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Semua');
  const [barcodeInput, setBarcodeInput] = useState('');
  
  // State Pembayaran & Checkout
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Tunai');
  const [cashTendered, setCashTendered] = useState('');
  const [isPaid, setIsPaid] = useState(false);

  const categories = ['Semua', ...new Set(products.map(p => p.category))];

  const filteredProducts = products.filter(p => 
    (category === 'Semua' || p.category === category) &&
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleScanBarcode = (e) => {
    e.preventDefault();
    const product = products.find(p => p.sku === barcodeInput);
    if (product) {
      addToCart(product);
      setBarcodeInput('');
    } else {
      alert('SKU tidak ditemukan!');
    }
  };

  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Stok habis!');
      return;
    }
    const existingItem = cart.find(item => item.id === product.id);
    if (existingItem) {
      if (existingItem.qty >= product.stock) {
        alert('Melebihi stok yang ada!');
        return;
      }
      setCart(cart.map(item => item.id === product.id ? { ...item, qty: item.qty + 1 } : item));
    } else {
      setCart([...cart, { ...product, qty: 1 }]);
    }
  };

  const updateQty = (id, delta) => {
    const item = cart.find(i => i.id === id);
    const product = products.find(p => p.id === id);
    if (item.qty + delta > product.stock) return;
    if (item.qty + delta === 0) {
      setCart(cart.filter(i => i.id !== id));
    } else {
      setCart(cart.map(i => i.id === id ? { ...i, qty: i.qty + delta } : i));
    }
  };

  const totalAmount = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handlePayment = () => {
    // Kurangi Stok
    const updatedProducts = products.map(p => {
      const cartItem = cart.find(c => c.id === p.id);
      if (cartItem) {
        return { ...p, stock: p.stock - cartItem.qty };
      }
      return p;
    });
    setProducts(updatedProducts);
    setIsPaid(true);
  };

  const resetPos = () => {
    setCart([]);
    setShowCheckout(false);
    setIsPaid(false);
    setCashTendered('');
  };

  // Fungsi Cetak Bawaan Browser
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="flex flex-col lg:flex-row h-full">
      {/* Area Produk (Sembunyi saat print) */}
      <div className="flex-1 flex flex-col h-full print:hidden">
        {/* Header POS */}
        <div className="bg-white p-4 shadow-sm z-10 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Cari nama produk..." value={search} onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50" />
          </div>
          <form onSubmit={handleScanBarcode} className="relative flex-1">
            <ScanBarcode className="absolute left-3 top-3 text-slate-400 w-5 h-5" />
            <input type="text" placeholder="Scan/Ketik SKU..." value={barcodeInput} onChange={(e) => setBarcodeInput(e.target.value)}
              className="w-full pl-10 pr-20 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 bg-slate-50" />
            <button type="submit" className="absolute right-2 top-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-lg text-sm font-medium">Pindai</button>
          </form>
        </div>

        {/* Kategori */}
        <div className="overflow-x-auto p-4 flex gap-2">
          {categories.map(cat => (
            <button key={cat} onClick={() => setCategory(cat)}
              className={`px-4 py-2 rounded-xl whitespace-nowrap font-medium transition-all ${
                category === cat ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid Produk */}
        <div className="flex-1 overflow-y-auto p-4 pb-24 md:pb-4">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {filteredProducts.map(product => (
              <div key={product.id} onClick={() => addToCart(product)}
                className={`bg-white p-4 rounded-2xl border-2 cursor-pointer transition-all hover:shadow-lg ${
                  product.stock <= 5 ? 'border-orange-200' : 'border-transparent'
                }`}>
                <div className="aspect-square bg-slate-100 rounded-xl mb-3 flex items-center justify-center relative">
                  <Package className="w-12 h-12 text-slate-300" />
                  {product.stock <= 5 && (
                    <span className="absolute top-2 right-2 bg-orange-500 text-white text-[10px] font-bold px-2 py-1 rounded-full">Sisa {product.stock}</span>
                  )}
                </div>
                <h3 className="font-bold text-slate-800 text-sm md:text-base leading-tight mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-blue-600 font-bold mb-1">Rp {product.price.toLocaleString('id-ID')}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Area Keranjang (Sembunyi saat print) */}
      <div className={`w-full lg:w-96 bg-white border-l border-slate-200 flex flex-col h-[60vh] lg:h-full fixed bottom-0 lg:relative transition-transform duration-300 print:hidden ${cart.length > 0 ? 'translate-y-0' : 'translate-y-full lg:translate-y-0'} z-30`}>
        <div className="p-4 border-b border-slate-200 flex justify-between items-center bg-white rounded-t-2xl lg:rounded-none shadow-md lg:shadow-none">
          <h2 className="font-bold text-lg flex items-center"><ShoppingCart className="w-5 h-5 mr-2 text-blue-600"/> Pesanan Saat Ini</h2>
          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-bold">{cart.length} Item</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400">
              <ShoppingCart className="w-16 h-16 mb-4 opacity-20" />
              <p>Keranjang kosong</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="flex justify-between items-center p-3 bg-slate-50 border border-slate-100 rounded-xl">
                <div className="flex-1 pr-2">
                  <h4 className="font-bold text-sm text-slate-800 line-clamp-1">{item.name}</h4>
                  <p className="text-blue-600 text-sm font-medium">Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
                </div>
                <div className="flex items-center gap-2 bg-white p-1 rounded-lg border border-slate-200 shadow-sm">
                  <button onClick={() => updateQty(item.id, -1)} className="p-1 hover:bg-slate-100 rounded-md text-slate-600"><Minus className="w-4 h-4" /></button>
                  <span className="w-6 text-center font-bold text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="p-1 hover:bg-slate-100 rounded-md text-blue-600"><Plus className="w-4 h-4" /></button>
                </div>
              </div>
            ))
          )}
        </div>

        <div className="p-4 bg-white border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)] pb-20 md:pb-4">
          <div className="flex justify-between text-lg font-bold mb-4">
            <span>Total Tagihan</span>
            <span className="text-blue-600">Rp {totalAmount.toLocaleString('id-ID')}</span>
          </div>
          <button onClick={() => setShowCheckout(true)} disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-blue-200 flex items-center justify-center text-lg">
            Bayar Sekarang
          </button>
        </div>
      </div>

      {/* MODAL CHECKOUT & STRUK (Muncul penuh saat print) */}
      {showCheckout && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 print:bg-white print:p-0 print:block">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden print:shadow-none print:max-w-none print:w-full print:rounded-none">
            
            {/* Header Modal - Sembunyi saat print */}
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50 print:hidden">
              <h2 className="font-bold text-xl">{isPaid ? 'Transaksi Berhasil' : 'Pilih Pembayaran'}</h2>
              {!isPaid && <button onClick={() => setShowCheckout(false)} className="p-2 hover:bg-slate-200 rounded-full"><X className="w-5 h-5" /></button>}
            </div>

            <div className="p-6">
              {!isPaid ? (
                // --- TAMPILAN PILIH PEMBAYARAN ---
                <div className="space-y-6 print:hidden">
                  <div className="text-center p-4 bg-blue-50 rounded-xl">
                    <p className="text-sm text-blue-600 font-medium mb-1">Total yang harus dibayar</p>
                    <p className="text-3xl font-black text-slate-800">Rp {totalAmount.toLocaleString('id-ID')}</p>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id: 'Tunai', icon: Wallet, label: 'Tunai' },
                      { id: 'QRIS', icon: QrCode, label: 'QRIS' },
                      { id: 'Kartu', icon: CreditCard, label: 'Kartu' },
                    ].map(method => (
                      <button key={method.id} onClick={() => setPaymentMethod(method.id)}
                        className={`p-3 rounded-xl border-2 flex flex-col items-center justify-center gap-2 transition-all ${
                          paymentMethod === method.id ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-slate-200 hover:border-slate-300'
                        }`}>
                        <method.icon className="w-6 h-6" />
                        <span className="font-semibold text-sm">{method.label}</span>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === 'Tunai' && (
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">Uang Diterima</label>
                      <input type="number" value={cashTendered} onChange={e => setCashTendered(e.target.value)}
                        className="w-full p-4 text-xl border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:ring-0" placeholder="0" />
                      <div className="flex gap-2 mt-2">
                        {[50000, 100000].map(nominal => (
                          <button key={nominal} onClick={() => setCashTendered(nominal.toString())}
                            className="flex-1 bg-slate-100 py-2 rounded-lg text-sm font-medium hover:bg-slate-200">
                            Rp {nominal.toLocaleString('id-ID')}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <button onClick={handlePayment} 
                    disabled={paymentMethod === 'Tunai' && Number(cashTendered) < totalAmount}
                    className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl hover:bg-blue-700 disabled:opacity-50 text-lg">
                    Proses Pembayaran
                  </button>
                </div>
              ) : (
                // --- TAMPILAN STRUK & TOMBOL PRINT ---
                <div className="space-y-6">
                  {/* Desain Struk (Tampil di layar & Print) */}
                  <div className="bg-white p-6 rounded-xl border border-dashed border-slate-300 print:border-none print:p-0" id="print-area">
                    <div className="text-center mb-6">
                      <h3 className="font-black text-2xl mb-1">LENTERA POS</h3>
                      <p className="text-sm text-slate-500">Jl. Teknologi No. 88, Jakarta</p>
                      <p className="text-xs text-slate-400 mt-2">{new Date().toLocaleString('id-ID')}</p>
                    </div>
                    
                    <div className="border-t border-b border-dashed border-slate-200 py-4 mb-4 space-y-3">
                      {cart.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <div>
                            <p className="font-bold">{item.name}</p>
                            <p className="text-slate-500">{item.qty} x Rp {item.price.toLocaleString('id-ID')}</p>
                          </div>
                          <p className="font-bold">Rp {(item.price * item.qty).toLocaleString('id-ID')}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between font-bold text-lg">
                        <span>TOTAL</span>
                        <span>Rp {totalAmount.toLocaleString('id-ID')}</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Metode: {paymentMethod}</span>
                        {paymentMethod === 'Tunai' && <span>Bayar: Rp {Number(cashTendered).toLocaleString('id-ID')}</span>}
                      </div>
                      {paymentMethod === 'Tunai' && (
                        <div className="flex justify-between text-slate-600">
                          <span>Kembali</span>
                          <span>Rp {(Number(cashTendered) - totalAmount).toLocaleString('id-ID')}</span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-center mt-8 pt-4 border-t border-dashed border-slate-200">
                      <p className="font-bold text-sm">Terima Kasih!</p>
                      <p className="text-xs text-slate-500">Barang yang dibeli tidak dapat ditukar.</p>
                    </div>
                  </div>

                  {/* Tombol Aksi - Sembunyi saat print */}
                  <div className="flex gap-3 print:hidden">
                    <button onClick={handlePrint} className="flex-1 bg-slate-800 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-900">
                      <Printer className="w-5 h-5" /> Cetak Struk
                    </button>
                    <button onClick={resetPos} className="flex-1 bg-blue-100 text-blue-700 font-bold py-3 rounded-xl hover:bg-blue-200">
                      Pesanan Baru
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 4. KOMPONEN INVENTARIS (STOK BARANG)
// ==========================================
function InventoryView({ products, setProducts, role }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ sku: '', name: '', category: '', price: '', stock: '' });

  const handleAddProduct = (e) => {
    e.preventDefault();
    const product = {
      id: Date.now(),
      sku: newProduct.sku,
      name: newProduct.name,
      category: newProduct.category || 'Lainnya',
      price: Number(newProduct.price),
      stock: Number(newProduct.stock)
    };
    setProducts([...products, product]);
    setShowAddModal(false);
    setNewProduct({ sku: '', name: '', category: '', price: '', stock: '' });
  };

  const handleDelete = (id) => {
    if(window.confirm('Yakin ingin menghapus produk ini?')) {
      setProducts(products.filter(p => p.id !== id));
    }
  };

  return (
    <div className="p-4 lg:p-8 h-full flex flex-col bg-slate-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Manajemen Stok</h2>
          <p className="text-slate-500 text-sm mt-1">Pantau dan kelola inventaris toko Anda.</p>
        </div>
        {role !== 'cashier' && (
          <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center hover:bg-blue-700 shadow-sm">
            <Plus className="w-5 h-5 mr-1" /> <span className="hidden sm:inline">Tambah Produk</span>
          </button>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm border-b border-slate-200">
                <th className="p-4 font-semibold">SKU</th>
                <th className="p-4 font-semibold">Nama Produk</th>
                <th className="p-4 font-semibold">Kategori</th>
                <th className="p-4 font-semibold">Harga Jual</th>
                <th className="p-4 font-semibold">Sisa Stok</th>
                {role !== 'cashier' && <th className="p-4 font-semibold text-right">Aksi</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {products.map(product => (
                <tr key={product.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-4 font-mono text-sm text-slate-500">{product.sku}</td>
                  <td className="p-4 font-bold text-slate-800">{product.name}</td>
                  <td className="p-4 text-sm text-slate-600">
                    <span className="bg-slate-100 px-3 py-1 rounded-full">{product.category}</span>
                  </td>
                  <td className="p-4 font-medium text-slate-700">Rp {product.price.toLocaleString('id-ID')}</td>
                  <td className="p-4">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      product.stock <= 5 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'
                    }`}>
                      {product.stock} Pcs
                    </span>
                  </td>
                  {role !== 'cashier' && (
                    <td className="p-4 text-right">
                      <button onClick={() => handleDelete(product.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Produk */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md p-6">
            <h3 className="font-bold text-xl mb-4 text-slate-800">Tambah Produk Baru</h3>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU / Barcode</label>
                  <input required type="text" value={newProduct.sku} onChange={e => setNewProduct({...newProduct, sku: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="12345" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Kategori</label>
                  <input required type="text" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="Minuman" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Produk</label>
                <input required type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="Kopi Susu..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Harga (Rp)</label>
                  <input required type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="15000" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Stok Awal</label>
                  <input required type="number" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} className="w-full p-2 border rounded-lg" placeholder="50" />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Simpan Produk</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 5. KOMPONEN PELANGGAN (CRM)
// ==========================================
function CustomersView({ customers, setCustomers, role }) {
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: '', phone: '' });

  const handleAddCustomer = (e) => {
    e.preventDefault();
    const customer = {
      id: Date.now(),
      name: newCustomer.name,
      phone: newCustomer.phone,
      points: 0
    };
    setCustomers([...customers, customer]);
    setShowAddModal(false);
    setNewCustomer({ name: '', phone: '' });
  };

  return (
    <div className="p-4 lg:p-8 h-full flex flex-col bg-slate-50">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-black text-slate-800">Data Pelanggan</h2>
          <p className="text-slate-500 text-sm mt-1">Kelola poin loyalitas pelanggan setia Anda.</p>
        </div>
        <button onClick={() => setShowAddModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold flex items-center hover:bg-blue-700 shadow-sm">
          <Plus className="w-5 h-5 mr-1" /> <span className="hidden sm:inline">Tambah Pelanggan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map(customer => (
          <div key={customer.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center">
            <div className="w-12 h-12 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center font-bold text-xl mr-4">
              {customer.name.charAt(0)}
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-slate-800">{customer.name}</h3>
              <p className="text-sm text-slate-500">{customer.phone}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-slate-500 uppercase font-bold">Poin</p>
              <p className="text-xl font-black text-amber-500">{customer.points}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Tambah Pelanggan */}
      {showAddModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <h3 className="font-bold text-xl mb-4 text-slate-800">Pelanggan Baru</h3>
            <form onSubmit={handleAddCustomer} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nama Lengkap</label>
                <input required type="text" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="Budi Santoso" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Nomor WhatsApp</label>
                <input required type="tel" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} className="w-full p-3 border rounded-lg" placeholder="0812..." />
              </div>
              <div className="flex gap-3 mt-6">
                <button type="button" onClick={() => setShowAddModal(false)} className="flex-1 py-3 bg-slate-100 text-slate-700 font-bold rounded-xl hover:bg-slate-200">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700">Simpan</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ==========================================
// 6. KOMPONEN LAPORAN & AI (STATIK)
// ==========================================
function AnalyticsView() {
  return (
    <div className="p-4 lg:p-8 h-full overflow-y-auto bg-slate-50">
      <h2 className="text-2xl font-black text-slate-800 mb-6">Ringkasan Bisnis Hari Ini</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { title: 'Pendapatan Kotor', value: 'Rp 2.450.000', color: 'bg-green-500' },
          { title: 'Total Transaksi', value: '84 Struk', color: 'bg-blue-500' },
          { title: 'Produk Terjual', value: '112 Pcs', color: 'bg-purple-500' },
          { title: 'Pelanggan Baru', value: '12 Orang', color: 'bg-amber-500' }
        ].map((stat, i) => (
          <div key={i} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative overflow-hidden">
            <div className={`absolute top-0 right-0 w-16 h-16 ${stat.color} opacity-10 rounded-bl-full`}></div>
            <p className="text-slate-500 text-sm font-medium mb-1">{stat.title}</p>
            <p className="text-2xl font-black text-slate-800">{stat.value}</p>
          </div>
        ))}
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 min-h-[300px] flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-slate-200 mx-auto mb-4" />
          <p className="text-slate-500 font-medium">Grafik penjualan real-time akan muncul di sini.</p>
        </div>
      </div>
    </div>
  );
}

function AiView() {
  return (
    <div className="p-4 lg:p-8 h-full flex flex-col bg-slate-50">
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-6 text-white mb-6 flex items-center shadow-lg">
        <Bot className="w-12 h-12 mr-4 opacity-90" />
        <div>
          <h2 className="text-2xl font-black">Lentera AI Analyst</h2>
          <p className="text-indigo-100 mt-1">Asisten bisnis pribadi berbasis AI untuk membedah data toko Anda.</p>
        </div>
      </div>
      <div className="flex-1 bg-white rounded-2xl shadow-sm border border-slate-200 flex flex-col p-6 items-center justify-center text-center">
        <Bot className="w-20 h-20 text-slate-200 mb-4" />
        <h3 className="text-xl font-bold text-slate-700 mb-2">AI Sedang Bersiap</h3>
        <p className="text-slate-500 max-w-md">Kumpulkan lebih banyak data transaksi agar Lentera AI dapat memberikan rekomendasi produk dan strategi promo yang akurat.</p>
        <button className="mt-6 bg-slate-100 text-slate-600 font-bold px-6 py-3 rounded-xl cursor-not-allowed">
          Tanya AI (Segera Hadir)
        </button>
      </div>
    </div>
  );
}