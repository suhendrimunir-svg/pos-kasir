import React, { useState } from 'react';
import { ShoppingCart, Package, Users, LogOut, Plus, Printer, Trash2 } from 'lucide-react';

// --- DATA AWAL (DUMMY) ---
const initialProducts = [
  { id: '1', name: 'Kopi Susu Gula Aren', price: 18000, stock: 50, category: 'Minuman' },
  { id: '2', name: 'Roti Bakar Coklat', price: 15000, stock: 20, category: 'Makanan' },
];

const initialCustomers = [
  { id: '1', name: 'Budi Santoso', phone: '08123456789', points: 150 },
];

export default function App() {
  // --- STATE APLIKASI ---
  const [user, setUser] = useState(null); // Menyimpan status login
  const [activeTab, setActiveTab] = useState('pos');
  
  // State Data
  const [products, setProducts] = useState(initialProducts);
  const [customers, setCustomers] = useState(initialCustomers);
  const [cart, setCart] = useState([]);
  
  // --- FUNGSI LOGIN ---
  const handleLogin = (username, password) => {
    if (username === 'admin' && password === '123') {
      setUser({ name: 'Pemilik Toko', role: 'owner' });
    } else if (username === 'kasir' && password === '123') {
      setUser({ name: 'Kasir Shift 1', role: 'cashier' });
    } else {
      alert('Username atau password salah! Coba admin/123 atau kasir/123');
    }
  };

  const handleLogout = () => setUser(null);

  // Jika belum login, tampilkan layar Login
  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  // --- KOMPONEN UTAMA (SETELAH LOGIN) ---
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col md:flex-row font-sans">
      
      {/* SIDEBAR NAVIGASI */}
      <div className="w-full md:w-64 bg-blue-800 text-white flex flex-col print:hidden">
        <div className="p-4 bg-blue-900 font-bold text-xl text-center md:text-left">
          Lentera POS
          <p className="text-xs font-normal text-blue-300 mt-1">Halo, {user.name} ({user.role})</p>
        </div>
        <nav className="flex-1 p-2 flex md:flex-col overflow-x-auto">
          <button onClick={() => setActiveTab('pos')} className={`flex items-center gap-2 p-3 mb-2 rounded whitespace-nowrap ${activeTab === 'pos' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
            <ShoppingCart size={20} /> Kasir
          </button>
          
          {/* Menu Inventaris & Pelanggan hanya untuk Owner (Atau bisa disesuaikan) */}
          <button onClick={() => setActiveTab('inventory')} className={`flex items-center gap-2 p-3 mb-2 rounded whitespace-nowrap ${activeTab === 'inventory' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
            <Package size={20} /> Inventaris
          </button>
          <button onClick={() => setActiveTab('customers')} className={`flex items-center gap-2 p-3 mb-2 rounded whitespace-nowrap ${activeTab === 'customers' ? 'bg-blue-600' : 'hover:bg-blue-700'}`}>
            <Users size={20} /> Pelanggan
          </button>
        </nav>
        <button onClick={handleLogout} className="flex items-center gap-2 p-4 bg-red-600 hover:bg-red-700 transition-colors">
          <LogOut size={20} /> Keluar
        </button>
      </div>

      {/* AREA KONTEN UTAMA */}
      <div className="flex-1 p-4 md:p-6 overflow-y-auto">
        {activeTab === 'pos' && (
          <POSScreen products={products} cart={cart} setCart={setCart} setProducts={setProducts} />
        )}
        {activeTab === 'inventory' && (
          <InventoryScreen products={products} setProducts={setProducts} role={user.role} />
        )}
        {activeTab === 'customers' && (
          <CustomerScreen customers={customers} setCustomers={setCustomers} />
        )}
      </div>
    </div>
  );
}

// ==========================================
// 1. LAYAR LOGIN
// ==========================================
function LoginScreen({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-blue-800 mb-6">Masuk ke Lentera POS</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium">Username</label>
            <input 
              type="text" 
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Contoh: admin / kasir"
              value={username} onChange={(e) => setUsername(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 mb-1 text-sm font-medium">Password</label>
            <input 
              type="password" 
              className="w-full p-3 border rounded focus:ring-2 focus:ring-blue-500 outline-none" 
              placeholder="Contoh: 123"
              value={password} onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <button 
            onClick={() => onLogin(username, password)}
            className="w-full bg-blue-600 text-white font-bold py-3 rounded hover:bg-blue-700 transition-colors mt-2"
          >
            Login
          </button>
        </div>
        <div className="mt-6 p-4 bg-blue-50 text-sm text-blue-800 rounded">
          <p className="font-bold mb-1">Gunakan Akun Demo:</p>
          <ul className="list-disc pl-5">
            <li>Admin: <b>admin</b> / pass: <b>123</b></li>
            <li>Kasir: <b>kasir</b> / pass: <b>123</b></li>
          </ul>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 2. LAYAR KASIR (POS) & CETAK STRUK
// ==========================================
function POSScreen({ products, cart, setCart, setProducts }) {
  const addToCart = (product) => {
    if (product.stock <= 0) {
      alert('Stok habis!');
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
    
    // Panggil dialog print browser
    window.print();
    
    // Kosongkan keranjang setelah print dialog tertutup
    setCart([]);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6 h-full">
      {/* Daftar Produk (Kiri) */}
      <div className="flex-1 print:hidden">
        <h2 className="text-xl font-bold mb-4">Pilih Produk</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {products.map(p => (
            <button 
              key={p.id} 
              onClick={() => addToCart(p)}
              disabled={p.stock <= 0}
              className={`p-4 border rounded-xl text-left transition-all ${p.stock > 0 ? 'bg-white hover:border-blue-500 hover:shadow-md' : 'bg-gray-100 opacity-50 cursor-not-allowed'}`}
            >
              <div className="font-bold text-gray-800 line-clamp-1">{p.name}</div>
              <div className="text-blue-600 font-semibold mt-1">Rp {p.price.toLocaleString('id-ID')}</div>
              <div className="text-xs text-gray-500 mt-2">Sisa stok: {p.stock}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Keranjang & Struk (Kanan) */}
      <div className="w-full lg:w-96 bg-white border rounded-xl shadow-sm flex flex-col print:w-full print:border-none print:shadow-none">
        <div className="p-4 border-b bg-gray-50 rounded-t-xl print:hidden">
          <h2 className="text-xl font-bold">Keranjang Belanja</h2>
        </div>
        
        {/* Area Struk yang akan di-print */}
        <div className="p-4 flex-1 overflow-y-auto">
          {/* Header Struk (Hanya tampil saat di-print) */}
          <div className="hidden print:block text-center mb-6">
            <h1 className="text-2xl font-bold">LENTERA STORE</h1>
            <p className="text-sm text-gray-500">Jl. Teknologi No. 99, Jakarta</p>
            <p className="text-sm text-gray-500">Tanggal: {new Date().toLocaleDateString('id-ID')}</p>
            <hr className="my-2 border-dashed border-gray-400" />
          </div>

          {cart.length === 0 ? (
            <div className="text-center text-gray-400 mt-10 print:hidden">Keranjang masih kosong</div>
          ) : (
            <div className="space-y-3">
              {cart.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.qty} x Rp {item.price.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="font-bold text-sm">Rp {(item.price * item.qty).toLocaleString('id-ID')}</div>
                  <button onClick={() => removeFromCart(item.id)} className="ml-3 text-red-500 print:hidden">
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Footer Struk */}
          <div className="hidden print:block mt-6">
             <hr className="my-2 border-dashed border-gray-400" />
             <div className="flex justify-between font-bold text-lg">
                <span>TOTAL:</span>
                <span>Rp {total.toLocaleString('id-ID')}</span>
             </div>
             <p className="text-center text-sm mt-6">Terima kasih atas kunjungan Anda!</p>
          </div>
        </div>

        {/* Tombol Aksi (Sembunyi saat print) */}
        <div className="p-4 border-t bg-gray-50 rounded-b-xl print:hidden">
          <div className="flex justify-between items-center mb-4 text-xl font-bold">
            <span>Total:</span>
            <span className="text-blue-600">Rp {total.toLocaleString('id-ID')}</span>
          </div>
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0}
            className="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center gap-2"
          >
            <Printer size={20} /> Cetak Struk & Bayar
          </button>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. LAYAR INVENTARIS (TAMBAH MANUAL)
// ==========================================
function InventoryScreen({ products, setProducts, role }) {
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', price: '', stock: '' });

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
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Manajemen Inventaris</h2>
        {/* Hanya owner/manager yang bisa nambah barang, bisa disesuaikan */}
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} /> Tambah Produk
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddProduct} className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-col md:flex-row gap-4">
          <input required type="text" placeholder="Nama Produk" className="border p-2 rounded flex-1" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
          <input required type="number" placeholder="Harga (Rp)" className="border p-2 rounded w-full md:w-32" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
          <input required type="number" placeholder="Stok" className="border p-2 rounded w-full md:w-24" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value})} />
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold">Simpan</button>
        </form>
      )}

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="p-4">Nama Produk</th>
              <th className="p-4">Harga</th>
              <th className="p-4">Sisa Stok</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-medium">{p.name}</td>
                <td className="p-4">Rp {p.price.toLocaleString('id-ID')}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${p.stock < 10 ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
                    {p.stock}
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

// ==========================================
// 4. LAYAR PELANGGAN (CRM)
// ==========================================
function CustomerScreen({ customers, setCustomers }) {
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
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Data Pelanggan</h2>
        <button 
          onClick={() => setShowForm(!showForm)}
          className="bg-blue-600 text-white px-4 py-2 rounded flex items-center gap-2 hover:bg-blue-700"
        >
          <Plus size={18} /> Tambah Pelanggan
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAddCustomer} className="bg-white p-4 rounded-xl shadow-sm border mb-6 flex flex-col md:flex-row gap-4">
          <input required type="text" placeholder="Nama Pelanggan" className="border p-2 rounded flex-1" value={newCustomer.name} onChange={e => setNewCustomer({...newCustomer, name: e.target.value})} />
          <input type="text" placeholder="No. Telepon" className="border p-2 rounded flex-1" value={newCustomer.phone} onChange={e => setNewCustomer({...newCustomer, phone: e.target.value})} />
          <button type="submit" className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700 font-bold">Simpan</button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {customers.map(c => (
          <div key={c.id} className="bg-white p-4 rounded-xl shadow-sm border flex flex-col">
            <div className="font-bold text-lg">{c.name}</div>
            <div className="text-gray-500 text-sm mt-1 mb-3">{c.phone || 'Tidak ada nomor HP'}</div>
            <div className="mt-auto pt-3 border-t">
              <span className="text-xs text-gray-500 uppercase tracking-wider">Poin Loyalitas</span>
              <div className="text-xl font-bold text-yellow-600">{c.points} Pts</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
