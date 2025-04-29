import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";
import { ThemeProvider } from "./contexts/ThemeContext";
import i18n from "./i18n/config";
import "./styles/App.css";
import skyline from "./assets/images/colorful-landmarks-skyline.jpg";
// import seoul from "./assets/images/3451351.ai";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import FAQ from "./pages/FAQ";
import History from "./pages/History";
import Settings from "./pages/Settings";
import Signup from "./pages/Signup";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

function App() {
  return (
    <ThemeProvider>
      <I18nextProvider i18n={i18n}>
        <Router>
          <div className="app">
            {/* <BasicExample /> */}
            <Header />
            <main
              className="main-content"
              // style={{
              //   backgroundImage: `url(${seoul})`,
              //   backgroundSize: "cover",
              // }}
            >
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/faq" element={<FAQ />} />
                <Route path="/history" element={<History />} />
                <Route path="/settings" element={<Settings />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </I18nextProvider>
    </ThemeProvider>
  );
}

export default App;
