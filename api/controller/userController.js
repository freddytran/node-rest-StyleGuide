const mongoose = require('mongoose');
const User = require('../models/user');
const bcrypt = require('bcryptjs');


/*
* Hier wird definiert was bei einem standard GET Request auf die standard URL passiert.
* Führt man mittel API einen Get - Befehl aus ohne spezifische UserID sollen alle vorhandenen User ausgegeben werden.
* Dafür gibt es die Methode find() von Mongoose.
* exec() bewirkt dass es eine sichere Antwort gibt
* then() beschreibt was passiert wenn eine Antwort erhalten wurde.
* catch() beschreibt was passiert wenn ein Error entstanden ist
*
* Falls eine Antwort erhalten wurde gib sie in der Console aus und gib der Antwort den Status 200 für 'OK' und gebe
* die Antwort im JSON - Format aus.
*
* Falls ein Error entstanden ist gib ihn in der Console aus und gib der Antwort den Status 500 für 'Error' und gebe
* diesen Error im JSON - Format aus.
* */
exports.getAllUsers =  (req, res, next)=>{
    User.find()
        .select('name email alter _id password avatar')
        .exec()
        .then(docs =>{
            console.log(docs);
            const response = {
                count: docs.length,
                users: docs.map(doc =>{
                    return {
                        _id: doc._id,
                        userName: doc.userName,
                        email: doc.email,
                        alter: doc.alter,
                        avatar: doc.avatar,
                        password: doc.password,
                        request: {
                            type: 'GET',
                            url: 'http://localhost:3000/users/' + doc._id
                        }
                    }
                })
            };
            res.status(200).json(response);
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            })
        })
};

exports.getSpecificUser = (req, res, next)=>{
    const id = req.params.userID;
    User.findById(id)
        .select('name email alter _id password userImage')
        .exec()
        .then(doc =>{
            console.log(doc);
            if(doc){
                res.status(200).json({
                    user: doc,
                    request:{
                        type: 'GET',
                        description: 'Get all the Content from the User',
                        url: 'http://localhost:3000/contents/' + doc._id
                    }
                });
            }else{
                res.status(404).json({
                    message: 'No valid entry found for provider ID'
                });
            }
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });
};

/*
* Patch bedeutet bearbeiten. Hier wird per API request definiert was passiert, wenn ein bestimmter User bearbeitet werden soll.
* Zunächst wird eine Variable definiert in der die bei der Anfrage mitgegebene UserID gespeichert wird.
* Danach wird ein leeres Javascript Objekt erstellt (updateOps). Dies wird gleich benötigt
*
* Die Idee dahinter ist, dass man nicht immer alles auf einmal Ändern/bearbeiten möchte. Es soll also dynamisch nur
* das geändert werden, was auch vom User geändert wird.
* Hierfür wird das anfangs leere Javascript Objekt gefüllt.
* req.body sind die Eingaben der Nutzer. Diese werden in Form von einem Array mit Key Value Paaren eingegeben.
* Das leere Javascript Objekt wird dann mit den Key Value Paaren gefüllt.
*
* Hat man das Javascript Objekt fertig erstellt kann man nun mit der Methode .update() den Eintag in der Datenbank
* bearbeiten. update({_id:id}, {$set: 'was geändert werden soll'})
*
*
* */
exports.patchSpecificUser = (req, res, next)=>{
    const id = req.params.userID;
    const updateOps = {};

    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }

    User.update({_id: id}, {$set: updateOps})
        .exec()
        .then(result => {
            console.log(result);
            res.status(200).json({
                message: 'User was updated!',
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/users/' + id
                }
            });
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error : err
            });
        });
};

/*
* Hier wird definiert was bei einem Remove Befehl geschieht.
* Um einen Eintrag in der Datenbank zu löschen wird die Methode remove() benutzt.
* remove({_id:id])
* */
exports.deleteUser = (req, res, next)=>{
    const id = req.params.userID;
    User.remove({_id: id})
        .exec()
        .then(result => {
            res.status(200).json({
                message: 'User was deleted!',
                request:{
                    type: 'POST',
                    url: 'http://localhost:3000/users',
                    body: {name: 'String', email: 'String', alter: 'Number'}
                }
            });
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

/*
* Hier wird definiert, was passiert wenn und was man benötigt wenn man den Post Request macht.
* Zunächst wird definiert was man für Informationen vom User benötigt damit er erstellt werden kann.
* die _id wird mit dem unten verwendeten Konstruktor automatisch erstellt
* name, email und alter müssen jedoch vom User eingegebn werden.
* Eingaben werden bei der API über einen sogenannten "Body" eingegeben. Im UI sind dies jedoch einfach nur normale
* Feldeingaben.
* Unten wird demnach definiert dass die nötigen Informationen von dem Body bzw. von der Usereingabe kommen.
*
* Danach wird der User mittels .save() in die Datenbank gespeichert.
* */
exports.postUser = (req, res, next)=>{
    console.log(req.file);
    const user = new User({
        _id: new mongoose.Types.ObjectId(),
        userName: req.body.userName,
        email: req.body.email,
        alter: req.body.alter,
        avatar: req.file.path
    });

    user.save().then(result =>{
        console.log(result);
        res.status(200).json({
            message: 'Created User successfully!',
            createdUser: {
                userName: result.userName,
                email: result.email,
                alter: result.alter,
                _id: result._id,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/users/' + result._id
                }
            }
        });
    })
        .catch(err => {
            console.log(err);
            res.status(500).json({
                error: err
            })
        });

};

/*
* jsonwebtoken ist dafür da jedem Benutzer der sich erfolgreich einloggt einen Token zu geben. Mit diesem Token kann
* das System Benutzer identifizieren. Dies ist hilfreich bei Seiten zum Beispiel die nur der Benutzer sehen darf.
* Bsp. Private Seite.
* Bei Node und MongoDB ersetzen diese Tokens die sogenannten "Sessions" wie beispielsweise in php
* Um so einen Token zu erstellen und zu nutzen muss die benötigte Library importiert werden.
*
* Befehl: npm install jsonwebtoken --save
*
* Erstellung des Tokens:    mit der sign(payload, secretOrPrivateKey, {options}, callback) - Methode
*                           Payload =       Daten die mitgesendet/gespeichert werden sollen
*                           secretKey..=    Key der nur dem Server bekannt ist.
*                           options =       es gibt verschiedene optionen. See at https://www.npmjs.com/package/jsonwebtoken
*                           callback =      gibt den Token zurück. Hier kann darauf verzichtet werden weil direkt die variable
*                                           token initialisiert wird und somit die rückgabe redundant ist.
*
* Was geschieht hier in der Methode:
*
* 1. Schritt:   Es wird nach einem User gesucht mit der angegebenen Email - Adresse
*               Ist das Array(benutzer) kleiner 1 also 0 bedeutet dies, dass es keinen solchen User gibt
*               Gebe "Authorization failed" zurück
* 2. Schritt:   Falls das Array nicht null / Leer ist existiert der User
*               Checke dann mit der brcypt.compare(angegebene Password, das in der DB gespeicherte PW, (err, result)...
*               Wird ein error ausgegeben, bedeutet dies, dass das Password falsch war.
*               Falls das Password richtig war kommt Schritt 3
* 3.Schritt:    Da nun email und Passwort richtig waren erstelle das Token für den Benutzer und gib ihn aus.
* */
exports.userLogin = (req, res, next)=>{
    User.find({email: req.body.email})
        .exec()
        .then(benutzer =>{
            if(benutzer.length < 1){
                res.status(401).json({
                    message: 'Authorization failed!'
                })
            }
            bcrypt.compare(req.body.password, benutzer[0].password, (err, result)=>{
                if(err){
                    return res.status(401).json({
                        error: err
                    });
                };
                if(result){
                    const token = jwt.sign({
                            email: benutzer[0].email,
                            _id: benutzer[0]._id
                        },
                        process.env.JWT_KEY,
                        {
                            expiresIn: '1h'
                        }
                    );
                    return res.status(401).json({
                        message: 'Authorization failed!',
                        token: token
                    })
                }
                res.status(401).json({
                    message: 'Authorization failed!'
                })
            })

        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error: err
            });
        });
};

/*
* Bei der Registrierung ist darauf zu achten, dass Passwörter niemals einfach so ungeschützt in die Datenbank
* gespeichert werden sollten. Hat jemals jemand dann zugriff auf die Datenbank wären alle Passwörter öffentlich.
* Zur verschlüsselung muss eine library importiert werden die sich Bcrypt nennt.
*
* Befehl: npm install bcrypt --save
*
* Hinweis: hier hat der Befehl irgendwie nicht geklappt, weshalb alternativ npm install bcryptjs --save verwendet wurde.
*
* Verschlüsselt wird dann mit dem Befehl Hash() (verschlüsseln = etwas hashen)
*
* Methode: hash(data: any, salt: any, cb:any) - Was ist salt?
* Dazu eine Erklärung zum hashen: Es gibt sogenannten Dictionary Tables in denen Text und deren Hash - Wert gespeichert sind
* Dies bedeutet also, dass die Möglichkeit besteht, dass wenn einer an den Hash von dem User gelangt (also das
* verschlüsselte Passwort), er diesen Hash mithilfe dieser Dictionary Tables dennoch entschlüsseln kann. Bei einfachen
* Passwörter ist es natülich wahrscheinlicher als bei komplizierteren.
*
* Jetzt zu Salt: Hinter Salt steckt die Idee, dem Password random String beizufügen, noch bevor sie gehashed werden.
* Folge dessen werden auch die Salt - Strings mit gehashed, welches es fast unmöglich macht den Hash zu entschlüsseln.
* In der Hash  - Methode kann dann angegeben werden wie viele "saltingrounds" gemacht werden sollen. 10 git als sicher.
*
*
* Was geschiet hier in der Post Methode also?
*
* 1. Schritt:   Prüfe ob die angegebene Email schon existiert.
*               Ist die gefundene Menge größer gleich 0 bedeutet dies, dass die Email bereits existiert.
*               Gebe ErrorCode zurück und sage, dass die Email bereits existiert.
* 2. Schritt:   Falls die Email noch nicht existiert, hashe das Passwort und erstelle einen neuen Benutzer mit einer
*               automatisch erstellten ID, der angegebenen email Adresse und dem gehashten Passwort
* 3. Schritt:   Speichere den erstellten Benutzer in die Datenbank mittels benutzer.save() und sage dass Benutzer
*               erstellt worden ist.
* */
exports.userSignUp = (req, res, next)=>{
    User.find({email: req.body.email})
        .exec()
        .then(user =>{
            if(user.length >= 1){
                return res.status(409).json({
                    message: 'EMail already exists!'
                });
            }else{
                bcrypt.hash(req.body.password, 10, (err, hash) =>{
                    if(err){
                        return res.status(500).json({
                            error: err
                        });
                    }else{
                        const user = new User({
                            _id: new mongoose.Types.ObjectId(),
                            email: req.body.email,
                            userName: req.body.userName,
                            password: hash
                        });
                        user.save()
                            .then(result =>{
                                console.log(result);
                                res.status(201).json({
                                    message: 'User was Created'
                                })
                            })
                            .catch(err =>{
                                console.log(err);
                                res.status(500).json({
                                    error:err
                                });
                            });
                    }
                });
            }
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error:err
            });
        })
};
