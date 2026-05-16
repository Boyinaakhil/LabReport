import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of, throwError, switchMap, forkJoin, delay } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FhirService {
  private apiUrl = 'https://hapi.fhir.org/baseR4';

  constructor(private http: HttpClient) {}

  getPatient(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/Patient/${id}`).pipe(
      catchError(this.handleError)
    );
  }

  getDiagnosticReports(patientId: string): Observable<any[]> {
    return this.http.get(`${this.apiUrl}/DiagnosticReport?patient=${patientId}&_count=50&_sort=-date`).pipe(
      switchMap((res: any) => {
        // Fallback to fetch any recent reports if sandbox doesn't have data for this patient
        if (!res.entry || res.entry.length === 0) {
          return this.http.get(`${this.apiUrl}/DiagnosticReport?_count=10&_sort=-date`);
        }
        return of(res);
      }),
      map((res: any) => {
        if (!res.entry) return [];
        return res.entry.map((e: any) => this.mapFhirReportToDto(e.resource));
      }),
      catchError(this.handleError)
    );
  }

  getObservationById(id: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/DiagnosticReport/${id}`).pipe(
      switchMap((report: any) => {
        const obsObservables: Observable<any>[] = [];
        if (report.result && report.result.length > 0) {
          for (const resRef of report.result) {
            if (resRef.reference) {
              obsObservables.push(
                this.http.get(`${this.apiUrl}/${resRef.reference}`).pipe(
                  catchError(() => of(null))
                )
              );
            }
          }
        }
        
        if (obsObservables.length === 0) {
          return of({ report, observations: [] });
        }
        
        return forkJoin(obsObservables).pipe(
          map(obs => ({
            report,
            observations: obs.filter(o => o !== null)
          }))
        );
      }),
      catchError(this.handleError)
    );
  }

  getAnalytics(): Observable<any> {
    // Generate simulated analytics data purely on the frontend
    return of({
      totalReports: 124,
      normalReports: 89,
      abnormalReports: 25,
      criticalReports: 10
    }).pipe(delay(500));
  }

  toggleBookmark(fhirReportId: string, patientId: string, isBookmarked: boolean): Observable<any> {
    const key = `bookmarks_${patientId}`;
    const bookmarks = JSON.parse(localStorage.getItem(key) || '{}');
    if (isBookmarked) {
      bookmarks[fhirReportId] = true;
    } else {
      delete bookmarks[fhirReportId];
    }
    localStorage.setItem(key, JSON.stringify(bookmarks));
    return of({ success: true, fhirReportId, isBookmarked }).pipe(delay(300));
  }

  shareReport(fhirReportId: string, email: string): Observable<any> {
    // Simulated share action
    return of({ success: true, email }).pipe(delay(600));
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
