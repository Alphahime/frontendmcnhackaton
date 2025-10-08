import React from 'react';
import { 
  FaBullseye, 
  FaHistory, 
  FaPalette, 
  FaUniversalAccess,
  FaBuilding,
  FaArtstation,
  FaGlobeAfrica,
  FaAward,
  FaUsers,
  FaMapMarkerAlt,
  FaHeart,
  FaLightbulb,
  FaHandshake
} from 'react-icons/fa';
import { GiEgyptianTemple, GiAfrica } from 'react-icons/gi';
import './About.css';
import Header from '../Header/Header'; 
import Footer from '../footer/Footer';
const About = () => {
  return (
    <div className="about-master">
          <Header />
      {/* Bannière animée */}
      {/* <div className="animated-banner">
        {/* <div className="banner-content">
          <div className="banner-icon">
            <GiEgyptianTemple />
          </div>
          <div className="banner-text">
            <h1>Musée des Civilisations Noires</h1>
            <p>Préserver • Célébrer • Inspirer</p>
          </div>
        </div> */}
        {/* <div className="banner-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle" style={{
              animationDelay: `${i * 0.3}s`,
              left: `${Math.random() * 100}%`
            }}></div>
          ))}
        </div>
      </div> */} 

      {/* Background Artistic Elements */}
      <div className="about-art-background">
        <div className="about-floating-shapes about-shape-1"></div>
        <div className="about-floating-shapes about-shape-2"></div>
        <div className="about-floating-shapes about-shape-3"></div>
        <div className="about-floating-shapes about-shape-4"></div>
      </div>

      {/* Hero Section */}
      <div className="about-hero">
        <div className="about-hero-content">
          <h1 className="about-gallery-title">
            <span className="about-title-main">À propos du</span>
            <span className="about-title-accent">Musée des civilisations noires</span>
          </h1>
          <p className="about-gallery-subtitle">
            Un lieu emblématique dédié à la préservation et à la célébration du patrimoine africain
          </p>
          <div className="about-hero-stats">
            <div className="hero-stat">
              <FaBuilding className="hero-stat-icon" />
              <span>14,000 m² d'exposition</span>
            </div>
            <div className="hero-stat">
              <FaArtstation className="hero-stat-icon" />
              <span>5,000+ œuvres</span>
            </div>
            <div className="hero-stat">
              <FaGlobeAfrica className="hero-stat-icon" />
              <span>3 langues</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="about-content">
        <div className="about-section">
          <div className="about-card">
            <div className="about-card-header">
              <div className="about-icon-wrapper mission">
                <FaBullseye className="about-card-icon" />
              </div>
              <h2>Notre mission</h2>
            </div>
            <p>
              Le Musée des Civilisations Noires a pour mission de préserver, promouvoir et diffuser 
              les richesses culturelles et historiques des civilisations noires à travers le monde. 
              Nous nous engageons à rendre accessible ce patrimoine exceptionnel à tous les publics.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-header">
              <div className="about-icon-wrapper history">
                <FaHistory className="about-card-icon" />
              </div>
              <h2>Notre histoire</h2>
            </div>
            <p>
              Inauguré en 2018 à Dakar, le MCN est un projet panafricain qui incarne la vision 
              du premier président sénégalais Léopold Sédar Senghor. Ce joyau architectural 
              s'étend sur 14 000 m² et représente un pont entre le passé, le présent et l'avenir 
              des civilisations noires.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-header">
              <div className="about-icon-wrapper collection">
                <FaPalette className="about-card-icon" />
              </div>
              <h2>Nos collections</h2>
            </div>
            <p>
              Notre musée abrite des collections permanentes et temporaires couvrant l'art, 
              l'histoire, l'archéologie et l'ethnographie de l'Afrique et de sa diaspora. 
              Des œuvres contemporaines aux artefacts historiques, chaque pièce raconte une 
              partie de l'histoire des civilisations noires.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-header">
              <div className="about-icon-wrapper accessibility">
                <FaUniversalAccess className="about-card-icon" />
              </div>
              <h2>Accessibilité</h2>
            </div>
            <p>
              Nous croyons en une culture accessible à tous. C'est pourquoi nous avons développé 
              cette plateforme numérique avec des fonctionnalités multilingues, des descriptions 
              audio et des parcours adaptés pour garantir une expérience inclusive à chaque visiteur.
            </p>
          </div>

          {/* Nouvelles cartes */}
          <div className="about-card">
            <div className="about-card-header">
              <div className="about-icon-wrapper innovation">
                <FaLightbulb className="about-card-icon" />
              </div>
              <h2>Innovation</h2>
            </div>
            <p>
              Nous intégrons les technologies modernes pour enrichir l'expérience muséale. 
              Réalité augmentée, visites virtuelles et installations interactives permettent 
              de redécouvrir les trésors des civilisations noires sous un angle contemporain.
            </p>
          </div>

          <div className="about-card">
            <div className="about-card-header">
              <div className="about-icon-wrapper engagement">
                <FaHandshake className="about-card-icon" />
              </div>
              <h2>Engagement communautaire</h2>
            </div>
            <p>
              Le MCN s'engage activement auprès des communautés locales et internationales 
              à travers des programmes éducatifs, des ateliers créatifs et des partenariats 
              avec des institutions culturelles du monde entier.
            </p>
          </div>
        </div>

        {/* Statistics Section */}
        <div className="about-stats-section">
          <h2 className="stats-title">Le musée en chiffres</h2>
          <div className="about-stats">
            <div className="stat-item">
              <div className="stat-icon-wrapper">
                <FaBuilding className="stat-icon" />
              </div>
              <h3>14,000 m²</h3>
              <p>Surface d'exposition</p>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrapper">
                <FaArtstation className="stat-icon" />
              </div>
              <h3>5,000+</h3>
              <p>Œuvres cataloguées</p>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrapper">
                <FaGlobeAfrica className="stat-icon" />
              </div>
              <h3>3 langues</h3>
              <p>Français, Anglais, Wolof</p>
            </div>
            <div className="stat-item">
              <div className="stat-icon-wrapper">
                <FaAward className="stat-icon" />
              </div>
              <h3>2018</h3>
              <p>Année d'inauguration</p>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="about-vision">
          <div className="vision-content">
            <FaUsers className="vision-icon" />
            <h2>Notre vision</h2>
            <p>
              Être la référence mondiale dans la préservation et la mise en valeur des civilisations noires, 
              en créant un espace de dialogue, d'éducation et d'inspiration pour les générations présentes et futures.
            </p>
            <div className="vision-location">
              <FaMapMarkerAlt className="location-icon" />
              <span>Dakar, Sénégal - cœur de l'Afrique de l'Ouest</span>
            </div>
          </div>
        </div>
      </div>
       <Footer />
    </div>
  );
};

export default About;