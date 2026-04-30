import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/Pages/HomePage.jsx'
import LoginPage from './components/Pages/LoginPage.jsx'
import SignUpPage from './components/Pages/SignUpPage.jsx'
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
import AdminRoute from "./ProtectedRoutes/AdminProtectedRoute.jsx"
import ProtectedRoute from "./ProtectedRoutes/ProtectedRoute.jsx"
import UserProfilePage from './components/Pages/UserProfilePage.jsx'
import PublicRoute from "./ProtectedRoutes/PublicRoute.jsx"
import AdminSettingpage from './components/Pages/AdminSettingpage.jsx'
import InvoiceDetails from './components/Pages/InvoiceDetailsPage.jsx'

function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={
            <About />
          } />
          <Route path="/products" element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <UserProfilePage />
            </ProtectedRoute>
          } />
          <Route path="/product/:id" element={
            <ProtectedRoute>
              <Product />
            </ProtectedRoute>
          } />
          <Route path="/contact" element={
            // <ProtectedRoute>
            <Contact />
            // </ProtectedRoute>
          } />
          <Route path="/login" element={
            <PublicRoute>
              <LoginPage />
            </PublicRoute>
          } />
          <Route path="/admin/signup" element={
            <PublicRoute>
              <AdminSignUpPage />
            </PublicRoute>
          } />
          <Route path="/signup" element={
            <PublicRoute>
              <SignUpPage />
            </PublicRoute>
          } />
          <Route path="/admin/dashboard" element={
            <AdminRoute>
              <AdminDashboardPage />
            </AdminRoute>
          } />
          <Route path="/admin/add-product" element={
            <AdminRoute>
              <AdminAddProductPage />
            </AdminRoute>
          } />
          <Route path="/admin/stock" element={
            <AdminRoute>
              <AdminStockPage />
            </AdminRoute>
          } />
          <Route path="/admin/khata" element={
            <AdminRoute>
              <AdminKhataPage />
            </AdminRoute>
          } />
          <Route path="/admin/setting" element={
            <AdminRoute>
              <AdminSettingpage />
            </AdminRoute>
          } />
          <Route path="/invoice/:id" element={
            <AdminRoute>
              <InvoiceDetails />
            </AdminRoute>
          } />

          <Route path="/admin/invoice" element={
            <AdminRoute>
              <AdminInvoicePage />
            </AdminRoute>
          } />
        </Routes>
      </Router>
    </>
  )
}

export default App
