import React, { useState, useEffect } from "react";
import "./App.css";
import background from "./assets/dashboard.jpg";

function Search() {
  const [query, setQuery] = useState("");
  const [species, setSpecies] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedSpecies, setSelectedSpecies] = useState(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!query || selectedSpecies?.name === query) {
      setSpecies([]);
      setShowDropdown(false);
      setNotFound(false);
      return;
    }

    const fetchData = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/species?q=${query}`);
        const data = await res.json();

        if (!data.found || data.species.length === 0) {
          setSpecies([]);
          setSelectedSpecies(null);
          setShowDropdown(false);
          setNotFound(true);
        } else {
          setSpecies(data.species);
          setShowDropdown(true);
          setNotFound(false);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };

    fetchData();
  }, [query, selectedSpecies]);

  const handleSelect = (sp) => {
    setSelectedSpecies(sp);
    setQuery(sp.name);
    setSpecies([]);
    setShowDropdown(false);
    setNotFound(false);
  };

  const handleClear = () => {
    setQuery("");
    setSelectedSpecies(null);
    setSpecies([]);
    setShowDropdown(false);
    setNotFound(false);
  };

  return (
    <div
      style={{
        height: "100vh",
        overflow: "hidden",
        fontFamily: "Arial, sans-serif",
        backgroundImage: `url(${background})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        color: "#fff",
        padding: "20px",
        boxSizing: "border-box",
      }}
    >
      {/* Overlay
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
        }}
      /> */}

      <div style={{ position: "relative", zIndex: 1 }}>
        <h1 style={{ textAlign: "center", fontSize: "2.5rem", marginBottom: "40px" }}>
         
        </h1>

        {/* Search bar */}
        <div style={{ position: "relative", width: "400px", margin: "0 auto" }}>
          <input
            type="text"
            placeholder="🔍 Search species..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 40px 12px 12px",
              borderRadius: "8px",
              border: "2px solid #fff",
              outline: "none",
              backgroundColor: "#fff",
              color: "#000000ff",
              fontSize: "1rem",
            }}
          />

          {/* Clear button */}
          {query && (
            <span
              onClick={handleClear}
              style={{
                position: "absolute",
                top: "50%",
                right: "12px",
                transform: "translateY(-50%)",
                cursor: "pointer",
                color: "#fff",
                fontSize: "1.2rem",
              }}
            >
              &times;
            </span>
          )}

          {/* Dropdown */}
          {showDropdown && species.length > 0 && (
            <ul
              style={{
                position: "absolute",
                top: "50px",
                left: 0,
                right: 0,
                background: "#ffffffff",
                borderRadius: "8px",
                listStyle: "none",
                margin: 0,
                padding: 0,
                maxHeight: "200px",
                overflowY: "auto",
                zIndex: 1000,
                color: "#000000ff",
              }}
            >
              {species.map((sp, idx) => (
                <li
                  key={idx}
                  onClick={() => handleSelect(sp)}
                  style={{
                    padding: "10px",
                    cursor: "pointer",
                    borderBottom: "1px solid #333",
                  }}
                  onMouseEnter={(e) =>
                    (e.target.style.backgroundColor = "#333")
                  }
                  onMouseLeave={(e) =>
                    (e.target.style.backgroundColor = "transparent")
                  }
                >
                  {sp.name}
                </li>
              ))}
            </ul>
          )}

          {/* Species Not Found */}
          {notFound && (
            <div
              style={{
                position: "absolute",
                top: "50px",
                left: 0,
                right: 0,
                backgroundColor: "#000",
                color: "#fff",
                padding: "12px",
                borderRadius: "8px",
                textAlign: "center",
                zIndex: 1000,
              }}
            >
              Species Not Found
            </div>
          )}
        </div>

        {/* Selected species display */}
        {selectedSpecies && (
          <div
            style={{
              marginTop: "30px",
              background: "rgba(255,255,255,0.95)",
              padding: "25px",
              borderRadius: "12px",
              maxWidth: "800px", // ✅ wider card
              margin: "30px auto",
              color: "#000",
              boxShadow: "0px 6px 12px rgba(0,0,0,0.3)",
              overflowY: "auto",
              maxHeight: "70vh",
            }}
          >
            <div style={{ marginBottom: "20px" }}>
              <strong style={{ fontSize: "1.5rem" }}>Name: </strong>
              <span style={{ fontSize: "1.2rem" }}>{selectedSpecies.name}</span>
            </div>

            <div style={{ marginBottom: "20px", textAlign: "center" }}>
              <img
                src={selectedSpecies.image}
                alt={selectedSpecies.name}
                style={{
                  maxWidth: "85%", // ✅ reduced image width
                  maxHeight: "250px", // ✅ reduced image height
                  height: "auto",
                  width: "auto",
                  borderRadius: "10px",
                  marginTop: "10px",
                  display: "block",
                  marginLeft: "auto",
                  marginRight: "auto",
                }}
              />
            </div>

            <div style={{ textAlign: "justify" }}>
              <strong>Description:</strong>
              <p style={{ marginTop: "10px", lineHeight: "1.6" }}>
                {selectedSpecies.description}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Search;
