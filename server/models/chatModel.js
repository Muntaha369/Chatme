const mongoose = require('mongoose')

const messageSchema = new mongoose.Schema({
     senderId: {
        type: String,
        required: true,
        index: true // Indexing this field is CRITICAL for quickly finding messages you sent
    },
    receiverId: {
        type: String,
        required: true,
        index: true // Indexing this field is CRITICAL for filtering by conversation partner/room
    },
    
    messageText: {
        type: String,
        required: true
    },
    
    timestamp: {
        type: String,
        default: Date.now,
        index: true // Indexing this field is CRITICAL for chronological sorting
    },
    
    // Optional: Used to group messages for filtering
    messageType: {
        type: String,
        enum: ['private', 'room', 'system'], // Helps categorize traffic
        default: 'private'
    },

});

messageSchema.index({ senderId: 1, receiverId: 1, timestamp: 1 });

module.exports = mongoose.model('Message', messageSchema);