// src/components/oeuvre-detail/OeuvreDetail.js
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import Header from '../Header/Header';
import Footer from '../footer/Footer';
import { 
  FaVolumeUp, 
  FaVolumeMute, 
  FaVideo, 
  FaDownload,
  FaShareAlt,
  FaHeart,
  FaGlobeAmericas,
  FaPalette,
  FaUsers,
  FaQrcode,
  FaSync,
  FaPlay,
  FaStop
} from 'react-icons/fa';
import { 
  oeuvreService, 
  avisService, 
  visiteService, 
  translationService, 
  ttsService,
  videoSynthesisService
} from '../../api';
import './OeuvreDetail.css';

function OeuvreDetail() {
  const { id } = useParams();
  const [oeuvre, setOeuvre] = useState(null);
  const [avis, setAvis] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [translating, setTranslating] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('fr');
  const [videoGenerating, setVideoGenerating] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState(null);
  const [isFavorite, setIsFavorite] = useState(false);

  const qrCodeValue = `${window.location.origin}/oeuvre/${id}`;

  useEffect(() => {
    loadOeuvreDetail();
    
    return () => {
      ttsService.stopSpeaking();
      if (generatedVideoUrl) {
        URL.revokeObjectURL(generatedVideoUrl);
      }
    };
  }, [id]);

  const loadOeuvreDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('🔄 Chargement des détails de l\'œuvre ID:', id);
      console.log('🌐 URL API:', process.env.REACT_APP_API_URL);

      // Utilisation de Promise.allSettled pour une meilleure gestion d'erreurs
      const [oeuvreResponse, avisResponse] = await Promise.allSettled([
        oeuvreService.getById(id),
        avisService.getByOeuvre(id)
      ]);

      console.log('📦 Réponses API:', {
        oeuvre: oeuvreResponse,
        avis: avisResponse
      });

      // Gestion de la réponse des œuvres
      if (oeuvreResponse.status === 'fulfilled') {
        const oeuvreData = extractDataFromResponse(oeuvreResponse.value);
        console.log('🎨 Données œuvre reçues:', oeuvreData);

        if (!oeuvreData || Object.keys(oeuvreData).length === 0) {
          throw new Error('Aucune donnée reçue pour cette œuvre');
        }

        // Vérification et génération des traductions si nécessaire
        if (oeuvreData.description_fr && (!oeuvreData.description_en || !oeuvreData.description_wo)) {
          console.log('🈺 Génération des traductions...');
          const translatedOeuvre = await generateTranslations(oeuvreData);
          setOeuvre(translatedOeuvre);
        } else {
          setOeuvre(oeuvreData);
        }
      } else {
        console.error('❌ Erreur chargement œuvre:', oeuvreResponse.reason);
        throw new Error(`Impossible de charger l'œuvre: ${oeuvreResponse.reason.message}`);
      }

      // Gestion de la réponse des avis
      if (avisResponse.status === 'fulfilled') {
        const avisData = extractDataFromResponse(avisResponse.value);
        console.log('💬 Avis reçus:', avisData);
        setAvis(Array.isArray(avisData) ? avisData : []);
      } else {
        console.warn('⚠️ Erreur chargement avis:', avisResponse.reason);
        setAvis([]); // On continue sans les avis
      }

      // Marquer comme visitée
      await markAsVisited();

    } catch (err) {
      console.error('💥 Erreur loadOeuvreDetail:', err);
      setError(err.message || 'Erreur lors du chargement des détails de l\'œuvre');
    } finally {
      setLoading(false);
    }
  };

  // Fonction utilitaire pour extraire les données de la réponse API
  const extractDataFromResponse = (response) => {
    if (!response) {
      console.warn('⚠️ Réponse API vide');
      return null;
    }
    
    // Différents formats possibles selon l'environnement
    if (typeof response === 'object' && !Array.isArray(response)) {
      if (response.data !== undefined) {
        return response.data; // Format { data: {} }
      } else if (response.oeuvre !== undefined) {
        return response.oeuvre; // Format { oeuvre: {} }
      } else if (response.success && response.data !== undefined) {
        return response.data; // Format { success: true, data: {} }
      } else {
        // Si c'est déjà l'objet oeuvre
        return response;
      }
    }
    
    console.warn('⚠️ Format de réponse inattendu:', response);
    return response;
  };

  const generateTranslations = async (oeuvreData) => {
    try {
      setTranslating(true);
      console.log('🔤 Traduction de la description...');
      
      const translations = await translationService.translateToAllLanguages(
        oeuvreData.description_fr || oeuvreData.description || ''
      );
      
      const updatedOeuvre = {
        ...oeuvreData,
        ...translations
      };
      
      // Tentative de sauvegarde des traductions (non bloquante)
      try {
        await oeuvreService.update(id, translations);
        console.log('✅ Traductions sauvegardées');
      } catch (updateError) {
        console.warn('⚠️ Impossible de sauvegarder les traductions:', updateError);
      }
      
      return updatedOeuvre;
    } catch (error) {
      console.error('❌ Erreur lors de la traduction:', error);
      // On retourne les données originales en cas d'erreur
      return oeuvreData;
    } finally {
      setTranslating(false);
    }
  };

  const handleLanguageChange = (language) => {
    console.log('🌐 Changement de langue:', language);
    setCurrentLanguage(language);
    if (generatedVideoUrl) {
      URL.revokeObjectURL(generatedVideoUrl);
      setGeneratedVideoUrl(null);
    }
  };

  const speakDescription = () => {
    const description = getDescriptionByLanguage();
    console.log('🔊 Lecture audio:', description.substring(0, 50) + '...');
    
    if (description && description !== 'Description non disponible') {
      const utterance = ttsService.speakText(description, currentLanguage);
      setIsSpeaking(true);
      
      utterance.onend = () => {
        console.log('✅ Lecture audio terminée');
        setIsSpeaking(false);
      };
      utterance.onerror = () => {
        console.error('❌ Erreur lecture audio');
        setIsSpeaking(false);
      };
    } else {
      console.warn('⚠️ Aucune description disponible pour la lecture audio');
    }
  };

  const stopSpeaking = () => {
    console.log('⏹️ Arrêt de la lecture audio');
    ttsService.stopSpeaking();
    setIsSpeaking(false);
  };

  const generateVideoFromDescription = async () => {
    try {
      setVideoGenerating(true);
      const description = getDescriptionByLanguage();
      
      console.log('🎥 Génération vidéo pour:', description.substring(0, 50) + '...');

      if (!description || description === 'Description non disponible') {
        alert('Aucune description disponible pour générer la vidéo');
        return;
      }

      const videoResult = await videoSynthesisService.createLocalVideo(description, currentLanguage);
      console.log('✅ Vidéo générée:', videoResult);
      setGeneratedVideoUrl(videoResult.result_url);
      
    } catch (error) {
      console.error('❌ Erreur lors de la génération vidéo:', error);
      alert('Erreur lors de la génération de la vidéo: ' + error.message);
    } finally {
      setVideoGenerating(false);
    }
  };

  const getDescriptionByLanguage = () => {
    if (!oeuvre) return 'Description non disponible';
    
    const descriptionMap = {
      'fr': oeuvre.description_fr,
      'en': oeuvre.description_en,
      'wo': oeuvre.description_wo
    };
    
    const description = descriptionMap[currentLanguage] || 
                       oeuvre.description_fr || 
                       oeuvre.description || 
                       'Description non disponible';
    
    console.log('📝 Description sélectionnée:', currentLanguage, description.substring(0, 50) + '...');
    return description;
  };

  const markAsVisited = async () => {
    try {
      console.log('📍 Marquage comme visitée...');
      await visiteService.markAsVisited(id);
      console.log('✅ Œuvre marquée comme visitée');
    } catch (err) {
      console.warn('⚠️ Impossible de marquer comme visitée:', err);
    }
  };

  const toggleFavorite = () => {
    console.log('❤️ Toggle favori:', !isFavorite);
    setIsFavorite(!isFavorite);
  };

  const getImageUrl = () => {
    if (!oeuvre) {
      console.log('🖼️ Aucune œuvre, retour placeholder');
      return '/placeholder-image.jpg';
    }
    
    console.log('🖼️ Recherche image pour oeuvre:', oeuvre);

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

  // Composant de chargement
  if (loading) return (
    <div className="artwork-loading">
      <div className="loading-animation">
        <div className="pulse-orange"></div>
        <div className="pulse-orange delay-1"></div>
        <div className="pulse-orange delay-2"></div>
        <p>Chargement de l'œuvre...</p>
        <div className="loading-debug">
          <small>ID: {id} • API: {process.env.REACT_APP_API_URL}</small>
        </div>
      </div>
    </div>
  );
  
  // Composant d'erreur
  if (error) return (
    <div className="artwork-error">
      <div className="error-content">
        <div className="error-icon">⚠️</div>
        <h3>Erreur de chargement</h3>
        <p>{error}</p>
        <div className="error-debug">
          <p><strong>Détails techniques:</strong></p>
          <small>ID: {id}</small><br />
          <small>URL API: {process.env.REACT_APP_API_URL}</small><br />
          <small>Environnement: {process.env.NODE_ENV}</small>
        </div>
        <button onClick={loadOeuvreDetail} className="retry-button">
          <FaSync className="button-icon" />
          Réessayer
        </button>
      </div>
    </div>
  );
  
  // Œuvre non trouvée
  if (!oeuvre) return (
    <div className="artwork-error">
      <div className="error-content">
        <div className="error-icon">🔍</div>
        <h3>Œuvre non trouvée</h3>
        <p>L'œuvre que vous recherchez n'existe pas ou a été supprimée.</p>
        <div className="error-debug">
          <small>ID recherché: {id}</small>
        </div>
      </div>
    </div>
  );

  console.log('🎯 Affichage de l\'œuvre:', oeuvre);
  console.log('💬 Nombre d\'avis:', avis.length);

  return (
    <div className="artwork">
      <div className="artwork-detail">
        <Header />
        
        {/* Header Section */}
        <div className="artwork-header">
          <div className="artwork-visual">
            <img 
              src={getImageUrl()} 
              alt={oeuvre.title}
              className="main-image"
              onError={(e) => {
                console.warn('❌ Erreur chargement image, fallback placeholder');
                e.target.src = '/placeholder-image.jpg';
              }}
              onLoad={(e) => {
                console.log('✅ Image chargée avec succès');
              }}
            />
            <div className="image-overlay">
              <button className="favorite-btn" onClick={toggleFavorite}>
                <FaHeart className={isFavorite ? 'favorite active' : 'favorite'} />
              </button>
            </div>
          </div>
          
          <div className="artwork-info">
            <div className="title-section">
              <h1 className="artwork-title">{oeuvre.title || 'Sans titre'}</h1>
              {oeuvre.category && (
                <div 
                  className="category-badge"
                  style={{ backgroundColor: oeuvre.category.color || '#d97706' }}
                >
                  <FaPalette className="badge-icon" />
                  {oeuvre.category.name}
                </div>
              )}
            </div>
            
            <div className="action-buttons">
              <button onClick={markAsVisited} className="visit-btn">
                <FaShareAlt className="btn-icon" />
                Marquer comme visitée
              </button>
            </div>

            {/* Debug info */}
            <div className="debug-info">
              <small>
                ID: {oeuvre.id} • Langue: {currentLanguage} • 
                Env: {process.env.NODE_ENV}
              </small>
            </div>
          </div>
        </div>

        {/* Controls Section */}
        <div className="controls-panel">
          <div className="control-group">
            <h3 className="control-title">
              <FaGlobeAmericas className="title-icon" />
              Langue
            </h3>
            <div className="language-selector">
              <button 
                className={`lang-option ${currentLanguage === 'fr' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('fr')}
              >
                🇫🇷 Français
              </button>
              <button 
                className={`lang-option ${currentLanguage === 'en' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('en')}
              >
                🇬🇧 English
              </button>
              <button 
                className={`lang-option ${currentLanguage === 'wo' ? 'active' : ''}`}
                onClick={() => handleLanguageChange('wo')}
              >
                🇸🇳 Wolof
              </button>
            </div>
          </div>
          
          <div className="control-group">
            <h3 className="control-title">
              <FaVolumeUp className="title-icon" />
              Audio
            </h3>
            <div className="audio-controls">
              {!isSpeaking ? (
                <button onClick={speakDescription} className="audio-button">
                  <FaVolumeUp className="btn-icon" />
                  Écouter
                </button>
              ) : (
                <button onClick={stopSpeaking} className="audio-button stop">
                  <FaVolumeMute className="btn-icon" />
                  Arrêter
                </button>
              )}
            </div>
          </div>

          <div className="control-group">
            <h3 className="control-title">
              <FaVideo className="title-icon" />
              Vidéo
            </h3>
            <div className="video-controls">
              {!generatedVideoUrl ? (
                <button 
                  onClick={generateVideoFromDescription} 
                  className="video-button"
                  disabled={videoGenerating}
                >
                  {videoGenerating ? (
                    <>
                      <FaSync className="btn-icon spinning" />
                      Génération...
                    </>
                  ) : (
                    <>
                      <FaPlay className="btn-icon" />
                      Créer vidéo
                    </>
                  )}
                </button>
              ) : (
                <button 
                  onClick={() => {
                    if (generatedVideoUrl) {
                      URL.revokeObjectURL(generatedVideoUrl);
                    }
                    setGeneratedVideoUrl(null);
                  }} 
                  className="video-button secondary"
                >
                  <FaSync className="btn-icon" />
                  Regénérer
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="artwork-content">
          {/* Description Section */}
          <section className="description-section">
            <div className="section-header">
              <FaPalette className="section-icon" />
              <h2>Description de l'œuvre</h2>
              {translating && (
                <div className="translation-notice">
                  <FaSync className="spinning" />
                  Traduction en cours...
                </div>
              )}
            </div>
            <div className="description-text">
              <p>{getDescriptionByLanguage()}</p>
            </div>
          </section>

          {/* Video Section */}
          <section className="video-section">
            <div className="section-header">
              <FaVideo className="section-icon" />
              <h2>Présentation Vidéo</h2>
            </div>
            <div className="video-container">
              {videoGenerating && (
                <div className="video-loading">
                  <div className="video-loader">
                    <div className="film-reel"></div>
                    <p>Création de votre vidéo...</p>
                  </div>
                </div>
              )}
              
              {generatedVideoUrl && !videoGenerating && (
                <div className="video-player-container">
                  <video 
                    controls 
                    className="video-player"
                    autoPlay
                    playsInline
                  >
                    <source src={generatedVideoUrl} type="video/webm" />
                    <source src={generatedVideoUrl} type="video/mp4" />
                    Votre navigateur ne supporte pas la lecture vidéo.
                  </video>
                  <div className="video-actions">
                    <a 
                      href={generatedVideoUrl} 
                      download={`oeuvre-${oeuvre.id}-${currentLanguage}.webm`}
                      className="download-button"
                    >
                      <FaDownload className="btn-icon" />
                      Télécharger
                    </a>
                  </div>
                </div>
              )}
              
              {!generatedVideoUrl && !videoGenerating && (
                <div className="video-placeholder">
                  <div className="placeholder-icon">
                    <FaVideo />
                  </div>
                  <p>Transformez la description en vidéo animée</p>
                  <button 
                    onClick={generateVideoFromDescription}
                    className="generate-video-button"
                  >
                    <FaPlay className="btn-icon" />
                    Générer la vidéo
                  </button>
                </div>
              )}
            </div>
          </section>

          {/* Reviews Section */}
          <section className="reviews-section">
            <div className="section-header">
              <FaUsers className="section-icon" />
              <h2>Avis des Visiteurs</h2>
              <span className="reviews-count">({avis.length})</span>
            </div>
            <div className="reviews-list">
              {avis.length > 0 ? (
                avis.map(avisItem => (
                  <div key={avisItem.id} className="review-card">
                    <div className="review-header">
                      <span className="reviewer-name">
                        {avisItem.user_name || `Visiteur ${avisItem.user_id}`}
                      </span>
                      <span className="review-rating">
                        {'★'.repeat(avisItem.note || 0)}
                        {'☆'.repeat(5 - (avisItem.note || 0))}
                      </span>
                    </div>
                    {avisItem.commentaire && (
                      <p className="review-comment">{avisItem.commentaire}</p>
                    )}
                    <div className="review-date">
                      {avisItem.created_at && new Date(avisItem.created_at).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-reviews">
                  <div className="no-reviews-icon">💬</div>
                  <h3>Aucun avis pour le moment</h3>
                  <p>Soyez le premier à donner votre avis !</p>
                </div>
              )}
            </div>
          </section>

          {/* QR Code Section */}
          <section className="qr-section">
            <div className="section-header">
              <FaQrcode className="section-icon" />
              <h2>Partager cette œuvre</h2>
            </div>
            <div className="qr-container">
              <div className="qr-display">
                <QRCodeSVG 
                  value={qrCodeValue}
                  size={200}
                  level="H"
                  includeMargin={true}
                  bgColor="#FFFFFF"
                  fgColor="#d97706"
                />
              </div>
              <div className="qr-info">
                <p className="qr-description">
                  Scannez ce QR code pour accéder directement à cette œuvre
                </p>
                <div className="qr-meta">
                  <span className="qr-id">ID: {oeuvre.qr_code || oeuvre.id}</span>
                  <span className="qr-url">{qrCodeValue}</span>
                </div>
              </div>
            </div>
          </section>
        </div>
        
      </div>
      <Footer />
    </div>
  );
}

export default OeuvreDetail;