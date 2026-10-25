import mongoose from 'mongoose';

const auditLogSchema = new mongoose.Schema(
  {
    action: {
      type: String,
      required: true,
      trim: true,
    },
    performedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    performedByName: {
      type: String,
      default: 'System',
    },
    targetModel: {
      type: String,
      required: true,
    },
    targetId: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
    details: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    ipAddress: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

auditLogSchema.index({ targetModel: 1, targetId: 1 });
auditLogSchema.index({ createdAt: -1 });

const AuditLog = mongoose.model('AuditLog', auditLogSchema);

export default AuditLog;
