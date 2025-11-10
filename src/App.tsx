import FileUpload from './components/FileUpload';
import Header from './components/Header';
import './App.css';

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-6xl p-4">
        {/* Temporary content until board pages are added */}
        <FileUpload />
      </main>
    </div>
  );
}
