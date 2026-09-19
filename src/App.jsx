import { useRef, useState } from "react";
import "./App.css";

const demoResults = [
  {
    id: 1,
    location: "Bengaluru, Karnataka",
    date: "2025-01-18",
    similarity: 96.4,
    type: "Urban Area",
    description: "High similarity with dense built-up regions.",
  },
  {
    id: 2,
    location: "Tumakuru, Karnataka",
    date: "2024-11-06",
    similarity: 91.8,
    type: "Mixed Terrain",
    description: "Matching road, vegetation and settlement patterns.",
  },
  {
    id: 3,
    location: "Mysuru, Karnataka",
    date: "2024-08-22",
    similarity: 87.6,
    type: "Urban Expansion",
    description: "Similar spatial features detected in the image.",
  },
];

const changes = [
  {
    icon: "🏙️",
    title: "Urban Expansion",
    description: "New built-up areas detected between observation dates.",
    confidence: 92,
    level: "HIGH",
  },
  {
    icon: "🌳",
    title: "Vegetation Change",
    description: "Reduction in vegetation coverage detected.",
    confidence: 78,
    level: "MEDIUM",
  },
  {
    icon: "💧",
    title: "Water Body Change",
    description: "Surface variation detected around water region.",
    confidence: 64,
    level: "LOW",
  },
];

function App() {
  const [mode, setMode] = useState("text");

  const [search, setSearch] = useState("");
  const [searchImage, setSearchImage] = useState(null);

  const [beforeImage, setBeforeImage] = useState(null);
  const [afterImage, setAfterImage] = useState(null);

  const [dateFrom, setDateFrom] = useState("2024-01-01");
  const [dateTo, setDateTo] = useState("2025-01-01");

  const [isSearching, setIsSearching] = useState(false);
  const [searchDone, setSearchDone] = useState(false);
  const [analysisDone, setAnalysisDone] = useState(false);

  const [status, setStatus] = useState("");

  const [zoom, setZoom] = useState(1);
  const [overlayVisible, setOverlayVisible] = useState(true);

  const workspaceRef = useRef(null);
  const resultsRef = useRef(null);
  const analysisRef = useRef(null);

  /* ---------------- IMAGE VALIDATION ---------------- */

  const validateImage = (file) => {
    if (!file) return false;

    if (!file.type.startsWith("image/")) {
      setStatus("Please select a valid image file.");
      return false;
    }

    if (file.size > 10 * 1024 * 1024) {
      setStatus("Image size must be below 10 MB.");
      return false;
    }

    return true;
  };

  const readImage = (file, callback) => {
    if (!validateImage(file)) return;

    const reader = new FileReader();

    reader.onload = (event) => {
      callback({
        name: file.name,
        url: event.target.result,
        size: file.size,
      });

      setStatus("");
    };

    reader.readAsDataURL(file);
  };

  /* ---------------- NAVIGATION ---------------- */

  const openWorkflow = (selectedMode) => {
    setMode(selectedMode);

    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  const openResults = () => {
    /*
      If results don't exist yet, create demo search results.
      This makes the Results navigation button actually useful.
    */
    if (!searchDone) {
      setSearchDone(true);
      setStatus("Showing sample satellite search results.");
    }

    setTimeout(() => {
      resultsRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  const openAnalysis = () => {
    setMode("change");

    setTimeout(() => {
      workspaceRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 50);
  };

  /* ---------------- SEARCH IMAGE ---------------- */

  const handleSearchImage = (event) => {
    const file = event.target.files?.[0];

    readImage(file, (image) => {
      setSearchImage(image);
      setMode("image");
      setSearchDone(false);
      setAnalysisDone(false);
    });
  };

  /* ---------------- BEFORE IMAGE ---------------- */

  const handleBeforeImage = (event) => {
    const file = event.target.files?.[0];

    readImage(file, (image) => {
      setBeforeImage(image);
      setAnalysisDone(false);
    });
  };

  /* ---------------- AFTER IMAGE ---------------- */

  const handleAfterImage = (event) => {
    const file = event.target.files?.[0];

    readImage(file, (image) => {
      setAfterImage(image);
      setAnalysisDone(false);
    });
  };

  /* ---------------- TEXT SEARCH ---------------- */

  const runSemanticSearch = () => {
    if (!search.trim()) {
      setStatus("Enter a search query first.");
      return;
    }

    setIsSearching(true);
    setSearchDone(false);
    setStatus("Searching satellite imagery locally...");

    setTimeout(() => {
      setIsSearching(false);
      setSearchDone(true);
      setStatus("3 matching satellite observations found.");

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }, 1000);
  };

  /* ---------------- IMAGE SEARCH ---------------- */

  const runImageSearch = () => {
    if (!searchImage) {
      setStatus("Upload a satellite image first.");
      return;
    }

    setIsSearching(true);
    setSearchDone(false);
    setStatus("Comparing visual features locally...");

    setTimeout(() => {
      setIsSearching(false);
      setSearchDone(true);
      setStatus("Visual similarity search completed.");

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }, 1000);
  };

  /* ---------------- CHANGE ANALYSIS ---------------- */

  const runChangeAnalysis = () => {
    if (!beforeImage) {
      setStatus("Please upload the Before satellite image.");
      return;
    }

    if (!afterImage) {
      setStatus("Please upload the After satellite image.");
      return;
    }

    if (dateFrom >= dateTo) {
      setStatus("After date must be later than Before date.");
      return;
    }

    setIsSearching(true);
    setAnalysisDone(false);

    setStatus("Running offline change detection...");

    setTimeout(() => {
      setIsSearching(false);
      setAnalysisDone(true);

      setStatus("Change analysis completed successfully.");

      setTimeout(() => {
        analysisRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
      }, 100);
    }, 1200);
  };

  /* ---------------- MAIN SEARCH BUTTON ---------------- */

  const handleSearch = () => {
    if (mode === "text") {
      runSemanticSearch();
    } else if (mode === "image") {
      runImageSearch();
    } else {
      runChangeAnalysis();
    }
  };

  /* ---------------- EXAMPLE SEARCH ---------------- */

  const useExample = (value) => {
    setMode("text");
    setSearch(value);
    setSearchDone(false);
    setAnalysisDone(false);
    setStatus("");
  };

  /* ---------------- RESET ---------------- */

  const handleReset = () => {
    setMode("text");

    setSearch("");
    setSearchImage(null);

    setBeforeImage(null);
    setAfterImage(null);

    setDateFrom("2024-01-01");
    setDateTo("2025-01-01");

    setIsSearching(false);
    setSearchDone(false);
    setAnalysisDone(false);

    setStatus("");

    setZoom(1);
    setOverlayVisible(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <div className="app">

      {/* ======================================================
          HEADER
      ====================================================== */}

      <header className="topbar">

        <div className="brand-area">

          <div className="brand-logo">
            🛰️
          </div>

          <div>
            <div className="brand-name">
              GeoSense
            </div>

            <div className="brand-subtitle">
              Satellite Intelligence Platform
            </div>
          </div>

        </div>

        <nav className="nav-menu">

          <button
            onClick={() =>
              window.scrollTo({
                top: 0,
                behavior: "smooth",
              })
            }
          >
            Dashboard
          </button>

          <button
            onClick={() => openWorkflow("text")}
          >
            Semantic Search
          </button>

          <button
            onClick={openAnalysis}
          >
            Change Analysis
          </button>

          <button
            onClick={openResults}
          >
            Results
          </button>

        </nav>

        <div className="offline-status">
          <span className="status-dot"></span>
          Offline AI Ready
        </div>

      </header>

      {/* ======================================================
          HERO
      ====================================================== */}

      <section className="hero">

        <div className="hero-badge">
          AI-POWERED EARTH OBSERVATION
        </div>

        <h1>
          Explore Earth.
          <span>
            Understand Change.
          </span>
        </h1>

        <p>
          Search satellite imagery using natural language or visual
          similarity, compare multiple time periods, and identify
          meaningful changes on Earth's surface.
        </p>

        <div className="hero-features">
          <span>✦ Semantic Retrieval</span>
          <span>✦ Multi-Temporal Analysis</span>
          <span>✦ Offline AI</span>
          <span>✦ Visual Similarity</span>
        </div>

      </section>

      {/* ======================================================
          WORKSPACE
      ====================================================== */}

      <section
        className="workspace"
        ref={workspaceRef}
      >

        <div className="workspace-heading">

          <div>

            <div className="section-kicker">
              GEOSENSE WORKSPACE
            </div>

            <h2>
              Search & Analyze Satellite Imagery
            </h2>

            <p>
              Choose a workflow and explore your satellite data.
            </p>

          </div>

          <button
            className="reset-button"
            onClick={handleReset}
          >
            ↻ Reset
          </button>

        </div>

        {/* MODE CARDS */}

        <div className="mode-grid">

          <button
            className={`mode-card ${
              mode === "text" ? "active" : ""
            }`}
            onClick={() => {
              setMode("text");
              setStatus("");
            }}
          >

            <div className="mode-icon">
              abc
            </div>

            <div>
              <strong>
                Text Search
              </strong>

              <span>
                Natural language
              </span>
            </div>

          </button>

          <button
            className={`mode-card ${
              mode === "image" ? "active" : ""
            }`}
            onClick={() => {
              setMode("image");
              setStatus("");
            }}
          >

            <div className="mode-icon">
              🖼️
            </div>

            <div>
              <strong>
                Image Search
              </strong>

              <span>
                Visual similarity
              </span>
            </div>

          </button>

          <button
            className={`mode-card ${
              mode === "change" ? "active" : ""
            }`}
            onClick={() => {
              setMode("change");
              setStatus("");
            }}
          >

            <div className="mode-icon">
              📊
            </div>

            <div>
              <strong>
                Change Analysis
              </strong>

              <span>
                Multi-temporal
              </span>
            </div>

          </button>

        </div>

        {/* ======================================================
            TEXT SEARCH
        ====================================================== */}

        {mode === "text" && (

          <div className="workflow-panel">

            <div className="search-row">

              <div className="search-input-wrap">

                <span className="search-icon">
                  ⌕
                </span>

                <input
                  value={search}
                  onChange={(e) => {
                    setSearch(e.target.value);
                    setSearchDone(false);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      runSemanticSearch();
                    }
                  }}
                  placeholder='Example: "Find areas where buildings increased between 2020 and 2025"'
                />

              </div>

              <button
                className="primary-button"
                onClick={runSemanticSearch}
                disabled={isSearching}
              >
                {isSearching
                  ? "Searching..."
                  : "Search"}
              </button>

            </div>

            <div className="quick-searches">

              <span>
                Try:
              </span>

              <button
                onClick={() =>
                  useExample(
                    "Urban expansion near Bengaluru"
                  )
                }
              >
                Urban expansion
              </button>

              <button
                onClick={() =>
                  useExample(
                    "Deforestation between 2020 and 2025"
                  )
                }
              >
                Deforestation
              </button>

              <button
                onClick={() =>
                  useExample(
                    "Water body changes"
                  )
                }
              >
                Water body changes
              </button>

            </div>

          </div>

        )}

        {/* ======================================================
            IMAGE SEARCH
        ====================================================== */}

        {mode === "image" && (

          <div className="workflow-panel">

            <div className="upload-section">

              <label className="upload-box">

                <input
                  type="file"
                  accept="image/png,image/jpeg,image/jpg,image/webp"
                  onChange={handleSearchImage}
                />

                <div className="upload-icon">
                  ⬆
                </div>

                <strong>
                  Upload Satellite Image
                </strong>

                <span>
                  PNG, JPG or WEBP · Maximum 10 MB
                </span>

                <div className="upload-button">
                  Choose Image
                </div>

              </label>

              {searchImage && (

                <div className="selected-image">

                  <img
                    src={searchImage.url}
                    alt="Uploaded satellite"
                  />

                  <div className="image-info">

                    <strong>
                      {searchImage.name}
                    </strong>

                    <span>
                      Image ready for visual similarity search
                    </span>

                  </div>

                  <button
                    onClick={() =>
                      setSearchImage(null)
                    }
                    className="small-remove"
                  >
                    Remove
                  </button>

                </div>

              )}

            </div>

            <button
              className="primary-button full-button"
              onClick={runImageSearch}
              disabled={isSearching}
            >
              {isSearching
                ? "Analyzing Image..."
                : "Find Similar Images"}
            </button>

          </div>

        )}

        {/* ======================================================
            CHANGE ANALYSIS WORKSPACE
        ====================================================== */}

        {mode === "change" && (

          <div className="workflow-panel">

            <div className="date-grid">

              <div className="date-field">

                <label>
                  BEFORE OBSERVATION
                </label>

                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setAnalysisDone(false);
                  }}
                />

              </div>

              <div className="date-arrow">
                →
              </div>

              <div className="date-field">

                <label>
                  AFTER OBSERVATION
                </label>

                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setAnalysisDone(false);
                  }}
                />

              </div>

            </div>

            <div className="comparison-upload-grid">

              {/* BEFORE */}

              <label className="comparison-upload">

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleBeforeImage}
                />

                <span className="comparison-label before-label">
                  BEFORE
                </span>

                {beforeImage ? (

                  <img
                    src={beforeImage.url}
                    alt="Before observation"
                  />

                ) : (

                  <div className="empty-upload">

                    <span>
                      ＋
                    </span>

                    <strong>
                      Upload Before Image
                    </strong>

                    <small>
                      Satellite observation
                    </small>

                  </div>

                )}

              </label>

              {/* ARROW */}

              <div className="comparison-arrow">

                <span>
                  →
                </span>

                <small>
                  CHANGE
                </small>

              </div>

              {/* AFTER */}

              <label className="comparison-upload">

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleAfterImage}
                />

                <span className="comparison-label after-label">
                  AFTER
                </span>

                {afterImage ? (

                  <img
                    src={afterImage.url}
                    alt="After observation"
                  />

                ) : (

                  <div className="empty-upload">

                    <span>
                      ＋
                    </span>

                    <strong>
                      Upload After Image
                    </strong>

                    <small>
                      Satellite observation
                    </small>

                  </div>

                )}

              </label>

            </div>

            <button
              className="primary-button full-button"
              onClick={runChangeAnalysis}
              disabled={isSearching}
            >
              {isSearching
                ? "Running AI Analysis..."
                : "Analyze Changes"}
            </button>

          </div>

        )}

        {/* STATUS */}

        {status && (

          <div
            className={`status-message ${
              isSearching ? "loading" : "success"
            }`}
          >

            <span>
              {isSearching ? "◌" : "✓"}
            </span>

            {status}

          </div>

        )}

      </section>

      {/* ======================================================
          SEARCH RESULTS
      ====================================================== */}

      {searchDone && (

        <section
          className="results-section"
          ref={resultsRef}
        >

          <div className="section-header">

            <div>

              <div className="section-kicker">
                SEMANTIC RETRIEVAL
              </div>

              <h2>
                Matching Satellite Images
              </h2>

              <p>
                Results ranked using demo visual and semantic similarity.
              </p>

            </div>

            <div className="sample-badge">
              DEMO RESULTS
            </div>

          </div>

          {search && mode === "text" && (

            <div className="query-display">

              <span>
                SEARCH QUERY
              </span>

              <strong>
                "{search}"
              </strong>

            </div>

          )}

          <div className="result-grid">

            {demoResults.map((result) => (

              <article
                className="result-card"
                key={result.id}
              >

                <div
                  className={`satellite-thumbnail thumb-${result.id}`}
                >

                  <div className="thumb-grid"></div>

                  <div className="thumb-road road-one"></div>

                  <div className="thumb-road road-two"></div>

                  <div className="thumb-water"></div>

                  <div className="thumb-city"></div>

                  <div className="thumb-label">
                    SATELLITE
                  </div>

                </div>

                <div className="result-content">

                  <div className="result-top">

                    <div>

                      <h3>
                        {result.location}
                      </h3>

                      <span className="result-type">
                        {result.type}
                      </span>

                    </div>

                    <div className="similarity">

                      <strong>
                        {result.similarity}%
                      </strong>

                      <span>
                        Similarity
                      </span>

                    </div>

                  </div>

                  <p>
                    {result.description}
                  </p>

                  <div className="result-meta">

                    <span>
                      📍 {result.location}
                    </span>

                    <span>
                      ◷ {result.date}
                    </span>

                  </div>

                  <button
                    className="view-result"
                    onClick={() =>
                      setStatus(
                        `Observation selected: ${result.location}`
                      )
                    }
                  >
                    View Observation →
                  </button>

                </div>

              </article>

            ))}

          </div>

        </section>

      )}

      {/* ======================================================
          CHANGE ANALYSIS RESULTS
      ====================================================== */}

      {analysisDone && (

        <section
          className="analysis-section"
          ref={analysisRef}
        >

          <div className="section-header">

            <div>

              <div className="section-kicker">
                ANALYSIS RESULTS
              </div>

              <h2>
                Multi-Temporal Change Analysis
              </h2>

              <p>
                Compare satellite observations across time.
              </p>

            </div>

            <div className="sample-badge">
              SAMPLE RESULT
            </div>

          </div>

          {/* BEFORE / AFTER */}

          <div className="large-comparison">

            <div className="large-image-card">

              <div className="image-card-header">

                <span className="before-tag">
                  BEFORE
                </span>

                <span>
                  {dateFrom}
                </span>

              </div>

              <img
                src={beforeImage.url}
                alt="Before satellite"
              />

            </div>

            <div className="large-change-arrow">

              <div>
                →
              </div>

              <span>
                CHANGE
              </span>

            </div>

            <div className="large-image-card">

              <div className="image-card-header">

                <span className="after-tag">
                  AFTER
                </span>

                <span>
                  {dateTo}
                </span>

              </div>

              <img
                src={afterImage.url}
                alt="After satellite"
              />

            </div>

          </div>

          {/* ==================================================
              MAP
          ================================================== */}

          <div className="map-section">

            <div className="section-header map-heading">

              <div>

                <div className="section-kicker">
                  AI CHANGE MAP
                </div>

                <h2>
                  Detected Change Regions
                </h2>

              </div>

              <div className="map-controls-info">
                Offline visualization
              </div>

            </div>

            <div
              className="map-wrapper"
              style={{
                transform: `scale(${zoom})`,
              }}
            >

              <div className="map-grid-lines"></div>

              <div className="terrain terrain-one"></div>
              <div className="terrain terrain-two"></div>
              <div className="terrain terrain-three"></div>

              <div className="water water-one"></div>

              <div className="map-road map-road-one"></div>
              <div className="map-road map-road-two"></div>
              <div className="map-road map-road-three"></div>
              <div className="map-road map-road-four"></div>

              {overlayVisible && (

                <>
                  <div className="change-zone zone-one">
                    <span>
                      Change Area
                    </span>
                  </div>

                  <div className="change-zone zone-two">
                    <span>
                      New Construction
                    </span>
                  </div>

                  <div className="change-zone zone-three"></div>
                </>

              )}

              <div className="ai-marker">
                <span>
                  AI
                </span>
              </div>

              <div className="map-location location-one">
                Bengaluru
              </div>

              <div className="map-location location-two">
                Tumakuru
              </div>

              {/* LEGEND */}

              <div className="map-legend">

                <strong>
                  LEGEND
                </strong>

                <div>
                  <span className="legend-dot change-dot"></span>
                  Detected Change
                </div>

                <div>
                  <span className="legend-dot stable-dot"></span>
                  Stable Region
                </div>

                <div>
                  <span className="legend-dot water-dot"></span>
                  Water
                </div>

                <div>
                  <span className="legend-dot road-dot"></span>
                  Roads
                </div>

              </div>

              {/* ZOOM */}

              <div className="map-zoom">

                <button
                  onClick={() =>
                    setZoom((value) =>
                      Math.min(1.3, value + 0.1)
                    )
                  }
                >
                  +
                </button>

                <button
                  onClick={() =>
                    setZoom((value) =>
                      Math.max(0.8, value - 0.1)
                    )
                  }
                >
                  −
                </button>

                <button
                  onClick={() => setZoom(1)}
                >
                  ⌂
                </button>

              </div>

              {/* OVERLAY */}

              <button
                className={`overlay-toggle ${
                  overlayVisible ? "enabled" : ""
                }`}
                onClick={() =>
                  setOverlayVisible(
                    (value) => !value
                  )
                }
              >
                {overlayVisible
                  ? "● Overlay ON"
                  : "○ Overlay OFF"}
              </button>

              <div className="map-scale">

                <span></span>
                5 km

              </div>

            </div>

          </div>

          {/* ==================================================
              STATISTICS
          ================================================== */}

          <div className="statistics-grid">

            <div className="stat-card">

              <span>
                DETECTED CHANGE
              </span>

              <strong>
                23.7%
              </strong>

              <small>
                Surface area affected
              </small>

            </div>

            <div className="stat-card">

              <span>
                CHANGED AREA
              </span>

              <strong>
                4.82 km²
              </strong>

              <small>
                Estimated region
              </small>

            </div>

            <div className="stat-card">

              <span>
                MODEL CONFIDENCE
              </span>

              <strong>
                94.2%
              </strong>

              <small>
                Detection confidence
              </small>

            </div>

            <div className="stat-card">

              <span>
                TIME DIFFERENCE
              </span>

              <strong>
                365 Days
              </strong>

              <small>
                Observation interval
              </small>

            </div>

          </div>

          {/* ==================================================
              CLASSIFICATION
          ================================================== */}

          <div className="classification-section">

            <div className="section-kicker">
              CHANGE CLASSIFICATION
            </div>

            <h2>
              Detected Surface Changes
            </h2>

            <div className="change-list">

              {changes.map((change) => (

                <div
                  className="change-card"
                  key={change.title}
                >

                  <div className="change-icon">
                    {change.icon}
                  </div>

                  <div className="change-details">

                    <h3>
                      {change.title}
                    </h3>

                    <p>
                      {change.description}
                    </p>

                  </div>

                  <div className="confidence">

                    <span className="confidence-level">
                      {change.level}
                    </span>

                    <strong>
                      {change.confidence}%
                    </strong>

                  </div>

                </div>

              ))}

            </div>

          </div>

        </section>

      )}

      {/* ======================================================
          SYSTEM
      ====================================================== */}

      <section className="system-panel">

        <div className="system-icon">
          ⚙
        </div>

        <div>

          <h3>
            GeoSense Offline Intelligence
          </h3>

          <p>
            Frontend prototype ready for integration with
            the semantic retrieval and change detection backend.
          </p>

        </div>

        <div className="ready-badge">
          READY
        </div>

      </section>

      {/* ======================================================
          FOOTER
      ====================================================== */}

      <footer>

        <div>

          <strong>
            GeoSense
          </strong>

          <span>
            Semantic Retrieval & Multi-Temporal Change Analysis
          </span>

        </div>

        <span>
          Offline AI · Hackathon Prototype
        </span>

      </footer>

    </div>
  );
}

export default App;