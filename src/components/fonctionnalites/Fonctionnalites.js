import React from 'react';
import { FaQrcode, FaGlobe, FaHeadphones, FaHistory, FaUniversalAccess } from 'react-icons/fa';
import './Fonctionnalites.css';

const Fonctionnalites = () => {
  const fonctionnalites = [
    {
      id: 1,
      icone: <FaQrcode />,
      titre: 'Scan QR Code',
      description: 'Scan des œuvres via QR Code avec redirection vers une fiche descriptive complète (texte, audio, vidéo)',
    },
    {
      id: 2,
      icone: <FaGlobe />,
      titre: 'Multilingue',
      description: 'Descriptions disponibles en Français, Anglais et Wolof pour une accessibilité internationale',
    },
    {
      id: 3,
      icone: <FaHeadphones />,
      titre: 'Audio Description',
      description: 'Option d\'écoute audio de la description pour une expérience plus inclusive',
    },
    {
      id: 4,
      icone: <FaHistory />,
      titre: 'Historique Culturel',
      description: 'Accès à l\'historique et aux informations culturelles liées à chaque œuvre',
    },
  ];

  return (
    <section className="fonctionnalites" id="fonctionnalites">
      {/* Background Artistic Elements */}
      <div className="fonctionnalites-art-background">
        <div className="fonctionnalites-floating-shapes fonctionnalites-shape-1"></div>
        <div className="fonctionnalites-floating-shapes fonctionnalites-shape-2"></div>
        <div className="fonctionnalites-floating-shapes fonctionnalites-shape-3"></div>
      </div>

      <div className="fonctionnalites-container">
        <div className="fonctionnalites-hero">
          <h2 className="fonctionnalites-gallery-title">
            <span className="fonctionnalites-title-main">Fonctionnalités</span>
            <span className="fonctionnalites-title-accent">Innovantes</span>
          </h2>
          <p className="fonctionnalites-gallery-subtitle">
            Découvrez une expérience muséale enrichie et accessible à tous
          </p>
        </div>
        
        <div className="fonctionnalites-grid">
          {fonctionnalites.map((fonctionnalite) => (
            <div key={fonctionnalite.id} className="carte-fonctionnalite">
              <div className="carte-icone">
                {fonctionnalite.icone}
              </div>
              <h3 className="carte-titre">{fonctionnalite.titre}</h3>
              <p className="carte-description">{fonctionnalite.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Fonctionnalites;