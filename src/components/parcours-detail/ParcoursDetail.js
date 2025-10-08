// src/components/parcours-detail/ParcoursDetail.js
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { parcoursService, parcoursUtils } from '../../api';
import './ParcoursDetail.css';

function ParcoursDetail() {
  const { id } = useParams();
  const [parcours, setParcours] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentOeuvreIndex, setCurrentOeuvreIndex] = useState(0);

  useEffect(() => {
    loadParcoursDetail();
  }, [id]);

  const loadParcoursDetail = async () => {
    try {
      setLoading(true);
      const data = await parcoursService.getById(id);
      setParcours(data.data || data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement du parcours');
    } finally {
      setLoading(false);
    }
  };

  const startVisite = () => {
    if (parcours.oeuvres && parcours.oeuvres.length > 0) {
      // Rediriger vers la première œuvre du parcours
      window.location.href = `/oeuvre/${parcours.oeuvres[0].id}?parcours=${parcours.id}`;
    }
  };

  const nextOeuvre = () => {
    if (parcours.oeuvres && currentOeuvreIndex < parcours.oeuvres.length - 1) {
      setCurrentOeuvreIndex(currentOeuvreIndex + 1);
    }
  };

  const prevOeuvre = () => {
    if (currentOeuvreIndex > 0) {
      setCurrentOeuvreIndex(currentOeuvreIndex - 1);
    }
  };

  if (loading) return (
    <div className="loading-container">
      <div className="art-loader">
        <div className="brush-stroke"></div>
        <div className="brush-stroke"></div>
        <div className="brush-stroke"></div>
        <p>Chargement du parcours...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-art">
        <div className="broken-frame"></div>
        <p>Erreur: {error}</p>
        <button onClick={loadParcoursDetail} className="retry-btn">Réessayer</button>
      </div>
    </div>
  );

  if (!parcours) return <div className="error">Parcours non trouvé</div>;

  return (
    <div className="parcours-detail-master">
      {/* Hero Section */}
      <div className="parcours-hero-section">
        <div className="hero-background">
          <img 
            src={parcours.image_full_url || parcours.image_url || '/placeholder-parcours.jpg'} 
            alt={parcours.title}
            className="hero-image"
          />
          <div className="hero-overlay"></div>
        </div>
        
        <div className="hero-content">
          <div className="parcours-badge">
            <span 
              className="difficulty-dot"
              style={{ backgroundColor: parcoursUtils.getDifficultyColor(parcours.difficulty) }}
            ></span>
            {parcoursUtils.getDifficultyIcon(parcours.difficulty)} {parcours.difficulty}
          </div>
          
          <h1 className="parcours-title">{parcours.title}</h1>
          <p className="parcours-description">{parcours.description}</p>
          
          <div className="parcours-stats-grid">
            <div className="stat-card">
              <div className="stat-icon">🎨</div>
              <div className="stat-info">
                <div className="stat-number">{parcours.oeuvres ? parcours.oeuvres.length : 0}</div>
                <div className="stat-label">Œuvres</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">⏱️</div>
              <div className="stat-info">
                <div className="stat-number">
                  {parcoursUtils.formatDuration(parcours.estimated_duration) || '1h30'}
                </div>
                <div className="stat-label">Durée</div>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">{parcoursUtils.getAudienceIcon(parcours.target_audience)}</div>
              <div className="stat-info">
                <div className="stat-number">
                  {parcours.target_audience === 'enfants' ? 'Enfants' :
                   parcours.target_audience === 'scolaires' ? 'Scolaires' :
                   parcours.target_audience === 'adultes' ? 'Adultes' : 'Experts'}
                </div>
                <div className="stat-label">Public</div>
              </div>
            </div>
          </div>

          <button className="start-visit-btn" onClick={startVisite}>
            <span className="btn-icon">🚀</span>
            Commencer la visite guidée
          </button>
        </div>
      </div>

      {/* Themes Section */}
      {parcours.themes && parcours.themes.length > 0 && (
        <div className="themes-section">
          <h2>Thèmes abordés</h2>
          <div className="themes-grid">
            {parcours.themes.map((theme, index) => (
              <div key={index} className="theme-card">
                <div className="theme-icon">🔍</div>
                <span className="theme-name">{theme}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Oeuvres List */}
      <div className="oeuvres-section">
        <div className="section-header">
          <h2>Parcours des œuvres</h2>
          <div className="progress-indicator">
            <span className="progress-text">
              {currentOeuvreIndex + 1} / {parcours.oeuvres ? parcours.oeuvres.length : 0}
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ 
                  width: `${((currentOeuvreIndex + 1) / (parcours.oeuvres ? parcours.oeuvres.length : 1)) * 100}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {parcours.oeuvres && parcours.oeuvres.length > 0 ? (
          <div className="oeuvres-carousel">
            <button 
              className="carousel-btn prev" 
              onClick={prevOeuvre}
              disabled={currentOeuvreIndex === 0}
            >
              ‹
            </button>

            <div className="carousel-content">
              <div className="oeuvre-featured">
                <div className="oeuvre-number-badge">
                  {currentOeuvreIndex + 1}
                </div>
                <img 
                  src={parcours.oeuvres[currentOeuvreIndex].image_full_url || 
                       parcours.oeuvres[currentOeuvreIndex].image_url || 
                       '/placeholder-image.jpg'} 
                  alt={parcours.oeuvres[currentOeuvreIndex].title}
                  className="featured-oeuvre-image"
                />
                <div className="featured-oeuvre-info">
                  <h3>{parcours.oeuvres[currentOeuvreIndex].title}</h3>
                  <p className="oeuvre-description">
                    {parcours.oeuvres[currentOeuvreIndex].description_fr?.substring(0, 200)}...
                  </p>
                  <div className="oeuvre-actions">
                    <Link 
                      to={`/oeuvre/${parcours.oeuvres[currentOeuvreIndex].id}`} 
                      className="view-details-btn"
                    >
                      Voir les détails complets
                    </Link>
                    <button className="audio-guide-btn">
                      🎧 Audio guide
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <button 
              className="carousel-btn next" 
              onClick={nextOeuvre}
              disabled={currentOeuvreIndex === parcours.oeuvres.length - 1}
            >
              ›
            </button>
          </div>
        ) : (
          <div className="no-oeuvres">
            <div className="empty-state">
              <div className="empty-icon">🎨</div>
              <h3>Aucune œuvre dans ce parcours</h3>
              <p>Ce parcours ne contient pas encore d'œuvres.</p>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Actions */}
      <div className="navigation-actions">
        <button className="share-btn">
          📤 Partager ce parcours
        </button>
        <button className="save-btn">
          💾 Sauvegarder
        </button>
        <button className="map-btn">
          🗺️ Voir sur la carte
        </button>
      </div>
    </div>
  );
}

export default ParcoursDetail;