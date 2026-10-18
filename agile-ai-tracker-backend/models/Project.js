// backend/models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  key: { 
    type: String, 
    uppercase: true, 
    default: function() {
      return this.name ? this.name.substring(0, 3).toUpperCase() : 'FJR';
    }
  }, // VD: FJR
  description: { type: String, default: '' },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  members: [
    {
      user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      role: { 
        type: String, 
        enum: ['ADMIN', 'PM', 'MEMBER', 'VIEWER'], 
        default: 'MEMBER' 
      },
      joinedAt: { type: Date, default: Date.now }
    }
  ],
  taskCounter: { type: Number, default: 0 }
}, { timestamps: true });

module.exports = mongoose.model('Project', projectSchema);