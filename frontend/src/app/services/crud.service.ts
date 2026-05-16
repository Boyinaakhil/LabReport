import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  constructor() {}

  private getCollection(model: string): any[] {
    const data = localStorage.getItem(`crud_${model}`);
    return data ? JSON.parse(data) : [];
  }

  private saveCollection(model: string, data: any[]): void {
    localStorage.setItem(`crud_${model}`, JSON.stringify(data));
  }

  private generateId(): string {
    return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
  }

  // Generic CRUD
  create(model: string, data: any): Observable<any> {
    const collection = this.getCollection(model);
    const newDoc = {
      ...data,
      _id: this.generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    collection.push(newDoc);
    this.saveCollection(model, collection);
    return of(newDoc).pipe(delay(300));
  }

  getAll(model: string, query: any = {}): Observable<any[]> {
    let collection = this.getCollection(model);
    
    // Simple query filtering (mocking Mongoose find)
    const keys = Object.keys(query);
    if (keys.length > 0) {
      collection = collection.filter(item => {
        return keys.every(k => item[k] === query[k]);
      });
    }

    return of(collection).pipe(delay(300));
  }

  getById(model: string, id: string): Observable<any> {
    const collection = this.getCollection(model);
    const doc = collection.find(item => item._id === id);
    if (!doc) throw new Error('Not found');
    return of(doc).pipe(delay(200));
  }

  update(model: string, id: string, data: any): Observable<any> {
    const collection = this.getCollection(model);
    const idx = collection.findIndex(item => item._id === id);
    if (idx === -1) throw new Error('Not found');
    
    collection[idx] = { ...collection[idx], ...data, updatedAt: new Date().toISOString() };
    this.saveCollection(model, collection);
    return of(collection[idx]).pipe(delay(300));
  }

  delete(model: string, id: string): Observable<any> {
    let collection = this.getCollection(model);
    collection = collection.filter(item => item._id !== id);
    this.saveCollection(model, collection);
    return of({ success: true }).pipe(delay(300));
  }

  // Specialized endpoints
  markNotificationRead(id: string): Observable<any> {
    return this.update('notifications', id, { isRead: true });
  }

  markAllNotificationsRead(userId: string): Observable<any> {
    let collection = this.getCollection('notifications');
    collection = collection.map(item => {
      if (item.userId === userId) {
        return { ...item, isRead: true, updatedAt: new Date().toISOString() };
      }
      return item;
    });
    this.saveCollection('notifications', collection);
    return of({ success: true }).pipe(delay(300));
  }
}
