import { Toilet } from '@/types/Toilet';

export function parseToiletCSV(csvContent: string): Toilet[] {
  const lines = csvContent.trim().split('\n');
  const data: Toilet[] = [];

  // Skip header line
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    const columns = line.split(';');

    if (columns.length >= 10) {
      const geoPoint = columns[0].trim();
      const coords = geoPoint.split(',');
      
      if (coords.length === 2) {
        const latitude = parseFloat(coords[0].trim());
        const longitude = parseFloat(coords[1].trim());

        const toilet: Toilet = {
          geoPoint: geoPoint,
          geoShape: columns[1].trim(),
          gmlId: columns[2].trim(),
          gid: parseInt(columns[3].trim()),
          geomO: parseInt(columns[4].trim()),
          adresse: columns[5].trim(),
          type: columns[6].trim(),
          handi: columns[7].trim(),
          cdate: columns[8].trim(),
          mdate: columns[9].trim(),
          coordinates: {
            latitude,
            longitude
          }
        };

        data.push(toilet);
      }
    }
  }

  return data;
}

export function getToiletIcon(type: string): string {
  switch (type) {
    case 'SANITAIRE_AUTOMATIQUE':
      return '🚻';
    case 'URINOIR':
      return '🚹';
    case 'CHALET_DE_NECESSITE':
      return '🏠';
    default:
      return '🚾';
  }
}

export function getToiletColor(type: string): string {
  switch (type) {
    case 'SANITAIRE_AUTOMATIQUE':
      return '#28A745'; // Bootstrap success green
    case 'URINOIR':
      return '#007BFF'; // Bootstrap primary blue
    case 'CHALET_DE_NECESSITE':
      return '#FD7E14'; // Bootstrap warning orange
    default:
      return '#6C757D'; // Bootstrap secondary grey
  }
}
