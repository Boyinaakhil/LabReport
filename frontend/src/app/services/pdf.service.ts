import { Injectable } from '@angular/core';

// @ts-ignore
import * as pdfMake from 'pdfmake/build/pdfmake';
// @ts-ignore
import * as pdfFonts from 'pdfmake/build/vfs_fonts';

const pdfMakeAny: any = pdfMake;
if (pdfMakeAny && pdfMakeAny.default) {
  pdfMakeAny.default.vfs = pdfFonts && (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;
} else if (pdfMakeAny) {
  pdfMakeAny.vfs = pdfFonts && (pdfFonts as any).pdfMake ? (pdfFonts as any).pdfMake.vfs : (pdfFonts as any).vfs;
}

@Injectable({
  providedIn: 'root'
})
export class PdfService {

  generateReportPdf(reportDetail: any, action: 'download' | 'print' = 'download') {
    const docDefinition: any = {
      content: [
        { text: 'HealthLink Lab Report', style: 'header' },
        { text: `Test Name: ${reportDetail.testName}`, style: 'subheader' },
        { text: `Date: ${reportDetail.date}`, margin: [0, 0, 0, 10] },
        { text: `Doctor: ${reportDetail.doctor}` },
        { text: `Lab: ${reportDetail.lab}`, margin: [0, 0, 0, 20] },
        { text: 'Biomarker Results', style: 'subheader' },
        this.buildObservationsTable(reportDetail.observations)
      ],
      styles: {
        header: {
          fontSize: 22,
          bold: true,
          color: '#0c4a6e',
          margin: [0, 0, 0, 10]
        },
        subheader: {
          fontSize: 16,
          bold: true,
          margin: [0, 10, 0, 5]
        },
        tableHeader: {
          bold: true,
          fontSize: 13,
          color: 'black'
        }
      }
    };

    let pdf: any;
    if (pdfMakeAny && pdfMakeAny.default && typeof pdfMakeAny.default.createPdf === 'function') {
      pdf = pdfMakeAny.default.createPdf(docDefinition);
    } else {
      pdf = pdfMakeAny.createPdf(docDefinition);
    }

    if (action === 'download') {
      pdf.download(`${reportDetail.testName.replace(/ /g, '_')}_Report.pdf`);
    } else {
      pdf.print();
    }
  }

  private buildObservationsTable(observations: any[]) {
    if (!observations || observations.length === 0) {
      return { text: 'No observations recorded.', margin: [0, 10, 0, 10] };
    }

    const tableBody = [
      [
        { text: 'Test', style: 'tableHeader' },
        { text: 'Result', style: 'tableHeader' },
        { text: 'Status', style: 'tableHeader' },
        { text: 'Reference Range', style: 'tableHeader' }
      ]
    ];

    observations.forEach(obs => {
      tableBody.push([
        obs.name || 'Unknown',
        `${obs.value} ${obs.unit}`,
        obs.status,
        `${obs.range} ${obs.unit}`
      ]);
    });

    return {
      table: {
        headerRows: 1,
        widths: ['*', 'auto', 'auto', '*'],
        body: tableBody
      },
      layout: 'lightHorizontalLines'
    };
  }
}
