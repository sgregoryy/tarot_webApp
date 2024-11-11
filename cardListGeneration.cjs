const fs = require('fs');
const path = require('path');

// Путь к папке с изображениями карт
const imagesDir = path.join(__dirname, 'public', 'images');
const outputFile = path.join(__dirname, 'src', 'cardList.json');

// Чтение файлов из папки и извлечение названий без расширения
const cardNames = fs.readdirSync(imagesDir)
  .filter((file) => /\.(png|jpg|jpeg)$/i.test(file))  // Фильтруем только изображения
  .map((file) => path.basename(file, path.extname(file)));  // Убираем расширение

// Записываем массив названий файлов в JSON-файл
fs.writeFileSync(outputFile, JSON.stringify(cardNames, null, 2), 'utf-8');

console.log('Список карт успешно создан и сохранен в src/cardList.json');