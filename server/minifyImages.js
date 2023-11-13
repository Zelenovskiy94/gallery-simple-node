const fs = require('fs').promises;
const path = require('path');

const sharp = require('sharp');

const imagesDirectory = path.join(__dirname, '../client/public', 'gallery');

async function minifyImages(directoryPath, relativePath = '') {
    const files = await fs.readdir(directoryPath);

    await Promise.all(files.map(async file => {
        const filePath = path.join(directoryPath, file);
        const isDirectory = (await fs.stat(filePath)).isDirectory();

        if (isDirectory) {
            // Рекурсивно обрабатываем подпапки
            const newRelativePath = path.join(relativePath, file);
            const minifiedFolderPath = path.join(__dirname, '../client/public', 'minGallery', newRelativePath);

            await fs.mkdir(minifiedFolderPath, { recursive: true });

            await minifyImages(path.join(directoryPath, file), newRelativePath);
        } else {
            // Если это файл, минифицируем и создаем копию
            const filenameWithUnderscore = file.replace(/\s/g, '_');
            const newAbsoluteFilename = path.join(directoryPath, filenameWithUnderscore);

            // Исключаем файлы системных служб, такие как .DS_Store
            if (file.startsWith('.')) {
                return;
            }

            // Проверка существования файла
            try {
                await fs.access(filePath, fs.constants.F_OK);
            } catch (err) {
                console.error(`File does not exist: ${filePath}`);
                return;
            }

            // Создаем папку min в структуре подпапок, если ее нет
            const minifiedFolderPath = path.join(__dirname, '../client/public', 'minGallery', relativePath);
            await fs.mkdir(minifiedFolderPath, { recursive: true });

            // Создаем новый файл для минифицированной копии в папке min
            const minifiedFilename = `${filenameWithUnderscore.split('.').slice(0, -1).join('.')}.${filenameWithUnderscore.split('.').pop()}`;
            const minifiedAbsoluteFilename = path.join(minifiedFolderPath, minifiedFilename);

            // Проверка существования минифицированного файла
            try {
                await fs.access(minifiedAbsoluteFilename, fs.constants.F_OK);
                console.log(`Minified file already exists: ${minifiedAbsoluteFilename}`);
                return;  // Пропускаем, если файл уже существует
            } catch (err) {
                // Продолжаем, если файл не существует
            }

            // Минификация изображения
            try {
                await sharp(newAbsoluteFilename)
                    .resize({ width: 600 })  // Укажите необходимые параметры минификации
                    .toFile(minifiedAbsoluteFilename);
            } catch (error) {
                console.error(`Error while minifying image: ${error}`);
            }
        }
    }));
}

// Вызываем функцию минификации перед запуском сервера
minifyImages(imagesDirectory)
    .then(() => {
        console.log('Image minification completed');
    })
    .catch(error => {
        console.error(`Error during image minification: ${error}`);
    });
