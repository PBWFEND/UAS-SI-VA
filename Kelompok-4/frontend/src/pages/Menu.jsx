import { useState, useEffect } from 'react'
import MenuCard from '../components/MenuCard'
import { menuService } from '../services/api'

const Menu = () => {
  const [menus, setMenus] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingMenu, setEditingMenu] = useState(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'makanan',
    imageUrl: '',
    isAvailable: true
  })
  const [categories] = useState(['makanan', 'minuman', 'snack', 'dessert'])

  useEffect(() => {
    fetchMenus()
  }, [])

  const fetchMenus = async () => {
    try {
      const response = await menuService.getMenus()
      setMenus(response.data)
    } catch (error) {
      console.error('Failed to fetch menus:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    })
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingMenu) {
        await menuService.updateMenu(editingMenu.id, formData)
      } else {
        await menuService.createMenu(formData)
      }
      setShowModal(false)
      setEditingMenu(null)
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'makanan',
        imageUrl: '',
        isAvailable: true
      })
      fetchMenus()
    } catch (error) {
      console.error('Failed to save menu:', error)
    }
  }

  const handleEdit = (menu) => {
    setEditingMenu(menu)
    setFormData({
      name: menu.name,
      description: menu.description || '',
      price: menu.price.toString(),
      category: menu.category,
      imageUrl: menu.imageUrl || '',
      isAvailable: menu.isAvailable
    })
    setShowModal(true)
  }

  const handleDelete = async (id) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus menu ini?')) {
      try {
        await menuService.deleteMenu(id)
        fetchMenus()
      } catch (error) {
        console.error('Failed to delete menu:', error)
      }
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingMenu(null)
    setFormData({
      name: '',
      description: '',
      price: '',
      category: 'makanan',
      imageUrl: '',
      isAvailable: true
    })
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-gray-600">Loading menu...</div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Kelola Menu</h1>
        <button
          onClick={() => setShowModal(true)}
          className="btn btn-primary"
        >
          + Tambah Menu
        </button>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {menus.map((menu) => (
          <div key={menu.id} className="relative">
            <MenuCard menu={menu} />
            <div className="absolute top-2 right-2 flex space-x-2">
              <button
                onClick={() => handleEdit(menu)}
                className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
              >
                ✏️
              </button>
              <button
                onClick={() => handleDelete(menu.id)}
                className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
              >
                🗑️
              </button>
            </div>
          </div>
        ))}
      </div>

      {menus.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg mb-4">Belum ada menu</p>
          <button
            onClick={() => setShowModal(true)}
            className="btn btn-primary"
          >
            Tambah Menu Pertama
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-medium text-gray-900">
                {editingMenu ? 'Edit Menu' : 'Tambah Menu Baru'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-400 hover:text-gray-500"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Nama Menu *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className="input"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    className="input"
                    rows="3"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Harga *
                  </label>
                  <input
                    type="number"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    className="input"
                    min="0"
                    step="100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Kategori *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="input"
                    required
                  >
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    URL Gambar
                  </label>
                  <input
                    type="url"
                    name="imageUrl"
                    value={formData.imageUrl}
                    onChange={handleChange}
                    className="input"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="isAvailable"
                    checked={formData.isAvailable}
                    onChange={handleChange}
                    className="h-4 w-4 text-blue-600 rounded"
                  />
                  <label className="ml-2 block text-sm text-gray-700">
                    Tersedia
                  </label>
                </div>
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="btn bg-gray-300 text-gray-700 hover:bg-gray-400"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  {editingMenu ? 'Update' : 'Simpan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Menu