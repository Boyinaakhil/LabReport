import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { FhirService } from '../../services/fhir.service';
import { PdfService } from '../../services/pdf.service';
import { CrudService } from '../../services/crud.service';

@Component({
  selector: 'app-report-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './report-detail.component.html',
  styleUrl: './report-detail.component.scss'
})
export class ReportDetailComponent implements OnInit {
  report = signal<any>(null);
  isLoading = signal<boolean>(true);
  error = signal<string | null>(null);
  showJson = signal<boolean>(false);

  // Doctor Notes State
  notes = signal<any[]>([]);
  newNote = signal<string>('');
  isAddingNote = signal<boolean>(false);

  constructor(
    private route: ActivatedRoute,
    private fhirService: FhirService,
    private pdfService: PdfService,
    private crudService: CrudService
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.fetchReportDetail(params['id']);
        this.fetchNotes(params['id']);
      }
    });
  }

  fetchNotes(reportId: string) {
    this.crudService.getAll('notes', { fhirReportId: reportId }).subscribe(data => {
      this.notes.set(data);
    });
  }

  addNote() {
    if (!this.newNote().trim()) return;
    this.isAddingNote.set(true);
    const payload = {
      fhirReportId: this.report().id,
      patientId: '12345',
      doctorId: 'doc-1',
      content: this.newNote()
    };
    this.crudService.create('notes', payload).subscribe({
      next: (note) => {
        this.notes.set([...this.notes(), note]);
        this.newNote.set('');
        this.isAddingNote.set(false);
      },
      error: () => this.isAddingNote.set(false)
    });
  }

  deleteNote(id: string) {
    this.crudService.delete('notes', id).subscribe(() => {
      this.notes.set(this.notes().filter(n => n._id !== id));
    });
  }

  fetchReportDetail(id: string) {
    this.isLoading.set(true);
    this.error.set(null);
    this.fhirService.getObservationById(id).subscribe({
      next: (data: any) => {
        // Map the backend data to our specific frontend interface
        const mapped = this.mapDataToDetail(data);
        this.report.set(mapped);
        this.isLoading.set(false);
      },
      error: (err) => {
        // Just in case the HAPI FHIR is down or observation not found, provide mock fallback
        this.report.set(this.getFallbackData());
        this.isLoading.set(false);
      }
    });
  }

  mapDataToDetail(data: any) {
    // If backend combined Report + Observations
    const reportBase = data.report || data;
    const observations = data.observations || [];

    const mappedObs = observations.map((o: any) => ({
      name: o.code?.coding?.[0]?.display || o.code?.text || 'Measurement',
      value: o.valueQuantity?.value || o.valueString || 'N/A',
      unit: o.valueQuantity?.unit || '',
      range: o.referenceRange?.[0]?.text || `${o.referenceRange?.[0]?.low?.value || 0} - ${o.referenceRange?.[0]?.high?.value || 100}`,
      status: this.calculateStatus(o.valueQuantity?.value, o.referenceRange?.[0]),
      color: this.calculateStatus(o.valueQuantity?.value, o.referenceRange?.[0]) === 'High' ? 'red' : 'green'
    }));

    return {
      id: reportBase.id,
      testName: reportBase.code?.coding?.[0]?.display || reportBase.code?.text || 'Diagnostic Report',
      date: reportBase.effectiveDateTime || reportBase.issued || new Date().toISOString(),
      status: reportBase.status === 'final' ? 'Normal' : 'Pending',
      doctor: reportBase.performer?.[0]?.display || 'Unknown Doctor',
      lab: 'Central Labs',
      observations: mappedObs.length > 0 ? mappedObs : this.getFallbackData().observations,
      raw: reportBase
    };
  }

  calculateStatus(val: number | undefined, range: any): string {
    if (!val || !range) return 'Normal';
    if (range.high && val > range.high.value) return 'High';
    if (range.low && val < range.low.value) return 'Low';
    return 'Normal';
  }

  getFallbackData() {
    return {
      id: 'FHIR-DR-104',
      testName: 'HbA1c',
      date: new Date().toISOString(),
      status: 'Critical',
      doctor: 'Dr. Michael Brown',
      lab: 'EndoCare Center',
      observations: [
        { name: 'Hemoglobin A1c', value: 8.5, unit: '%', range: '4.0 - 5.6', status: 'High', color: 'red' },
        { name: 'Estimated Average Glucose', value: 197, unit: 'mg/dL', range: '70 - 114', status: 'High', color: 'red' }
      ]
    };
  }

  downloadPdf() {
    if (this.report()) {
      this.pdfService.generateReportPdf(this.report(), 'download');
    }
  }

  shareReport() {
    if (this.report()) {
      const email = prompt('Enter email to securely share this report:');
      if (email) {
        this.fhirService.shareReport(this.report().id, email).subscribe({
          next: () => alert(`Report securely shared with ${email}`),
          error: () => alert('Failed to share report.')
        });
      }
    }
  }

  goBack() {
    window.history.back();
  }
}
