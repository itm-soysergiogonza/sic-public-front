export interface CertificateType {
  id: number;
  name: string;
  paid: boolean;
  price: number;
}

export type FieldType =
  | 'TEXT'
  | 'EMAIL'
  | 'SELECT_SINGLE'
  | 'SELECT_MULTIPLE'
  | 'DATE'
  | 'DATE_RANGE'
  | 'NUMBER';

export interface FieldOption {
  value: string;
  label: string;
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

export interface CertificateTypeEvent {
  id?: number;
  label: string;
  value: CertificateType;
}

export type CompareWithCertificateType = (
  item: CertificateTypeEvent,
  selected: CertificateType,
) => boolean;
