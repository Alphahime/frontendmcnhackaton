import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { galerieService } from '../../api';
import { 
  FaArrowLeft, 
  FaExpand, 
  FaCompress, 
  FaVolumeUp, 
  FaVolumeMute,
  FaInfo,
  FaShare,
  FaCube
} from 'react-icons/fa';
import './DetailsGalerie.css';

const DetailsGalerie = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [oeuvre, setOeuvre] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [is3DMode, setIs3DMode] = useState(false);

  const imageRef = useRef(null);
  const containerRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    loadOeuvre();
  }, [id]);

  const loadOeuvre = async () => {
    try {
      setLoading(true);
      const response = await galerieService.getById(id);
      setOeuvre(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Gestion de la souris pour l'effet 3D
  const handleMouseMove = (e) => {
    if (!is3DMode || !containerRef.current) return;

    const container = containerRef.current;
    const rect = container.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    const rotateY = ((x - centerX) / centerX) * 10;
    const rotateX = ((centerY - y) / centerY) * 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    if (is3DMode) {
      setRotation({ x: 0, y: 0 });
    }
  };

  const handleWheel = (e) => {
    if (!is3DMode) return;
    e.preventDefault();
    
    const zoomSpeed = 0.1;
    const newZoom = e.deltaY > 0 
      ? Math.max(0.5, zoom - zoomSpeed)
      : Math.min(3, zoom + zoomSpeed);
    
    setZoom(newZoom);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const toggleAudio = () => {
    if (isAudioPlaying) {
      audioRef.current?.pause();
    } else {
      // Simulation d'audio descriptif
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(
          `${oeuvre.titre}. Par ${oeuvre.artiste}. ${oeuvre.description}`
        );
        utterance.lang = 'fr-FR';
        utterance.rate = 0.8;
        speechSynthesis.speak(utterance);
      }
    }
    setIsAudioPlaying(!isAudioPlaying);
  };

  const toggle3DMode = () => {
    setIs3DMode(!is3DMode);
    if (!is3DMode) {
      setRotation({ x: 0, y: 0 });
      setZoom(1);
    }
  };

  const shareOeuvre = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: oeuvre.titre,
          text: oeuvre.description,
          url: window.location.href,
        });
      } catch (err) {
        console.log('Erreur de partage:', err);
      }
    } else {
      // Fallback pour copier le lien
      navigator.clipboard.writeText(window.location.href);
      alert('Lien copié dans le presse-papier !');
    }
  };

  const resetView = () => {
    setRotation({ x: 0, y: 0 });
    setZoom(1);
  };

  if (loading) {
    return (
      <div className="details-loading">
        <div className="loading-spinner-3d"></div>
        <p>Chargement de l'œuvre...</p>
      </div>
    );
  }

  if (error || !oeuvre) {
    return (
      <div className="details-error">
        <h2>Œuvre non trouvée</h2>
        <p>{error || "Cette œuvre n'existe pas."}</p>
        <button onClick={() => navigate('/galerie')} className="back-btn">
          Retour à la galerie
        </button>
      </div>
    );
  }

  return (
    <div className="details-container">
      {/* Navigation */}
      <nav className="details-nav">
        <button onClick={() => navigate('/galerie')} className="nav-btn back-btn">
          <FaArrowLeft />
          Retour
        </button>
        
        <div className="nav-actions">
          <button onClick={toggle3DMode} className={`nav-btn ${is3DMode ? 'active' : ''}`}>
            <FaCube />
            {is3DMode ? '2D' : '3D'}
          </button>
          <button onClick={toggleAudio} className="nav-btn">
            {isAudioPlaying ? <FaVolumeMute /> : <FaVolumeUp />}
            Audio
          </button>
          <button onClick={() => setShowInfo(!showInfo)} className="nav-btn">
            <FaInfo />
            Info
          </button>
          <button onClick={shareOeuvre} className="nav-btn">
            <FaShare />
            Partager
          </button>
          <button onClick={toggleFullscreen} className="nav-btn">
            {isFullscreen ? <FaCompress /> : <FaExpand />}
            Plein écran
          </button>
        </div>
      </nav>

      {/* Contenu principal */}
      <div 
        ref={containerRef}
        className={`image-container ${is3DMode ? 'mode-3d' : ''} ${isFullscreen ? 'fullscreen' : ''}`}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onWheel={handleWheel}
      >
        <div 
          className="image-wrapper"
          style={{
            transform: is3DMode 
              ? `perspective(1000px) rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`
              : 'none',
            transition: is3DMode ? 'transform 0.1s ease' : 'none'
          }}
        >
          <img
            ref={imageRef}
            src={oeuvre.image_url}
            alt={oeuvre.titre}
            className="oeuvre-image-detail"
            style={{
              cursor: is3DMode ? 'grab' : 'default'
            }}
            onMouseDown={() => {
              if (is3DMode) {
                imageRef.current.style.cursor = 'grabbing';
              }
            }}
            onMouseUp={() => {
              if (is3DMode) {
                imageRef.current.style.cursor = 'grab';
              }
            }}
          />
          
          {/* Overlay d'information */}
          {showInfo && (
            <div className="info-overlay">
              <div className="info-content">
                <h2>{oeuvre.titre}</h2>
                <p className="artist">{oeuvre.artiste}</p>
                <p className="year">{oeuvre.annee_creation}</p>
                <p className="dimensions">{oeuvre.dimensions}</p>
                <p className="description">{oeuvre.description}</p>
              </div>
            </div>
          )}

          {/* Contrôles 3D */}
          {is3DMode && (
            <div className="controls-3d">
              <button onClick={resetView} className="control-btn">
                Réinitialiser
              </button>
              <div className="zoom-controls">
                <span>Zoom: {Math.round(zoom * 100)}%</span>
              </div>
            </div>
          )}
        </div>

        {/* Effet de lumière ambiante */}
        {is3DMode && (
          <div 
            className="ambient-light"
            style={{
              transform: `rotateX(${-rotation.x * 0.5}deg) rotateY(${-rotation.y * 0.5}deg)`
            }}
          />
        )}
      </div>

      {/* Panneau d'information latéral */}
      <div className={`info-panel ${showInfo ? 'open' : ''}`}>
        <div className="info-panel-content">
          <h1>{oeuvre.titre}</h1>
          <div className="info-section">
            <h3>Artiste</h3>
            <p>{oeuvre.artiste}</p>
          </div>
          <div className="info-section">
            <h3>Année de création</h3>
            <p>{oeuvre.annee_creation}</p>
          </div>
          <div className="info-section">
            <h3>Dimensions</h3>
            <p>{oeuvre.dimensions}</p>
          </div>
          <div className="info-section">
            <h3>Description</h3>
            <p className="description-full">{oeuvre.description}</p>
          </div>
        </div>
      </div>

      {/* Audio element pour la description */}
      <audio ref={audioRef} style={{ display: 'none' }} />
    </div>
  );
};

export default DetailsGalerie;