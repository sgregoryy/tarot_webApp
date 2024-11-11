// src/components/Card.jsx
import React from 'react';
import { motion } from 'framer-motion';
import './Card.css'; // Убедитесь, что CSS импортирован

const Card = ({ card, onSelect, isSelected, imgSrc, backImage }) => {
  return (
    <div className="card-container" onClick={() => !isSelected && onSelect(card)}>
      <motion.div
        className="card"
        animate={{
          rotateY: isSelected ? 180 : 0,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 35,
        }}
      >
        <div className="card-back">
          <img
            src={imgSrc}
            alt={card.id}
            onError={(e) => {
              e.target.src = "/images/default.png";
            }}
          />
        </div>
        <div className="card-front">
          <img
            src={backImage}
            alt="Card Back"
            onError={(e) => {
              e.target.src = "/images/default.png";
            }}
          />
        </div>
      </motion.div>
    </div>
  );
};

export default Card;
