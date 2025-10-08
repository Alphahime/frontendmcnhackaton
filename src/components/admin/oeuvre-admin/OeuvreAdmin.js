// src/components/admin/oeuvre-admin/OeuvreAdmin.js
import React, { useState, useEffect } from 'react';
import { oeuvreService } from '../../../api';
import OeuvreList from './OeuvreList';
import OeuvreForm from './OeuvreForm';
import './OeuvreAdmin.css';

function OeuvreAdmin() {
  const [oeuvres, setOeuvres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingOeuvre, setEditingOeuvre] = useState(null);

  useEffect(() => {
    loadOeuvres();
  }, []);

  const loadOeuvres = async () => {
    try {
      setLoading(true);
      const data = await oeuvreService.getAll();
      setOeuvres(data);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des œuvres');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingOeuvre(null);
    setShowForm(true);
  };

  const handleEdit = (oeuvre) => {
    setEditingOeuvre(oeuvre);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette œuvre ?')) {
      try {
        await oeuvreService.delete(id);
        await loadOeuvres();
      } catch (err) {
        alert('Erreur lors de la suppression: ' + err.message);
      }
    }
  };

  const handleFormClose = () => {
    setShowForm(false);
    setEditingOeuvre(null);
  };

  const handleFormSubmit = async () => {
    await loadOeuvres();
    setShowForm(false);
    setEditingOeuvre(null);
  };

  if (loading) return <div className="admin-loading">Chargement des œuvres...</div>;
  if (error) return <div className="admin-error">Erreur: {error}</div>;

  return (
    <div className="oeuvre-admin-container">
      <div className="admin-header">
        <h1>Gestion des Œuvres</h1>
        <button className="btn-create" onClick={handleCreate}>
          + Ajouter une œuvre
        </button>
      </div>

      {showForm ? (
        <OeuvreForm
          oeuvre={editingOeuvre}
          onClose={handleFormClose}
          onSubmit={handleFormSubmit}
        />
      ) : (
        <OeuvreList
          oeuvres={oeuvres}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onRefresh={loadOeuvres}
        />
      )}
    </div>
  );
}

export default OeuvreAdmin;