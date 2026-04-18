import React, { useState, useEffect } from 'react';
import { 
  FiPackage, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiPlus, 
  FiAlertCircle,
  FiCheckCircle,
  FiXCircle,
  FiTrendingUp,
  FiTrendingDown,
  FiFilter,
  FiDownload,
  FiRefreshCw,
  FiArrowUp,
  FiArrowDown,
  FiSave,
  FiX
} from 'react-icons/fi';

const Stock = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStockStatus, setFilterStockStatus] = useState('all');
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editStockValue, setEditStockValue] = useState('');
  const [notification, setNotification] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Mock categories
  const categories = [
    'Electronics',
    'Clothing',
    'Books',
    'Home & Garden',
    'Sports',
    'Toys',
    'Beauty',
    'Automotive'
  ];

  // Mock data - in real app, fetch from API
  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockProducts = [
      { id: 1, name: "iPhone 14 Pro", price: 999, stock: 45, category: "Electronics", description: "Latest Apple smartphone", status: "active", sku: "IP14P001" },
      { id: 2, name: "Samsung Galaxy S23", price: 899, stock: 32, category: "Electronics", description: "Premium Android phone", status: "active", sku: "SGS23002" },
      { id: 3, name: "Leather Jacket", price: 199, stock: 8, category: "Clothing", description: "Genuine leather jacket", status: "active", sku: "LJ003" },
      { id: 4, name: "The Great Gatsby", price: 15, stock: 0, category: "Books", description: "Classic novel", status: "inactive", sku: "BK004" },
      { id: 5, name: "Garden Tool Set", price: 49, stock: 3, category: "Home & Garden", description: "Complete garden toolkit", status: "active", sku: "HG005" },
      { id: 6, name: "Basketball", price: 29, stock: 15, category: "Sports", description: "Official size basketball", status: "active", sku: "SP006" },
      { id: 7, name: "Lego Set", price: 59, stock: 0, category: "Toys", description: "Building blocks set", status: "inactive", sku: "TY007" },
      { id: 8, name: "Face Cream", price: 35, stock: 12, category: "Beauty", description: "Anti-aging cream", status: "active", sku: "BT008" },
      { id: 9, name: "Car Vacuum Cleaner", price: 79, stock: 5, category: "Automotive", description: "Portable car vacuum", status: "active", sku: "AT009" },
      { id: 10, name: "Wireless Earbuds", price: 129, stock: 0, category: "Electronics", description: "Noise cancelling earbuds", status: "inactive", sku: "EL010" }
    ];
    
    setProducts(mockProducts);
    setLoading(false);
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateStock = async () => {
    const updatedProducts = products.map(product => 
      product.id === selectedProduct.id 
        ? { ...product, stock: parseInt(editStockValue) }
        : product
    );
    setProducts(updatedProducts);
    setShowEditModal(false);
    showNotification(`Stock updated for ${selectedProduct.name}`, 'success');
  };

  const handleDeleteProduct = async () => {
    const updatedProducts = products.filter(product => product.id !== selectedProduct.id);
    setProducts(updatedProducts);
    setShowDeleteConfirm(false);
    showNotification(`${selectedProduct.name} has been deleted`, 'warning');
  };

  const handleBulkUpdate = async () => {
    // Implement bulk update logic
    showNotification('Bulk stock update initiated', 'info');
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Price', 'Stock', 'Status'];
    const csvData = filteredProducts.map(product => [
      product.name,
      product.sku,
      product.category,
      product.price,
      product.stock,
      product.status
    ]);
    
    const csvContent = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stock_report_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification('Stock report exported successfully', 'success');
  };

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getStockStatus = (stock) => {
    if (stock === 0) return { label: 'Out of Stock', color: 'red', icon: FiXCircle };
    if (stock < 10) return { label: 'Low Stock', color: 'orange', icon: FiAlertCircle };
    return { label: 'In Stock', color: 'green', icon: FiCheckCircle };
  };

  // Filter and search products
  const filteredProducts = products
    .filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           product.sku.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = filterCategory === 'all' || product.category === filterCategory;
      const matchesStockStatus = filterStockStatus === 'all' || 
                                (filterStockStatus === 'out' && product.stock === 0) ||
                                (filterStockStatus === 'low' && product.stock > 0 && product.stock < 10) ||
                                (filterStockStatus === 'in' && product.stock >= 10);
      return matchesSearch && matchesCategory && matchesStockStatus;
    })
    .sort((a, b) => {
      if (sortConfig.key === 'stock') {
        return sortConfig.direction === 'asc' ? a.stock - b.stock : b.stock - a.stock;
      }
      if (sortConfig.key === 'price') {
        return sortConfig.direction === 'asc' ? a.price - b.price : b.price - a.price;
      }
      const aVal = a[sortConfig.key].toString().toLowerCase();
      const bVal = b[sortConfig.key].toString().toLowerCase();
      return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg animate-slide-in ${
          notification.type === 'success' ? 'bg-green-500' : 
          notification.type === 'warning' ? 'bg-orange-500' : 'bg-blue-500'
        } text-white`}>
          {notification.type === 'success' ? <FiCheckCircle className="text-xl" /> :
           notification.type === 'warning' ? <FiAlertCircle className="text-xl" /> : <FiRefreshCw className="text-xl" />}
          <span>{notification.message}</span>
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl">
              <FiPackage className="text-white text-2xl" />
            </div>
            Stock Management
          </h1>
          <p className="text-gray-600 mt-2 ml-2">Monitor and manage your inventory levels</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Products</p>
                <p className="text-2xl font-bold text-gray-800">{totalProducts}</p>
              </div>
              <FiPackage className="text-blue-500 text-3xl opacity-50" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Total Stock Units</p>
                <p className="text-2xl font-bold text-gray-800">{totalStock}</p>
              </div>
              <FiTrendingUp className="text-green-500 text-3xl opacity-50" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Low Stock Items</p>
                <p className="text-2xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
              <FiTrendingDown className="text-orange-500 text-3xl opacity-50" />
            </div>
          </div>
          
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm">Out of Stock</p>
                <p className="text-2xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <FiAlertCircle className="text-red-500 text-3xl opacity-50" />
            </div>
          </div>
        </div>

        {/* Filters and Actions */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-8">
          <div className="flex flex-wrap gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-4 flex-1">
              {/* Search */}
              <div className="relative flex-1 min-w-[200px]">
                <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search by name or SKU..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              {/* Category Filter */}
              <div className="relative">
                <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                >
                  <option value="all">All Categories</option>
                  {categories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
              
              {/* Stock Status Filter */}
              <select
                value={filterStockStatus}
                onChange={(e) => setFilterStockStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">All Stock Status</option>
                <option value="in">In Stock (≥10)</option>
                <option value="low">Low Stock (1-9)</option>
                <option value="out">Out of Stock (0)</option>
              </select>
            </div>
            
            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleBulkUpdate}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
              >
                <FiRefreshCw />
                Bulk Update
              </button>
              <button
                onClick={handleExportCSV}
                className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
              >
                <FiDownload />
                Export CSV
              </button>
              <button
                onClick={fetchProducts}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <FiRefreshCw />
                Refresh
              </button>
            </div>
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">
                      Product Name
                      {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('price')}>
                    <div className="flex items-center gap-2">
                      Price
                      {sortConfig.key === 'price' && (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('stock')}>
                    <div className="flex items-center gap-2">
                      Stock
                      {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-12 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    const StatusIcon = stockStatus.icon;
                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{product.name}</div>
                          <div className="text-sm text-gray-500">{product.description}</div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">{product.sku}</td>
                        <td className="px-6 py-4">
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                            {product.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">${product.price}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            product.stock === 0 ? 'bg-red-100 text-red-700' :
                            product.stock < 10 ? 'bg-orange-100 text-orange-700' :
                            'bg-green-100 text-green-700'
                          }`}>
                            {product.stock} units
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 text-sm ${stockStatus.color === 'red' ? 'text-red-600' : stockStatus.color === 'orange' ? 'text-orange-600' : 'text-green-600'}`}>
                            <StatusIcon />
                            {stockStatus.label}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setEditStockValue(product.stock.toString());
                                setShowEditModal(true);
                              }}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            >
                              <FiTrash2 />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Edit Stock Modal */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Update Stock</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Product: <span className="font-semibold">{selectedProduct.name}</span>
              </label>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Current Stock: <span className="font-semibold">{selectedProduct.stock} units</span>
              </label>
              <input
                type="number"
                value={editStockValue}
                onChange={(e) => setEditStockValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new stock quantity"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleUpdateStock}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FiSave />
                Update Stock
              </button>
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
            <div className="text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                <FiAlertCircle className="text-red-600 text-2xl" />
              </div>
              <h3 className="text-lg font-bold text-gray-800 mb-2">Delete Product</h3>
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete <span className="font-semibold">{selectedProduct.name}</span>? 
                This action cannot be undone.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleDeleteProduct}
                  className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition"
                >
                  Delete
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slide-in {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        
        .animate-slide-in {
          animation: slide-in 0.3s ease-out;
        }
        
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Stock;