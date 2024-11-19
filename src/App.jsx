import React, { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Card from './components/Card';
import useWindowSize from './hooks/useWindowSize';
import cardListData from './cardList.json';
import buttonImage from '/images/button.jpg';
import './App.css';

const App = () => {
  const [selectedCards, setSelectedCards] = useState([]);
  const [isSelectionComplete, setIsSelectionComplete] = useState(false);
  const [showContinueButton, setShowContinueButton] = useState(false);
  const [cards, setCards] = useState([]);
  const [cardWidth, setCardWidth] = useState(120);
  const [isFlipping, setIsFlipping] = useState(false);
  const [flippedCards, setFlippedCards] = useState(new Set());
  const [isButtonImageLoaded, setIsButtonImageLoaded] = useState(false);

  const windowSize = useWindowSize();

  // Инициализация Telegram WebApp
  const tg = window.Telegram?.WebApp;
  useEffect(() => {
    const img = new Image();
    img.src = '/images/button.jpg'; // Убедитесь, что путь корректен
    img.onload = () => {
      setIsButtonImageLoaded(true);
    };
  }, []);
  useEffect(() => {
    if (tg) {
      tg.ready();
    }
  }, [tg]);

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
      .slice(0, 10)
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
      setCardWidth(90);
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
      setTimeout(() => {
        setIsSelectionComplete(true);
        setTimeout(() => {
          setShowContinueButton(true);
        }, 800);
      }, 300);
      setIsFlipping(false);
    }
  }, [selectedCards.length, flippedCards.size]);

  const getSelectedCardPosition = useCallback((index, totalSelected = 3, cardWidth) => {
    const isMobile = windowSize.width <= 500;
    const gap = isMobile ? 15 : 150;
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
        setTimeout(() => setIsFlipping(false), 100);
      }
    }
  }, [selectedCards, isFlipping]);

  // Обработчик нажатия кнопки "Продолжить"
  const handleContinueClick = useCallback(() => {
    if (selectedCards.length === 3 && tg) {
      // Формируем строку с названиями карт
      const selectedCardNames = selectedCards
        .map(card => card.id)
        .join(',');

      try {

        tg.sendData(selectedCardNames);
        tg.close();
      } catch (error) {
        console.error('Ошибка при отправке данных:', error);
      }
    }
  }, [selectedCards, tg]);

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
        stiffness: 150,
        damping: 20,
        mass: 1,
        duration: 1.2,
        delay: 0.3
      }
    }),
    unselected: {
      opacity: 0,
      scale: 0.95,
      filter: "blur(2px)",
      transition: {
        type: "spring", 
        duration: 0.8,
        delay: 0.3,
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
                        marginTop: '10px',
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
                        backImage="/images/back.png"
                      />
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>
          {showContinueButton && isButtonImageLoaded && (
            <motion.div 
              className="button-container"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                ease: [0.4, 0, 0.2, 1], // Используем плавную кривую ease
              }}
            >
              <button
                className="continue-button"
                onClick={handleContinueClick}
                style={{ 
                  fontFamily: 'Playfair Display',
                  backgroundImage: `url(${buttonImage})`
                }}
              >
                Продолжить
              </button>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default App;