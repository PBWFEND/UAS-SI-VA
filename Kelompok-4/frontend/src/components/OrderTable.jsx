import { useState } from 'react'

const OrderTable = ({ orders, onRefresh }) => {
  const [statusFilter, setStatusFilter] = useState('all')

  const filteredOrders = orders.filter(order => 
    statusFilter === 'all' || order.status === statusFilter
  )

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', label: 'Menunggu' },
      processing: { color: 'bg-blue-100 text-blue-800', label: 'Diproses' },
      completed: { color: 'bg-green-100 text-green-800', label: 'Selesai' },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Dibatalkan' }
    }
    
    const config = statusConfig[status] || statusConfig.pending
    return (
      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${config.color}`}>
        {config.label}
      </span>
    )
  }

  const getOrderItemsSummary = (orderItems) => {
    const itemCount = orderItems.reduce((sum, item) => sum + item.quantity, 0)
    const itemNames = orderItems.map(item => item.menu.name).join(', ')
    return `${itemCount} item${itemCount > 1 ? 's' : ''}: ${itemNames.substring(0, 50)}${itemNames.length > 50 ? '...' : ''}`
  }

  return (
    <div className="card">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">Daftar Pesanan</h2>
        <div className="flex space-x-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input py-1 text-sm"
          >
            <option value="all">Semua Status</option>
            <option value="pending">Menunggu</option>
            <option value="processing">Diproses</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
          <button
            onClick={onRefresh}
            className="btn btn-primary text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ID
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Pelanggan
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Items
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Total
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Tanggal
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredOrders.map((order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  #{order.id}
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900">{order.customerName}</div>
                  <div className="text-xs text-gray-500">Meja: {order.tableNumber}</div>
                </td>
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-900 max-w-xs truncate">
                    {getOrderItemsSummary(order.orderItems)}
                  </div>
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                  Rp {order.totalAmount.toLocaleString()}
                </td>
                <td className="px-4 py-4 whitespace-nowrap">
                  {getStatusBadge(order.status)}
                </td>
                <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString('id-ID', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {filteredOrders.length === 0 && (
          <div className="text-center py-8">
            <p className="text-gray-500">
              {statusFilter === 'all' 
                ? 'Belum ada pesanan' 
                : `Tidak ada pesanan dengan status ${statusFilter}`}
            </p>
          </div>
        )}
      </div>
      
      <div className="mt-4 flex justify-between items-center text-sm text-gray-500">
        <div>
          Menampilkan {filteredOrders.length} dari {orders.length} pesanan
        </div>
        <div className="flex space-x-2">
          <button className="px-3 py-1 border rounded hover:bg-gray-50">
            ← Prev
          </button>
          <button className="px-3 py-1 border rounded hover:bg-gray-50">
            Next →
          </button>
        </div>
      </div>
    </div>
  )
}

export default OrderTable