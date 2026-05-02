import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
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
  FiShoppingBag,
  FiMenu
} from 'react-icons/fi';
import { handleError, handleSuccess } from '../utils';
import API_URL from "../config";

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
  const [sortConfig, setSortConfig] = useState({ key: 'name', direction: 'asc' });
  const [showFilters, setShowFilters] = useState(false);

  // Bulk update states
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState([]);
  const [bulkStockValue, setBulkStockValue] = useState('');
  const [selectAll, setSelectAll] = useState(false);

  // Categories
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
      const response = await fetch(`${API_URL}/products`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${localStorage.getItem("token")}`
        },
      });
      const result = await response.json();
      if (!response.ok) {
        handleError(result.message || "Failed to fetch products");
      }

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

  const handleUpdateStockAndPrices = async () => {
    try {
      const updateData = {
        quantity: parseInt(editStockValue),
        purchasePrice: parseFloat(editPrices.purchasePrice),
        wholesalePrice: parseFloat(editPrices.wholesalePrice),
        retailPrice: parseFloat(editPrices.retailPrice),
      };

      const response = await fetch(
        `${API_URL}/products/${selectedProduct.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
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
      handleSuccess(`Product updated for ${selectedProduct.name}`);

    } catch (error) {
      console.error(error);
      handleError(error.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async () => {
    try {
      const response = await fetch(
        `${API_URL}/products/${selectedProduct.id}`,
        {
          method: "DELETE",
          headers: {
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          }
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
      handleSuccess(`${selectedProduct.name} has been deleted`);

    } catch (error) {
      console.error(error);
      handleError(error.message);
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
      handleError("Please select at least one product");
      return;
    }
    setBulkStockValue('');
    setShowBulkModal(true);
  };

  const handleBulkUpdate = async () => {
    if (!selectedProducts.length) {
      handleError("No products selected");
      return;
    }

    const newStockValue = parseInt(bulkStockValue);
    if (isNaN(newStockValue) || newStockValue < 0) {
      handleError("Please enter a valid stock quantity (0 or more)");
      return;
    }

    try {
      const updatePromises = selectedProducts.map(productId => {
        return fetch(`${API_URL}/products/${productId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${localStorage.getItem("token")}`
          },
          body: JSON.stringify({ quantity: newStockValue }),
        });
      });

      const responses = await Promise.all(updatePromises);
      const allOk = responses.every(res => res.ok);

      if (!allOk) {
        throw new Error("Some updates failed");
      }

      await fetchProducts();
      setShowBulkModal(false);
      setSelectedProducts([]);
      setSelectAll(false);
      handleSuccess(`Successfully updated stock for ${selectedProducts.length} product(s)`);

    } catch (error) {
      console.error(error);
      handleError(error.message || "Bulk update failed");
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
    handleSuccess('Stock report exported successfully');
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

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.05
      }
    }
  };

  const cardVariants = {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    whileHover: { y: -5, transition: { duration: 0.2 } }
  };

  // Stats Cards Data
  const statsCards = [
    { label: 'Total Products', value: totalProducts, icon: FiPackage, color: 'blue', prefix: '', suffix: '' },
    { label: 'Total Stock Units', value: totalStock, icon: FiTrendingUp, color: 'green', prefix: '', suffix: '' },
    { label: 'Inventory Value', value: totalInventoryValue.toFixed(2), icon: FiDollarSign, color: 'purple', prefix: '$', suffix: '' },
    { label: 'Potential Revenue', value: potentialRevenue.toFixed(2), icon: FiTrendingUp, color: 'indigo', prefix: '$', suffix: '' },
    { label: 'Low Stock Items', value: lowStockCount, icon: FiTrendingDown, color: 'orange', prefix: '', suffix: '' },
    { label: 'Out of Stock', value: outOfStockCount, icon: FiAlertCircle, color: 'red', prefix: '', suffix: '' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 md:p-8"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-6 sm:mb-8"
        >
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 flex items-center gap-3">
            <motion.div
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.3 }}
              className="bg-blue-600 p-2 rounded-xl"
            >
              <FiPackage className="text-white text-xl sm:text-2xl" />
            </motion.div>
            Stock Management
          </h1>
          <p className="text-gray-600 mt-2 ml-2 text-sm sm:text-base">Monitor and manage your inventory levels and pricing</p>
        </motion.div>

        {/* Stats Cards - Responsive Grid */}
        <motion.div
          variants={staggerContainer}
          initial="initial"
          animate="animate"
          className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6 sm:mb-8"
        >
          {statsCards.map((stat, idx) => {
            const Icon = stat.icon;
            const colorClasses = {
              blue: 'border-blue-500',
              green: 'border-green-500',
              purple: 'border-purple-500',
              indigo: 'border-indigo-500',
              orange: 'border-orange-500',
              red: 'border-red-500',
            };
            const textColorClasses = {
              blue: 'text-blue-600',
              green: 'text-green-600',
              purple: 'text-purple-600',
              indigo: 'text-indigo-600',
              orange: 'text-orange-600',
              red: 'text-red-600',
            };
            return (
              <motion.div
                key={stat.label}
                variants={cardVariants}
                className={`bg-white rounded-xl shadow-md p-3 sm:p-4 border-l-4 ${colorClasses[stat.color]}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <p className="text-gray-500 text-xs sm:text-xs truncate">{stat.label}</p>
                    <p className={`text-base sm:text-xl font-bold ${textColorClasses[stat.color]} truncate`}>
                      {stat.prefix}{stat.value}{stat.suffix}
                    </p>
                  </div>
                  <Icon className={`${textColorClasses[stat.color]} text-xl sm:text-2xl opacity-50 flex-shrink-0 ml-2`} />
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Filters and Actions - Responsive */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-xl shadow-md p-4 sm:p-6 mb-6 sm:mb-8"
        >
          {/* Mobile Filter Toggle */}
          <div className="flex items-center justify-between lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg text-gray-700"
            >
              <FiFilter />
              {showFilters ? 'Hide Filters' : 'Show Filters'}
            </button>
            <div className="flex gap-2">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={openBulkModal}
                className="px-3 py-2 bg-purple-600 text-white rounded-lg text-sm"
              >
                Bulk
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleExportCSV}
                className="px-3 py-2 bg-green-600 text-white rounded-lg text-sm"
              >
                <FiDownload className="inline mr-1" />
                Export
              </motion.button>
            </div>
          </div>

          <div className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
            <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1">
                  <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search by name or SKU..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                {/* Category Filter */}
                <div className="relative sm:w-48">
                  <FiFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white text-sm"
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
                  className="w-full sm:w-48 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value="all">All Stock Status</option>
                  <option value="in">In Stock (≥10)</option>
                  <option value="low">Low Stock (1-9)</option>
                  <option value="out">Out of Stock (0)</option>
                </select>
              </div>

              {/* Action Buttons - Desktop */}
              <div className="hidden lg:flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={openBulkModal}
                  className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition text-sm"
                >
                  <FiRefreshCw />
                  Bulk Update
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleExportCSV}
                  className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition text-sm"
                >
                  <FiDownload />
                  Export CSV
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={fetchProducts}
                  className="flex items-center gap-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition text-sm"
                >
                  <FiRefreshCw />
                  Refresh
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Products Table - Responsive with Horizontal Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white rounded-xl shadow-md overflow-hidden"
        >
          <div className="overflow-x-auto">
            <table className="w-full min-w-[800px] lg:min-w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-3 sm:px-4 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectAll && filteredProducts.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-4 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('name')}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      Product
                      {sortConfig.key === 'name' && (sortConfig.direction === 'asc' ? <FiArrowUp className="text-xs" /> : <FiArrowDown className="text-xs" />)}
                    </div>
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">SKU</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">Category</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden lg:table-cell" onClick={() => handleSort('purchasePrice')}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      Purchase
                      {sortConfig.key === 'purchasePrice' && (sortConfig.direction === 'asc' ? <FiArrowUp className="text-xs" /> : <FiArrowDown className="text-xs" />)}
                    </div>
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 hidden lg:table-cell" onClick={() => handleSort('wholesalePrice')}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      Wholesale
                      {sortConfig.key === 'wholesalePrice' && (sortConfig.direction === 'asc' ? <FiArrowUp className="text-xs" /> : <FiArrowDown className="text-xs" />)}
                    </div>
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('retailPrice')}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      Retail
                      {sortConfig.key === 'retailPrice' && (sortConfig.direction === 'asc' ? <FiArrowUp className="text-xs" /> : <FiArrowDown className="text-xs" />)}
                    </div>
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100" onClick={() => handleSort('stock')}>
                    <div className="flex items-center gap-1 sm:gap-2">
                      Stock
                      {sortConfig.key === 'stock' && (sortConfig.direction === 'asc' ? <FiArrowUp className="text-xs" /> : <FiArrowDown className="text-xs" />)}
                    </div>
                  </th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">Status</th>
                  <th className="px-3 sm:px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                <AnimatePresence>
                  {loading ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan="10" className="px-6 py-12 text-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                          className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full"
                        />
                      </td>
                    </motion.tr>
                  ) : filteredProducts.length === 0 ? (
                    <motion.tr
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <td colSpan="10" className="px-6 py-12 text-center text-gray-500">
                        No products found
                      </td>
                    </motion.tr>
                  ) : (
                    filteredProducts.map((product, index) => {
                      const stockStatus = getStockStatus(product.stock);
                      const StatusIcon = stockStatus.icon;
                      const profitMargin = ((product.retailPrice - product.purchasePrice) / product.purchasePrice * 100).toFixed(2);

                      return (
                        <motion.tr
                          key={product.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          transition={{ delay: index * 0.02 }}
                          whileHover={{ backgroundColor: '#F9FAFB' }}
                          className="transition"
                        >
                          <td className="px-3 sm:px-4 py-3 sm:py-4">
                            <input
                              type="checkbox"
                              checked={selectedProducts.includes(product.id)}
                              onChange={() => handleSelectProduct(product.id)}
                              className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                          </td>
                          <td className="px-4 sm:px-6 py-3 sm:py-4">
                            <div className="font-medium text-gray-900 text-sm sm:text-base">{product.name}</div>
                            <div className="text-xs text-gray-500 truncate max-w-[150px] sm:max-w-none">{product.description}</div>
                            {/* Mobile SKU & Category */}
                            <div className="sm:hidden mt-1">
                              <span className="text-xs text-gray-400">SKU: {product.sku}</span>
                              <span className="text-xs text-gray-400 ml-2">| {product.category}</span>
                            </div>
                            {/* Mobile Purchase & Wholesale */}
                            <div className="lg:hidden mt-1 text-xs">
                              <span className="text-gray-500">P: ${product.purchasePrice.toFixed(2)}</span>
                              <span className="text-gray-500 ml-2">W: ${product.wholesalePrice.toFixed(2)}</span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 hidden sm:table-cell">{product.sku}</td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 hidden md:table-cell">
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                              {product.category}
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-gray-900 hidden lg:table-cell">
                            ${product.purchasePrice.toFixed(2)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm font-medium text-blue-600 hidden lg:table-cell">
                            ${product.wholesalePrice.toFixed(2)}
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex flex-col">
                              <span className="text-sm sm:text-base font-bold text-green-600">${product.retailPrice.toFixed(2)}</span>
                              <span className={`text-xs ${profitMargin >= 0 ? 'text-green-500' : 'text-red-500'} hidden sm:inline`}>
                                Margin: {profitMargin}%
                              </span>
                            </div>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <motion.span
                              whileHover={{ scale: 1.05 }}
                              className={`inline-flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1 sm:py-1.5 text-xs font-semibold rounded-full border whitespace-nowrap
                                ${product.stock === 0
                                  ? 'bg-red-50 text-red-700 border-red-200'
                                  : product.stock < 10
                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                    : 'bg-green-50 text-green-700 border-green-200'
                                }`}
                            >
                              <motion.span
                                animate={product.stock > 0 && product.stock < 10 ? { scale: [1, 1.2, 1] } : {}}
                                transition={{ duration: 1, repeat: Infinity }}
                                className={`w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full 
                                  ${product.stock === 0
                                    ? 'bg-red-500'
                                    : product.stock < 10
                                      ? 'bg-yellow-500'
                                      : 'bg-green-500'
                                  }`}
                              />
                              <span className="hidden sm:inline">
                                {product.stock === 0
                                  ? 'Out of Stock'
                                  : product.stock < 10
                                    ? `Low Stock (${product.stock})`
                                    : `In Stock (${product.stock})`}
                              </span>
                              <span className="sm:hidden">
                                {product.stock === 0 ? 'Out' : product.stock < 10 ? `Low(${product.stock})` : `${product.stock}`}
                              </span>
                            </motion.span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4 hidden sm:table-cell">
                            <span className={`inline-flex items-center gap-1 text-xs sm:text-sm ${stockStatus.color === 'red' ? 'text-red-600' : stockStatus.color === 'orange' ? 'text-orange-600' : 'text-green-600'}`}>
                              <StatusIcon className="text-xs sm:text-sm" />
                              <span className="hidden sm:inline">{stockStatus.label}</span>
                            </span>
                          </td>
                          <td className="px-3 sm:px-6 py-3 sm:py-4">
                            <div className="flex gap-1 sm:gap-2">
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => openEditModal(product)}
                                className="p-1.5 sm:p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                                title="Edit Product"
                              >
                                <FiEdit2 className="text-sm sm:text-base" />
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                                onClick={() => {
                                  setSelectedProduct(product);
                                  setShowDeleteConfirm(true);
                                }}
                                className="p-1.5 sm:p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                                title="Delete Product"
                              >
                                <FiTrash2 className="text-sm sm:text-base" />
                              </motion.button>
                            </div>
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>

      {/* Modals with Framer Motion - Responsive */}
      <AnimatePresence>
        {/* Edit Product Modal */}
        {showEditModal && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-2xl p-4 sm:p-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Edit Product</h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={() => setShowEditModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="text-xl" />
                </motion.button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Product: <span className="font-semibold">{selectedProduct.name}</span>
                  </label>
                </div>

                {/* Stock Update Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm sm:text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                      placeholder="Enter new stock quantity"
                    />
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="text-sm sm:text-md font-semibold text-gray-800 mb-3 flex items-center gap-2">
                    <FiDollarSign className="text-green-600" />
                    Pricing Information
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <FiShoppingBag className="text-gray-500 text-sm" />
                        Purchase Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editPrices.purchasePrice}
                          onChange={(e) => setEditPrices({ ...editPrices, purchasePrice: e.target.value })}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <FiTag className="text-blue-600 text-sm" />
                        Wholesale Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editPrices.wholesalePrice}
                          onChange={(e) => setEditPrices({ ...editPrices, wholesalePrice: e.target.value })}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                        <FiDollarSign className="text-green-600 text-sm" />
                        Retail Price
                      </label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={editPrices.retailPrice}
                          onChange={(e) => setEditPrices({ ...editPrices, retailPrice: e.target.value })}
                          className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Profit Margin Preview */}
                  {editPrices.purchasePrice && editPrices.retailPrice && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 p-3 bg-gray-50 rounded-lg"
                    >
                      <div className="text-sm text-gray-600">
                        Profit Margin Preview:
                        <span className={`ml-2 font-semibold ${((parseFloat(editPrices.retailPrice) - parseFloat(editPrices.purchasePrice)) / parseFloat(editPrices.purchasePrice) * 100) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {((parseFloat(editPrices.retailPrice) - parseFloat(editPrices.purchasePrice)) / parseFloat(editPrices.purchasePrice) * 100).toFixed(2)}%
                        </span>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mt-6">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleUpdateStockAndPrices}
                  className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2 text-sm sm:text-base"
                >
                  <FiSave />
                  Save Changes
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm sm:text-base"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Bulk Update Modal */}
        {showBulkModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 sm:p-6"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg sm:text-xl font-bold text-gray-800">Bulk Stock Update</h3>
                <motion.button
                  whileHover={{ rotate: 90 }}
                  onClick={() => setShowBulkModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FiX className="text-xl" />
                </motion.button>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  placeholder="Enter new stock quantity for all selected products"
                />
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleBulkUpdate}
                  className="flex-1 bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm"
                >
                  <FiSave />
                  Update All
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setShowBulkModal(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
                >
                  Cancel
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}

        {/* Delete Confirmation Modal */}
        {showDeleteConfirm && selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl w-full max-w-md p-4 sm:p-6"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200 }}
                  className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4"
                >
                  <FiAlertCircle className="text-red-600 text-2xl" />
                </motion.div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-800 mb-2">Delete Product</h3>
                <p className="text-gray-600 mb-4 text-sm sm:text-base">
                  Are you sure you want to delete <span className="font-semibold">{selectedProduct.name}</span>?
                  This action cannot be undone.
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleDeleteProduct}
                    className="flex-1 bg-red-600 text-white py-2 rounded-lg hover:bg-red-700 transition text-sm"
                  >
                    Delete
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition text-sm"
                  >
                    Cancel
                  </motion.button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default Stock;