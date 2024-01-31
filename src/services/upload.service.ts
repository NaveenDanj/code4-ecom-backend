
import multer from 'multer';
import path from 'path';

const storage = multer.diskStorage({
    
    destination: (req, file, callback) => {
      callback(null, 'uploads/');
    },

    filename: (req, file, callback) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      callback(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    },

})

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 20 * 1024 * 1024, 
    },
    fileFilter: (req, file, callback) => {

        const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif'];
        const fileExtension = path.extname(file.originalname).toLowerCase();

        if (allowedExtensions.includes(fileExtension)) {
            callback(null, true);
        } else {
            callback(new Error('Invalid file extension'));
        }

    },

});

export default upload