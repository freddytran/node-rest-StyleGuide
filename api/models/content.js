const mongoose = require('mongoose');
const CommentController = require('../controller/commentController');
const Comment = require('../models/comment');



const contentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    comment:{
        type: Array,
        userComment: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Comment'
        }]
    },

    metaInfo:[{
        likes: Number,
        shareNumber: Number,
        rating: Number,
    }],

    clothInfo:[],

    contentTitle: {type: String, required: true},
    contentImage: {type: String, required: false},
    time: {type: String, required: false}
});

// contentSchema.methods.findBelongingComments = function(cb){
//     const id = cb;
//     console.log("WAS IST CB??" + cb);
//     Comment.find({_id: id})
//         .select('_id userComment')
//         .exec()
//         .then(result =>{
//             console.log(result.userComment)
//         })
//         .catch(err =>{
//             res.status(500).json({
//                 error: err
//             })
//         })
// };

module.exports = mongoose.model('Content', contentSchema);