// Card.jsx
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './Card.css';

const Card = ({ card, onSelect, isSelected, imgSrc, backImage, onFlipComplete }) => {
  return (
    <div className="card-container" onClick={() => !isSelected && onSelect(card)}>
      <motion.div
        className="card"
        animate={{
          rotateY: isSelected ? 180 : 0,
        }}
        onAnimationComplete={() => {
          if (isSelected) {
            onFlipComplete?.(card.id);
          }
        }}
        transition={{
          type: "tween", // Используем tween вместо spring для более предсказуемой анимации
          duration: 0.3,
          ease: "easeIn"
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