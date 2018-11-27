const express = require('express');
const router = express.Router();
const checkAuth = require('../middleware/check-auth');
const multer = require('multer');
const userController = require('../controller/userController');

/*
* Mit multer.diskStorage kann verwaltet werden wie Dateien gespeichert werden.
* destination bestimmt wo die Datei (Bild) gespeichert werden soll
* filename bestimmt wie die Datei heißen soll.
* Der Name wird hier aus dem altuellen Datum und Uhrzeit plus dem Originalnamen zusammengesetzt.
* */
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'avatars/');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + file.originalname);
    }
});

/*
* In dieser Methode wird gefiltert welche Bilder erlaubt sind.
* Zuerst erfolgt eine if Abfrage ob es sich um Jpg oder png handelt und wenn ja wird es zugelassen
* Falls nicht erscheint eine Fehlermeldung und es wird nicht hochgeladen
* */
const fileFilter = (req, file, cb)=>{
    //reject a file
    if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png'){
        cb(null, true);
    }else{
        console.log(file.mimetype);
        cb(new Error('Filetype not supported!'), false);
    }
};
/*
* Initialisiere Multer mit dem angegebenen Speicherort/art
* limitiere die Bilder auf 5 MB (1024*1024 = 1MB)
* und wende zusätzlich den Filter an.
* */
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 1024 * 1024 * 5
    },
    fileFilter: fileFilter
});

router.get('/',  userController.getAllUsers);

router.post('/', upload.single('avatar'), userController.postUser);

//Hier wird definiert was passiert wenn per API ein bestimmter User mit einer bestimmten ID gesucht wird.
router.get('/:userID',  userController.getSpecificUser);

router.patch('/:userID', userController.patchSpecificUser);

router.delete('/:userID', userController.deleteUser);

module.exports = router;