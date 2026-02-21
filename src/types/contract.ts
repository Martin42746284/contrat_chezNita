export type Role = 'fournisseuse' | 'distributrice';

export type ContractStatus = 'brouillon' | 'en_attente' | 'valide';

export type CINVerificationStatus = 'idle' | 'verifying' | 'valid' | 'invalid';

export interface CINPhotos {
  recto: string | null;
  verso: string | null;
  rectoStatus: CINVerificationStatus;
  versoStatus: CINVerificationStatus;
  rectoError: string | null;
  versoError: string | null;
}

export interface PartyInfo {
  nomComplet: string;
  cin: string;
  adresse: string;
  telephone: string;
  cinPhotos: CINPhotos;
}

export interface DistributorInfo extends PartyInfo {
  nomPage: string;
}

export interface ProductSelection {
  robes: boolean;
  jupes: boolean;
  chemises: boolean;
  ensembles: boolean;
  autres: boolean;
  autresDetail: string;
}

export interface PricingOption {
  type: 'marge' | 'commission';
  commissionPercent: number;
}

export interface PaymentMethod {
  mvola: boolean;
  orangeMoney: boolean;
  airtelMoney: boolean;
}

export interface DeliveryOption {
  responsable: 'fournisseuse' | 'distributrice';
  fraisPayePar: 'client' | 'distributrice' | 'fournisseuse';
}

export interface ContractData {
  fournisseuse: PartyInfo;
  distributrice: DistributorInfo;
  produits: ProductSelection;
  prix: PricingOption;
  paiement: PaymentMethod;
  livraison: DeliveryOption;
  lieu: string;
  date: string;
  dateCreation: string;
  dateValidation: string | null;
  validationFournisseuse: boolean;
  validationDistributrice: boolean;
  status: ContractStatus;
}

export const initialCINPhotos: CINPhotos = {
  recto: null,
  verso: null,
  rectoStatus: 'idle',
  versoStatus: 'idle',
  rectoError: null,
  versoError: null,
};

export const initialPartyInfo: PartyInfo = {
  nomComplet: '',
  cin: '',
  adresse: '',
  telephone: '',
  cinPhotos: { ...initialCINPhotos },
};

export const initialDistributorInfo: DistributorInfo = {
  ...initialPartyInfo,
  nomPage: '',
};

export const initialContractData: ContractData = {
  fournisseuse: { ...initialPartyInfo },
  distributrice: { ...initialDistributorInfo, cinPhotos: { ...initialCINPhotos } },
  produits: {
    robes: false,
    jupes: false,
    chemises: false,
    ensembles: false,
    autres: false,
    autresDetail: '',
  },
  prix: { type: 'marge', commissionPercent: 10 },
  paiement: { mvola: false, orangeMoney: false, airtelMoney: false },
  livraison: { responsable: 'fournisseuse', fraisPayePar: 'client' },
  lieu: '',
  date: new Date().toISOString().split('T')[0],
  dateCreation: new Date().toISOString(),
  dateValidation: null,
  validationFournisseuse: false,
  validationDistributrice: false,
  status: 'brouillon',
};
