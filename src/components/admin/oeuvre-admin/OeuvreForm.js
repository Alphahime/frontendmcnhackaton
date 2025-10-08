// src/components/admin/oeuvre-admin/OeuvreForm.js
import React, { useState, useEffect } from 'react';
import { oeuvreService } from '../../../api';
import './OeuvreForm.css';

function OeuvreForm({ oeuvre, onClose, onSubmit }) {
  const [formData, setFormData] = useState({
    title: '',
    description_fr: '',
    description_en: '',
    description_wo: '',
    qr_code: '',
    category_id: ''
    // Retirer is_published car il n'existe pas dans la table
  });
  const [files, setFiles] = useState({
    image: null,
    video: null,
    audio: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [previews, setPreviews] = useState({
    image: null,
    video: null,
    audio: null
  });

  useEffect(() => {
    if (oeuvre) {
      setFormData({
        title: oeuvre.title || '',
        description_fr: oeuvre.description_fr || '',
        description_en: oeuvre.description_en || '',
        description_wo: oeuvre.description_wo || '',
        qr_code: oeuvre.qr_code || '',
        category_id: oeuvre.category_id || ''
        // Retirer is_published
      });

      // Prévisualisations des médias existants
      // Le backend retourne image_full_url, video_full_url, audio_full_url via les accesseurs
      setPreviews({
        image: oeuvre.image_full_url || null,
        video: oeuvre.video_full_url || null,
        audio: oeuvre.audio_full_url || null
      });
    }
  }, [oeuvre]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    const file = fileList[0];
    
    if (file) {
      setFiles(prev => ({
        ...prev,
        [name]: file
      }));

      // Créer une prévisualisation
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews(prev => ({
          ...prev,
          [name]: e.target.result
        }));
      };
      
      if (name === 'image') {
        reader.readAsDataURL(file);
      } else if (name === 'video') {
        setPreviews(prev => ({
          ...prev,
          video: URL.createObjectURL(file)
        }));
      } else if (name === 'audio') {
        setPreviews(prev => ({
          ...prev,
          audio: URL.createObjectURL(file)
        }));
      }
    }
  };

  const removeFile = (fileType) => {
    setFiles(prev => ({
      ...prev,
      [fileType]: null
    }));
    setPreviews(prev => ({
      ...prev,
      [fileType]: null
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Créer FormData pour l'envoi des fichiers
      const submitData = new FormData();
      
      // Ajouter les données du formulaire (sans is_published)
      Object.keys(formData).forEach(key => {
        if (formData[key] !== null && formData[key] !== undefined && formData[key] !== '') {
          submitData.append(key, formData[key]);
        }
      });

      // Ajouter les fichiers
      Object.keys(files).forEach(key => {
        if (files[key]) {
          submitData.append(key, files[key]);
        }
      });

      console.log('Données envoyées:', {
        formData,
        files: Object.keys(files).filter(key => files[key])
      });

      if (oeuvre) {
        await oeuvreService.update(oeuvre.id, submitData);
      } else {
        await oeuvreService.create(submitData);
      }
      onSubmit();
    } catch (err) {
      console.error('Erreur détaillée:', err);
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="oeuvre-form-container">
      <div className="form-header">
        <h2>{oeuvre ? 'Modifier l\'œuvre' : 'Nouvelle œuvre'}</h2>
        <button onClick={onClose} className="btn-close">✕</button>
      </div>

      <form onSubmit={handleSubmit} className="oeuvre-form">
        {error && (
          <div className="form-error">
            <div className="error-icon">⚠️</div>
            {error}
          </div>
        )}

        <div className="form-group">
          <label htmlFor="title">Titre *</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            placeholder="Titre de l'œuvre"
          />
        </div>

        <div className="form-group">
          <label htmlFor="qr_code">Code QR *</label>
          <input
            type="text"
            id="qr_code"
            name="qr_code"
            value={formData.qr_code}
            onChange={handleChange}
            required
            placeholder="Code unique QR"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description_fr">Description (Français) *</label>
          <textarea
            id="description_fr"
            name="description_fr"
            value={formData.description_fr}
            onChange={handleChange}
            rows="4"
            required
            placeholder="Description en français"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description_en">Description (Anglais)</label>
          <textarea
            id="description_en"
            name="description_en"
            value={formData.description_en}
            onChange={handleChange}
            rows="4"
            placeholder="Description en anglais (optionnel)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="description_wo">Description (Wolof)</label>
          <textarea
            id="description_wo"
            name="description_wo"
            value={formData.description_wo}
            onChange={handleChange}
            rows="4"
            placeholder="Description en wolof (optionnel)"
          />
        </div>

        {/* Upload d'image */}
        <div className="form-group file-upload-group">
          <label htmlFor="image">Image</label>
          <div className="file-upload-container">
            <input
              type="file"
              id="image"
              name="image"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="image" className="file-upload-label">
              {previews.image ? 'Changer l\'image' : 'Choisir une image'}
            </label>
            {previews.image && (
              <div className="file-preview">
                <img src={previews.image} alt="Preview" className="image-preview" />
                <button 
                  type="button" 
                  onClick={() => removeFile('image')}
                  className="remove-file-btn"
                  title="Supprimer l'image"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <small className="file-hint">Formats: JPEG, PNG, JPG, GIF, WEBP (max 2MB)</small>
        </div>

        {/* Upload de vidéo */}
        <div className="form-group file-upload-group">
          <label htmlFor="video">Vidéo</label>
          <div className="file-upload-container">
            <input
              type="file"
              id="video"
              name="video"
              accept="video/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="video" className="file-upload-label">
              {previews.video ? 'Changer la vidéo' : 'Choisir une vidéo'}
            </label>
            {previews.video && (
              <div className="file-preview">
                <video controls className="video-preview">
                  <source src={previews.video} />
                </video>
                <button 
                  type="button" 
                  onClick={() => removeFile('video')}
                  className="remove-file-btn"
                  title="Supprimer la vidéo"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <small className="file-hint">Formats: MP4, AVI, MOV, WMV (max 10MB)</small>
        </div>

        {/* Upload d'audio */}
        <div className="form-group file-upload-group">
          <label htmlFor="audio">Audio</label>
          <div className="file-upload-container">
            <input
              type="file"
              id="audio"
              name="audio"
              accept="audio/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <label htmlFor="audio" className="file-upload-label">
              {previews.audio ? 'Changer l\'audio' : 'Choisir un fichier audio'}
            </label>
            {previews.audio && (
              <div className="file-preview">
                <audio controls className="audio-preview">
                  <source src={previews.audio} />
                </audio>
                <button 
                  type="button" 
                  onClick={() => removeFile('audio')}
                  className="remove-file-btn"
                  title="Supprimer l'audio"
                >
                  ✕
                </button>
              </div>
            )}
          </div>
          <small className="file-hint">Formats: MP3, WAV, OGG (max 5MB)</small>
        </div>

        <div className="form-group">
          <label htmlFor="category_id">Catégorie ID</label>
          <input
            type="number"
            id="category_id"
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            placeholder="ID numérique de la catégorie"
            min="1"
          />
        </div>

        {/* Retirer la checkbox is_published */}

        <div className="form-actions">
          <button
            type="button"
            onClick={onClose}
            className="btn-cancel"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            className="btn-submit"
            disabled={loading}
          >
            {loading ? (
              <div className="btn-loading">
                <div className="spinner"></div>
                <span>Sauvegarde...</span>
              </div>
            ) : (
              oeuvre ? 'Modifier' : 'Créer'
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

export default OeuvreForm;