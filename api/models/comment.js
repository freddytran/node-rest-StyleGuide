const mongoose = require('mongoose');

const commentSchema = mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Content',
        required: true
    },
    commentTime: {type: String, required: false},
    userComment: {type: String, required:true},
});

module.exports = mongoose.model('Comment', commentSchema);