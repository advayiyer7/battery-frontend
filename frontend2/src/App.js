import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Finder from "./Finder";
import Lookup from "./Lookup";
import Results from "./Results";
import Upload from "./Upload";
import "./App.css";

//Easy frontend which just has the links to each of the page js so that we can switch and use all options
//Simple react router to build the linking and configurations
export default function App() {
  return (
    <Router>
      <nav className="top-nav">
        <Link to="/">Manual Input</Link>
        <Link to="/lookup">VIN Lookup</Link>
        <Link to="/upload">Upload VIN Image</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Finder />} />
        <Route path="/lookup" element={<Lookup />} />
        <Route path="/upload" element={<Upload />} />
        <Route path="/results" element={<Results />} />
      </Routes>
    </Router>
  );
}
