

const express = require('express');
const router = express.Router();
const multer = require('multer');
const ContentController = require('../controller/contentparser');
const bodyParser = require('body-parser');

const bodyParsing = bodyParser.urlencoded({extended: false});

/*
* Mit multer.diskStorage kann verwaltet werden wie Dateien gespeichert werden.
* destination bestimmt wo die Datei (Bild) gespeichert werden soll
* filename bestimmt wie die Datei heißen soll.
* Der Name wird hier aus dem altuellen Datum und Uhrzeit plus dem Originalnamen zusammengesetzt.
* */
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
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

router.patch('/:contentID', ContentController.patchContent);

/*
* Wenn der User einen Post anlegen möchte, muss die UserID mitgesendet werden und ein Bild.
* Zunächst wird geprüft, ob der User mit der UserID existiert und wenn ja dann erstelle den Content und speichere
* zusätzlich die aktuelle Zeit und das Datum.
* */
router.post('/', upload.single('contentImage'), ContentController.postContent);

router.get('/:userID', ContentController.getContentFromUser);

router.get('/', ContentController.getAllContents);

router.delete('/:contentID', ContentController.deleteContent);

module.exports = router;