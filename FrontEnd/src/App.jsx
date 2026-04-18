import './App.css'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './components/HomePage.jsx'
import Login from './components/Login.jsx'
import SignUp from './components/SignUp.jsx'
import About from './components/About.jsx'
import Product from './components/Product.jsx'
import Contact from './components/Contact.jsx'


function App() {


  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<About />} />
          <Route path="/products" element={<Product />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<SignUp />} />
        </Routes>
     </Router>
    </>
  )
}

export default App
