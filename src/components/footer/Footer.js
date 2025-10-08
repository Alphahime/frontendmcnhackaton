import React from 'react';
import { 
  FaMapMarkerAlt, 
  FaPhone, 
  FaEnvelope, 
  FaHeart
} from 'react-icons/fa';
import './Footer.css';

const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer-container">
        
        {/* Main Content */}
        <div className="footer-content">
          
          {/* Brand Section */}
          <div className="footer-brand">
            <h3 className="footer-logo">MuséeArt</h3>
            <p className="footer-description">
              Découvrez la beauté de l'art africain à travers nos collections uniques.
            </p>
          </div>

          {/* Quick Links */}
          <div className="footer-section">
            <h4 className="section-title">Navigation</h4>
            <ul className="footer-links">
              <li><a href="/oeuvres">Œuvres</a></li>
              <li><a href="/parcours">Parcours</a></li>
              <li><a href="/galerie">Galerie</a></li>
              <li><a href="/contact">Contact</a></li>
            </ul>
          </div>

          {/* Contact Info */}
          <div className="footer-section">
            <h4 className="section-title">Contact</h4>
            <div className="contact-info">
              <div className="contact-item">
                <FaMapMarkerAlt className="contact-icon" />
                <span>Dakar, Sénégal</span>
              </div>
              <div className="contact-item">
                <FaPhone className="contact-icon" />
                <span>+221 33 800 00 00</span>
              </div>
              <div className="contact-item">
                <FaEnvelope className="contact-icon" />
                <span>contact@museeart.sn</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom">
          <p className="footer-copyright">
            Fait avec <FaHeart className="heart-icon" /> au Sénégal • 
            &copy; 2024 MuséeArt
          </p>
        </div>

      </div>
    </footer>
  );
};

export default Footer;