import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable, tap } from 'rxjs';

export interface CertificateType {
  id: number;
  name: string;
  paid: boolean;
  price: number;
}

export interface CertificateField {
  id: number;
  name: string;
  label: string;
  type: string;
  required: boolean;
  placeholder: string | null;
  options: any[] | null;
  minLength: number | null;
  maxLength: number | null;
  minValue: number | null;
  maxValue: number | null;
  certificateType: CertificateType;
}

@Injectable({
  providedIn: 'root',
})
export class CertificatesService {
  private readonly _API_URL = environment.API_URL;
  private _certificateFields = new BehaviorSubject<CertificateField[]>([]);
  private _certificateTypes = new BehaviorSubject<CertificateType[]>([]);

  // Observables para los componentes
  certificateFields$ = this._certificateFields.asObservable();
  certificateTypes$ = this._certificateTypes.asObservable();

  constructor(private _http: HttpClient) {
    // Cargar datos iniciales
    this.refreshCertificateTypes();
    this.refreshCertificateParameters();
  }

  refreshCertificateTypes(): void {
    this._http.get<CertificateType[]>(`${this._API_URL}/api/certificate/type`)
      .pipe(
        tap(types => this._certificateTypes.next(types))
      )
      .subscribe({
        error: (error) => console.error('Error fetching certificate types:', error)
      });
  }

  refreshCertificateParameters(): void {
    this._http.get<CertificateField[]>(`${this._API_URL}/api/certificate/parameter`)
      .pipe(
        tap(fields => this._certificateFields.next(fields))
      )
      .subscribe({
        error: (error) => console.error('Error fetching certificate parameters:', error)
      });
  }

  // Métodos para obtener los valores actuales
  getCertificateTypes(): Observable<CertificateType[]> {
    return this.certificateTypes$;
  }

  getCertificateParameters(): Observable<CertificateField[]> {
    return this.certificateFields$;
  }

  // Método para forzar una actualización de los datos
  refreshAll(): void {
    this.refreshCertificateTypes();
    this.refreshCertificateParameters();
  }
}
