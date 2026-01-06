import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Tambahan wajib untuk redirect
import { menuService, orderService } from '../services/api'; 
import MenuCard from '../components/MenuCard';

const Dashboard = () => {
  const navigate = useNavigate();
  const [menus, setMenus] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stats, setStats] = useState({
    totalMenus: 0,
    totalOrders: 0,
    revenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. CEK KEAMANAN: Apakah ada token?
    const token = localStorage.getItem('token');
    if (!token) {
        navigate('/login'); // Tendang ke login jika tidak ada token
        return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const [menusRes, ordersRes] = await Promise.all([
        menuService.getMenus(),
        orderService.getOrders()
      ]);

      console.log("Data Menu dari Backend:", menusRes.data); // Debugging
      console.log("Data Order dari Backend:", ordersRes.data); // Debugging

      // 2. DATA HANDLING YANG AMAN
      // Backend mungkin mengirim array langsung [..] ATAU object { data: [..] }
      // Kita siapkan logika untuk menangani keduanya.
      const menuData = Array.isArray(menusRes.data) ? menusRes.data : (menusRes.data.data || []);
      const orderData = Array.isArray(ordersRes.data) ? ordersRes.data : (ordersRes.data.data || []);

      setMenus(menuData.slice(0, 4));
      setOrders(orderData.slice(0, 5));

      const revenue = orderData.reduce((sum, order) => sum + (order.totalAmount || 0), 0);
      
      setStats({
        totalMenus: menuData.length,
        totalOrders: orderData.length,
        revenue
      });

    } catch (error) {
      console.error('Failed to fetch data:', error);
      // Opsional: Jika errornya 401 (Unauthorized), logout user
      if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg font-medium text-gray-600">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="p-6 min-h-screen bg-gray-50">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard UMKM</h1>
        <button 
            onClick={() => {
                localStorage.clear();
                navigate('/login');
            }}
            className="px-4 py-2 text-sm text-red-600 border border-red-600 rounded hover:bg-red-50"
        >
            Logout
        </button>
      </div>

      {/* --- STATISTIC CARDS --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-blue-500">
          <h3 className="text-lg font-semibold text-gray-600">Total Menu</h3>
          <p className="text-3xl font-bold text-blue-600 mt-2">{stats.totalMenus}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-green-500">
          <h3 className="text-lg font-semibold text-gray-600">Total Pesanan</h3>
          <p className="text-3xl font-bold text-green-600 mt-2">{stats.totalOrders}</p>
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow-sm border-l-4 border-purple-500">
          <h3 className="text-lg font-semibold text-gray-600">Total Pendapatan</h3>
          <p className="text-3xl font-bold text-purple-600 mt-2">
            Rp {stats.revenue.toLocaleString()}
          </p>
        </div>
      </div>

      {/* --- RECENT MENUS --- */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Menu Terbaru</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {menus.length > 0 ? (
            menus.map((menu) => (
              <MenuCard key={menu.id || Math.random()} menu={menu} />
            ))
          ) : (
            <div className="col-span-4 text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
              <p className="text-gray-500">Belum ada menu yang ditambahkan</p>
            </div>
          )}
        </div>
      </div>

      {/* --- RECENT ORDERS TABLE --- */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Pesanan Terbaru</h2>
        </div>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pelanggan</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {orders.length > 0 ? (
                  orders.map((order) => (
                    <tr key={order.id || Math.random()} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {order.customerName || 'Umum'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        Rp {(order.totalAmount || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800">
                          {order.status || 'Pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center py-8 text-gray-500">
                      Belum ada pesanan masuk
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;