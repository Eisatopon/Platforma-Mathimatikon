import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "@/pages/Home";
import Grade from "@/pages/Grade";
import Lesson from "@/pages/Lesson";
import Achievements from "@/pages/Achievements";
import { applyTheme, getTheme } from "@/lib/theme";

function App() {
  useEffect(() => {
    applyTheme(getTheme());
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/grade/:gradeId" element={<Grade />} />
        <Route path="/lesson/:lessonId" element={<Lesson />} />
        <Route path="/achievements" element={<Achievements />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
