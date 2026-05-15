import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { CrudService } from '../../services/crud.service';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterModule, CommonModule],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent implements OnInit {
  showNotifications = false;
  unreadCount = 0;
  notifications: any[] = [];
  userId = '12345'; // Mock logged-in user

  constructor(private crudService: CrudService) {}

  ngOnInit() {
    this.fetchNotifications();
  }

  fetchNotifications() {
    this.crudService.getAll('notifications', { userId: this.userId }).subscribe(data => {
      this.notifications = data || [];
      // Fallback dummy data if DB empty just for visualization if needed
      if (this.notifications.length === 0) {
        this.notifications = [
          { _id: 'mock1', title: 'Welcome to HealthLink', message: 'Your dashboard is ready.', isRead: false, createdAt: new Date() }
        ];
      }
      this.updateUnreadCount();
    });
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
    if (this.showNotifications) {
      // Logic to mark as viewed could go here
    }
  }

  markAllRead() {
    this.crudService.markAllNotificationsRead(this.userId).subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.updateUnreadCount();
    });
  }

  deleteNotification(id: string, event: Event) {
    event.stopPropagation();
    if (id.startsWith('mock')) {
      this.notifications = this.notifications.filter(n => n._id !== id);
      this.updateUnreadCount();
      return;
    }
    this.crudService.delete('notifications', id).subscribe(() => {
      this.notifications = this.notifications.filter(n => n._id !== id);
      this.updateUnreadCount();
    });
  }

  updateUnreadCount() {
    this.unreadCount = this.notifications.filter(n => !n.isRead).length;
  }
}
