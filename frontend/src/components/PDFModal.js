import React from 'react';
import './PDFModal.css';

function PDFModal({ open, onClose, pdfUrl, title }) {
    if (!open) return null;

    return (
        <div className="pdf-modal-overlay" onClick={onClose}>
            <div className="pdf-modal-content" onClick={e => e.stopPropagation()}>
                <header className="pdf-modal-header">
                    <h2>{title}</h2>
                    <button className="close-btn" onClick={onClose}>X</button>
                </header>
                <div className="pdf-modal-body">
                    <iframe
                        src={pdfUrl}
                        title={title}
                        width="100%"
                        height="600px"
                        frameBorder="0"
                    />
                </div>
            </div>
        </div>
    );
}

export default PDFModal;