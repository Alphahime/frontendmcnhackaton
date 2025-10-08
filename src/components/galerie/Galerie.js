import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { galerieService, galerieUtils } from '../../api';
import { FaSearch, FaImage } from 'react-icons/fa';
import './Galerie.css';
import Header from '../Header/Header';
import Footer from '../footer/Footer';
const Galerie = () => {
  const [oeuvres, setOeuvres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Charger les œuvres au montage du composant
  useEffect(() => {
    loadOeuvres();
  }, []);

  const loadOeuvres = async () => {
    try {
      setLoading(true);
      const params = searchTerm ? { search: searchTerm } : {};
      const response = await galerieService.getAll(params);
      setOeuvres(response.data);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    loadOeuvres();
  };

  if (loading) {
    return (
      <div className="galerie-loading">
        <div className="loading-spinner"></div>
        <p>Chargement des œuvres...</p>
      </div>
    );
  }

  return (
     <div className="gal">
    <div className="galerie-container">
      <Header />
      {/* En-tête */}
      <div className="galerie-header">
        <h1 className="galerie-title">Galerie d'Œuvres</h1>
        <p className="galerie-subtitle">
          Découvrez notre collection d'œuvres d'art exceptionnelles
        </p>
      </div>

      {/* Barre de recherche */}
      <div className="galerie-actions">
        <form onSubmit={handleSearchSubmit} className="search-form">
          <div className="search-input-container">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Rechercher une œuvre ou un artiste..."
              value={searchTerm}
              onChange={handleSearch}
              className="search-input"
            />
          </div>
          <button type="submit" className="search-btn">
            Rechercher
          </button>
        </form>
      </div>

      {/* Message d'erreur */}
      {error && (
        <div className="error-message">
          {error}
          <button onClick={loadOeuvres} className="retry-btn">
            Réessayer
          </button>
        </div>
      )}

      {/* Grille des œuvres */}
      <div className="oeuvres-grid">
        {oeuvres.length === 0 ? (
          <div className="no-results">
            <FaImage className="no-results-icon" />
            <h3>Aucune œuvre trouvée</h3>
            <p>Aucune œuvre ne correspond à votre recherche.</p>
          </div>
        ) : (
          oeuvres.map((oeuvre) => (
            <Link 
              key={oeuvre.id} 
              to={`/galerie/${oeuvre.id}`} 
              className="oeuvre-card-link"
            >
              <div className="oeuvre-card">
                {/* Image de l'œuvre */}
                <div className="oeuvre-image-container">
                  <img
                    src={galerieUtils.getImageUrl(oeuvre.image_url)}
                    alt={oeuvre.titre}
                    className="oeuvre-image"
                    onError={(e) => {
                      e.target.src = '/placeholder-oeuvre.jpg';
                    }}
                  />
                </div>

                {/* Contenu de la carte */}
                <div className="oeuvre-content">
                  <h3 className="oeuvre-title">{oeuvre.titre}</h3>
                  <p className="oeuvre-artiste">{oeuvre.artiste || 'Artiste inconnu'}</p>
                  
                  <div className="oeuvre-meta">
                    <span className="oeuvre-annee">
                      {galerieUtils.formatAnnee(oeuvre.annee_creation)}
                    </span>
                    {oeuvre.dimensions && (
                      <span className="oeuvre-dimensions">{oeuvre.dimensions}</span>
                    )}
                  </div>

                  <p className="oeuvre-description">
                    {galerieUtils.truncateDescription(oeuvre.description)}
                  </p>
                </div>
              </div>
            </Link>
          ))
        )}
        
      </div>

      {/* Statistiques */}
      <div className="galerie-stats">
        <div className="stat-item">
          <span className="stat-number">{oeuvres.length}</span>
          <span className="stat-label">Œuvres</span>
        </div>
      </div>
     
    </div>
       <Footer />
    </div>
  );
};

export default Galerie;