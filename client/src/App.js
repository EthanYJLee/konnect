import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { I18nextProvider } from "react-i18next";

import i18n from "./i18n/config";
import "./styles/App.scss";
import skyline from "./assets/images/colorful-landmarks-skyline.jpg";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import FAQ from "./pages/FAQ";
import History from "./pages/History";
// import Settings from "./pages/Settings";
import Signup from "./pages/Signup";
import Chat from "./pages/Chat";
import CurationPage from "./pages/Curation";

// Routes
import ProtectedRoute from "./routes/ProtectedRoute";
import GuestOnlyRoute from "./routes/GuestOnlyRoute";

// Components
import Header from "./components/Header";
import Footer from "./components/Footer";

// Contexts
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <I18nextProvider i18n={i18n}>
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
                  <Route path="/curation" element={<CurationPage />} />

                  <Route
                    path="/chat"
                    element={
                      <ProtectedRoute>
                        <Chat />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/history"
                    element={
                      <ProtectedRoute>
                        <History />
                      </ProtectedRoute>
                    }
                  />
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/signup" element={<Signup />} />
                  <Route
                    path="/login"
                    element={
                      <GuestOnlyRoute>
                        <Login />
                      </GuestOnlyRoute>
                    }
                  />
                </Routes>
              </main>
              <Footer />
            </div>
          </I18nextProvider>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
