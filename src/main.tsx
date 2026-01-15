import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import App from "./App.tsx";
import Home from "./pages/Home.tsx";
import CreatePost from "./pages/CreatePost.tsx";
import MyPosts from "./pages/MyPosts.tsx";
import EditPost from "./pages/EditPost.tsx";
import NotFound from "./pages/NotFound.tsx";
import Login from "./components/Login.tsx";
import Register from "./components/Register.tsx";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="create" element={<CreatePost />} />
          <Route path="my-posts" element={<MyPosts />} />
          <Route path="edit/:id" element={<EditPost />} />
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
);
