// src/api.js
import axios from 'axios';

// Configuration de l'URL API
const getApiUrl = () => {
  if (process.env.NODE_ENV === 'development') {
    return process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';
  }
  return process.env.REACT_APP_API_URL || 'https://museeart.etef-design.fr/api';
};

const API_URL = getApiUrl();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  },
  timeout: 10000,
  withCredentials: false
});

console.log('API URL configurée:', API_URL);

// Gestion centralisée des erreurs - DÉPLACÉE AU DÉBUT
const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
    throw new Error('Impossible de se connecter au serveur. Vérifiez votre connexion internet.');
  }
  
  if (error.response) {
    const status = error.response.status;
    const message = error.response.data?.message || error.response.data?.error || 'Erreur serveur';
    
    switch (status) {
      case 401:
        localStorage.removeItem('token');
        window.location.href = '/login';
        throw new Error('Session expirée. Veuillez vous reconnecter.');
      case 403:
        throw new Error('Accès refusé.');
      case 404:
        throw new Error('Ressource non trouvée.');
      case 500:
        throw new Error('Erreur interne du serveur.');
      default:
        throw new Error(message || `Erreur ${status}`);
    }
  } else if (error.request) {
    throw new Error('Serveur inaccessible. Vérifiez que le serveur backend est démarré.');
  } else {
    throw new Error(error.message || 'Erreur inconnue');
  }
};

// Intercepteur pour ajouter automatiquement le token JWT
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

// Intercepteur de réponse
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Response Error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      data: error.response?.data
    });
    
    return Promise.reject(error);
  }
);

// Service de traduction
class TranslationService {
  constructor() {
    this.apiKey = process.env.REACT_APP_GOOGLE_TRANSLATE_API_KEY;
    this.baseURL = 'https://translation.googleapis.com/language/translate/v2';
  }

  async translateText(text, targetLanguage) {
    try {
      const response = await axios.post(
        `${this.baseURL}?key=${this.apiKey}`,
        {
          q: text,
          target: targetLanguage,
          format: 'text'
        }
      );
      
      return response.data.data.translations[0].translatedText;
    } catch (error) {
      console.error('Erreur de traduction:', error);
      throw new Error('Échec de la traduction');
    }
  }

  async translateToAllLanguages(text) {
    try {
      const [en, wo] = await Promise.all([
        this.translateText(text, 'en'),
        this.translateText(text, 'fr')
      ]);
      
      return {
        description_en: en,
        description_wo: wo
      };
    } catch (error) {
      console.error('Erreur de traduction multiple:', error);
      return {
        description_en: text,
        description_wo: text
      };
    }
  }
}

// Service de synthèse vocale
class TTSService {
  constructor() {
    this.speechSynthesis = window.speechSynthesis;
    this.availableVoices = [];
    this.loadVoices();
  }

  loadVoices() {
    this.availableVoices = this.speechSynthesis.getVoices();
    
    this.speechSynthesis.onvoiceschanged = () => {
      this.availableVoices = this.speechSynthesis.getVoices();
    };
  }

  getVoiceForLanguage(language) {
    const langMap = {
      'fr': 'fr-FR',
      'en': 'en-US',
      'wo': 'fr-FR'
    };

    const targetLang = langMap[language];
    return this.availableVoices.find(voice => 
      voice.lang.startsWith(targetLang)
    ) || this.availableVoices[0];
  }

  speakText(text, language = 'fr') {
    if (this.speechSynthesis.speaking) {
      this.speechSynthesis.cancel();
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = this.getVoiceForLanguage(language);
    utterance.rate = 0.8;
    utterance.pitch = 1;
    utterance.volume = 1;

    this.speechSynthesis.speak(utterance);
    return utterance;
  }

  stopSpeaking() {
    this.speechSynthesis.cancel();
  }

  isSpeaking() {
    return this.speechSynthesis.speaking;
  }
}

// Instances des services
export const translationService = new TranslationService();
export const ttsService = new TTSService();

// Service d'authentification
export const authService = {
  login: async (credentials) => {
    try {
      const response = await api.post('/login', credentials);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  register: async (userData) => {
    try {
      const response = await api.post('/register', userData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  getProfile: async () => {
    try {
      const response = await api.get('/me');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },
  logout: async () => {
    try {
      await api.post('/logout');
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }
};

// Service pour les oeuvres
export const oeuvreService = {
  getAll: async () => {
    try {
      const response = await api.get('/oeuvres');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/oeuvres/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  create: async (oeuvreData) => {
    try {
      const response = await api.post('/oeuvres', oeuvreData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  update: async (id, oeuvreData) => {
    try {
      const response = await api.post(`/oeuvres/${id}`, oeuvreData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/oeuvres/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  search: async (query) => {
    try {
      const response = await api.get('/oeuvres', { params: { search: query } });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  translateOeuvre: async (id, text) => {
    try {
      const translations = await translationService.translateToAllLanguages(text);
      const response = await api.put(`/oeuvres/${id}`, translations);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Service pour les avis
export const avisService = {
  getByOeuvre: async (oeuvreId) => {
    try {
      const response = await api.get(`/oeuvres/${oeuvreId}/avis`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  create: async (oeuvreId, avisData) => {
    try {
      const response = await api.post(`/oeuvres/${oeuvreId}/avis`, avisData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  update: async (avisId, avisData) => {
    try {
      const response = await api.put(`/avis/${avisId}`, avisData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  delete: async (avisId) => {
    try {
      const response = await api.delete(`/avis/${avisId}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getRecent: async () => {
    try {
      const response = await api.get('/avis/recent');
      return response.data;
    } catch (error) {
      console.warn('Endpoint /avis/recent non disponible, retour des données simulées');
      return [];
    }
  }
};

// Service pour les visites
export const visiteService = {
  markAsVisited: async (oeuvreId) => {
    try {
      const response = await api.post(`/oeuvres/${oeuvreId}/visite`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getHistory: async () => {
    try {
      const response = await api.get('/visites');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Service pour les parcours
export const parcoursService = {
  getAll: async () => {
    try {
      const response = await api.get('/parcours');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/parcours/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getFeatured: async () => {
    try {
      const response = await api.get('/parcours/featured');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getByDifficulty: async (difficulty) => {
    try {
      const response = await api.get(`/parcours/difficulty/${difficulty}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  create: async (parcoursData) => {
    try {
      const response = await api.post('/parcours', parcoursData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  update: async (id, parcoursData) => {
    try {
      const response = await api.put(`/parcours/${id}`, parcoursData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/parcours/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  addOeuvres: async (parcoursId, oeuvreIds) => {
    try {
      const response = await api.put(`/parcours/${parcoursId}`, {
        oeuvre_ids: oeuvreIds
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  removeOeuvre: async (parcoursId, oeuvreId) => {
    try {
      const parcours = await parcoursService.getById(parcoursId);
      const currentOeuvres = parcours.data.oeuvres.map(oeuvre => oeuvre.id);
      const updatedOeuvres = currentOeuvres.filter(id => id !== oeuvreId);
      
      return await parcoursService.addOeuvres(parcoursId, updatedOeuvres);
    } catch (error) {
      handleApiError(error);
    }
  },

  downloadImage: async (parcoursId) => {
    try {
      const response = await api.get(`/parcours/${parcoursId}/download-image`, {
        responseType: 'blob'
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  searchByTheme: async (theme) => {
    try {
      const allParcours = await parcoursService.getAll();
      const filteredParcours = allParcours.data.filter(parcours => 
        parcours.themes && parcours.themes.includes(theme)
      );
      return { success: true, data: filteredParcours };
    } catch (error) {
      handleApiError(error);
    }
  },

  getByTargetAudience: async (audience) => {
    try {
      const allParcours = await parcoursService.getAll();
      const filteredParcours = allParcours.data.filter(parcours => 
        parcours.target_audience === audience
      );
      return { success: true, data: filteredParcours };
    } catch (error) {
      handleApiError(error);
    }
  },

  getStats: async (parcoursId) => {
    try {
      const parcours = await parcoursService.getById(parcoursId);
      const stats = {
        oeuvres_count: parcours.data.oeuvres ? parcours.data.oeuvres.length : 0,
        estimated_duration: parcours.data.estimated_duration,
        difficulty: parcours.data.difficulty,
        target_audience: parcours.data.target_audience,
        themes: parcours.data.themes || []
      };
      return { success: true, data: stats };
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Utilitaires pour les parcours
export const parcoursUtils = {
  formatDuration: (minutes) => {
    if (!minutes) return 'Durée non spécifiée';
    
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    
    if (hours > 0) {
      return `${hours}h${mins > 0 ? `${mins}min` : ''}`;
    }
    return `${mins}min`;
  },

  getDifficultyColor: (difficulty) => {
    const colors = {
      'facile': '#10B981',
      'moyen': '#F59E0B',
      'difficile': '#EF4444'
    };
    return colors[difficulty] || '#6B7280';
  },

  getDifficultyIcon: (difficulty) => {
    const icons = {
      'facile': '🥉',
      'moyen': '🥈', 
      'difficile': '🥇'
    };
    return icons[difficulty] || '📊';
  },

  getAudienceIcon: (audience) => {
    const icons = {
      'enfants': '🧒',
      'scolaires': '🎓',
      'adultes': '👨‍💼',
      'experts': '🔬'
    };
    return icons[audience] || '👥';
  }
};

// Service pour les catégories
export const categoryService = {
  getAll: async () => {
    try {
      const response = await api.get('/categories');
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getBySlug: async (slug) => {
    try {
      const response = await api.get(`/categories/${slug}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getOeuvresByCategory: async (slug) => {
    try {
      const response = await api.get(`/categories/${slug}/oeuvres`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  create: async (categoryData) => {
    try {
      const response = await api.post('/categories', categoryData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  update: async (slug, categoryData) => {
    try {
      const response = await api.put(`/categories/${slug}`, categoryData);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  delete: async (slug) => {
    try {
      const response = await api.delete(`/categories/${slug}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Service pour les QR Codes
export const qrCodeService = {
  generateQrCode: async (oeuvreId) => {
    try {
      const response = await api.post(`/oeuvres/${oeuvreId}/generate-qr`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  downloadQrCode: async (oeuvreId) => {
    try {
      const response = await api.get(`/oeuvres/${oeuvreId}/download-qr`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `qr-code-${oeuvreId}.png`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'QR code téléchargé avec succès' };
    } catch (error) {
      handleApiError(error);
    }
  },

  getOeuvreByQrCode: async (qrCode) => {
    try {
      const response = await api.get(`/oeuvres/qr/${qrCode}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  scanQrCode: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.mediaDevices || !('BarcodeDetector' in window)) {
        reject(new Error('Scan des QR codes non supporté sur ce device'));
        return;
      }

      const barcodeDetector = new window.BarcodeDetector({ formats: ['qr_code'] });

      navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
        .then((stream) => {
          const video = document.createElement('video');
          video.srcObject = stream;
          video.setAttribute('playsinline', true);
          video.play();

          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');

          const scanFrame = () => {
            if (video.readyState === video.HAVE_ENOUGH_DATA) {
              canvas.width = video.videoWidth;
              canvas.height = video.videoHeight;
              context.drawImage(video, 0, 0, canvas.width, canvas.height);

              barcodeDetector.detect(canvas)
                .then((barcodes) => {
                  if (barcodes.length > 0) {
                    stream.getTracks().forEach(track => track.stop());
                    resolve(barcodes[0].rawValue);
                  } else {
                    requestAnimationFrame(scanFrame);
                  }
                })
                .catch(reject);
            } else {
              requestAnimationFrame(scanFrame);
            }
          };

          scanFrame();
        })
        .catch(reject);
    });
  },

  scanWithHtml5QrCode: (elementId) => {
    return new Promise((resolve, reject) => {
      if (typeof window.Html5QrcodeScanner === 'undefined') {
        reject(new Error('Librairie de scan QR code non chargée'));
        return;
      }

      const scanner = new window.Html5QrcodeScanner(
        elementId,
        {
          qrbox: {
            width: 250,
            height: 250
          },
          fps: 5
        },
        false
      );

      scanner.render(
        (decodedText) => {
          scanner.clear();
          resolve(decodedText);
        },
        (error) => {
          console.log('Scan en cours...', error);
        }
      );
    });
  },

  generateQrCodeUrl: (qrCode) => {
    return `${API_URL}/oeuvres/qr/${qrCode}`;
  },

  openOeuvreFromQrScan: async (qrCode) => {
    try {
      const oeuvreResponse = await qrCodeService.getOeuvreByQrCode(qrCode);
      
      if (oeuvreResponse.success) {
        const oeuvre = oeuvreResponse.data;
        localStorage.setItem('lastScannedOeuvre', JSON.stringify(oeuvre));
        
        return {
          success: true,
          oeuvre: oeuvre,
          redirectUrl: `/oeuvre/${oeuvre.id}`
        };
      } else {
        throw new Error('Œuvre non trouvée');
      }
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Service pour la lecture multimédia
export const mediaService = {
  playAudio: async (oeuvreId) => {
    try {
      const response = await api.get(`/oeuvres/${oeuvreId}/audio`, {
        responseType: 'blob'
      });
      
      const audioUrl = URL.createObjectURL(response.data);
      const audio = new Audio(audioUrl);
      
      return {
        play: () => audio.play(),
        pause: () => audio.pause(),
        stop: () => {
          audio.pause();
          audio.currentTime = 0;
        },
        getDuration: () => audio.duration,
        setOnEnded: (callback) => audio.onended = callback
      };
    } catch (error) {
      handleApiError(error);
    }
  },

  getVideoUrl: (oeuvreId) => {
    return `${API_URL}/oeuvres/${oeuvreId}/video`;
  },

  downloadMedia: async (oeuvreId, mediaType) => {
    try {
      const response = await api.get(`/oeuvres/${oeuvreId}/download/${mediaType}`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      const contentDisposition = response.headers['content-disposition'];
      let fileName = `${mediaType}-${oeuvreId}`;
      
      if (contentDisposition) {
        const fileNameMatch = contentDisposition.match(/filename="(.+)"/);
        if (fileNameMatch && fileNameMatch.length === 2) {
          fileName = fileNameMatch[1];
        }
      }
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      return { success: true, message: 'Média téléchargé avec succès' };
    } catch (error) {
      handleApiError(error);
    }
  },

  getImageUrl: (imagePath) => {
    if (!imagePath) return null;
    
    if (typeof imagePath === 'string' && !imagePath.startsWith('http')) {
      return `${API_URL}/storage/${imagePath}`;
    }
    
    return imagePath;
  }
};

// Utilitaires pour l'interface de scan
export const scanUtils = {
  isScanSupported: () => {
    return (
      navigator.mediaDevices && 
      (('BarcodeDetector' in window) || (typeof window.Html5QrcodeScanner !== 'undefined'))
    );
  },

  requestCameraPermission: async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      console.error('Permission caméra refusée:', error);
      return false;
    }
  },

  formatQrCodeForDisplay: (qrCode) => {
    if (!qrCode) return '';
    return qrCode.replace(/(ART\d{8}_)/, '$1\n').toUpperCase();
  },

  copyQrCodeToClipboard: async (qrCode) => {
    try {
      await navigator.clipboard.writeText(qrCode);
      return true;
    } catch (error) {
      console.error('Erreur lors de la copie:', error);
      return false;
    }
  }
};

// Service pour les œuvres de galerie
export const galerieService = {
  getAll: async (params = {}) => {
    try {
      const response = await api.get('/galerie-oeuvres', { params });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  getById: async (id) => {
    try {
      const response = await api.get(`/galerie-oeuvres/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  create: async (oeuvreData) => {
    try {
      const formData = new FormData();
      
      formData.append('titre', oeuvreData.titre);
      formData.append('description', oeuvreData.description || '');
      formData.append('artiste', oeuvreData.artiste || '');
      formData.append('annee_creation', oeuvreData.annee_creation || '');
      formData.append('dimensions', oeuvreData.dimensions || '');
      
      if (oeuvreData.image) {
        formData.append('image', oeuvreData.image);
      }

      const response = await api.post('/galerie-oeuvres', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  update: async (id, oeuvreData) => {
    try {
      const formData = new FormData();
      
      formData.append('titre', oeuvreData.titre);
      formData.append('description', oeuvreData.description || '');
      formData.append('artiste', oeuvreData.artiste || '');
      formData.append('annee_creation', oeuvreData.annee_creation || '');
      formData.append('dimensions', oeuvreData.dimensions || '');
      
      if (oeuvreData.image) {
        formData.append('image', oeuvreData.image);
      }

      formData.append('_method', 'PUT');

      const response = await api.post(`/galerie-oeuvres/${id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  },

  delete: async (id) => {
    try {
      const response = await api.delete(`/galerie-oeuvres/${id}`);
      return response.data;
    } catch (error) {
      handleApiError(error);
    }
  }
};

// Utilitaires pour la galerie
export const galerieUtils = {
  formatAnnee: (annee) => {
    return annee ? `Créée en ${annee}` : 'Année inconnue';
  },

  getImageUrl: (imageUrl) => {
    if (!imageUrl) return '/placeholder-oeuvre.jpg';
    if (imageUrl.startsWith('http')) return imageUrl;
    return `${API_URL.replace('/api', '')}/storage/${imageUrl}`;
  },

  truncateDescription: (description, maxLength = 150) => {
    if (!description) return 'Aucune description disponible';
    if (description.length <= maxLength) return description;
    return description.substring(0, maxLength) + '...';
  }
};

class VideoSynthesisService {
  constructor() {
    this.apiKey = process.env.REACT_APP_DID_API_KEY;
    this.baseURL = 'https://api.d-id.com';
  }

  async createVideoFromText(text, language = 'fr') {
    try {
      const avatarConfig = {
        'fr': 'lisa-dnkS0hK_c',
        'en': 'amy-l0bH0nA_c',
        'wo': 'lisa-dnkS0hK_c'
      };

      const avatarId = avatarConfig[language] || avatarConfig['fr'];

      const response = await fetch(`${this.baseURL}/talks`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          script: {
            type: 'text',
            input: text,
            provider: {
              type: 'microsoft',
              voice_id: this.getVoiceForLanguage(language),
              voice_config: {
                style: 'Friendly'
              }
            }
          },
          source_url: `${this.baseURL}/talks/images/${avatarId}`,
          config: {
            fluent: true,
            pad_audio: 0.0
          }
        })
      });

      if (!response.ok) {
        throw new Error(`Erreur API D-ID: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Erreur de synthèse vidéo:', error);
      throw new Error('Échec de la création de la vidéo');
    }
  }

  async getVideoStatus(talkId) {
    try {
      const response = await fetch(`${this.baseURL}/talks/${talkId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        }
      });

      if (!response.ok) {
        throw new Error(`Erreur API D-ID: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur de statut vidéo:', error);
      throw error;
    }
  }

  getVoiceForLanguage(language) {
    const voices = {
      'fr': 'fr-FR-DeniseNeural',
      'en': 'en-US-JennyNeural',
      'wo': 'fr-FR-DeniseNeural'
    };
    return voices[language] || voices['fr'];
  }

  async createLocalVideo(text, language = 'fr') {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      canvas.width = 800;
      canvas.height = 600;

      const stream = canvas.captureStream(25);
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'video/webm;codecs=vp9'
      });

      const chunks = [];
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunks.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'video/webm' });
        const url = URL.createObjectURL(blob);
        resolve({
          id: 'local-video',
          result_url: url,
          status: 'created'
        });
      };

      mediaRecorder.start();

      let startTime = Date.now();
      const duration = Math.max(3000, text.length * 100);

      const animate = () => {
        const currentTime = Date.now() - startTime;
        
        ctx.fillStyle = '#f5e6d3';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#5d4037';
        ctx.font = '30px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        const visibleChars = Math.min(text.length, Math.floor((currentTime / duration) * text.length));
        const visibleText = text.substring(0, visibleChars);
        
        const lines = this.wrapText(ctx, visibleText, canvas.width - 100);
        lines.forEach((line, index) => {
          ctx.fillText(line, canvas.width / 2, canvas.height / 2 + (index * 40) - ((lines.length - 1) * 20));
        });

        if (currentTime < duration) {
          requestAnimationFrame(animate);
        } else {
          mediaRecorder.stop();
        }
      };

      animate();
    });
  }

  wrapText(context, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = words[0];

    for (let i = 1; i < words.length; i++) {
      const word = words[i];
      const width = context.measureText(currentLine + " " + word).width;
      if (width < maxWidth) {
        currentLine += " " + word;
      } else {
        lines.push(currentLine);
        currentLine = word;
      }
    }
    lines.push(currentLine);
    return lines;
  }
}

// Créez l'instance et exportez-la
export const videoSynthesisService = new VideoSynthesisService();

// Fonctions de test de connexion API
export const testApiConnection = async () => {
  try {
    const response = await api.get('/health-check');
    return { 
      success: true, 
      data: response.data,
      status: response.status
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      status: error.response?.status
    };
  }
};

export const testApiRoot = async () => {
  try {
    const response = await api.get('/');
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      url: API_URL
    };
  }
};

export default api;