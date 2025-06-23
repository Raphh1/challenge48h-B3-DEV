export interface Toilet {
  geoPoint: string;
  geoShape: string;
  gmlId: string;
  gid: number;
  geomO: number;
  adresse: string;
  type: string;
  handi: string;
  cdate: string;
  mdate: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
}

export type ToiletType = 'SANITAIRE_AUTOMATIQUE' | 'URINOIR' | 'CHALET_DE_NECESSITE';
