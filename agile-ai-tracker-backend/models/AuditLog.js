const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  actor: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  action: { 
    type: String, 
    required: true, 
    enum: [
      'USER_SUSPENDED',
      'USER_ACTIVATED',
      'USER_ROLE_CHANGED',
      'USER_PASSWORD_RESET',
      'USER_DELETED',
      'PROJECT_OWNERSHIP_TRANSFERRED',
      'PROJECT_DELETED'
    ]
  },
  targetType: { 
    type: String, 
    required: true, 
    enum: ['USER', 'PROJECT', 'SETTING'] 
  },
  targetId: { type: String, required: true },
  details: { type: String, default: '' },
  ipAddress: { type: String, default: '127.0.0.1' }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);