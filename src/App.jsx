import Navbar from "./components/Navbar.jsx"
import Hero from "./components/Hero.jsx"
import FeatureSection from "./components/FeatureSection.jsx"
import Footer from "./components/Footer.jsx"
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import InjuryDetail from "./pages/InjuryDetail.jsx"
import { Routes, Route } from 'react-router-dom'
import { useState } from "react"

function App() {

  const [user, setUser] = useState(null)

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/" element={
          <>
            <Hero />
            <FeatureSection />
            <Footer />
          </>
        }>
        </Route>
        <Route path="/login" element={<Login setUser={setUser}/>} />
        <Route path="/signup" element={<Signup setUser={setUser} />} />
        <Route path="/dashboard" element={<Dashboard user={user} />} />
        <Route path="/injuries/:id" element={<InjuryDetail user={user} />} />

      </Routes>
    </>
  )
}

export default App