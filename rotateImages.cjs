const Jimp = require('jimp');
const fs = require('fs');
const path = require('path');

const imagesFolder = path.join(__dirname, 'public', 'images');

async function mirrorImagesInFolder(folderPath) {
  try {
    const files = fs.readdirSync(folderPath);

    for (const file of files) {
      const filePath = path.join(folderPath, file);

      if (file.endsWith('.jpg') || file.endsWith('.png')) {
        Jimp.read(filePath)
          .then(image => {
            image.mirror(true, false); // Отзеркаливаем по горизонтали
            image.write(filePath); // Сохраняем изменения
            console.log(`Изображение ${file} отзеркалено и сохранено.`);
          })
          .catch(error => {
            console.error(`Ошибка при обработке файла ${file}:`, error);
          });
      }
    }
  } catch (error) {
    console.error('Ошибка при отзеркаливании изображений:', error);
  }
}

mirrorImagesInFolder(imagesFolder);
