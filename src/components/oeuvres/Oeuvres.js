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
import './Oeuvres.css';

function Oeuvres() {
  const [oeuvres, setOeuvres] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [hoveredCard, setHoveredCard] = useState(null);
  const [selectedOeuvreForQR, setSelectedOeuvreForQR] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🌐 Début du chargement des données...');
      
      // Chargement parallèle avec meilleure gestion d'erreurs
      const [oeuvresResponse, categoriesResponse] = await Promise.allSettled([
        oeuvreService.getAll(),
        categoryService.getAll()
      ]);
      
      console.log('📦 Réponses API:', {
        oeuvres: oeuvresResponse,
        categories: categoriesResponse
      });

      // Gestion des œuvres
      if (oeuvresResponse.status === 'fulfilled') {
        const oeuvresData = extractDataFromResponse(oeuvresResponse.value);
        console.log('🎨 Œuvres chargées:', oeuvresData);
        setOeuvres(Array.isArray(oeuvresData) ? oeuvresData : []);
      } else {
        console.error('❌ Erreur œuvres:', oeuvresResponse.reason);
        throw new Error(`Échec chargement œuvres: ${oeuvresResponse.reason.message}`);
      }

      // Gestion des catégories
      if (categoriesResponse.status === 'fulfilled') {
        const categoriesData = extractDataFromResponse(categoriesResponse.value);
        console.log('📂 Catégories chargées:', categoriesData);
        setCategories(Array.isArray(categoriesData) ? categoriesData : []);
      } else {
        console.error('❌ Erreur catégories:', categoriesResponse.reason);
        // On ne bloque pas pour les catégories, on continue avec des catégories vides
        setCategories([]);
      }

    } catch (err) {
      console.error('💥 Erreur globale loadData:', err);
      setError(err.message || 'Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour extraire les données de la réponse API
  const extractDataFromResponse = (response) => {
    if (!response) {
      console.warn('⚠️ Réponse API vide');
      return [];
    }
    
    // Différents formats possibles selon l'environnement
    if (Array.isArray(response)) {
      return response; // Format direct
    } else if (response.data && Array.isArray(response.data)) {
      return response.data; // Format { data: [] }
    } else if (response.success && Array.isArray(response.data)) {
      return response.data; // Format { success: true, data: [] }
    } else if (response.oeuvres && Array.isArray(response.oeuvres)) {
      return response.oeuvres; // Format { oeuvres: [] }
    } else if (response.categories && Array.isArray(response.categories)) {
      return response.categories; // Format { categories: [] }
    }
    
    console.warn('⚠️ Format de réponse inattendu:', response);
    return [];
  };

  const filteredOeuvres = filter === 'all' 
    ? oeuvres 
    : oeuvres.filter(oeuvre => {
        if (oeuvre.category && oeuvre.category.slug === filter) return true;
        if (oeuvre.category_id) {
          const category = categories.find(cat => cat.id === oeuvre.category_id);
          return category && category.slug === filter;
        }
        if (oeuvre.category_slug === filter) return true;
        return false;
      });

  const getCategoryName = (oeuvre) => {
    if (oeuvre.category && oeuvre.category.name) return oeuvre.category.name;
    if (oeuvre.category_id) {
      const category = categories.find(cat => cat.id === oeuvre.category_id);
      return category ? category.name : 'Non catégorisé';
    }
    if (oeuvre.category_name) return oeuvre.category_name;
    return 'Non catégorisé';
  };

  const getCategoryColor = (oeuvre) => {
    if (oeuvre.category && oeuvre.category.color) return oeuvre.category.color;
    if (oeuvre.category_id) {
      const category = categories.find(cat => cat.id === oeuvre.category_id);
      return category ? category.color : '#6B7280';
    }
    if (oeuvre.category_color) return oeuvre.category_color;
    return '#6B7280';
  };

  const getImageUrl = (oeuvre) => {
    console.log('🖼️ Traitement image pour oeuvre:', oeuvre.id, oeuvre);
    
    // Priorité 1: image_url direct
    if (oeuvre.image_url) {
      if (oeuvre.image_url.startsWith('http')) {
        console.log('✅ URL image directe:', oeuvre.image_url);
        return oeuvre.image_url;
      }
      // Construire l'URL complète pour les chemins relatifs
      const fullUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '')}/storage/${oeuvre.image_url}`;
      console.log('🔗 URL image construite:', fullUrl);
      return fullUrl;
    }
    
    // Priorité 2: champ images (JSON ou array)
    if (oeuvre.images) {
      try {
        const images = typeof oeuvre.images === 'string' 
          ? JSON.parse(oeuvre.images) 
          : oeuvre.images;
        
        if (Array.isArray(images) && images.length > 0) {
          const firstImage = images[0];
          if (firstImage.startsWith('http')) {
            console.log('✅ Première image du tableau:', firstImage);
            return firstImage;
          }
          // Construire l'URL pour les chemins relatifs
          const fullUrl = `${process.env.REACT_APP_API_URL?.replace('/api', '')}/storage/${firstImage}`;
          console.log('🔗 URL image tableau construite:', fullUrl);
          return fullUrl;
        }
      } catch (error) {
        console.error('❌ Erreur parsing images:', error);
      }
    }
    
    // Fallback
    console.warn('⚠️ Aucune image trouvée, utilisation du placeholder');
    return '/placeholder-image.jpg';
  };

  const isImageValid = (url) => {
    return url && (url.startsWith('http') || url.startsWith('/') || url.startsWith('blob:'));
  };

  const handleGenerateQRCode = (oeuvre, e) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedOeuvreForQR(oeuvre);
  };

  const closeQRCodeModal = () => {
    setSelectedOeuvreForQR(null);
  };

  // Composant de chargement
  if (loading) return (
    <div className="oeuvres-loading-container">
      <div className="oeuvres-art-loader">
        <div className="oeuvres-brush-stroke"></div>
        <div className="oeuvres-brush-stroke"></div>
        <div className="oeuvres-brush-stroke"></div>
        <p>Chargement des œuvres...</p>
        <div className="oeuvres-loading-debug">
          <small>API: {process.env.REACT_APP_API_URL}</small>
        </div>
      </div>
    </div>
  );

  // Composant d'erreur
  if (error) return (
    <div className="oeuvres-error-container">
      <div className="oeuvres-error-art">
        <div className="oeuvres-broken-frame"></div>
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <div className="oeuvres-error-debug">
          <p><strong>Détails techniques:</strong></p>
          <small>URL API: {process.env.REACT_APP_API_URL}</small>
          <br />
          <small>Environnement: {process.env.NODE_ENV}</small>
        </div>
        <button onClick={loadData} className="oeuvres-retry-btn">
          <FaSyncAlt /> Réessayer
        </button>
      </div>
    </div>
  );

  console.log('🎯 Oeuvres à afficher:', oeuvres.length);
  console.log('📂 Catégories disponibles:', categories.length);
  console('🔍 Filtre actuel:', filter);
  console.log('📋 Oeuvres filtrées:', filteredOeuvres.length);

  return (
    <div className="oeuvres-master">
      {/* Background Artistic Elements */}
      <div className="oeuvres-art-background">
        <div className="oeuvres-floating-shapes oeuvres-shape-1"></div>
        <div className="oeuvres-floating-shapes oeuvres-shape-2"></div>
        <div className="oeuvres-floating-shapes oeuvres-shape-3"></div>
        <div className="oeuvres-color-splash oeuvres-splash-1"></div>
        <div className="oeuvres-color-splash oeuvres-splash-2"></div>
      </div>

      <div className="oeuvres-hero">
        <h1 className="oeuvres-gallery-title">
          <span className="oeuvres-title-main">Galerie des</span>
          <span className="oeuvres-title-accent">Œuvres</span>
        </h1>
        <p className="oeuvres-gallery-subtitle">
          Découvrez la richesse artistique à travers nos collections exceptionnelles
        </p>
        
        {/* Debug info */}
        <div className="oeuvres-debug-info">
          <small>
            {oeuvres.length} œuvres chargées • {categories.length} catégories • 
            Environnement: {process.env.NODE_ENV}
          </small>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="oeuvres-filter-tabs">
        <button
          key="all"
          className={`oeuvres-filter-tab ${filter === 'all' ? 'oeuvres-active' : ''}`}
          onClick={() => setFilter('all')}
        >
          <span className="oeuvres-tab-text">Toutes ({oeuvres.length})</span>
          <div className="oeuvres-tab-underline"></div>
        </button>
        
        {categories.map(category => (
          <button
            key={category.slug || category.id}
            className={`oeuvres-filter-tab ${filter === (category.slug || category.id) ? 'oeuvres-active' : ''}`}
            onClick={() => setFilter(category.slug || category.id)}
            style={{ '--category-color': category.color || '#6B7280' }}
          >
            <span className="oeuvres-tab-text">
              {category.name} ({oeuvres.filter(o => {
                if (o.category && o.category.slug === category.slug) return true;
                if (o.category_id === category.id) return true;
                if (o.category_slug === category.slug) return true;
                return false;
              }).length})
            </span>
            <div className="oeuvres-tab-underline"></div>
          </button>
        ))}
      </div>

      {/* Oeuvres Grid */}
      <div className="oeuvres-gallery">
        {filteredOeuvres.map((oeuvre, index) => {
          const imageUrl = getImageUrl(oeuvre);
          const isValidImage = isImageValid(imageUrl);
          
          console.log(`🖼️ Oeuvre ${oeuvre.id}:`, {
            titre: oeuvre.title,
            imageUrl,
            isValidImage,
            hasImages: !!oeuvre.images,
            category: oeuvre.category
          });
          
          return (
            <div
              key={oeuvre.id}
              className={`oeuvres-card ${hoveredCard === oeuvre.id ? 'oeuvres-hovered' : ''}`}
              onMouseEnter={() => setHoveredCard(oeuvre.id)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Card Glow Effect */}
              <div className="oeuvres-card-glow"></div>
              
              {/* Image Container */}
              <div className="oeuvres-image-container">
                <img 
                  src={isValidImage ? imageUrl : '/placeholder-image.jpg'} 
                  alt={oeuvre.title}
                  className="oeuvres-image"
                  onError={(e) => {
                    console.warn(`❌ Image failed to load: ${imageUrl}`);
                    e.target.src = '/placeholder-image.jpg';
                  }}
                  onLoad={(e) => {
                    console.log(`✅ Image loaded successfully: ${imageUrl}`);
                  }}
                />
                <div className="oeuvres-image-overlay">
                  <div className="oeuvres-zoom-icon">
                    <FaSearch />
                  </div>
                </div>
                
                {/* Category Badge */}
                <div 
                  className="oeuvres-category-badge"
                  style={{ backgroundColor: getCategoryColor(oeuvre) }}
                >
                  <FaPalette /> {getCategoryName(oeuvre)}
                </div>
              </div>

              {/* Card Content */}
              <div className="oeuvres-card-content">
                <div className="oeuvres-card-header">
                  <h3 className="oeuvres-title">{oeuvre.title || 'Sans titre'}</h3>
                  <div className="oeuvres-art-indicator">
                    <div 
                      className="oeuvres-indicator-dot"
                      style={{ backgroundColor: getCategoryColor(oeuvre) }}
                    ></div>
                    <span>{getCategoryName(oeuvre)}</span>
                  </div>
                </div>
                
                <p className="oeuvres-description">
                  {oeuvre.description_fr?.substring(0, 120) || 
                   oeuvre.description?.substring(0, 120) || 
                   oeuvre.desc?.substring(0, 120) || 
                   'Description non disponible'}...
                </p>

                <div className="oeuvres-card-footer">
                  <div className="oeuvres-meta">
                    <button 
                      onClick={(e) => handleGenerateQRCode(oeuvre, e)}
                      className="oeuvres-generate-qr-btn"
                      title="Générer QR Code pour cette œuvre"
                    >
                      <FaQrcode /> Générer QR Code
                      <div className="oeuvres-scan-hint">
                        <FaExclamationTriangle /> Cliquez pour scanner
                      </div>
                    </button>
                    {(oeuvre.images && Array.isArray(oeuvre.images) && oeuvre.images.length > 0) && (
                      <div className="oeuvres-media-count">
                        <FaCamera /> {oeuvre.images.length} image{oeuvre.images.length > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                  
                  <Link 
                    to={`/oeuvre/${oeuvre.id}`} 
                    className="oeuvres-view-details-btn"
                  >
                    <span className="oeuvres-btn-text">Explorer</span>
                    <div className="oeuvres-btn-arrow">
                      <FaArrowRight />
                    </div>
                  </Link>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="oeuvres-card-decoration"></div>
            </div>
          );
        })}
      </div>

      {filteredOeuvres.length === 0 && !loading && (
        <div className="oeuvres-no-results">
          <div className="oeuvres-empty-gallery">
            <div className="oeuvres-empty-palette">
              <FaPalette />
            </div>
            <h3>Aucune œuvre trouvée</h3>
            <p>
              {filter === 'all' 
                ? 'Aucune œuvre disponible dans la base de données' 
                : 'Aucune œuvre ne correspond à la catégorie sélectionnée'
              }
            </p>
            <button 
              onClick={() => setFilter('all')} 
              className="oeuvres-show-all-btn"
            >
              Voir toutes les œuvres
            </button>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      {selectedOeuvreForQR && (
        <QRCodeManager 
          oeuvre={selectedOeuvreForQR}
          onClose={closeQRCodeModal}
        />
      )}
    </div>
  );
}

export default Oeuvres;