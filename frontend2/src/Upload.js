// src/Upload.js
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./App.css";

export default function Upload() {
  const [vin, setVin]       = useState("");
  const [info, setInfo]     = useState("");
  const [error, setError]   = useState("");
  const [loading, setLoading] = useState(false);

  const videoRef  = useRef(null);
  const canvasRef = useRef(null);
  const navigate  = useNavigate();

  // Start rear‐camera on mount
  useEffect(() => {
    async function initCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "environment" }
        });
        videoRef.current.srcObject = stream;
      } catch {
        setError("Unable to access camera");
      }
    }
    initCamera();
    return () => {
      // stop camera on unmount
      if (videoRef.current?.srcObject) {
        videoRef.current.srcObject.getTracks().forEach(t => t.stop());
      }
    };
  }, []);

  // Capture frame & POST it for OCR
  const handleCapture = () => {
    setError("");
    setLoading(true);
    const video  = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width  = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0);
    canvas.toBlob(async (blob) => {
      if (!blob) {
        setError("Capture failed");
        setLoading(false);
        return;
      }
      try {
        const form = new FormData();
        form.append("file", blob, "frame.png");
        const res = await fetch("http://127.0.0.1:8000/vin-from-image", {
          method: "POST",
          body: form
        });
        const payload = await res.json();
        if (!res.ok) throw new Error(payload.detail || "OCR failed");
        setVin(payload.vin);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    }, "image/png");
  };

  const handleLookup = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/vin-info", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.detail || "Lookup failed");
      setInfo(payload.summary);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecommend = async () => {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://127.0.0.1:8000/vin-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vin })
      });
      const payload = await res.json();
      if (!res.ok) throw new Error(payload.detail || "Recommendation failed");
      navigate("/results", {
        state: {
          batteries: payload.batteries,
          selections: { VIN: vin }
        }
      });
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h2>Scan VIN with Camera</h2>
      {error   && <p className="error">{error}</p>}
      {loading && <p>Processing...</p>}
      <video ref={videoRef} autoPlay muted playsInline className="camera-view"/>
      <canvas ref={canvasRef} style={{ display: "none" }}/>
      <button onClick={handleCapture} disabled={loading}>
        Capture VIN
      </button>

      {vin && !loading && (
        <div className="vin-extracted">
          <p><strong>VIN:</strong> {vin}</p>
          <button onClick={handleLookup}>Lookup Vehicle Details</button>
        </div>
      )}

      {info && !loading && (
        <div className="vin-info">
          <h3>Vehicle Info</h3>
          <pre>{info}</pre>
          <button onClick={handleRecommend}>Get Battery Recommendation</button>
        </div>
      )}
    </div>
  );
}
