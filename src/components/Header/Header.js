import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Header.css';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [activeLink, setActiveLink] = useState('/');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setActiveLink(location.pathname);
    checkAuthStatus();
  }, [location]);

  const checkAuthStatus = () => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsLoggedIn(true);
      setUser(JSON.parse(userData));
    } else {
      setIsLoggedIn(false);
      setUser(null);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsLoggedIn(false);
    setUser(null);
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const menuItems = [
    { path: '/', label: 'Accueil' },
    { path: '/about', label: 'A propos' },
    { path: '/recherche-oeuvres', label: 'Œuvres' },
    { path: '/galerie', label: 'Visite virtuelle' }
  ];

  return (
    <header className={`header ${isScrolled ? 'scrolled' : ''} ${isMobileMenuOpen ? 'menu-open' : ''}`}>
      {/* Background effects */}
      <div className="header-background"></div>
      <div className="header-glow"></div>
      
      <div className="header-container">
        {/* Logo avec animation */}
        <Link 
          to="/" 
          className="logo"
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.1) rotate(-5deg)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1) rotate(0deg)';
          }}
        >
          <div className="logo-icon">
            <div className="logo-circle"></div>
            <div className="logo-bar"></div>
          </div>
          <span className="logo-text">
            Musée<span className="logo-accent">Art</span>
          </span>
        </Link>

        {/* Navigation Desktop */}
        <nav className="nav-desktop">
          <div className="nav-links">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${activeLink === item.path ? 'active' : ''}`}
                onMouseEnter={(e) => {
                  e.target.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = 'translateY(0)';
                }}
              >
                <span className="link-text">{item.label}</span>
                <div className="link-underline"></div>
              </Link>
            ))}
          </div>
        </nav>

        {/* Section Authentification */}
        <div className="auth-section">
          {isLoggedIn ? (
            <div className="user-menu">
              <div className="user-info">
                <span className="user-name">Bonjour, {user?.name}</span>
                <div className="user-actions">
                  <Link 
                    to="/profil"
                    className="profile-btn"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profil
                  </Link>
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin"
                      className="admin-btn"
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      Admin
                    </Link>
                  )}
                  <button 
                    className="logout-btn"
                    onClick={handleLogout}
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link 
              to="/connexion"
              className="login-btn"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <span className="btn-text">Connexion</span>
              <div className="btn-glow"></div>
              <div className="btn-sparkles">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="sparkle" style={{ animationDelay: `${i * 0.2}s` }}></div>
                ))}
              </div>
            </Link>
          )}
        </div>

        {/* Menu Mobile Burger */}
        <button 
          className={`mobile-menu-btn ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        >
          <span></span>
          <span></span>
          <span></span>
        </button>
      </div>

      {/* Menu Mobile */}
      <div className={`mobile-menu ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="mobile-menu-backdrop" onClick={() => setIsMobileMenuOpen(false)}></div>
        <div className="mobile-menu-content">
          <div className="mobile-menu-header">
            <Link 
              to="/" 
              className="mobile-logo"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              MuséeArt
            </Link>
          </div>
          <nav className="mobile-nav">
            {menuItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`mobile-nav-link ${activeLink === item.path ? 'active' : ''}`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <span className="mobile-link-text">{item.label}</span>
                <div className="mobile-link-indicator"></div>
              </Link>
            ))}
          </nav>
          
          <div className="mobile-auth">
            {isLoggedIn ? (
              <div className="mobile-user-menu">
                <div className="mobile-user-info">
                  <span className="mobile-user-name">Connecté en tant que {user?.name}</span>
                </div>
                <Link 
                  to="/profil"
                  className="mobile-profile-btn"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mon Profil
                </Link>
                {user?.role === 'admin' && (
                  <Link 
                    to="/admin"
                    className="mobile-admin-btn"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Administration
                  </Link>
                )}
                <button 
                  className="mobile-logout-btn"
                  onClick={handleLogout}
                >
                  Déconnexion
                </button>
              </div>
            ) : (
              <Link 
                to="/connexion"
                className="mobile-login-btn"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Connexion
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;