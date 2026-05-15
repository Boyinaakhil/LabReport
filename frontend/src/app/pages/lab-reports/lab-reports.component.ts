import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FhirService } from '../../services/fhir.service';
import { SocketService } from '../../services/socket.service';
import { PdfService } from '../../services/pdf.service';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-lab-reports',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './lab-reports.component.html',
  styleUrl: './lab-reports.component.scss'
})
export class LabReportsComponent implements OnInit {
  reports = signal<any[]>([]);
  filteredReports = signal<any[]>([]);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  
  searchQuery = signal<string>('');
  filterStatus = signal<string>('All');
  
  patientId = '12345'; // Replace with dynamic Auth ID later

  constructor(
    private fhirService: FhirService,
    private socketService: SocketService,
    private pdfService: PdfService
  ) {}

  ngOnInit() {
    this.fetchReports();

    // Listen for realtime bookmark updates
    this.socketService.on('bookmarkUpdated').subscribe(data => {
      console.log('Realtime Bookmark Update:', data);
      // Can be used to highlight bookmarked rows
    });
  }

  fetchReports() {
    this.isLoading.set(true);
    this.error.set(null);
    this.fhirService.getDiagnosticReports(this.patientId).subscribe({
      next: (data) => {
        this.reports.set(data);
        this.filteredReports.set(data);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.error.set(err.message || 'Failed to load reports');
        this.isLoading.set(false);
      }
    });
  }

  filterData() {
    let result = this.reports();
    
    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      result = result.filter(r => 
        r.testName.toLowerCase().includes(q) || 
        r.doctor.toLowerCase().includes(q)
      );
    }

    if (this.filterStatus() !== 'All') {
      result = result.filter(r => r.status === this.filterStatus());
    }

    this.filteredReports.set(result);
  }

  downloadPdf(event: Event, report: any) {
    event.stopPropagation();
    this.pdfService.generateReportPdf(report);
  }

  shareReport(event: Event, report: any) {
    event.stopPropagation();
    const email = prompt('Enter email to securely share this report:');
    if (email) {
      this.fhirService.shareReport(report.id, email).subscribe({
        next: () => alert(`Report successfully shared with ${email}`),
        error: () => alert('Failed to share report.')
      });
    }
  }

  getStatusClass(status: string) {
    switch(status) {
      case 'Normal': return 'status-normal';
      case 'Abnormal': return 'status-abnormal';
      case 'Critical': return 'status-critical';
      case 'Pending': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  }
}
