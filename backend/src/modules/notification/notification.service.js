// Notification service. Channels are pluggable; here they log + emit a toast event.
// Wire real transports (email/Slack/SMS) by implementing the channel senders.
import { bus } from '../../utils/bus.js';
import { logger } from '../../config/logger.js';

class NotificationService {
  send({ channel = 'toast', target = '', subject = '', body = '', level = 'info' }) {
    logger.info('notification', { channel, subject });
    bus.emit('notify', { channel, target, subject, body, level, ts: Date.now() });
    return { queued: true };
  }
}
export const notificationService = new NotificationService();
