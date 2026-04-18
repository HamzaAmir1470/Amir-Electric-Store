import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/Pages/HomePage.jsx'
import LoginPage from './components/Pages/LoginPage.jsx'
import SignUpPage from './components/Pages/SignupPage.jsx'
import About from './components/About.jsx'
import Product from './components/Product.jsx'
import Contact from './components/Contact.jsx'
import AdminSignUpPage from './components/Pages/AdminSignUpPage.jsx'
import AdminDashboardPage from './components/Pages/AdminDashboardPage.jsx'
import AdminAddProductPage from './components/Pages/AdminAddProductPage.jsx'
import AdminStockPage from './components/Pages/AdminStockPage.jsx'
import AdminKhataPage from './components/Pages/AdminKhataPage.jsx'
import AdminInvoicePage from './components/Pages/AdminInvoicePage.jsx'
import 'react-toastify/ReactToastify.css'

function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Product />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/admin/signup" element={<AdminSignUpPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin/add-product" element={<AdminAddProductPage />} />
          <Route path="/admin/stock" element={<AdminStockPage />} />
          <Route path="/admin/khata" element={<AdminKhataPage />} />
          <Route path="/admin/invoice" element={<AdminInvoicePage />} />
        </Routes>
     </Router>
    </>
  )
}

export default App
