import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DataInput from "./pages/DataInput";
import Output from "./pages/Output";
import Trends from "./pages/Trends";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
import NMEOP from "./pages/NMEOP";
import { supabase } from "./supabaseClient";

export default function App(){

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    const initAuth = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setIsSignedIn(!!session);
    setLoading(false);
  };

  initAuth();

  const { data: listener } = supabase.auth.onAuthStateChange(
    (_event, session) => {
      setIsSignedIn(!!session);
    }
  );

  return () => {
    listener.subscription.unsubscribe();
  };
}, []);

  if (loading) return <div className="p-6 text-white">Checking session...</div>;

  return(
     <BrowserRouter>
      {/* components */}
      <Navbar isSignedIn = {isSignedIn} />

      <Routes>
        {/* public Routes*/}
        <Route path="/" element={<Home />} />
        <Route path="/signIn" element={!isSignedIn ? <SignIn /> : <Navigate to="/" replace/>} />
        <Route path="/signUp" element={!isSignedIn ? <SignUp /> : <Navigate to="/" replace/>} />
        <Route path="/dashboard" element={<Dashboard />} /> 

        {/* private Routes*/}
        <Route path="/input" element={isSignedIn ? <DataInput /> : <Navigate to="/signin" replace/>} />
        <Route path="/output" element={isSignedIn ? <Output /> : <Navigate to="/signin" replace/>} />
        <Route path="/trends" element={isSignedIn ? <Trends /> : <Navigate to="/signin" replace/>} />
        <Route path="/NMEOP" element={isSignedIn ? <NMEOP />: <Navigate to="/signin" replace/>} />
        
      </Routes>
    </BrowserRouter>
  )
}