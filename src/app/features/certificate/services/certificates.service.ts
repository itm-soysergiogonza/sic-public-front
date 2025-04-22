import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '@environments/environment';
import { BehaviorSubject, Observable, map, tap } from 'rxjs';
import { FieldType } from '../models/form-field.interface';

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
  type: FieldType;
  required: boolean;
  placeholder?: string;
  options?: FieldOption[];
  minLength?: number;
  maxLength?: number;
  minValue?: number;
  maxValue?: number;
  certificateType: CertificateType;
}

export interface FieldOption {
  value: string;
  label: string;
}

@Injectable({
  providedIn: 'root',
})
export class CertificatesService {
  private readonly _API_URL = environment.API_URL;
  private _certificateFields = new BehaviorSubject<CertificateField[]>([]);
  private _certificateTypes = new BehaviorSubject<CertificateType[]>([]);

  certificateFields$ = this._certificateFields.asObservable();
  certificateTypes$ = this._certificateTypes.asObservable();

  constructor(private _http: HttpClient) {
    // Cargar datos iniciales
    this.refreshCertificateTypes();
    this.refreshCertificateParameters();
  }

  private mapApiFieldType(type: string): FieldType {
    switch (type.toUpperCase()) {
      case 'TEXT':
        return 'TEXT';
      case 'EMAIL':
        return 'EMAIL';
      case 'SELECT':
        return 'SELECT_SINGLE';
      case 'MULTISELECT':
        return 'SELECT_MULTIPLE';
      case 'DATE':
        return 'DATE';
      case 'DATE_RANGE':
        return 'DATE_RANGE';
      case 'NUMBER':
        return 'NUMBER';
      default:
        return 'TEXT';
    }
  }

  private transformApiField(field: any): CertificateField {
    return {
      ...field,
      type: this.mapApiFieldType(field.type),
      placeholder: field.placeholder || undefined,
      options: field.options || undefined,
      minLength: field.minLength || undefined,
      maxLength: field.maxLength || undefined,
      minValue: field.minValue || undefined,
      maxValue: field.maxValue || undefined,
    };
  }

  refreshCertificateTypes(): void {
    this._http
      .get<CertificateType[]>(`${this._API_URL}/api/certificate/type`)
      .pipe(tap((types) => this._certificateTypes.next(types)))
      .subscribe({
        error: (error) =>
          console.error('Error fetching certificate types:', error),
      });
  }

  refreshCertificateParameters(): void {
    this._http
      .get<any[]>(`${this._API_URL}/api/certificate/parameter`)
      .pipe(
        map((fields) => fields.map((field) => this.transformApiField(field))),
        tap((fields) => this._certificateFields.next(fields)),
      )
      .subscribe({
        error: (error) =>
          console.error('Error fetching certificate parameters:', error),
      });
  }

  getCertificateTypes(): Observable<CertificateType[]> {
    return this.certificateTypes$;
  }

  getCertificateParameters(): Observable<CertificateField[]> {
    return this.certificateFields$;
  }

  refreshAll(): void {
    this.refreshCertificateTypes();
    this.refreshCertificateParameters();
  }
}
