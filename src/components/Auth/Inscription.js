// src/components/Auth/Inscription.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api';
import './Inscription.css';

function Inscription() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Validation des mots de passe
    if (formData.password !== formData.password_confirmation) {
      setError('Les mots de passe ne correspondent pas');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      });

      console.log('Réponse complète:', response); // Pour debug

      if (response && response.token) {
        // CORRECTION ICI : utiliser response.token au lieu de response.access_token
        localStorage.setItem('token', response.token);
        localStorage.setItem('user', JSON.stringify(response.user));
        
        // Redirection vers la page d'accueil
        navigate('/');
      } else {
        setError('Réponse inattendue du serveur');
      }
    } catch (err) {
      // Amélioration de la gestion d'erreur
      console.error('Erreur d\'inscription:', err);
      
      if (err.errors) {
        // Gestion des erreurs de validation Laravel
        const firstError = Object.values(err.errors)[0][0];
        setError(firstError);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError('Erreur lors de l\'inscription');
      }
    } finally {
      setLoading(false);
    }
  };

  // Le reste du code reste identique...
  return (
    <div className="auth-container">
      {/* Background Artistic Elements */}
      <div className="auth-background">
        <div className="floating-shapes shape-1"></div>
        <div className="floating-shapes shape-2"></div>
        <div className="color-splash splash-1"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            <span className="title-main">Créer un</span>
            <span className="title-accent">Compte</span>
          </h1>
          <p className="auth-subtitle">
            Rejoignez notre communauté artistique
          </p>
        </div>

        {error && (
          <div className="error-message">
            <div className="error-icon">⚠️</div>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form">
          <div className="form-group">
            <label htmlFor="name" className="form-label">
              Nom complet
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Votre nom complet"
            />
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="votre@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Au moins 6 caractères"
              minLength="6"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password_confirmation" className="form-label">
              Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="password_confirmation"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              required
              className="form-input"
              placeholder="Répétez votre mot de passe"
            />
          </div>

          <button 
            type="submit" 
            className="auth-btn primary"
            disabled={loading}
          >
            {loading ? (
              <div className="btn-loading">
                <div className="spinner"></div>
                <span>Inscription...</span>
              </div>
            ) : (
              <span>S'inscrire</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-link-text">
            Déjà membre ?{' '}
            <Link to="/connexion" className="auth-link">
              Se connecter
            </Link>
          </p>
        </div>

        <div className="auth-decoration">
          <div className="decoration-item"></div>
          <div className="decoration-item"></div>
          <div className="decoration-item"></div>
        </div>
      </div>
    </div>
  );
}

export default Inscription;