import React from 'react';
import { FaStar, FaQuoteLeft, FaUser } from 'react-icons/fa';
import './Temoignages.css';

const Temoignages = () => {
  const temoignages = [
    {
      id: 1,
      nom: "Mariama D.",
      role: "Visiteuse",
      note: 5,
      commentaire: "Une expérience muséale exceptionnelle ! Les QR codes rendent la visite tellement interactive et enrichissante.",
      avatar: null
    },
    {
      id: 2,
      nom: "Jean P.",
      role: "Professeur d'histoire",
      note: 4,
      commentaire: "Parfait pour mes élèves. Les descriptions multilingues et l'audio ont rendu l'apprentissage accessible à tous.",
      avatar: null
    },
    {
      id: 3,
      nom: "Aminata S.",
      role: "Touriste internationale",
      note: 5,
      commentaire: "Grâce aux traductions en wolof, j'ai pu partager cette belle expérience avec ma famille. Magnifique initiative !",
      avatar: null
    },
    {
      id: 4,
      nom: "Pierre L.",
      role: "Personne malvoyante",
      note: 5,
      commentaire: "L'audio description a transformé ma visite. Pour la première fois, j'ai pu profiter pleinement d'un musée.",
      avatar: null
    },
    {
      id: 5,
      nom: "Sophie M.",
      role: "Mère de famille",
      note: 4,
      commentaire: "Mes enfants ont adoré le scan des QR codes. Une façon moderne et amusante de découvrir l'art ensemble.",
      avatar: null
    },
    {
      id: 6,
      nom: "Tamsir K.",
      role: "Expert en art",
      note: 5,
      commentaire: "Les informations historiques détaillées et la qualité des contenus audio sont remarquables. Bravo !",
      avatar: null
    }
  ];

  const renderStars = (note) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar 
        key={index} 
        className={`star ${index < note ? 'filled' : 'empty'}`}
      />
    ));
  };

  return (
    <section className="temoignages" id="temoignages">
      {/* Background Artistic Elements */}
      <div className="temoignages-art-background">
        <div className="temoignages-floating-shapes temoignages-shape-1"></div>
        <div className="temoignages-floating-shapes temoignages-shape-2"></div>
        <div className="temoignages-floating-shapes temoignages-shape-3"></div>
      </div>

      <div className="temoignages-container">
        <div className="temoignages-hero">
          <h2 className="temoignages-gallery-title">
            <span className="temoignages-title-main">Ils parlent</span>
            <span className="temoignages-title-accent">de nous</span>
          </h2>
          <p className="temoignages-gallery-subtitle">
            Découvrez les retours de nos visiteurs sur leur expérience au musée
          </p>
        </div>

        <div className="temoignages-grid">
          {temoignages.map((temoignage, index) => (
            <div 
              key={temoignage.id} 
              className="temoignage-card"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="quote-icon">
                <FaQuoteLeft />
              </div>
              
              <div className="temoignage-note">
                {renderStars(temoignage.note)}
              </div>

              <p className="temoignage-commentaire">
                "{temoignage.commentaire}"
              </p>

              <div className="temoignage-auteur">
                <div className="auteur-avatar">
                  {temoignage.avatar ? (
                    <img src={temoignage.avatar} alt={temoignage.nom} />
                  ) : (
                    <FaUser className="default-avatar" />
                  )}
                </div>
                <div className="auteur-info">
                  <h4 className="auteur-nom">{temoignage.nom}</h4>
                  <p className="auteur-role">{temoignage.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="temoignages-cta">
          <p>Partagez votre expérience avec nous</p>
          <button className="btn-temoignage">
            Laisser un témoignage
          </button>
        </div>
      </div>
    </section>
  );
};

export default Temoignages;