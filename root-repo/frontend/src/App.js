import React, { useState } from "react";
import Lightbox from "./Lightbox";
import { searchByImageFile, searchByImageUrl } from "./api";
import "./App.css";

function App() {
  const [file, setFile] = useState(null);
  const [filePreview, setFilePreview] = useState(null);
  const [url, setUrl] = useState("");
  const [results, setResults] = useState([]); // Always array
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [minScore, setMinScore] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImage, setLightboxImage] = useState(null);

  // Compute filtered results safely
  const filteredResults = Array.isArray(results)
    ? results.filter(({ score }) => score >= minScore)
    : [];

  const openLightbox = (imgUrl) => {
    setLightboxImage(imgUrl);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
    setLightboxImage(null);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    setFile(selectedFile);
    setUrl("");
    if (selectedFile) {
      setFilePreview(URL.createObjectURL(selectedFile));
    } else {
      setFilePreview(null);
    }
  };

  const handleSearch = async () => {
    setError("");
    setLoading(true);
    setResults([]);
    try {
      let res;
      if (file) {
        res = await searchByImageFile(file);
      } else if (url) {
        res = await searchByImageUrl(url);
      } else {
        setError("Please upload an image file or enter an image URL.");
        setLoading(false);
        setResults([]);
        return;
      }
      setResults(res || []);
    } catch {
      setError("Search failed. Please try again.");
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Visual Product Matcher</h1>
      <div
        style={{
          width: "70px",
          margin: "0 auto 1.7rem auto",
          borderTop: "4px solid #50aaff",
          borderRadius: "4px",
          opacity: 0.32,
        }}
      />

      {filePreview && (
        <div className="preview-container">
          <p>Uploaded Image Preview:</p>
          <img
            src={filePreview}
            alt="Uploaded preview"
            className="preview-image"
            onClick={() => openLightbox(filePreview)}
            style={{ cursor: "pointer" }}
          />
        </div>
      )}

      {url && !filePreview && (
        <div className="preview-container">
          <p>Image URL Preview:</p>
          <img
            src={url}
            alt="URL preview"
            className="preview-image"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src =
                "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
            }}
            onClick={() => openLightbox(url)}
            style={{ cursor: "pointer" }}
          />
        </div>
      )}

      {/* Modern Search Bar */}
      <div className="search-bar">
        <div className="input-fields">
          <label>
            <span>Upload Image:</span>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </label>
          <div className="or-text">or</div>
          <label>
            <span>Image URL:</span>
            <input
              type="text"
              value={url}
              placeholder="https://example.com/image.jpg"
              onChange={(e) => {
                setUrl(e.target.value);
                setFile(null);
                setFilePreview(null);
              }}
            />
          </label>
        </div>
        <button
          className="search-btn"
          onClick={handleSearch}
          disabled={loading || (!file && !url)}
        >
          {loading ? "Searching..." : "Search"}
        </button>
      </div>

      {error && (
        <div
          className="error"
          style={{
            animation: "shake 0.6s cubic-bezier(0.36, 0.07, 0.19, 0.97) both",
          }}
        >
          {error}
        </div>
      )}

      {Array.isArray(results) && results.length > 0 && (
        <>
          <label>
            Min Similarity ({Math.round(minScore * 100)}%):
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={minScore}
              onChange={(e) => setMinScore(parseFloat(e.target.value))}
            />
          </label>

          <div className="results">
            {filteredResults.map(({ score, product }) => (
              <div key={product.id} className="card">
                <img
                  src={
                    product.images && product.images.length > 0
                      ? product.images[0]
                      : "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg"
                  }
                  alt={product.title}
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src =
                      "https://upload.wikimedia.org/wikipedia/commons/a/ac/No_image_available.svg";
                  }}
                  onClick={() =>
                    product.images &&
                    product.images.length > 0 &&
                    openLightbox(product.images[0])
                  }
                  style={{ cursor: "pointer", maxHeight: 140 }}
                />
                <h2>{product.title}</h2>
                <p>{product.category}</p>
                <p>Similarity: {(score * 100).toFixed(1)}%</p>
              </div>
            ))}
          </div>
        </>
      )}

      <Lightbox
        src={lightboxImage}
        alt="Preview"
        isOpen={lightboxOpen}
        onClose={closeLightbox}
      />
    </div>
  );
}

export default App;
