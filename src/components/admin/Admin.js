// src/components/admin/Admin.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { oeuvreService, visiteService, avisService } from '../../api';
import './Admin.css';

function Admin() {
  const [stats, setStats] = useState({
    totalOeuvres: 0,
    totalVisites: 0,
    totalAvis: 0,
    publishedOeuvres: 0
  });
  const [recentOeuvres, setRecentOeuvres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      const [oeuvresData, visitesData, avisData] = await Promise.all([
        oeuvreService.getAll(),
        visiteService.getHistory(),
        avisService.getRecent() // Vous devrez créer cette méthode dans api.js
      ]);

      const publishedOeuvres = oeuvresData.filter(oeuvre => oeuvre.is_published).length;
      
      setStats({
        totalOeuvres: oeuvresData.length,
        totalVisites: visitesData.length,
        totalAvis: avisData.length,
        publishedOeuvres
      });

      // Les 5 œuvres les plus récentes
      const sortedOeuvres = oeuvresData
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      setRecentOeuvres(sortedOeuvres);

    } catch (err) {
      setError(err.message || 'Erreur lors du chargement du dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="admin-loading">Chargement du dashboard...</div>;
  if (error) return <div className="admin-error">Erreur: {error}</div>;

  return (
    <div className="admin-dashboard">
      {/* En-tête du dashboard */}
      <div className="dashboard-header">
        <h1>Tableau de Bord Administratif</h1>
        <p>Bienvenue dans l'interface de gestion du musée</p>
      </div>

      {/* Cartes de statistiques */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">🎨</div>
          <div className="stat-content">
            <h3>{stats.totalOeuvres}</h3>
            <p>Œuvres totales</p>
            <span className="stat-subtitle">{stats.publishedOeuvres} publiées</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">👣</div>
          <div className="stat-content">
            <h3>{stats.totalVisites}</h3>
            <p>Visites enregistrées</p>
            <span className="stat-subtitle">Cette semaine</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <h3>{stats.totalAvis}</h3>
            <p>Avis des visiteurs</p>
            <span className="stat-subtitle">Derniers commentaires</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <h3>{(stats.totalVisites / Math.max(stats.totalOeuvres, 1)).toFixed(1)}</h3>
            <p>Visites par œuvre</p>
            <span className="stat-subtitle">Moyenne</span>
          </div>
        </div>
      </div>

      {/* Actions rapides */}
      <div className="quick-actions-section">
        <h2>Actions Rapides</h2>
        <div className="quick-actions-grid">
          <Link to="/admin/oeuvres/nouveau" className="action-card">
            <div className="action-icon">➕</div>
            <h3>Ajouter une œuvre</h3>
            <p>Créer une nouvelle œuvre dans la collection</p>
          </Link>

          <Link to="/admin/oeuvres" className="action-card">
            <div className="action-icon">📋</div>
            <h3>Gérer les œuvres</h3>
            <p>Voir et modifier toutes les œuvres</p>
          </Link>

          <Link to="/admin/parcours" className="action-card">
            <div className="action-icon">🗺️</div>
            <h3>Parcours</h3>
            <p>Gérer les parcours de visite</p>
          </Link>

          <Link to="/admin/analytics" className="action-card">
            <div className="action-icon">📈</div>
            <h3>Analytics</h3>
            <p>Voir les statistiques détaillées</p>
          </Link>
        </div>
      </div>

      {/* Œuvres récentes */}
      <div className="recent-section">
        <div className="section-header">
          <h2>Œuvres Récentes</h2>
          <Link to="/admin/oeuvres" className="view-all-link">
            Voir toutes →
          </Link>
        </div>
        
        <div className="recent-oeuvres-grid">
          {recentOeuvres.length > 0 ? (
            recentOeuvres.map(oeuvre => (
              <div key={oeuvre.id} className="recent-oeuvre-card">
                <div className="oeuvre-image">
                  {oeuvre.image_url ? (
                    <img src={oeuvre.image_url} alt={oeuvre.title} />
                  ) : (
                    <div className="no-image">🖼️</div>
                  )}
                </div>
                <div className="oeuvre-details">
                  <h4>{oeuvre.title}</h4>
                  <p className="oeuvre-description">
                    {oeuvre.description_fr?.substring(0, 80)}...
                  </p>
                  <div className="oeuvre-meta">
                    <span className={`status ${oeuvre.is_published ? 'published' : 'draft'}`}>
                      {oeuvre.is_published ? 'Publié' : 'Brouillon'}
                    </span>
                    <span className="date">
                      {new Date(oeuvre.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="no-oeuvres">
              <p>Aucune œuvre disponible</p>
              <Link to="/admin/oeuvres" className="btn-primary">
                Ajouter votre première œuvre
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Section d'activité récente */}
      <div className="activity-section">
        <h2>Activité Récente</h2>
        <div className="activity-list">
          <div className="activity-item">
            <div className="activity-icon">🎨</div>
            <div className="activity-content">
              <p><strong>Nouvelle œuvre ajoutée</strong> - "La Joconde"</p>
              <span className="activity-time">Il y a 2 heures</span>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">⭐</div>
            <div className="activity-content">
              <p><strong>Nouvel avis</strong> - 5 étoiles pour "Starry Night"</p>
              <span className="activity-time">Il y a 4 heures</span>
            </div>
          </div>
          
          <div className="activity-item">
            <div className="activity-icon">👣</div>
            <div className="activity-content">
              <p><strong>Visite enregistrée</strong> - Parcours "Art Moderne"</p>
              <span className="activity-time">Il y a 6 heures</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Admin;