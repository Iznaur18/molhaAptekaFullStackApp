import multer from 'multer';

// конфигурация для сохранения файлов на диске
export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    // Уникальное имя только из timestamp и mimetype, без originalname — защита от path traversal
    const raw = file.mimetype.split('/')[1] || 'bin';
    const ext = raw.replace(/[^a-z0-9]/gi, '') || 'bin';
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2, 9)}.${ext}`);
  }
});

// фильтр по типу файла (только jpeg/png)
export const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/webp' || file.mimetype === 'image/svg') {
    cb(null, true); // если тип файла разрешен, возвращаем true
  } else {
    cb(null, false); // если тип файла не разрешен, возвращаем ошибку
  }
};

const FILE_SIZE_LIMIT = 5 * 1024 * 1024; // 5 MB

export const uploadMW = multer({
  storage,
  fileFilter,
  limits: { fileSize: FILE_SIZE_LIMIT }
});
