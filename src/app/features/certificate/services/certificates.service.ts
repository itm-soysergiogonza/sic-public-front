import { HttpClient, HttpParams } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { environment } from "@environments/environment";
import {
  CertificateField,
  CertificateType,
  FieldOption,
} from "@shared/models/interfaces/form-field.interface";
import { BehaviorSubject, Observable, tap } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class CertificatesService {
  private readonly _API_URL = environment.API_URL;
  private _certificateTypes = new BehaviorSubject<CertificateType[]>([]);

  certificateTypes$ = this._certificateTypes.asObservable();

  constructor(private _http: HttpClient) {
    this.refreshCertificateTypes();
  }

  refreshCertificateTypes(): void {
    this._http
      .get<CertificateType[]>(`${this._API_URL}/api/certificate/type`)
      .pipe(tap((types) => this._certificateTypes.next(types)))
      .subscribe({
        error: (error) =>
          console.error("Error fetching certificate types:", error),
      });
  }

  getCertificateTypes(): Observable<CertificateType[]> {
    return this.certificateTypes$;
  }

  fetchOptions(parameterId: number, data: any): Observable<FieldOption[]> {
    return this._http.post<FieldOption[]>(
      `${this._API_URL}/api/certificate/parameter/${parameterId}/options`,
      data
    );
  }

  getCertificateParametersByType(
    certificateTypeId: number
  ): Observable<CertificateField[]> {
    return this._http.get<CertificateField[]>(
      `${this._API_URL}/api/certificate/parameter/certificate-type/${certificateTypeId}`
    );
  }

  generateCertificate(data: any): Observable<Blob> {
    return this._http.post(`${this._API_URL}/api/certificate/generate`, data, {
      responseType: "blob",
    });
  }
}
