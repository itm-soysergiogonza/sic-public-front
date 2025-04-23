import { CertificateType } from '@features/certificate/models/form-field.interface';

export interface SelectOption {
  id?: number;
  value: CertificateType;
  label: string;
}
