// App.jsx
import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './components/Card';
import useWindowSize from './hooks/useWindowSize';
import cardListData from './cardList.json';
import './App.css';

const App = () => {
  const [selectedCards, setSelectedCards] = useState([]);
  const [isSelectionComplete, setIsSelectionComplete] = useState(false);
  const [cards, setCards] = useState([]);
  const [cardWidth, setCardWidth] = useState(120);
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
        imgSrc: `/preImages/${cardName}.png`
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

  const getSelectedCardPosition = useCallback((index, totalSelected = 3, cardWidth) => {
    const isMobile = windowSize.width <= 500;
    const gap = isMobile ? 15 : 12;

    const totalWidth = (cardWidth * totalSelected) + (gap * (totalSelected - 1));
    const groupStartX = -totalWidth / 2 + cardWidth / 2;

    // Добавляем небольшое смещение по Y для эффекта веера
    const yOffset = Math.abs(index - 1) * 5;

    return {
      x: groupStartX + (index * (cardWidth + gap)),
      y: -50 + yOffset
    };
  }, [windowSize.width]);

  const handleCardSelect = useCallback((card) => {
    if (selectedCards.length < 3 && !selectedCards.find(c => c.id === card.id)) {
      setSelectedCards(prev => [...prev, card]);

      if (selectedCards.length === 2) {
        setTimeout(() => {
          setIsSelectionComplete(true);
        }, 800);
      }
    }
  }, [selectedCards]);

  const cardVariants = {
    normal: {
      opacity: 1,
      scale: 1,
      x: 0,
      y: 0,
      transition: {
        duration: 0.6,
        ease: "easeInOut"
      }
    },
    selected: (custom) => ({
      opacity: 1,
      scale: 1,
      x: custom.x,
      y: custom.y,
      transition: {
        type: "spring",
        stiffness: 50,
        damping: 14,
        mass: 0.8,
        duration: 1.5
      }
    }),
    unselected: {
      opacity: 0,
      scale: 0.8,
      transition: {
        duration: 1,
        ease: [0.25, 0.1, 0.25, 1]
      }
    },
    spring: {
      type: "spring",
      stiffness: 100,
      damping: 15,
      mass: 0.8
    }
  };

  if (cards.length === 0) {
    return <div className="App">Раскладываю карты...</div>;
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
                      layout
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
                      drag={!isSelectionComplete && !isSelected ? false : undefined}
                      whileDrag={{ scale: 1.1 }}
                      style={{
                        position: isSelectionComplete ? 'absolute' : 'relative',
                        zIndex: isSelected ? 2 : 1,
                        transformOrigin: 'center center',
                        margin: '0 auto'
                      }}
                      transition={{
                        layout: {
                          type: "spring",
                          stiffness: 50,
                          damping: 14,
                          mass: 0.8,
                          duration: 1.5
                        }
                      }}
                    >
                      <Card
                        card={card}
                        onSelect={handleCardSelect}
                        isSelected={!!isSelected}
                        imgSrc={card.imgSrc}
                        backImage="/images/back.jpg"
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          {isSelectionComplete && (
            <div className="button-container">
              <motion.button
                className="continue-button"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
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