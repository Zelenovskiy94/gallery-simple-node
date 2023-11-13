const fs = require('fs').promises;
const path = require('path');

function transliterate(str) {
    const cyrillic = {
        'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'e', 'ж': 'zh',
        'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm', 'н': 'n', 'о': 'o',
        'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u', 'ф': 'f', 'х': 'kh', 'ц': 'ts',
        'ч': 'ch', 'ш': 'sh', 'щ': 'shch', 'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu',
        'я': 'ya', '—': '-',
    };

    return str.split('').map(char => cyrillic[char] || char).join('');
}

const imagesDirectory = path.join(__dirname, '../client/public', 'gallery');

async function transliterateFiles(directoryPath, relativePath = '') {
    const files = await fs.readdir(directoryPath);

    await Promise.all(files.map(async file => {
        const filePath = path.join(directoryPath, file);
        const isDirectory = (await fs.stat(filePath)).isDirectory();

        if (isDirectory) {
            // Рекурсивно обрабатываем подпапки
            const newRelativePath = path.join(relativePath, file);
            await transliterateFiles(path.join(directoryPath, file), newRelativePath);
        } else {
            // Если это файл, транслитерируем его имя
            const filenameWithUnderscore = transliterate(file.replace(/\s/g, '_'));
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

            // Переименование файла, если имя изменено
            if (file !== filenameWithUnderscore) {
                await fs.rename(filePath, newAbsoluteFilename);
            }
        }
    }));
}

// Вызываем функцию транслитерации перед запуском сервера
transliterateFiles(imagesDirectory)
    .then(() => {
        console.log('Image file name changes completed');
    })
    .catch(error => {
        console.error(`Error during image file name changes: ${error}`);
    });
