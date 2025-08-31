import React from "react";

const Lightbox = ({ src, alt, isOpen, onClose }) => {
  if (!isOpen) return null;

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleBackgroundClick}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        zIndex: 1000,
        width: "100vw",
        height: "100vh",
        backgroundColor: "rgba(0,0,0,0.8)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        cursor: "pointer",
      }}
      aria-modal="true"
      role="dialog"
    >
      <img
        src={src}
        alt={alt}
        style={{
          maxWidth: "90vw",
          maxHeight: "90vh",
          objectFit: "contain",
          borderRadius: "8px",
          boxShadow: "0 0 20px rgba(255,255,255,0.5)",
          cursor: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
      />
    </div>
  );
};

export default Lightbox;
