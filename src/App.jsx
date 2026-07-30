import Navbar from "./components/Navbar.jsx"
import Hero from "./components/Hero.jsx"
import FeatureSection from "./components/FeatureSection.jsx"
import Footer from "./components/Footer.jsx"
import Login from "./pages/Login.jsx"
import Signup from "./pages/Signup.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import InjuryDetail from "./pages/InjuryDetail.jsx"
import { Routes, Route } from 'react-router-dom'
import { useState, useEffect } from "react"
import { supabase } from "./supabaseClient.js"
import ProtectedRoute from "./components/ProtectedRoute.jsx"
import ROM from "./pages/ROM";

function App() {

  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true); // 1. Added loading state

  useEffect(() => {
    // Check active session on initial load
  async function checkSession() {
    const { data } = await supabase.auth.getSession()
    setUser(data.session?.user ?? null) 
    setLoading(false)// Session check complete
  }

  checkSession()

  //2: Set up the ongoing event listener
  const {data : {subscription}} = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false)
    }
  );

  //3: Clean up the listener when the component unmounts

  return () => {
    subscription.unsubscribe();
  };
  }, []);


  //4. Block rendering until we KNOW if the user is loading or not

  if(loading){
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 font-medium">Loading session...</p>
      </div>
    )
  }

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
        <Route path="/dashboard" element={
          <ProtectedRoute user={user}> <Dashboard user={user} /> </ProtectedRoute>
          } />
        <Route path="/injuries/:id" element={
          <>
          <ProtectedRoute user={user}> <InjuryDetail user={user} /> </ProtectedRoute>
          </>
          } />
        <Route path="/rom/:id" element={<ROM user={user} />} />
      </Routes>
    </>
  )
}

export default App