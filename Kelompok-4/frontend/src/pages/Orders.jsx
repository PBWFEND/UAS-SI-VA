import { useState, useEffect } from 'react'
import { orderService, menuService } from '../services/api'
import OrderTable from '../components/OrderTable'

const Orders = () => {
  const [orders, setOrders] = useState([])
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    customerName: '',
    tableNumber: '',
    items: [{ menuId: '', quantity: 1, notes: '' }]
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [ordersRes, menusRes] = await Promise.all([
        orderService.getOrders(),
        menuService.getMenus()
      ])
      setOrders(ordersRes.data)
      setMenus(menusRes.data.filter(menu => menu.isAvailable))
    } catch (error) {
      console.error('Failed to fetch data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: value
    })
  }

  const handleItemChange = (index, field, value) => {
    const newItems = [...formData.items]
    newItems[index][field] = value
    setFormData({
      ...formData,
      items: newItems
    })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { menuId: '', quantity: 1, notes: '' }]
    })
  }

  const removeItem = (index) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        items: newItems
      })
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await orderService.createOrder({
        ...formData,
        tableNumber: parseInt(formData.tableNumber),
        items: formData.items.map(item => ({
          ...item,
          menuId: parseInt(item.menuId),
          quantity: parseInt(item.quantity)
        }))
      })
      setShowModal(false)
      setFormData({
        customerName: '',
        tableNumber: '',
        items: [{ menuId: '', quantity: 1, notes: '' }]
      })
      fetchData()
    } catch (error) {
      console.error('Failed to create order:', error)
    }
  }

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      const menu = menus.find(m => m.id === parseInt(item.menuId))
      return total + (menu ? menu.price * item.quantity : 0)
    }, 0)
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setFormData({
      customerName: '',
      tableNumber: '',
      items: [{ menuId: '', quantity: 1, notes: '' }]
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading orders...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Pesanan</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-success"
        >
          + Pesanan Baru
        </button>
      </div>

      <OrderTable orders={orders} onRefresh={fetchData} />

      {/* Create Order Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                Buat Pesanan Baru
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nama Pelanggan *
                  </label>
                  <input
                    type="text"
                    name="customerName"
                    value={formData.customerName}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nomor Meja *
                  </label>
                  <input
                    type="number"
                    name="tableNumber"
                    value={formData.tableNumber}
                    onChange={handleChange}
                    className="input"
                    min="1"
                    required
                  />
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-md font-medium text-gray-900">Item Pesanan</h4>
                  <button
                    type="button"
                    onClick={addItem}
                    className="btn btn-primary text-sm"
                  >
                    + Tambah Item
                  </button>
                </div>

                {formData.items.map((item, index) => (
                  <div key={index} className="flex items-center space-x-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Menu
                      </label>
                      <select
                        value={item.menuId}
                        onChange={(e) => handleItemChange(index, 'menuId', e.target.value)}
                        className="input"
                        required
                      >
                        <option value="">Pilih Menu</option>
                        {menus.map((menu) => (
                          <option key={menu.id} value={menu.id}>
                            {menu.name} - Rp {menu.price.toLocaleString()}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="w-32">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Jumlah
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleItemChange(index, 'quantity', e.target.value)}
                        className="input"
                        required
                      />
                    </div>

                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Catatan
                      </label>
                      <input
                        type="text"
                        value={item.notes}
                        onChange={(e) => handleItemChange(index, 'notes', e.target.value)}
                        className="input"
                        placeholder="Tanpa pedas, dll."
                      />
                    </div>

                    {formData.items.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="mt-6 text-red-500 hover:text-red-700"
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center mb-6">
                <div className="text-lg font-semibold">
                  Total: Rp {calculateTotal().toLocaleString()}
                </div>
              </div>

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-success"
                  disabled={formData.items.some(item => !item.menuId)}
                >
                  Buat Pesanan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Orders