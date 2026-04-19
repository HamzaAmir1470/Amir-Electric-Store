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
  FiX,
  FiDollarSign,
  FiTag,
  FiShoppingBag
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import { handleError, handleSuccess } from '../utils';

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
  const [editPrices, setEditPrices] = useState({
    purchasePrice: '',
    wholesalePrice: '',
    retailPrice: ''
  });
  const [notification, setNotification] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });

  // Bulk update states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  // Mock categories
  const categories = [
    'Electronics',
    'Motors',
    'Bearings',
    'Belts',
    'Rotors',
    'Wires',
    'Tools',
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch("http://localhost:8080/products");
      const result = await response.json();

      if (!response.ok) {
        handleError(result.message || "Failed to fetch products");
      }

      // Map backend data → frontend format
      const formattedProducts = result.data.map((item) => ({
        id: item._id,
        name: item.name,
        purchasePrice: item.purchasePrice || item.costPrice || 0,
        wholesalePrice: item.wholesalePrice || item.price || 0,
        retailPrice: item.retailPrice || item.price || 0,
        stock: item.quantity,
        category: item.category,
        description: item.description,
        imageUrl: item.imageUrl,
        status: item.quantity > 0 ? "active" : "inactive",
        sku: item._id.slice(-6).toUpperCase()
      }));

      setProducts(formattedProducts);
      setSelectedProducts([]);
      setSelectAll(false);

    } catch (error) {
      console.error(error);
      handleError("Failed to load products");
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdateStockAndPrices = async () => {
    try {
      const updateData = {
        quantity: parseInt(editStockValue),
        purchasePrice: parseFloat(editPrices.purchasePrice),
        wholesalePrice: parseFloat(editPrices.wholesalePrice),
        retailPrice: parseFloat(editPrices.retailPrice),
      };

      const response = await fetch(
        `http://localhost:8080/products/${selectedProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(updateData),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to update product");
      }

      await fetchProducts();

      setShowEditModal(false);
      showNotification(
        `Product updated for ${selectedProduct.name}`,
        "success"
      );

    } catch (error) {
      console.error(error);
      handleError(error.message || "Failed to update product");
    }
  };
  const handleDeleteProduct = async () => {
    try {
      const response = await fetch(
        `http://localhost:8080/products/${selectedProduct.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete product");
      }

      const updatedProducts = products.filter(
        (product) => product.id !== selectedProduct.id
      );

      setProducts(updatedProducts);
      setShowDeleteConfirm(false);
      setSelectedProducts(prev => prev.filter(id => id !== selectedProduct.id));
      handleSuccess(`${selectedProduct.name} has been deleted`, "warning");

    } catch (error) {
      console.error(error);
      handleError(error.message, "error");
    }
  };

  const handleSelectProduct = (productId) => {
    setSelectedProducts(prev => {
      if (prev.includes(productId)) {
        return prev.filter(id => id !== productId);
      } else {
        return [...prev, productId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedProducts([]);
    } else {
      const allProductIds = filteredProducts.map(p => p.id);
      setSelectedProducts(allProductIds);
    }
    setSelectAll(!selectAll);
  };

  const openBulkModal = () => {
    if (selectedProducts.length === 0) {
      showNotification("Please select at least one product", "warning");
      return;
    }
    setBulkStockValue('');
    setShowBulkModal(true);
  };

  const handleBulkUpdate = async () => {
    if (!selectedProducts.length) {
      showNotification("No products selected", "warning");
      return;
    }

    const newStockValue = parseInt(bulkStockValue);
    if (isNaN(newStockValue) || newStockValue < 0) {
      showNotification("Please enter a valid stock quantity (0 or more)", "error");
      return;
    }

    try {
      const updatePromises = selectedProducts.map(productId => {
        return fetch(`http://localhost:8080/products/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ quantity: newStockValue }),
        });
      });

      const responses = await Promise.all(updatePromises);
      const allOk = responses.every(res => res.ok);

      if (!allOk) {
        throw new Error("Some updates failed");
      }

      const updatedProducts = products.map(product => {
        if (selectedProducts.includes(product.id)) {
          return { ...product, stock: newStockValue };
        }
        return product;
      });

      setProducts(updatedProducts);
      setShowBulkModal(false);
      setSelectedProducts([]);
      setSelectAll(false);
      showNotification(`Successfully updated stock for ${selectedProducts.length} product(s)`, "success");

    } catch (error) {
      console.error(error);
      showNotification(error.message || "Bulk update failed", "error");
    }
  };

  const handleExportCSV = () => {
    const headers = ['Name', 'SKU', 'Category', 'Purchase Price', 'Wholesale Price', 'Retail Price', 'Stock', 'Status', 'Profit Margin'];
    const csvData = filteredProducts.map(product => {
      const margin = ((product.retailPrice - product.purchasePrice) / product.purchasePrice * 100).toFixed(2);
      return [
        product.name,
        product.sku,
        product.category,
        product.purchasePrice,
        product.wholesalePrice,
        product.retailPrice,
        product.stock,
        product.status === 'active' ? 'Active' : 'Inactive',
        `${margin}%`
      ];
    });

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

  const openEditModal = (product) => {
    setSelectedProduct(product);
    setEditStockValue(product.stock.toString());
    setEditPrices({
      purchasePrice: product.purchasePrice.toString(),
      wholesalePrice: product.wholesalePrice.toString(),
      retailPrice: product.retailPrice.toString()
    });
    setShowEditModal(true);
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
      if (sortConfig.key === 'purchasePrice' || sortConfig.key === 'wholesalePrice' || sortConfig.key === 'retailPrice') {
        return sortConfig.direction === 'asc' ? a[sortConfig.key] - b[sortConfig.key] : b[sortConfig.key] - a[sortConfig.key];
      }
      const aVal = a[sortConfig.key].toString().toLowerCase();
      const bVal = b[sortConfig.key].toString().toLowerCase();
      return sortConfig.direction === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    });

  const totalProducts = products.length;
  const totalStock = products.reduce((sum, product) => sum + product.stock, 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock < 10).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;
  const totalInventoryValue = products.reduce((sum, product) => sum + (product.purchasePrice * product.stock), 0);
  const potentialRevenue = products.reduce((sum, product) => sum + (product.retailPrice * product.stock), 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-8">
      {/* Notification */}
      {notification && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-6 py-3 rounded-lg shadow-lg animate-slide-in ${notification.type === 'success' ? 'bg-green-500' :
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
          <p className="text-gray-600 mt-2 ml-2">Monitor and manage your inventory levels and pricing</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Total Products</p>
                <p className="text-xl font-bold text-gray-800">{totalProducts}</p>
              </div>
              <FiPackage className="text-blue-500 text-2xl opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-green-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Total Stock Units</p>
                <p className="text-xl font-bold text-gray-800">{totalStock}</p>
              </div>
              <FiTrendingUp className="text-green-500 text-2xl opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Inventory Value</p>
                <p className="text-xl font-bold text-purple-600">${totalInventoryValue.toFixed(2)}</p>
              </div>
              <FiDollarSign className="text-purple-500 text-2xl opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-indigo-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Potential Revenue</p>
                <p className="text-xl font-bold text-indigo-600">${potentialRevenue.toFixed(2)}</p>
              </div>
              <FiTrendingUp className="text-indigo-500 text-2xl opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-orange-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Low Stock Items</p>
                <p className="text-xl font-bold text-orange-600">{lowStockCount}</p>
              </div>
              <FiTrendingDown className="text-orange-500 text-2xl opacity-50" />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-4 border-l-4 border-red-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-xs">Out of Stock</p>
                <p className="text-xl font-bold text-red-600">{outOfStockCount}</p>
              </div>
              <FiAlertCircle className="text-red-500 text-2xl opacity-50" />
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
                onClick={openBulkModal}
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
                  <th className="px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-2">
                      Product Name
                      {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">SKU</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('purchasePrice')}>
                    <div className="flex items-center gap-2">
                      Purchase Price
                      {sortConfig.key === 'purchasePrice' && (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('wholesalePrice')}>
                    <div className="flex items-center gap-2">
                      Wholesale Price
                      {sortConfig.key === 'wholesalePrice' && (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('retailPrice')}>
                    <div className="flex items-center gap-2">
                      Retail Price
                      {sortConfig.key === 'retailPrice' && (sortConfig.direction === 'asc' ? <FiArrowUp /> : <FiArrowDown />)}
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
                    <td colSpan="10" className="px-6 py-12 text-center">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                      No products found
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product) => {
                    const stockStatus = getStockStatus(product.stock);
                    const StatusIcon = stockStatus.icon;
                    const profitMargin = ((product.retailPrice - product.purchasePrice) / product.purchasePrice * 100).toFixed(2);

                    return (
                      <tr key={product.id} className="hover:bg-gray-50 transition">
                        <td className="px-4 py-4">
                          <input
                            type="checkbox"
                            checked={selectedProducts.includes(product.id)}
                            onChange={() => handleSelectProduct(product.id)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                        </td>
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
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          ${product.purchasePrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4 text-sm font-medium text-blue-600">
                          ${product.wholesalePrice.toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-green-600">${product.retailPrice.toFixed(2)}</span>
                            <span className={`text-xs ${profitMargin >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                              Margin: {profitMargin}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${product.stock === 0 ? 'bg-red-100 text-red-700' :
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
                              onClick={() => openEditModal(product)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                              title="Edit Product"
                            >
                              <FiEdit2 />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedProduct(product);
                                setShowDeleteConfirm(true);
                              }}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                              title="Delete Product"
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

      {/* Edit Product Modal with Prices */}
      {showEditModal && selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-6 animate-fade-in max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Edit Product</h3>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Product: <span className="font-semibold">{selectedProduct.name}</span>
                </label>
              </div>

              {/* Stock Update Section */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiPackage className="text-blue-600" />
                  Stock Information
                </h4>
                <div>
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
              </div>

              {/* Pricing Section */}
              <div className="border-t border-gray-200 pt-4">
                <h4 className="text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                  <FiDollarSign className="text-green-600" />
                  Pricing Information
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <FiShoppingBag className="text-gray-500" />
                      Purchase Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editPrices.purchasePrice}
                        onChange={(e) => setEditPrices({ ...editPrices, purchasePrice: e.target.value })}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <FiTag className="text-blue-600" />
                      Wholesale Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editPrices.wholesalePrice}
                        onChange={(e) => setEditPrices({ ...editPrices, wholesalePrice: e.target.value })}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <FiDollarSign className="text-green-600" />
                      Retail Price
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                      <input
                        type="number"
                        step="0.01"
                        value={editPrices.retailPrice}
                        onChange={(e) => setEditPrices({ ...editPrices, retailPrice: e.target.value })}
                        className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="0.00"
                      />
                    </div>
                  </div>
                </div>

                {/* Profit Margin Preview */}
                {editPrices.purchasePrice && editPrices.retailPrice && (
                  <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                    <div className="text-sm text-gray-600">
                      Profit Margin Preview:
                      <span className={`ml-2 font-semibold ${((parseFloat(editPrices.retailPrice) - parseFloat(editPrices.purchasePrice)) / parseFloat(editPrices.purchasePrice) * 100) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {((parseFloat(editPrices.retailPrice) - parseFloat(editPrices.purchasePrice)) / parseFloat(editPrices.purchasePrice) * 100).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateStockAndPrices}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
              >
                <FiSave />
                Save Changes
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

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-fade-in">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-bold text-gray-800">Bulk Stock Update</h3>
              <button onClick={() => setShowBulkModal(false)} className="text-gray-400 hover:text-gray-600">
                <FiX className="text-xl" />
              </button>
            </div>
            <div className="mb-4">
              <p className="text-sm text-gray-600 mb-2">
                Updating stock for <span className="font-semibold text-blue-600">{selectedProducts.length}</span> selected product(s)
              </p>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                New Stock Quantity
              </label>
              <input
                type="number"
                value={bulkStockValue}
                onChange={(e) => setBulkStockValue(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter new stock quantity for all selected products"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBulkUpdate}
                className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2"
              >
                <FiSave />
                Update All
              </button>
              <button
                onClick={() => setShowBulkModal(false)}
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