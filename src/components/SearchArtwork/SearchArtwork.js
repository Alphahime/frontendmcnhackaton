import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { oeuvreService, categoryService } from '../../api';
import QRCodeManager from '../QRCodeManager/QRCodeManager';
import { 
  FaSearch, 
  FaPalette, 
  FaCamera, 
  FaQrcode,
  FaArrowRight,
  FaExclamationTriangle,
  FaSyncAlt
} from 'react-icons/fa';
import './SearchArtwork.css';
import Header from '../Header/Header'; 
import Footer from '../footer/Footer';

function SearchArtwork() {
  const [oeuvres, setOeuvres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedOeuvreForQR, setSelectedOeuvreForQR] = useState(null);
  
  // États pour la recherche et filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('title');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [oeuvresResponse, categoriesResponse] = await Promise.all([
        oeuvreService.getAll(),
        categoryService.getAll()
      ]);
      
      const oeuvresData = oeuvresResponse.data || oeuvresResponse;
      const categoriesData = categoriesResponse.data || categoriesResponse;
      
      setOeuvres(Array.isArray(oeuvresData) ? oeuvresData : []);
      setCategories(Array.isArray(categoriesData) ? categoriesData : []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des données');
      console.error('Erreur loadData:', err);
    } finally {
      setLoading(false);
    }
  };

  // Filtrage et recherche
  const filteredOeuvres = oeuvres.filter(oeuvre => {
    // Filtre par recherche texte
    const matchesSearch = searchTerm === '' || 
      oeuvre.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      oeuvre.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      oeuvre.description_fr?.toLowerCase().includes(searchTerm.toLowerCase());

    // Filtre par catégorie
    const matchesCategory = selectedCategory === 'all' || 
      (oeuvre.category && oeuvre.category.slug === selectedCategory) ||
      (oeuvre.category_id && categories.find(cat => cat.id === oeuvre.category_id && cat.slug === selectedCategory));

    return matchesSearch && matchesCategory;
  });

  // Tri des œuvres
  const sortedOeuvres = [...filteredOeuvres].sort((a, b) => {
    switch (sortBy) {
      case 'title':
        return a.title?.localeCompare(b.title);
      case 'category':
        return getCategoryName(a).localeCompare(getCategoryName(b));
      case 'recent':
        return new Date(b.created_at || 0) - new Date(a.created_at || 0);
      default:
        return 0;
    }
  });

  const getCategoryName = (oeuvre) => {
    if (oeuvre.category) return oeuvre.category.name;
    if (oeuvre.category_id) {
      const category = categories.find(cat => cat.id === oeuvre.category_id);
      return category ? category.name : 'Non catégorisé';
    }
    return 'Non catégorisé';
  };

  const getCategoryColor = (oeuvre) => {
    if (oeuvre.category && oeuvre.category.color) return oeuvre.category.color;
    if (oeuvre.category_id) {
      const category = categories.find(cat => cat.id === oeuvre.category_id);
      return category ? category.color : '#6B7280';
    }
    return '#6B7280';
  };

  const getImageUrl = (oeuvre) => {
    if (oeuvre.image_url && oeuvre.image_url.startsWith('http')) {
      return oeuvre.image_url;
    }
    
    if (oeuvre.images) {
      try {
        const images = typeof oeuvre.images === 'string' 
          ? JSON.parse(oeuvre.images) 
          : oeuvre.images;
        
        if (Array.isArray(images) && images.length > 0) {
          const firstImage = images[0];
          if (firstImage.startsWith('http')) {
            return firstImage;
          }
          return firstImage;
        }
      } catch (error) {
        console.error('Erreur parsing images:', error);
      }
    }
    
    if (oeuvre.image_url) {
      return oeuvre.image_url;
    }
    
    return '/placeholder-image.jpg';
  };

  const isImageValid = (url) => {
    return url && (url.startsWith('http') || url.startsWith('/'));
  };

  const handleGenerateQRCode = (oeuvre, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOeuvreForQR(oeuvre);
  };

  const closeQRCodeModal = () => {
    setSelectedOeuvreForQR(null);
  };

  if (loading) return (
    <div className="search-artwork-loading-container">
      <div className="search-artwork-art-loader">
        <div className="search-artwork-brush-stroke"></div>
        <div className="search-artwork-brush-stroke"></div>
        <div className="search-artwork-brush-stroke"></div>
        <p>Chargement des œuvres...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="search-artwork-error-container">
      <div className="search-artwork-error-art">
        <div className="search-artwork-broken-frame"></div>
        <p>Erreur: {error}</p>
        <button onClick={loadData} className="search-artwork-retry-btn">
          <FaSyncAlt /> Réessayer
        </button>
      </div>
    </div>
  );

  return (
    <div className="search-artwork-master">
      <Header />
      
      {/* Background Artistic Elements */}
      <div className="search-artwork-art-background">
        <div className="search-artwork-floating-shapes search-artwork-shape-1"></div>
        <div className="search-artwork-floating-shapes search-artwork-shape-2"></div>
        <div className="search-artwork-floating-shapes search-artwork-shape-3"></div>
        <div className="search-artwork-color-splash search-artwork-splash-1"></div>
        <div className="search-artwork-color-splash search-artwork-splash-2"></div>
      </div>

      {/* Bannière de recherche */}
      <div className="search-artwork-banner">
        <div className="search-artwork-banner-content">
          <h1 className="search-artwork-banner-title">
            Recherche d'Œuvres
          </h1>
          <p className="search-artwork-banner-subtitle">
            Explorez notre collection et trouvez les œuvres qui vous passionnent
          </p>
          
          {/* Barre de recherche principale */}
          <div className="search-artwork-main-search">
            <div className="search-input-container">
              <input
                type="text"
                placeholder="Rechercher une œuvre par titre, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-artwork-input"
              />
              <span className="search-icon">
                <FaSearch />
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Résultats de recherche */}
      <div className="search-artwork-results">
        {sortedOeuvres.length > 0 ? (
          <div className="search-artwork-gallery">
            {sortedOeuvres.map((oeuvre, index) => {
              const imageUrl = getImageUrl(oeuvre);
              const isValidImage = isImageValid(imageUrl);
              
              return (
                <div
                  key={oeuvre.id}
                  className={`search-artwork-card ${hoveredCard === oeuvre.id ? 'search-artwork-hovered' : ''}`}
                  onMouseEnter={() => setHoveredCard(oeuvre.id)}
                  onMouseLeave={() => setHoveredCard(null)}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="search-artwork-card-glow"></div>
                  
                  <div className="search-artwork-image-container">
                    <img 
                      src={isValidImage ? imageUrl : '/placeholder-image.jpg'} 
                      alt={oeuvre.title}
                      className="search-artwork-image"
                      onError={(e) => {
                        e.target.src = '/placeholder-image.jpg';
                      }}
                    />
                    <div className="search-artwork-image-overlay">
                      <div className="search-artwork-zoom-icon">
                        <FaSearch />
                      </div>
                    </div>
                    
                    <div 
                      className="search-artwork-category-badge"
                      style={{ backgroundColor: getCategoryColor(oeuvre) }}
                    >
                      <FaPalette /> {getCategoryName(oeuvre)}
                    </div>
                  </div>

                  <div className="search-artwork-card-content">
                    <div className="search-artwork-card-header">
                      <h3 className="search-artwork-title">{oeuvre.title}</h3>
                      <div className="search-artwork-art-indicator">
                        <div 
                          className="search-artwork-indicator-dot"
                          style={{ backgroundColor: getCategoryColor(oeuvre) }}
                        ></div>
                        <span>{getCategoryName(oeuvre)}</span>
                      </div>
                    </div>
                    
                    <p className="search-artwork-description">
                      {oeuvre.description_fr?.substring(0, 120) || oeuvre.description?.substring(0, 120) || 'Description non disponible'}...
                    </p>

                    <div className="search-artwork-card-footer">
                      <div className="search-artwork-meta">
                        <button 
                          onClick={(e) => handleGenerateQRCode(oeuvre, e)}
                          className="search-artwork-generate-qr-btn"
                          title="Générer QR Code pour cette œuvre"
                        >
                          <FaQrcode /> Générer QR Code
                          <div className="search-artwork-scan-hint">
                            <FaExclamationTriangle /> Cliquez pour scanner
                          </div>
                        </button>
                        {(oeuvre.images && Array.isArray(oeuvre.images) && oeuvre.images.length > 0) && (
                          <div className="search-artwork-media-count">
                            <FaCamera /> {oeuvre.images.length} image{oeuvre.images.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </div>
                      
                      <Link 
                        to={`/oeuvre/${oeuvre.id}`} 
                        className="search-artwork-view-details-btn"
                      >
                        <span className="search-artwork-btn-text">Explorer</span>
                        <div className="search-artwork-btn-arrow">
                          <FaArrowRight />
                        </div>
                      </Link>
                    </div>
                  </div>

                  <div className="search-artwork-card-decoration"></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="search-artwork-no-results">
            <div className="search-artwork-empty-gallery">
              <div className="search-artwork-empty-palette">
                <FaPalette />
              </div>
              <h3>Aucune œuvre trouvée</h3>
              <p>Aucune œuvre ne correspond à votre recherche "{searchTerm}"</p>
              <button 
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('all');
                }}
                className="search-artwork-show-all-btn"
              >
                Voir toutes les œuvres
              </button>
            </div>
          </div>
        )}
      </div>

      {/* QR Code Modal */}
      {selectedOeuvreForQR && (
        <QRCodeManager 
          oeuvre={selectedOeuvreForQR}
          onClose={closeQRCodeModal}
        />
      )}

      <Footer />
    </div>
  );
}

export default SearchArtwork;