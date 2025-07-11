// src/Finder.js
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { API_BASE } from "./api";  // ← our new helper

const STEPS = [
  { key: "vehicle_type", label: "Vehicle Category" },
  { key: "year",         label: "Model Year"      },
  { key: "make",         label: "Car Brand"       },
  { key: "model",        label: "Model Name"      },
  { key: "engine",       label: "Engine Option"   },
];

export default function Finder() {
  const [selections, setSelections] = useState({});
  const [options, setOptions] = useState({
    vehicle_type: [], year: [], make: [], model: [], engine: []
  });
  const navigate = useNavigate();

  const fetchOptions = async (stepKey) => {
    const res = await fetch(`${API_BASE}/options/${stepKey}`, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(selections),
    });
    const data = await res.json();
    setOptions(o => ({ ...o, [stepKey]: data }));
  };

  useEffect(() => {
    fetchOptions(STEPS[0].key);
  }, []);

  useEffect(() => {
    const filled = STEPS.filter(s => selections[s.key]).length;
    const next  = STEPS[filled];
    if (next && options[next.key].length === 0) {
      fetchOptions(next.key);
    }
  }, [selections]);

  const handleSelect = (stepKey, value) => {
    const idx = STEPS.findIndex(s => s.key === stepKey);
    const newSel = { ...selections, [stepKey]: value };
    const newOpts = { ...options };
    STEPS.slice(idx + 1).forEach(s => {
      delete newSel[s.key];
      newOpts[s.key] = [];
    });
    setSelections(newSel);
    setOptions(newOpts);
  };

  return (
    <div className="finder-container">
      <h1>General Battery Finder</h1>

      {STEPS.map(({ key, label }) => (
        <div key={key} className="form-row">
          <label>{label}</label>
          <select
            value={selections[key] || ""}
            disabled={options[key].length === 0}
            onChange={e => handleSelect(key, e.target.value)}
          >
            <option value="">
              {options[key].length
                ? `Select ${label}…`
                : `Loading ${label}…`}
            </option>
            {options[key].map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      ))}

      {Object.keys(selections).length === STEPS.length && (
        <button
          onClick={async () => {
            const res = await fetch(`${API_BASE}/recommendation`, {
              method:  "POST",
              headers: { "Content-Type": "application/json" },
              body:    JSON.stringify(selections),
            });
            const { batteries } = await res.json();

            // Pass both batteries and the car selections to Results
            navigate("/results", {
              state: {
                batteries,
                selections
              }
            });
          }}
        >
          Get Recommendation
        </button>
      )}
    </div>
  );
}
