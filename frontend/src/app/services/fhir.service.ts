import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FhirService {
  private apiUrl = 'http://localhost:3000/api/fhir';
  private reportUrl = 'http://localhost:3000/api/reports';

  constructor(private http: HttpClient) {}

  getPatient(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/patient/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getDiagnosticReports(patientId: string): Observable<any[]> {
    return this.http.get(`${this.apiUrl}/reports/${patientId}`).pipe(
      map((res: any) => {
        if (!res.entry) return [];
        return res.entry.map((e: any) => this.mapFhirReportToDto(e.resource));
      }),
      catchError(this.handleError)
    );
  }

  getObservationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/observations/detail/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getAnalytics(): Observable<any> {
    return this.http.get(`${this.reportUrl}/analytics`).pipe(
      catchError(this.handleError)
    );
  }

  toggleBookmark(fhirReportId: string, patientId: string, isBookmarked: boolean): Observable<any> {
    return this.http.post(`${this.reportUrl}/bookmark`, { fhirReportId, patientId, isBookmarked }).pipe(
      catchError(this.handleError)
    );
  }

  shareReport(fhirReportId: string, email: string): Observable<any> {
    return this.http.post(`${this.reportUrl}/share`, { fhirReportId, email }).pipe(
      catchError(this.handleError)
    );
  }

  // Mapper Function
  private mapFhirReportToDto(resource: any) {
    return {
      id: resource.id,
      testName: resource.code?.coding?.[0]?.display || resource.code?.text || 'Unknown Test',
      category: resource.category?.[0]?.coding?.[0]?.display || 'General',
      date: resource.effectiveDateTime || resource.issued || new Date().toISOString(),
      status: this.mapStatus(resource.status),
      doctor: resource.performer?.[0]?.display || 'Unknown Doctor',
      lab: 'Central Labs (FHIR)',
      raw: resource
    };
  }

  private mapStatus(status: string) {
    if (!status) return 'Normal';
    const s = status.toLowerCase();
    if (s.includes('final') || s.includes('amended')) return 'Normal';
    if (s.includes('preliminary') || s.includes('registered')) return 'Pending';
    if (s.includes('critical') || s.includes('alert')) return 'Critical';
    return 'Normal';
  }

  private handleError(error: any) {
    console.error('API Error:', error);
    return throwError(() => new Error(error.message || 'Server Error'));
  }
}
