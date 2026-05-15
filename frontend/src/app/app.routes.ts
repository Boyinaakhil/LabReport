import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layouts/main-layout/main-layout.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { LabReportsComponent } from './pages/lab-reports/lab-reports.component';
import { ReportDetailComponent } from './pages/report-detail/report-detail.component';

export const routes: Routes = [
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'reports', component: LabReportsComponent },
      { path: 'reports/:id', component: ReportDetailComponent }
    ]
  }
];
