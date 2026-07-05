import Header from "./components/Header.jsx"
import Hero from "./components/Hero.jsx"
import FeatureSection from "./components/FeatureSection.jsx"
import Footer from "./components/Footer.jsx"
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import { Routes, Route } from 'react-router-dom'
import { useState } from "react"

function App() {

  const [user, setUser] = useState(null)

  return (
  <Routes>
    <Route path="/" element={
      <>
        <Header />
        <Hero />
        <FeatureSection />
        <Footer />
      </>
    }>
    </Route>
    <Route path="/login" element={<Login setUser={setUser}/>} />
    <Route path="/signup" element={<Signup setUser={setUser} />} />
    <Route path="/dashboard" element={<Dashboard user={user} />} />
  </Routes>
  )
}

export default App