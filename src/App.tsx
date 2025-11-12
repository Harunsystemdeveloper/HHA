import Header from "./components/Header";
import Footer from "./components/Footer";
import { Outlet } from "react-router-dom";
import "./App.css";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Ingen extra top-nav här – Headern äger menyn */}
      <main className="mx-auto max-w-6xl p-4">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
