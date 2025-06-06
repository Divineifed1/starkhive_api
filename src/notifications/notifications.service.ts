import { Injectable, Logger } from '@nestjs/common';
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';


export interface NotificationPayload {
  recruiterId: string;
  jobId: string;
  freelancerId: string;
  jobLink: string;
  freelancerProfileLink: string;
}
@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);


  async sendNotification(payload: NotificationPayload): Promise<void> {
    try {
      this.logger.log(`Notification sent to recruiter ${payload.recruiterId}:`);
      this.logger.log(`Freelancer applied for job.`);
      this.logger.log(`Job link: ${payload.jobLink}`);
      this.logger.log(`Freelancer profile: ${payload.freelancerProfileLink}`);
    } catch (error) {
      this.logger.error(`Failed to send notification: ${error.message}`, error.stack);
      throw new Error('Failed to send notification');
    }
}

constructor(
  @InjectRepository(Notification)
  private readonly notificationRepository: Repository<Notification>,
) {}

  async getNotificationsByUser(userId: string, page: number = 1, limit: number = 10) {
    if (page < 1) page = 1;
    if (limit < 1) limit = 10;
    if (limit > 100) limit = 100;
    const skip = (page - 1) * limit;

    try {
      const [notifications, total] = await this.notificationRepository.findAndCount({
        where: { userId },
        order: { createdAt: 'DESC' },
        skip,
        take: limit,
      });

      const totalPages = Math.ceil(total / limit);
      const hasNextPage = page < totalPages;
      const hasPreviousPage = page > 1;

      return {
        data: notifications,
        meta: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage,
          hasPreviousPage,
        },
      };
    } catch (error) {
      throw new NotFoundException('Failed to retrieve notifications');
    }
  }


  async markAsRead(notificationId: string, userId: string) {
    const notification = await this.notificationRepository.findOne({
      where: { id: notificationId, userId },
    });

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }

    notification.isRead = true;
    notification.updatedAt = new Date();

    return await this.notificationRepository.save(notification);
  }

  async markAllAsRead(userId: string) {
    await this.notificationRepository.update(
      { userId, isRead: false },
      { isRead: true, updatedAt: new Date() },
    );

    return { message: 'All notifications marked as read' };
  }

  async getUnreadCount(userId: string): Promise<number> {
    return await this.notificationRepository.count({
      where: { userId, isRead: false },
    });
  }
}

function constructor(arg0: any, notificationRepository: any, arg2: any) {
  throw new Error('Function not implemented.');
}

