import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Grade from "@/pages/Grade";
import Lesson from "@/pages/Lesson";
import Achievements from "@/pages/Achievements";
import Admin from "@/pages/Admin";
import { applyTheme, getTheme } from "@/lib/theme";

function App() {
  useEffect(() => {
    applyTheme(getTheme());
  }, []);

  return (
    <BrowserRouter basename={process.env.PUBLIC_URL || "/"}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/grade/:gradeId" element={<Grade />} />
        <Route path="/lesson/:lessonId" element={<Lesson />} />
        <Route path="/achievements" element={<Achievements />} />
        <Route path="/admin" element={<Admin />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
