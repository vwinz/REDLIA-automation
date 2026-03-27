import React from 'react'
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import Signup from './pages/Signup'
import Login from './pages/Login'
import Intern from './pages/Intern'
import Admin from './pages/Admin'
import InternManagement from './pages/AdminIntern'
import ClientManagement from './pages/AdminClient'
import BookingManagement from './pages/AdminBooking'

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/intern" element={<Intern />} />
         <Route path="/admin" element={<Admin />} />
         <Route path="/intern-management" element={<InternManagement />} />
         <Route path="/client-management" element={<ClientManagement />} />
         <Route path="/booking-management" element={<BookingManagement />} />
      </Routes>
    </Router>
  )
}

export default App