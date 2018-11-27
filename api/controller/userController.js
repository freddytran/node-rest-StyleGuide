const mongoose = require('mongoose');
const User = require('../models/user');


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
        .select('name email alter _id avatar')
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
        .select('name email alter _id userImage')
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
