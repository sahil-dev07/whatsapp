import React from 'react';
import './styling/avatarModal.css';

const AvatarModal = ({ avatarUrl, onClose }) => {
  return (
    <div className="avatar-modal-overlay" onClick={onClose}>
      <div className="avatar-modal-content" onClick={(e) => e.stopPropagation()}>
        <img src={avatarUrl} alt="Avatar" className="avatar-modal-image" />
        <button className="avatar-modal-close" onClick={onClose}>×</button>
      </div>
    </div>
  );
};

export default AvatarModal;