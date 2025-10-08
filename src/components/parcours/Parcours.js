// src/components/parcours/Parcours.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { parcoursService, parcoursUtils } from '../../api';
import { 
  FaStar, 
  FaPlay, 
  FaClock, 
  FaUsers, 
  FaPalette, 
  FaArrowRight,
  FaMapMarkerAlt,
  FaFilter,
  FaExclamationTriangle
} from 'react-icons/fa';
import './Parcours.css';

function Parcours() {
  const [parcours, setParcours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    loadParcours();
  }, []);

  const loadParcours = async () => {
    try {
      setLoading(true);
      const response = await parcoursService.getAll();
      
      // Gérer différentes structures de réponse
      const parcoursData = response.data || response;
      setParcours(Array.isArray(parcoursData) ? parcoursData : []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des parcours');
      console.error('Erreur loadParcours:', err);
    } finally {
      setLoading(false);
    }
  };

  const getImageUrl = (parcour) => {
    // Priorité 1: image_full_url (attribut calculé du modèle)
    if (parcour.image_full_url) return parcour.image_full_url;
    
    // Priorité 2: image_url direct
    if (parcour.image_url) {
      return parcour.image_url;
    }
    
    // Image par défaut
    return '/placeholder-parcours.jpg';
  };

  const handleImageError = (parcourId) => {
    setImageErrors(prev => ({
      ...prev,
      [parcourId]: true
    }));
  };

  const getThemesArray = (themes) => {
    if (!themes) return [];
    if (Array.isArray(themes)) return themes;
    if (typeof themes === 'string') {
      try {
        const parsed = JSON.parse(themes);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return themes.split(',').map(t => t.trim());
      }
    }
    return [];
  };

  const difficulties = ['all', 'facile', 'moyen', 'difficile'];
  const audiences = ['all', 'enfants', 'scolaires', 'adultes', 'experts'];

  const filteredParcours = parcours.filter(parcour => {
    if (filter === 'all') return true;
    if (difficulties.includes(filter)) return parcour.difficulty === filter;
    if (audiences.includes(filter)) return parcour.target_audience === filter;
    return true;
  });

  if (loading) return (
    <div className="loading-container">
      <div className="art-loader">
        <div className="brush-stroke"></div>
        <div className="brush-stroke"></div>
        <div className="brush-stroke"></div>
        <p>Chargement des parcours...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="error-container">
      <div className="error-art">
        <div className="broken-frame"></div>
        <p>Erreur: {error}</p>
        <button onClick={loadParcours} className="retry-btn">Réessayer</button>
      </div>
    </div>
  );

  return (
    <div className="parcours-master">
      {/* Background Artistic Elements */}
      <div className="art-background">
        <div className="floating-shapes shape-1"></div>
        <div className="floating-shapes shape-2"></div>
        <div className="floating-shapes shape-3"></div>
      </div>

        <div className="parcours-hero">
        <h1 className="parcours-gallery-title">
          <span className="parcours-title-main">Parcours</span>
          <span className="parcours-title-accent">Thématiques</span>
        </h1>
        <p className="parcours-gallery-subtitle">
          Explorez le musée à travers nos parcours guidés spécialement conçus
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="filter-section">
        <div className="filter-header">
          <FaFilter className="filter-icon" />
          <h3>Filtrer par difficulté</h3>
        </div>
        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            <span className="tab-text">Tous</span>
          </button>
          
          <button
            className={`filter-tab ${filter === 'facile' ? 'active' : ''}`}
            onClick={() => setFilter('facile')}
          >
            <span className="tab-text">Facile</span>
          </button>
          
          <button
            className={`filter-tab ${filter === 'moyen' ? 'active' : ''}`}
            onClick={() => setFilter('moyen')}
          >
            <span className="tab-text">Moyen</span>
          </button>
          
          <button
            className={`filter-tab ${filter === 'difficile' ? 'active' : ''}`}
            onClick={() => setFilter('difficile')}
          >
            <span className="tab-text">Difficile</span>
          </button>
        </div>
      </div>

      {/* Parcours Grid */}
      <div className="parcours-gallery">
        {filteredParcours.map((parcour, index) => {
          const themesArray = getThemesArray(parcour.themes);
          const imageUrl = getImageUrl(parcour);
          const hasImageError = imageErrors[parcour.id];
          
          return (
            <div
              key={parcour.id}
              className="parcours-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Featured Badge */}
              {parcour.is_featured && (
                <div className="featured-badge">
                  <FaStar className="star-icon" />
                  En vedette
                </div>
              )}

              {/* Card Image */}
              <div className="parcours-image-container">
                {hasImageError ? (
                  <div className="image-error">
                    <FaExclamationTriangle className="error-icon" />
                    <span>Image non disponible</span>
                  </div>
                ) : (
                  <img 
                    src={imageUrl}
                    alt={parcour.title}
                    className="parcours-image"
                    onError={() => handleImageError(parcour.id)}
                  />
                )}
                <div className="image-overlay">
                  <div className="play-icon">
                    <FaPlay />
                  </div>
                </div>
              </div>

              {/* Card Content */}
              <div className="parcours-card-content">
                <div className="card-header">
                  <h3 className="parcours-title">{parcour.title}</h3>
                  <div className="difficulty-badge" 
                       style={{ backgroundColor: parcoursUtils.getDifficultyColor(parcour.difficulty) }}>
                    <FaMapMarkerAlt className="difficulty-icon" />
                    {parcour.difficulty}
                  </div>
                </div>
                
                <p className="parcours-description">
                  {parcour.description?.substring(0, 120) || 'Découvrez ce parcours exceptionnel...'}...
                </p>

                {/* Metadata */}
                <div className="parcours-meta">
                  <div className="meta-item">
                    <span className="meta-icon">
                      <FaClock />
                    </span>
                    <span className="meta-text">
                      {parcoursUtils.formatDuration(parcour.estimated_duration) || '1h30'}
                    </span>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-icon">
                      <FaUsers />
                    </span>
                    <span className="meta-text">
                      {parcour.target_audience === 'enfants' ? 'Enfants' :
                       parcour.target_audience === 'scolaires' ? 'Scolaires' :
                       parcour.target_audience === 'adultes' ? 'Adultes' : 'Experts'}
                    </span>
                  </div>
                  
                  <div className="meta-item">
                    <span className="meta-icon">
                      <FaPalette />
                    </span>
                    <span className="meta-text">
                      {parcour.oeuvres ? parcour.oeuvres.length : 0} œuvres
                    </span>
                  </div>
                </div>

                {/* Themes */}
                {themesArray.length > 0 && (
                  <div className="themes-container">
                    {themesArray.slice(0, 3).map((theme, idx) => (
                      <span key={idx} className="theme-tag">
                        #{theme}
                      </span>
                    ))}
                    {themesArray.length > 3 && (
                      <span className="theme-tag more">+{themesArray.length - 3}</span>
                    )}
                  </div>
                )}

                {/* Action Button */}
                <Link 
                  to={`/parcours/${parcour.id}`} 
                  className="commencer-btn"
                >
                  <span className="btn-text">Commencer la visite</span>
                  <FaArrowRight className="btn-arrow" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>

      {filteredParcours.length === 0 && (
        <div className="no-results">
          <div className="empty-gallery">
            <div className="empty-palette">🗺️</div>
            <h3>Aucun parcours trouvé</h3>
            <p>Aucun parcours ne correspond aux filtres sélectionnés</p>
            <button 
              onClick={() => setFilter('all')} 
              className="show-all-btn"
            >
              Voir tous les parcours
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Parcours;