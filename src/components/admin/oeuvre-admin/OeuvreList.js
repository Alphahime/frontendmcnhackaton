// src/components/admin/oeuvre-admin/OeuvreList.js
import React, { useState } from 'react';
import './OeuvreList.css';

function OeuvreList({ oeuvres, onEdit, onDelete, onRefresh }) {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOeuvres = oeuvres.filter(oeuvre =>
    oeuvre.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    oeuvre.description_fr?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="oeuvre-list-container">
      <div className="list-controls">
        <div className="search-box">
          <input
            type="text"
            placeholder="Rechercher une œuvre..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <button onClick={onRefresh} className="btn-refresh">
          🔄 Actualiser
        </button>
      </div>

      <div className="oeuvres-grid">
        {filteredOeuvres.length > 0 ? (
          filteredOeuvres.map(oeuvre => (
            <div key={oeuvre.id} className="oeuvre-card">
              <div className="oeuvre-image">
                {oeuvre.image_url ? (
                  <img src={oeuvre.image_url} alt={oeuvre.title} />
                ) : (
                  <div className="no-image">Pas d'image</div>
                )}
              </div>
              
              <div className="oeuvre-info">
                <h3 className="oeuvre-title">{oeuvre.title}</h3>
                <p className="oeuvre-description">
                  {oeuvre.description_fr?.substring(0, 100)}...
                </p>
                
                <div className="oeuvre-meta">
                  <span className={`status ${oeuvre.is_published ? 'published' : 'draft'}`}>
                    {oeuvre.is_published ? 'Publié' : 'Brouillon'}
                  </span>
                  <span className="date">
                    Créé le: {new Date(oeuvre.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="oeuvre-actions">
                <button 
                  onClick={() => onEdit(oeuvre)}
                  className="btn-edit"
                >
                  ✏️ Modifier
                </button>
                <button 
                  onClick={() => onDelete(oeuvre.id)}
                  className="btn-delete"
                >
                  🗑️ Supprimer
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="no-results">
            {searchTerm ? 'Aucune œuvre trouvée' : 'Aucune œuvre disponible'}
          </div>
        )}
      </div>
    </div>
  );
}

export default OeuvreList;