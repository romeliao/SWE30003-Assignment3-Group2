import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/navBar";
import CataloguePage from "./pages/cataloguePage";
import LoginPage from "./pages/loginPage";
import Signup from "./pages/signupPage";


function App() {
  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<CataloguePage />} />
          <Route path="/catalogue" element={<CataloguePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<Signup />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
