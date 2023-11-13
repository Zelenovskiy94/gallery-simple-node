const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const imageSize = require('image-size');

const app = express();

// Папка с изображениями
const imagesDirectory = path.join(__dirname, '../client/public', 'gallery');

app.use(express.static(imagesDirectory));

async function processDirectory(directoryPath, relativePath = '') {
    const files = await fs.readdir(directoryPath);

    const images = await Promise.all(files.map(async file => {
        const filePath = path.join(directoryPath, file);
        const isDirectory = (await fs.stat(filePath)).isDirectory();

        if (isDirectory) {
            // Если это подпапка первого уровня, обрабатываем её рекурсивно
            const newRelativePath = path.join(relativePath, file);
            const subfolderPath = path.join(directoryPath, file);
            const subfolderFiles = await fs.readdir(subfolderPath);
            const hasSubfolders = subfolderFiles.some(async subfile => (await fs.stat(path.join(subfolderPath, subfile))).isDirectory());

            if (!hasSubfolders) {
                return processDirectory(subfolderPath, newRelativePath);
            } else {
                // Если в подпапке есть другие подпапки, игнорируем её
                return null;
            }
        } else {
            // Если это файл, обрабатываем его
            const filenameWithUnderscore = file.replace(/\s/g, '_');
            const encodedFilename = encodeURIComponent(filenameWithUnderscore).replace(/%20/g, '_');
            const newAbsoluteFilename = path.join(directoryPath, filenameWithUnderscore);

            // Исключаем файлы системных служб, такие как .DS_Store
            if (file.startsWith('.')) {
                return null;
            }

            // Проверка существования файла
            try {
                await fs.access(filePath, fs.constants.F_OK);
            } catch (err) {
                console.error(`File does not exist: ${filePath}`);
                return null;
            }

            // Переименование файла, если имя изменено
            if (file !== filenameWithUnderscore) {
                await fs.rename(filePath, newAbsoluteFilename);
            }

            // Получение размеров изображения
            const dimensions = imageSize(newAbsoluteFilename);

            const minFilePath = path.join(__dirname, '../client/public', 'minGallery', relativePath, encodedFilename);

            const srcMin = await fs.access(minFilePath, fs.constants.F_OK)
                .then(() => `/minGallery/${path.join(relativePath, filenameWithUnderscore)}`)
                .catch(() => `/gallery/${path.join(relativePath, filenameWithUnderscore)}`);

            console.log(srcMin);
            return {
                srcMin,
                src: `/gallery/${path.join(relativePath, encodedFilename)}`,
                width: dimensions.width,
                height: dimensions.height
            };
        }
    }));

    // Фильтрация null значений (в случае, если файл не существует)
    return images.flat().filter(url => url !== null);
}


app.get('/gallery-api', async (req, res) => {
    try {
        const imageUrls = await processDirectory(imagesDirectory);
        res.json(imageUrls);
    } catch (error) {
        console.error(`Server error: ${error}`);
        res.status(500).send('Server Error');
    }
});

// Добавляем новый эндпоинт для каждой подпапки
app.get('/gallery-api/:subfolder', async (req, res) => {
    try {
        const subfolder = req.params.subfolder;
        const subfolderPath = path.join(imagesDirectory, subfolder);

        // Проверяем существование директории
        try {
            await fs.access(subfolderPath, fs.constants.F_OK);
        } catch (err) {
            res.status(404).send('Subfolder not found');
            return;
        }

        const imageUrls = await processDirectory(subfolderPath, subfolder);
        res.json(imageUrls);
    } catch (error) {
        console.error(`Server error: ${error}`);
        res.status(500).send('Server Error');
    }
});

// Добавляем эндпоинт для возврата списка подпапок
app.get('/gallery-folders', async (req, res) => {
    try {
        const folders = await fs.readdir(imagesDirectory);
        const subfolders = await Promise.all(folders.map(async folder => {
            const folderPath = path.join(imagesDirectory, folder);
            const isDirectory = (await fs.stat(folderPath)).isDirectory();
            return isDirectory ? folder : null;
        }));
        res.json(subfolders.filter(folder => folder !== null));
    } catch (error) {
        console.error(`Server error: ${error}`);
        res.status(500).send('Server Error');
    }
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
    console.log(`Server listening on ${PORT}`);
});
