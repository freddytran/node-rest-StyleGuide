const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const cors = require('cors');

const userRoutes = require('./api/routes/users');
const contentRoutes = require('./api/routes/contents');
const commentRoutes = require('./api/routes/comments');

/*
* MongoDB wurde erstellt und der KeyString für die Datenbank kopiert.
* Um das Passwort nicht Hardcoden zu müssen wird es hier über eine dynamische Variable ersetzt. Diese findet man in der
* nodemon.json Datei.
* Nun folgt der Schritt, dass man sich mit der Datenbank verbindet. Dafür wird mongoose.connect ausgeführt und der Key
* reinkopiert.
* */
mongoose.connect(
    'mongodb://FreddyTran:' +
    process.env.MONGO_ATLAS_PW + '@cluster0-shard-00-00-xv50r.mongodb.net:27017,cluster0-shard-00-01-xv50r.mongodb.net:27017,cluster0-shard-00-02-xv50r.mongodb.net:27017/StyleGuide?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin&retryWrites=true',
    {
        useNewUrlParser: true
    }
);

/*
* Um die Default Promis Implementation zu benutzen. TEST IST UPDATED????
*
* */
mongoose.Promise = global.Promise;

// app.use(cors());

app.use(morgan('dev'));

app.use('/avatars', express.static('avatars'));
app.use('/uploads', express.static('uploads'));

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());



//Um die API Cors Kompatibel zu machen muss der Zugriff sozusagen für andere Clients gewährt werden. Dies geht mit Headern
app.use(function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers','Origin, X-Requested-With, Content-Type, Accept, Authorization');
    if(req.method === 'OPTIONS'){
        res.header('Access-Control-Allow-Methods', 'PUT, POST, PATCH, DELETE, GET');
        return res.status(200).json({});
    }
    next();
});

app.use('/users', userRoutes);
app.use('/contents', contentRoutes);
app.use('/comments', commentRoutes);

/*Die Logik hierhinter ist, dass in dem Falle dass der Code die nächste Zeile erreicht, es einen Fehler gab. Denn wenn
 *es keinen Fehler gegeben hätte, wäre der Code in einer der Routen gegangen und hätte was ausgegeben. Hier werden demnach
 * alle API Anfragen verwaltet, die einen Fehler ausgeben würden. Error Handling!
 */
app.use((req, res, next)=>{
    const error = new Error('Not Found');
    error.status = 404;
    next(error);
});

//In der Methode vorher wurde ein Error weitergegeben. Hier wird dieser Error nun aufgefangen und mit diesem umgegangen.
app.use((error, req, res, next)=>{
    res.status(error.status || 500);
    res.json({
        error: {
            message: error.message
        }
    });
});

module.exports = app;