const mongoose = require('mongoose');

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

module.exports = mongoose.model('Content', contentSchema);