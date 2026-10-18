const AuditLog = require('../models/AuditLog');

exports.logAudit = async ({ actorId, action, targetType, targetId, details, req }) => {
  try {
    const ipAddress = req?.headers['x-forwarded-for'] || req?.socket?.remoteAddress || '127.0.0.1';
    await AuditLog.create({
      actor: actorId,
      action,
      targetType,
      targetId: targetId.toString(),
      details,
      ipAddress
    });
  } catch (error) {
    console.error('Lỗi khi ghi Audit Log:', error.message);
  }
};