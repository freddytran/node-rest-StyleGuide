const Content = require('../models/content');
const Comment = require('../models/comment');
const mongoose = require('mongoose');
const contentParser = require('../controller/contentparser');

exports.getCommentForContent = (req, res, next) =>{
    const contentID = req.params.contentID;
    Comment.find({content: {_id: contentID}})
        .select('_id user content commentTime userComment')
        .populate('user')
        .populate('content')
        .exec()
        .then(docs =>{
            if(docs.length < 1){
                return res.status(200).json({
                    message: "No Comments yet."
                })
            }else{
                console.log(docs);
                res.status(200).json({
                    count: docs.length,
                    comments: docs.map(doc =>{
                        return{
                            _id: doc._id,
                            user: doc.user,
                            content: contentID,
                            commentTime: doc.commentTime,
                            userComment: doc.userComment
                        }
                    })
                })
            }
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            })
        })
};

exports.postCommentToContent = (req, res, next) =>{
    const contentID = req.params.contentID;
    console.log(contentID);
    Content.find({_id: req.params.contentID})
        .select('_id')
        .then(content =>{
            if(!content){
                return res.status(404).json({
                    message: 'Content not Found!'
                });
            }
            const userComment = new Comment({
                _id: mongoose.Types.ObjectId(),
                user: req.body.userID,
                content: contentID,
                commentTime: new Date(),
                userComment: req.body.userComment
            });
            return userComment.save()
        })
        .then(result =>{
            console.log(result);
            res.status(201).json({
                message: "Comment was placed",
                createdComment:{
                    _id: result._id,
                    user: result.user,
                    contentID: result.content,
                    comment: result.message,
                    commentTime: result.commentTime
                }
            })
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            })
        })
};

exports.deleteComment = (req, res, next)=>{
    const id = req.params.commentID;
    Comment.remove({_id: id})
        .exec()
        .then(result =>{
            console.log(result);
            res.status(200).json({
                message: 'Comment was deleted!',
                request:{
                    type: 'GET',
                    url: 'http://localhost:3000/comments',
                }
            })
        })
        .catch(err =>{
            res.status(500).json({
                error: err
            })
        });
};

exports.getBelongingComments = (req, res, next) =>{
    /*console.log("HIER SIND IST DIE LOG VON getBelongningComments" + req);*/
    const contentID = req;
    let commArr = [];
    Comment.find({content: contentID})
        .select('user _id userComment content commentTime')
        .exec()
        .then(results =>{
           if(results.length > 0){
               return results
           }else{
               return commArr
           }
        })
        .catch(err =>{
            res.status(500).json({
                message: 'Gab Fehler bei getBelonging Comments',
                error: err
            })
        });
};