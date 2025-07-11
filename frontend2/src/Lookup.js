// src/Lookup.js
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";
import { API_BASE } from "./api";  // ← use our helper

export default function Lookup() {
  const [vin, setVin] = useState("");
  const [info, setInfo] = useState("");
  const navigate = useNavigate();

  const handleLookup = async () => {
    const res = await fetch(`${API_BASE}/vin-info`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vin }),
    });
    const { summary } = await res.json();
    setInfo(summary);
  };

  const handleRecommend = async () => {
    // fetch your two battery recommendations
    const res = await fetch(`${API_BASE}/vin-recommendation`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ vin }),
    });
    const { batteries } = await res.json();

    // parse the `info` string into a selections object
    // e.g. "Make: Ford\nModel: Fiesta\n..." ➔ { Make: "Ford", Model: "Fiesta", ... }
    const selections = {};
    info.split("\n").forEach((line) => {
      const [key, ...rest] = line.split(":");
      if (!key || rest.length === 0) return;
      selections[key.trim()] = rest.join(":").trim();
    });

    // navigate to /results, passing both batteries and car details
    navigate("/results", {
      state: {
        batteries,
        selections,
      },
    });
  };

  return (
    <div className="lookup-container">
      <h2>VIN Lookup</h2>
      <input
        type="text"
        value={vin}
        onChange={(e) => setVin(e.target.value)}
        placeholder="Enter VIN"
      />
      <button onClick={handleLookup} disabled={!vin}>
        Lookup
      </button>

      {info && (
        <div className="vin-info">
          <h3>Vehicle Info</h3>
          <pre>{info}</pre>
          <button onClick={handleRecommend}>Get Battery Recommendation</button>
        </div>
      )}
    </div>
  );
}
