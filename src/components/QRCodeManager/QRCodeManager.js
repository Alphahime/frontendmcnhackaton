import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { 
  FaTimes, 
  FaDownload, 
  FaLink, 
  FaExternalLinkAlt,
  FaMobileAlt,
  FaPrint,
  FaEnvelope,
  FaTag
} from 'react-icons/fa';
import './QRCodeManager.css';

const QRCodeManager = ({ oeuvre, onClose }) => {
  const [downloadFormat, setDownloadFormat] = useState('png');
  const qrCodeRef = useRef(null);

  const generateArtworkUrl = () => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/oeuvre/${oeuvre.id}`;
  };

  const downloadQRCode = () => {
    const svgElement = qrCodeRef.current;
    if (!svgElement) return;

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);

      if (downloadFormat === 'png') {
        const pngFile = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.download = `qr-code-${oeuvre.title}-${oeuvre.id}.png`;
        downloadLink.href = pngFile;
        downloadLink.click();
      } else if (downloadFormat === 'svg') {
        const svgBlob = new Blob([svgData], { type: 'image/svg+xml' });
        const svgUrl = URL.createObjectURL(svgBlob);
        const downloadLink = document.createElement('a');
        downloadLink.download = `qr-code-${oeuvre.title}-${oeuvre.id}.svg`;
        downloadLink.href = svgUrl;
        downloadLink.click();
        URL.revokeObjectURL(svgUrl);
      }
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(generateArtworkUrl());
      alert('Lien copié dans le presse-papier !');
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
      // Fallback pour les navigateurs qui ne supportent pas clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = generateArtworkUrl();
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Lien copié dans le presse-papier !');
    }
  };

  return (
    <div className="qr-code-modal-overlay">
      <div className="qr-code-modal">
        <div className="qr-code-header">
          <h3>QR Code pour {oeuvre.title}</h3>
          <button className="qr-code-close-btn" onClick={onClose}>
            <FaTimes />
          </button>
        </div>

        <div className="qr-code-content">
          <div className="qr-code-display">
            <div className="qr-code-svg-wrapper" ref={qrCodeRef}>
              <QRCodeSVG
                value={generateArtworkUrl()}
                size={200}
                level="H"
                includeMargin={true}
                bgColor="#0a0a0a"
                fgColor="#f59e0b"
              />
            </div>
            <p className="qr-code-url">{generateArtworkUrl()}</p>
          </div>

          <div className="qr-code-controls">
            <div className="format-selector">
              <label>Format de téléchargement:</label>
              <select 
                value={downloadFormat} 
                onChange={(e) => setDownloadFormat(e.target.value)}
                className="format-select"
              >
                <option value="png">PNG</option>
                <option value="svg">SVG</option>
              </select>
            </div>

            <div className="action-buttons">
              <button 
                onClick={downloadQRCode}
                className="download-btn"
              >
                <FaDownload /> Télécharger QR Code
              </button>
              
              <button 
                onClick={copyLink}
                className="copy-link-btn"
              >
                <FaLink /> Copier le lien
              </button>

              <Link 
                to={`/oeuvre/${oeuvre.id}`}
                className="test-link-btn"
                onClick={onClose}
              >
                <FaExternalLinkAlt /> Voir l'œuvre
              </Link>
            </div>
          </div>

          <div className="qr-code-info">
            <h4>Comment utiliser ce QR Code:</h4>
            <ul>
              <li><FaMobileAlt /> Scannez avec votre smartphone pour accéder directement à l'œuvre</li>
              <li><FaPrint /> Imprimez-le pour l'exposition physique</li>
              <li><FaEnvelope /> Partagez-le par email ou messagerie</li>
              <li><FaTag /> Ajoutez-le aux documents de l'œuvre</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QRCodeManager;