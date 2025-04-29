import AdminDashboard from "./pages/AdminDashboard";

function App() {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <header className="p-4 text-3xl font-bold text-center text-pink-500">
        Streamify 🎬
      </header>
      <main className="p-6">
        <AdminDashboard />
      </main>
    </div>
  );
}

export default App;
