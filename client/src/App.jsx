import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import HomePage from "./pages/HomePage";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLogin from "./pages/AdminLogin";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-black text-white">
          <nav className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black to-transparent p-4">
            <div className="max-w-7xl mx-auto flex justify-between items-center">
              <Link to="/" className="text-3xl font-bold text-pink-500">
                Streamify 🎬
              </Link>
              <div className="flex gap-4">
                <Link to="/" className="hover:text-pink-500 transition">
                  Home
                </Link>
                <Link to="/admin/login" className="hover:text-pink-500 transition">
                  Admin
                </Link>
              </div>
            </div>
          </nav>

          <main className="pt-16">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
