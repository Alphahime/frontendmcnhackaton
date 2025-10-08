// src/components/Auth/Connexion.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService } from '../../api';
import './Connexion.css';

function Connexion() {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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

    try {
      const response = await authService.login({
        email: formData.email,
        password: formData.password
      });

      console.log('Réponse connexion:', response);

      if (response && response.token) {
        // Stocker le token JWT
        localStorage.setItem('token', response.token);
        
        // Récupérer les infos user pour déterminer le rôle
        let user = null;
        
        if (response.user) {
          // Si user inclus dans la réponse de connexion
          user = response.user;
          localStorage.setItem('user', JSON.stringify(user));
        } else {
          // Sinon, récupérer via le endpoint /me
         try {
  const userResponse = await authService.getProfile(); // Changez getCurrentUserProfile en getProfile
  user = userResponse;
  localStorage.setItem('user', JSON.stringify(user));
} catch (userError) {
  console.log('Impossible de récupérer les infos user:', userError);
}
        }
        
        // REDIRECTION EN FONCTION DU RÔLE
        if (user && user.role === 'admin') {
          navigate('/admin'); // Redirection vers le dashboard admin
        } else {
          navigate('/'); // Redirection vers la page d'accueil pour les users normaux
        }
        
      } else {
        setError('Email ou mot de passe incorrect');
      }
    } catch (err) {
      console.error('Erreur de connexion:', err);
      
      if (err.message) {
        setError(err.message);
      } else if (err.error) {
        setError(err.error);
      } else {
        setError('Email ou mot de passe incorrect');
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
        <div className="floating-shapes shape-3"></div>
        <div className="color-splash splash-1"></div>
        <div className="color-splash splash-2"></div>
      </div>

      <div className="auth-card">
        <div className="auth-header">
          <h1 className="auth-title">
            <span className="title-main">Bienvenue</span>
            <span className="title-accent">à nouveau</span>
          </h1>
          <p className="auth-subtitle">
            Connectez-vous à votre compte
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
              placeholder="Votre mot de passe"
            />
          </div>

          <div className="form-options">
            <label className="remember-me">
              <input type="checkbox" />
              <span className="checkmark"></span>
              Se souvenir de moi
            </label>
            <Link to="/mot-de-passe-oublie" className="forgot-password">
              Mot de passe oublié ?
            </Link>
          </div>

          <button 
            type="submit" 
            className="auth-btn primary"
            disabled={loading}
          >
            {loading ? (
              <div className="btn-loading">
                <div className="spinner"></div>
                <span>Connexion...</span>
              </div>
            ) : (
              <span>Se connecter</span>
            )}
          </button>
        </form>

        <div className="auth-footer">
          <p className="auth-link-text">
            Pas encore membre ?{' '}
            <Link to="/inscription" className="auth-link">
              Créer un compte
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

export default Connexion;