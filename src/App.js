import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/home/Home';
import Oeuvres from './components/oeuvres/Oeuvres';
import OeuvreDetail from './components/oeuvre-detail/OeuvreDetail';
import Parcours from './components/parcours/Parcours';
import ParcoursDetail from './components/parcours-detail/ParcoursDetail';
import Profil from './components/profil/Profil';
import Avis from './components/avis/Avis';
import VisiteVirtuelle from './components/visite-virtuelle/VisiteVirtuelle';
import Admin from './components/admin/Admin';
import OeuvreForm from './components/admin/oeuvre-admin/OeuvreForm';
import Connexion from './components/Auth/Connexion';
import Inscription from './components/Auth/Inscription';
import ProtectedRoute from './components/Auth/ProtectedRoute';
import AdminRoute from './components/Auth/AdminRoute';
import Galerie from './components/galerie/Galerie';
import DetailsGalerie from './components/galerie/DetailsGalerie';
import About from './components/about/About';
import SearchArtwork from './components/SearchArtwork/SearchArtwork';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          {/* Routes publiques */}
          <Route path="/" element={<Home />} />
          <Route path="/oeuvres" element={<Oeuvres />} />
          <Route path="/oeuvre/:id" element={<OeuvreDetail />} />
          <Route path="/parcours" element={<Parcours />} />
          <Route path="/parcours/:id" element={<ParcoursDetail />} />
          <Route path="/visite-virtuelle" element={<VisiteVirtuelle />} />
          <Route path="/galerie" element={<Galerie />} />
          <Route path="/galerie/:id" element={<DetailsGalerie />} />
          {/* Routes d'authentification */}
          <Route path="/connexion" element={<Connexion />} />
          <Route path="/inscription" element={<Inscription />} />
          <Route path="/about" element={<About />} />
          <Route path="/recherche-oeuvres" element={<SearchArtwork />} />

          {/* Routes protégées (utilisateur connecté) */}
          <Route 
            path="/profil" 
            element={
              <ProtectedRoute>
                <Profil />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/avis" 
            element={
              <ProtectedRoute>
                <Avis />
              </ProtectedRoute>
            } 
          />
          
          {/* Routes admin */}
          <Route 
            path="/admin" 
            element={
              <AdminRoute>
                <Admin />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/oeuvres/nouveau" 
            element={
              <AdminRoute>
                <OeuvreForm />
              </AdminRoute>
            } 
          />
          <Route 
            path="/admin/oeuvres/modifier/:id" 
            element={
              <AdminRoute>
                <OeuvreForm />
              </AdminRoute>
            } 
          />
          
          {/* Route 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </div>
    </Router>
  );
}

// Composant 404 simple
function NotFound() {
  return (
    <div style={{ 
      textAlign: 'center', 
      padding: '50px',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      minHeight: '100vh',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '4rem', marginBottom: '20px' }}>404</h1>
      <h2 style={{ marginBottom: '20px' }}>Page non trouvée</h2>
      <p style={{ marginBottom: '30px' }}>
        La page que vous recherchez n'existe pas ou a été déplacée.
      </p>
      <a 
        href="/" 
        style={{
          padding: '12px 24px',
          background: 'white',
          color: '#667eea',
          textDecoration: 'none',
          borderRadius: '10px',
          fontWeight: '600',
          transition: 'transform 0.3s ease'
        }}
        onMouseOver={(e) => e.target.style.transform = 'translateY(-2px)'}
        onMouseOut={(e) => e.target.style.transform = 'translateY(0)'}
      >
        Retour à l'accueil
      </a>
    </div>
  );
}

export default App;