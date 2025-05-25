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
import Terms from "./pages/Terms";
import Privacy from "./pages/Privacy";
import TravelGuides from "./pages/TravelGuides";
import Contact from "./pages/Contact";
import Feedback from "./pages/Feedback";
import Cookies from "./pages/Cookies";

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
                  {/* Main pages */}
                  <Route path="/" element={<Home />} />
                  <Route path="/curation" element={<CurationPage />} />

                  {/* Protected routes */}
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

                  {/* Authentication */}
                  <Route path="/signup" element={<Signup />} />
                  <Route
                    path="/login"
                    element={
                      <GuestOnlyRoute>
                        <Login />
                      </GuestOnlyRoute>
                    }
                  />

                  {/* Travel Resources */}
                  <Route path="/travel-guides" element={<TravelGuides />} />
                  <Route path="/destinations" element={<TravelGuides />} />
                  <Route path="/travel-tips" element={<TravelGuides />} />

                  {/* Help & Support */}
                  <Route path="/faq" element={<FAQ />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/feedback" element={<Feedback />} />

                  {/* Legal pages */}
                  <Route path="/terms" element={<Terms />} />
                  <Route path="/privacy" element={<Privacy />} />
                  <Route path="/cookies" element={<Cookies />} />
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
