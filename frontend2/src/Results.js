// src/Results.js
import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./App.css";

const PLACEHOLDER = "/placeholder.png";

export default function Results() {
  const { state } = useLocation();
  const batteries  = state?.batteries  || [];
  const selections = state?.selections || {};
  const navigate    = useNavigate();

  if (batteries.length !== 2) {
    return (
      <div className="results-container">
        <p>No recommendations available.</p>
        <button onClick={() => navigate("/")}>Start Over</button>
      </div>
    );
  }

  return (
    <div className="results-container">
      <h2>Your Recommendations</h2>

      <div className="car-details">
        <h3>Car Details</h3>
        <ul>
          {Object.entries(selections).map(([key, val]) => (
            <li key={key}>
              <strong>{key.replace(/_/g, " ")}:</strong> {val}
            </li>
          ))}
        </ul>
      </div>

      <div className="cards">
        {batteries.map((batt, idx) => (
          <div key={idx} className="card">
            <img
              src={batt.image_url || PLACEHOLDER}
              alt={batt.name}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = PLACEHOLDER;
              }}
            />
            <p>{batt.name}</p>
          </div>
        ))}
      </div>

      <button onClick={() => navigate("/")}>Search Again</button>
    </div>
  );
}
