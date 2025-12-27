import Layout from "./Layout.jsx";
import Dashboard from "./Dashboard.jsx";
import Upload from "./Upload.jsx";
import Results from "./Results.jsx";
import Reports from "./Reports.jsx";
import Patients from "./Patients.jsx";
import NewAnalysis from "./NewAnalysis.jsx";
import Admin from "./Admin.jsx";
import AIAnalysis from "./AIAnalysis.jsx";
import Analytics from "./Analytics.jsx";

import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";

const PAGES = {
  Dashboard,
  Upload,
  Results,
  Reports,
  Patients,
  NewAnalysis,
  Admin,
  AIAnalysis,
  Analytics,
};

function getCurrentPage(pathname) {
  let url = pathname || "/";
  if (url.endsWith("/")) url = url.slice(0, -1);
  let last = url.split("/").pop() || "Dashboard";
  if (last.includes("?")) last = last.split("?")[0];

  const pageName = Object.keys(PAGES).find(
    (p) => p.toLowerCase() === last.toLowerCase()
  );
  return pageName || "Dashboard";
}

function PagesContent() {
  const location = useLocation();
  const currentPage = getCurrentPage(location.pathname);

  return (
    <Layout currentPageName={currentPage}>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/Dashboard" element={<Dashboard />} />
        <Route path="/Upload" element={<Upload />} />
        <Route path="/Results" element={<Results />} />
        <Route path="/Reports" element={<Reports />} />
        <Route path="/Patients" element={<Patients />} />
        <Route path="/NewAnalysis" element={<NewAnalysis />} />
        <Route path="/Admin" element={<Admin />} />
        <Route path="/AIAnalysis" element={<AIAnalysis />} />
        <Route path="/Analytics" element={<Analytics />} />
      </Routes>
    </Layout>
  );
}

export default function Pages() {
  return (
    <Router>
      <PagesContent />
    </Router>
  );
}
