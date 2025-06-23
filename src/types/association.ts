export interface Association {
  rna: string;
  nom: string;
  sigle?: string;
  description?: string;
  etat: string;
  datedevalidationstatuts?: string;
  siege?: string;
  liste_activites?: string[];
  contact_adresse?: string;
  contact_cp?: string;
  contact_ville?: string;
  site_web?: string;
  anneecreation?: string;
  coordinates?: [number, number]; // Coordonnées géocodées
}

export interface ApiResponse {
  total_count: number;
  results: Association[];
}