const Content = require('../models/content');
const Comment = require('../models/comment');
const User = require('../models/user');
const mongoose = require('mongoose');
const commentController = require('../controller/commentController');

/*
* In diesem Controller werden alle Posts von dem gesuchten User ausgegeben. Als erstes wird eine variable mit der
* angegeben userID erstellt und dann werden alle Posts mithilfe von Content.find() gesucht. Um die suche darauf zu
* begrenzen, dass auch nur die Posts vom gewünschten User ausgegeben werden, wird in dem der find() Methode eingerenzt.
*
* Es geschieht sprichwörtlich so: Suche alle Contents die mit der UserID ... verbunden sind.
* */
exports.getContentFromUser = (req, res, next)=>{
    console.log(req.params.userID);
    const id = req.params.userID;
    Content.find({user: {_id:id}})
        .select('_id contentImage user contentTitle comment time')
        .populate('user', '_id userName email alter avatar')
        .exec()
        .then(docs =>{
            console.log("Parser" + docs);
            res.status(200).json({
                count: docs.length,
                content: docs.map(doc =>{
                    return {
                        user: doc.user,
                        content_id: doc._id,
                        contentTitle: doc.contentTitle,
                        contentImage: doc.contentImage,
                        comments: doc.comment,
                        time: doc.time
                    }
                })
            });
        })
        .catch(err =>{
            res.status(500).json({
                error: "MEIN ERROR " + err
            })
        })
};

exports.deleteContent = (req, res, next)=>{
    Content.remove({_id: req.params.contentID})
        .exec()
        .then(result =>{
            res.status(200).json({
                message: 'Content was deleted!',
                request:{
                    type: 'POST',
                    url: 'http://localhost:3000/contents',
                }
            })
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            })
        });
};

exports.getAllContents = (req, res, next) =>{
    const belongArr = [];
    let commArr = [];
    Content.find()
        .select('user _id comment metaInfo contentTitle clothInfo contentImage time')
        .populate('user', '_id userName comment email')
        .exec()
        .then(docs => {
            res.status(200).json({
                count: docs.length,
                posts: docs.map(doc =>{
                    return{
                        user: doc.user,
                        contentID: doc._id,
                        contentTitle: doc.contentTitle,
                        contentTime: doc.time,
                        contentImage: doc.contentImage,
                        metaInfo: doc.metaInfo,
                        clothInfo: doc.clothInfo,
                        comment: Comment.find({content: doc._id})
                            .exec()
                            .then(results =>{
                                console.log(results);
                                return results
                                /*results.map(result =>{
                                    return {
                                        commentID: result._id,
                                        commentUser: result.user,
                                        commentTime: result.time,
                                        userComment: result.userComment
                                    }
                                });*/
                            })
                            .catch(err =>{
                                res.status(500).json({
                                    message: 'Comment.find Hat probleme',
                                    err: err
                                })
                            })
                    }
                })
            })

            /*res.status(200).json({
                count: docs.length,
                posts: docs.map(doc => {
                    /!*commentController.getBelongingComments("" + doc._id)
                        .then(res => {
                            console.log('ContentTitle ' + doc.contentTitle);
                            console.log('ContentTime ' + doc.time);
                            commArr = res;
                        })
                        .catch(err => {
                            res.status(500).json({
                                message: 'SUPERERROR'
                            })
                        });*!/
                    commentController.getBelongingComments("" + doc._id)
                        .exec()
                        .then(result =>{
                                console.log('KJKJKJKJ ' + result)
                            })
                        .catch(err=>{
                            res.status(500).json({
                                message: 'Bis hier hin und nicht weiter',
                                error: err
                            })
                        });
                    return {
                        user: doc.user,
                        contentID: doc._id,
                        contentTitle: doc.contentTitle,
                        contentTime: doc.time,
                        contentImage: doc.contentImage,
                        metaInfo: doc.metaInfo,
                        clothInfo: doc.clothInfo,
                        comments: 'Platzhalter'
                    }
                })
            })*/
        })
        .catch(err => {
            res.status(500).json({
                error: err
            })
        })

    /*Promise.all([
        Content.find()
    ])*/
};

/*
* Um diese Patch API erfolgreich durchzuführen muss eine folgede JSON - Datei gesendet werden.
* Beispiel:
*           [{
*               "propName": "clothInfo",
*               "value": [{
*			                "headwear": {
*				                "laden": "zara",
*				                "preis": 13.45
*			                },
*                           "jacket": {
*                               "laden": "jack&Jones BRUDER",
*                               "preis": 50
*                            }
*		                  }]
*           }]
* */
exports.patchContent = (req, res, next)=>{
    const contID = req.params.contentID;
    const updateOps = {};
    for(const ops of req.body){
        updateOps[ops.propName] = ops.value;
    }

    Content.findById({_id: contID})
        .exec()
        .then(content =>{
            // console.log(content);
            content.set(updateOps);
            res.status(200).json({
                message: 'Content was found!',
                contentID: content._id,
                contentImage: content.contentImage,
                clothInfo: content.clothInfo,
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/contents/' + contID
                }
            });
            content.save();
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            })
        })
};

/*
* Wenn der User einen Post anlegen möchte, muss die UserID mitgesendet werden und ein Bild.
* Zunächst wird geprüft, ob der User mit der UserID existiert und wenn ja dann erstelle den Content und speichere
* zusätzlich die aktuelle Zeit und das Datum.
* */
exports.postContent = (req, res, next)=>{
    User.findById(req.body.userID)
        .then(user =>{
            if(!user){
                return res.status(404).json({
                    message: 'User not Found!'
                });
            }

            const content = new Content({
                _id: mongoose.Types.ObjectId(),
                contentTitle: req.body.contentTitle,
                user: req.body.userID,
                contentImage: req.file.path,
                time: new Date(),
                metaInfo: {
                    likes: 0,
                    shareNumber: 0,
                    rating: 0
                },
            });
            return content.save()
        })
        .then(result =>{
            console.log(result);
            res.status(201).json({
                message: 'Content was created',
                createdContent:{
                    content_id: result._id,
                    contentTitle: result.contentTitle,
                    user: result.user,
                    contentImage: result.contentImage,
                    time: result.time,
                    meta: result.metaInfo,
                    clothInfo: result.clothInfo
                },
                request:{
                    type: 'GET',
                    message: 'Get all the Post from this User',
                    url: 'http:localhost:3000/contents/' + result._id
                }
            })
        })
        .catch(err =>{
            console.log(err);
            res.status(500).json({
                error : err
            });
        });
};