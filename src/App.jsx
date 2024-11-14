import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './components/Card';
import useWindowSize from './hooks/useWindowSize';
import cardListData from './cardList.json';
import './App.css';

const App = () => {
  const [selectedCards, setSelectedCards] = useState([]);
  const [isSelectionComplete, setIsSelectionComplete] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [cards, setCards] = useState([]);
  const [cardWidth, setCardWidth] = useState(120);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const windowSize = useWindowSize();

  const shuffleArray = (array) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
  };

  useEffect(() => {
    const shuffledCards = shuffleArray([...cardListData])
      .slice(0, 8)
      .map(cardName => ({
        id: cardName,
        imgSrc: `/preImages/${encodeURIComponent(cardName)}.png`
      }));
    setCards(shuffledCards);
  }, []);

  useEffect(() => {
    if (windowSize.width <= 360) {
      setCardWidth(60);
    } else if (windowSize.width <= 500) {
      setCardWidth(70);
    } else {
      setCardWidth(120);
    }
  }, [windowSize.width]);

  const handleFlipComplete = useCallback((cardId) => {
    setFlippedCards(prev => {
      const newSet = new Set(prev);
      newSet.add(cardId);
      return newSet;
    });
  }, []);

  useEffect(() => {
    if (selectedCards.length === 3 && flippedCards.size === 3) {
      // Увеличиваем задержку перед началом перемещения
      setTimeout(() => {
        setIsSelectionComplete(true);
        // Увеличиваем задержку появления кнопки
        setTimeout(() => {
          setShowContinueButton(true);
        }, 800);
      }, 300);
      setIsFlipping(false);
    }
  }, [selectedCards.length, flippedCards.size]);

  const getSelectedCardPosition = useCallback((index, totalSelected = 3, cardWidth) => {
    const isMobile = windowSize.width <= 500;
    const gap = isMobile ? 15 : 12;
    const totalWidth = (cardWidth * totalSelected) + (gap * (totalSelected - 1));
    const groupStartX = -totalWidth / 2 + cardWidth / 2;
    const yOffset = Math.abs(index - 1) * 5;

    return {
      x: groupStartX + (index * (cardWidth + gap)),
      y: -50 + yOffset
    };
  }, [windowSize.width]);

  const handleCardSelect = useCallback((card) => {
    if (selectedCards.length < 3 && !selectedCards.find(c => c.id === card.id) && !isFlipping) {
      setIsFlipping(true);
      setSelectedCards(prev => [...prev, card]);
      
      if (selectedCards.length !== 2) {
        setTimeout(() => setIsFlipping(false), 100); // Уменьшаем время блокировки
      }
    }
  }, [selectedCards, isFlipping]);

  const cardVariants = {
    normal: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      filter: "blur(0px)",
      transition: {
        duration: 0.2,
        ease: "easeOut"
      }
    },
    selected: (custom) => ({
      opacity: 1,
      scale: 1,
      x: custom.x,
      y: custom.y,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        stiffness: 150, // Уменьшаем жесткость для более плавного движения
        damping: 20,   // Настраиваем затухание
        mass: 1,      // Увеличиваем массу для более медленного движения
        duration: 1.2, // Увеличиваем длительность анимации
        delay: 0.3    // Добавляем задержку после переворота
      }
    }),
    unselected: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(2px)",
      transition: {
        duration: 0.8, // Увеличиваем время исчезновения
        delay: 0.2,   // Та же задержка, что и для selected
        ease: [0.4, 0.0, 0.2, 1]
      }
    }
  };

  if (cards.length === 0) {
    return <div className="App">Раскладываем карты...</div>;
  }

  return (
    <div className="App">
      <div className="background-image"></div>
      <div className="background-overlay"></div>
      <div className="content">
        <h1 style={{fontFamily: 'Playfair Display'}}>Выберите 3 карты</h1>
        <div className="cards-container">
          <div className="selected-cards-wrapper">
            <div className="card-grid">
              <AnimatePresence>
                {cards.map((card) => {
                  const isSelected = selectedCards.find(c => c.id === card.id);
                  const selectedIndex = selectedCards.findIndex(c => c.id === card.id);
                  const position = isSelected && isSelectionComplete 
                    ? getSelectedCardPosition(selectedIndex, selectedCards.length, cardWidth)
                    : undefined;

                  return (
                    <motion.div
                      key={card.id}
                      layout={!isSelectionComplete || isSelected}
                      layoutId={`card-${card.id}`}
                      initial="normal"
                      animate={
                        isSelectionComplete
                          ? isSelected
                            ? "selected"
                            : "unselected"
                          : "normal"
                      }
                      variants={cardVariants}
                      custom={position}
                      style={{
                        position: isSelectionComplete ? 'absolute' : 'relative',
                        zIndex: isSelected ? 2 : 1,
                        transformOrigin: 'center center',
                        margin: '0 auto',
                        willChange: 'transform, opacity',
                        transform: 'translateZ(0)'
                      }}
                    >
                      <Card
                        card={card}
                        onSelect={handleCardSelect}
                        isSelected={!!isSelected}
                        onFlipComplete={handleFlipComplete}
                        imgSrc={card.imgSrc}
                        backImage="/images/back.jpg"
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          {showContinueButton && (
            <div className="button-container">
              <motion.button
                className="continue-button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5,
                  ease: "easeOut"
                }}
                style={{fontFamily: 'Playfair Display'}}
              >
                Продолжить
              </motion.button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;