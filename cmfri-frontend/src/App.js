// src/App.js (or where you define routes)
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Signup from "./Signup";
import Dashboard from "./Dashboard";
import UploadPhoto from "./UploadPhoto";
import Search from "./Search";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/upload" element={<UploadPhoto />} />
        <Route path="/search" element={<Search/>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
