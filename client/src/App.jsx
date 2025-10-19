import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import DataInput from "./pages/dataInput";
import Output from "./pages/Output";
import Trends from "./pages/Trends";
// import Dashboard from "./pages/Dashboard";
export default function App(){
  return(
     <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/input" element={<DataInput />} />
        <Route path="/output" element={<Output />} />
        <Route path="/trends" element={<Trends />} />
        {/* <Route path="/dashboard" element={<Dashboard />} /> */}
      </Routes>
    </BrowserRouter>
  )
}