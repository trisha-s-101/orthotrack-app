import Header from "./components/Header.jsx"
import Hero from "./components/Hero.jsx"
import FeatureSection from "./components/FeatureSection.jsx"
import Footer from "./components/Footer.jsx"
import Login from "./pages/Login.jsx"
import { Routes, Route } from 'react-router-dom'

function App() {
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
    <Route path="/login" element={<Login />} />
  </Routes>
  )
}

export default App