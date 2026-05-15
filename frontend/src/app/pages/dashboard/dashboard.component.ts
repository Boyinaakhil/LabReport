import { Component, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FhirService } from '../../services/fhir.service';
import { PdfService } from '../../services/pdf.service';
import { NgApexchartsModule } from 'ng-apexcharts';
import {
  ChartComponent,
  ApexAxisChartSeries,
  ApexChart,
  ApexXAxis,
  ApexTitleSubtitle,
  ApexDataLabels,
  ApexStroke,
  ApexTooltip,
  ApexNonAxisChartSeries
} from 'ng-apexcharts';

export type TrendChartOptions = {
  series: ApexAxisChartSeries;
  chart: ApexChart;
  xaxis: ApexXAxis;
  title: ApexTitleSubtitle;
  dataLabels: ApexDataLabels;
  stroke: ApexStroke;
  tooltip: ApexTooltip;
};

export type DonutChartOptions = {
  series: ApexNonAxisChartSeries;
  chart: ApexChart;
  labels: any;
  dataLabels: ApexDataLabels;
};

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, NgApexchartsModule],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  analytics = signal<any>(null);
  isLoading = signal<boolean>(true);

  public trendChartOptions!: Partial<TrendChartOptions> | any;
  public donutChartOptions!: Partial<DonutChartOptions> | any;

  constructor(
    private fhirService: FhirService,
    private pdfService: PdfService
  ) {}

  ngOnInit() {
    this.fhirService.getAnalytics().subscribe({
      next: (data) => {
        this.analytics.set(data);
        this.initCharts(data);
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
      }
    });
  }

  downloadSummary() {
    if (this.analytics()) {
      // Mocking a summary structure for the PdfService
      const summaryData = {
        testName: 'Monthly Health Summary',
        date: new Date().toISOString(),
        doctor: 'AI Health System',
        lab: 'HealthLink Analytics',
        observations: [
          { name: 'Total Reports', value: this.analytics().totalReports, unit: '', range: 'N/A', status: 'Info' },
          { name: 'Normal Results', value: this.analytics().normalReports, unit: '', range: 'N/A', status: 'Normal' },
          { name: 'Abnormal Results', value: this.analytics().abnormalReports, unit: '', range: 'N/A', status: 'Warning' },
          { name: 'Critical Alerts', value: this.analytics().criticalReports, unit: '', range: 'N/A', status: 'Critical' }
        ]
      };
      this.pdfService.generateReportPdf(summaryData, 'download');
    }
  }

  initCharts(data: any) {
    this.trendChartOptions = {
      series: [
        {
          name: "Blood Sugar",
          data: data.bloodSugarTrends || [90, 95, 110, 105, 98, 92]
        },
        {
          name: "Cholesterol",
          data: data.cholesterolTrends || [180, 185, 190, 175, 160, 165]
        }
      ],
      chart: {
        height: 250,
        type: "area",
        toolbar: { show: false },
        fontFamily: 'Inter, sans-serif'
      },
      dataLabels: {
        enabled: false
      },
      stroke: {
        curve: "smooth",
        width: 2
      },
      xaxis: {
        categories: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"]
      },
      tooltip: {
        x: {
          format: "dd/MM/yy HH:mm"
        }
      }
    };

    this.donutChartOptions = {
      series: [data.normalReports || 95, data.abnormalReports || 25, data.criticalReports || 4],
      chart: {
        type: "donut",
        height: 250,
        fontFamily: 'Inter, sans-serif'
      },
      labels: ["Normal", "Abnormal", "Critical"],
      colors: ['#10b981', '#f59e0b', '#ef4444'],
      dataLabels: {
        enabled: false
      }
    };
  }
}
