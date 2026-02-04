import multer from 'multer';

// конфигурация для сохранения файлов на диске
export const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// фильтр по типу файла (только jpeg/png)
export const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

export const uploadMW = multer({ storage, fileFilter }); // Получаем в файле routes/upload.js
