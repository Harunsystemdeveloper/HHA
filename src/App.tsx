import Header from './components/Header';
import Home from './pages/Home';
import './App.css';

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl p-4">
        <Home />
      </main>
    </div>
  );
}
