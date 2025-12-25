import React, { useEffect, useState } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DataInput from "./pages/dataInput";
import Output from "./pages/Output";
import Trends from "./pages/Trends";
import SignIn from "./pages/SignIn";
import SignUp from "./pages/SignUp";
import Dashboard from "./pages/Dashboard";
// import Dashboard from "./pages/Dashboard";

export default function App(){

  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(true);

   useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:3000/api/auth/me", {
          credentials: "include", // sends cookie automatically
        });
        setIsSignedIn(res.ok); // if 200 -> true, if 401 -> false
      } catch {
        setIsSignedIn(false);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <div className="p-6 text-white">Checking session...</div>;

  return(
     <BrowserRouter>
      {/* components */}
      <Navbar isSignedIn = {isSignedIn} setIsSignedIn={setIsSignedIn} />

      <Routes>
        {/* public Routes*/}
        <Route path="/" element={<Home />} />
        <Route path="/signIn" element={<SignIn setIsSignedIn = {setIsSignedIn}/>} />
        <Route path="/signUp" element={<SignUp />} />

        {/* public Routes*/}
        <Route path="/input" element={isSignedIn ? <DataInput /> : <Navigate to="/signin" replace/>} />
        <Route path="/output" element={isSignedIn ? <Output /> : <Navigate to="/signin" replace/>} />
        <Route path="/trends" element={isSignedIn ? <Trends /> : <Navigate to="/signin" replace/>} />
        <Route path="/dashboard" element={<Dashboard />} /> 
      </Routes>
    </BrowserRouter>
  )
}