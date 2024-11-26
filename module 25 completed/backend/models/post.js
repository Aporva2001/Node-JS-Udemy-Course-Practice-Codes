const mongoose= require('mongoose');

const Schema= mongoose.Schema;

const postSchema= new Schema({
    title:{
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        required: true,
    },
    content:{
        type: String,
        required: true
    },
    creator: {
        type: Object,
        required: true
    }
}, {timestamps: true}) // The timestamps field automatically creates a timestamp for a newly created post document.

module.exports= mongoose.model('Post',postSchema)