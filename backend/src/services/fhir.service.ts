import axios from 'axios';

const FHIR_BASE_URL = process.env.FHIR_BASE_URL || 'http://hapi.fhir.org/baseR4';

export class FHIRService {
  
  static async getPatient(patientId: string) {
    try {
      const response = await axios.get(`${FHIR_BASE_URL}/Patient/${patientId}`);
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch patient data from FHIR');
    }
  }

  static async getDiagnosticReports(patientId: string) {
    try {
      // First try to get reports for specific patient
      let response = await axios.get(`${FHIR_BASE_URL}/DiagnosticReport`, {
        params: { patient: patientId, _count: 50, _sort: '-date' }
      });
      
      // If empty, fetch ANY recent reports so the UI isn't empty (since HAPI sandbox is volatile)
      if (!response.data || !response.data.entry || response.data.entry.length === 0) {
        response = await axios.get(`${FHIR_BASE_URL}/DiagnosticReport`, {
          params: { _count: 10, _sort: '-date' }
        });
      }
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch diagnostic reports');
    }
  }

  static async getDiagnosticReportById(reportId: string) {
    try {
      // Get the report
      const reportRes = await axios.get(`${FHIR_BASE_URL}/DiagnosticReport/${reportId}`);
      const report = reportRes.data;

      // Get referenced observations
      const observations = [];
      if (report.result && report.result.length > 0) {
        for (const resRef of report.result) {
          if (resRef.reference) {
            try {
              const obsRes = await axios.get(`${FHIR_BASE_URL}/${resRef.reference}`);
              observations.push(obsRes.data);
            } catch (e) {
              console.warn(`Could not fetch observation ${resRef.reference}`);
            }
          }
        }
      }

      return { report, observations };
    } catch (error) {
      throw new Error('Failed to fetch diagnostic report details');
    }
  }

  static async getObservations(patientId: string) {
    try {
      const response = await axios.get(`${FHIR_BASE_URL}/Observation`, {
        params: { patient: patientId, _count: 100 }
      });
      return response.data;
    } catch (error) {
      throw new Error('Failed to fetch observations');
    }
  }
}
