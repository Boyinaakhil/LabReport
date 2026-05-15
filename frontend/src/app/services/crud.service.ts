import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CrudService {
  private apiUrl = 'https://labreport-01ta.onrender.com/api/crud';

  constructor(private http: HttpClient) {}

  // Generic CRUD
  create(model: string, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/${model}`, data);
  }

  getAll(model: string, query: any = {}): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${model}`, { params: query });
  }

  getById(model: string, id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${model}/${id}`);
  }

  update(model: string, id: string, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/${model}/${id}`, data);
  }

  delete(model: string, id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${model}/${id}`);
  }

  // Specialized endpoints
  markNotificationRead(id: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/mark-read/${id}`, {});
  }

  markAllNotificationsRead(userId: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/notifications/mark-all-read/${userId}`, {});
  }
}
