import React, { useState, useEffect } from 'react';
import './Home.css';
import Oeuvres from '../oeuvres/Oeuvres';
import Parcours from '../parcours/Parcours';
import bannerImage from '../../assets/images/gaminexperienceimmersive.png';
import Header from '../Header/Header';  
import Fonctionnalites from '../fonctionnalites/Fonctionnalites';
import Temoignages from '../temoignages/Temoignages';
import Footer from '../footer/Footer';
function Home() {
  const [isVisible, setIsVisible] = useState(false);
  const [textIndex, setTextIndex] = useState(0);
  const texts = ["Découvrez la richesse", "Explorez la diversité", "Célébrez l'héritage"];

  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setTextIndex((prev) => (prev + 1) % texts.length);
    }, 3000);

    return () => clearInterval(interval);
  }, [texts.length]);

  return (
    <div className="home">
      <Header />
      <div 
        className="banner"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(139,69,19,0.4) 50%, rgba(0,0,0,0.7) 100%), url(${bannerImage})`
        }}
      >
        {/* Particules flottantes */}
        <div className="floating-particles">
          {[...Array(15)].map((_, i) => (
            <div key={i} className="particle" style={{
              left: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`
            }}></div>
          ))}
        </div>

        {/* Éléments décoratifs */}
        <div className="decorative-elements">
          <div className="circle-decor decor-1"></div>
          <div className="circle-decor decor-2"></div>
          <div className="circle-decor decor-3"></div>
        </div>

        {/* Contenu principal */}
        <div className={`banner-content ${isVisible ? 'visible' : ''}`}>
          <div className="title-wrapper">
            <h1 className="main-title">
              <span className="title-line">Musée de la</span>
              <span className="title-line highlight">Civilisation noire</span>
            </h1>
          </div>
          
          <div className="text-carousel">
            <p className="subtitle">
              {texts[textIndex]} 
              <span className="typing-cursor">|</span>
            </p>
            <p className="static-text">de notre patrimoine culturel</p>
          </div>

          <div className="cta-container">
            <button className="cta-buttonhome">
              <span className="button-texthome">Explorer</span>
              <div className="button-sparklehome">
                <div className="sparklehome"></div>
                <div className="sparklehome"></div>
                <div className="sparklehome"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="scroll-arrow"></div>
        </div>
      </div>
      <Oeuvres />
      <Parcours />
      <Fonctionnalites />
      <Temoignages />
      <Footer />
    </div>
  );
}

export default Home;