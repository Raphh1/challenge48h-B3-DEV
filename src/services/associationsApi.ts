const API_BASE_URL = 'https://datahub.bordeaux-metropole.fr/api/explore/v2.1/catalog/datasets/bor_associations/records';

// Cache pour stocker les associations et éviter les appels répétés
let associationsCache: any = null;
let cacheTimestamp: number = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes en millisecondes

// Fonction optimisée pour récupérer les associations avec mise en cache
export const fetchAssociations = async (query?: string): Promise<any> => {
  // Vérifier si on peut utiliser le cache
  const now = Date.now();
  if (associationsCache && (now - cacheTimestamp) < CACHE_DURATION && !query) {
    console.log('Using cached data');
    return associationsCache;
  }

  const params = new URLSearchParams({
    limit: '100',
    // Sélectionner seulement les champs nécessaires pour réduire la taille de la réponse
    select: 'nom,liste_activites,description,adresse,ville,code_postal,telephone,email,site_web',
  });

  if (query) {
    // Recherche dans le nom, les activités et la description
    params.append('where', `nom like "%${query}%" or liste_activites like "%${query}%" or description like "%${query}%"`);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // Timeout de 10 secondes

    const response = await fetch(`${API_BASE_URL}?${params}`, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'max-age=300', // Cache navigateur de 5 minutes
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Mettre en cache seulement si c'est une requête sans filtre
    if (!query) {
      associationsCache = data;
      cacheTimestamp = now;
      console.log('Data cached for future use');
    }
    
    console.log('API Response loaded:', data.results?.length || 0, 'associations');
    
    return data;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Request timeout - using cached data if available');
      if (associationsCache && !query) {
        return associationsCache;
      }
    }
    console.error('Error fetching associations:', error);
    throw error;
  }
};

// Fonction pour vider le cache si nécessaire
export const clearAssociationsCache = () => {
  associationsCache = null;
  cacheTimestamp = 0;
};

// Fonction pour pre-charger les associations en arrière-plan
export const preloadAssociations = async (): Promise<void> => {
  try {
    await fetchAssociations();
  } catch (error) {
    console.error('Error preloading associations:', error);
  }
};

// Cache pour le géocodage
const geocodeCache = new Map<string, [number, number] | null>();

// Service de géocodage optimisé avec cache et throttling
export const geocodeAddress = async (address: string, city: string, postalCode: string): Promise<[number, number] | null> => {
  const cacheKey = `${address}_${postalCode}_${city}`;
  
  // Vérifier le cache d'abord
  if (geocodeCache.has(cacheKey)) {
    return geocodeCache.get(cacheKey)!;
  }

  const fullAddress = `${address}, ${postalCode} ${city}, France`;
  
  try {
    // Réduire le délai de 100ms à 50ms pour accélérer
    await new Promise(resolve => setTimeout(resolve, 50));
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // Timeout de 5 secondes
    
    const response = await fetch(
      `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(fullAddress)}&limit=1&countrycodes=fr`,
      {
        signal: controller.signal,
        headers: {
          'User-Agent': 'AssociationApp/1.0'
        }
      }
    );
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      geocodeCache.set(cacheKey, null);
      return null;
    }
    
    const data = await response.json();
    let result: [number, number] | null = null;
    
    if (data && data.length > 0) {
      const lat = parseFloat(data[0].lat);
      const lon = parseFloat(data[0].lon);
      
      // Vérifier que les coordonnées sont dans la région de Bordeaux
      if (lat >= 44.5 && lat <= 45.0 && lon >= -1.0 && lon <= -0.2) {
        result = [lat, lon];
      }
    }
    
    // Mettre en cache le résultat
    geocodeCache.set(cacheKey, result);
    return result;
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('Geocoding timeout for:', fullAddress);
    } else {
      console.error('Geocoding error:', error);
    }
    geocodeCache.set(cacheKey, null);
    return null;
  }
};

// Fonction pour géocoder plusieurs adresses par batch
export const geocodeAddressesBatch = async (
  addresses: Array<{address: string, city: string, postalCode: string, id: string}>
): Promise<Map<string, [number, number] | null>> => {
  const results = new Map<string, [number, number] | null>();
  const batchSize = 5; // Traiter 5 adresses en parallèle maximum
  
  for (let i = 0; i < addresses.length; i += batchSize) {
    const batch = addresses.slice(i, i + batchSize);
    
    const promises = batch.map(async (addr) => {
      const coords = await geocodeAddress(addr.address, addr.city, addr.postalCode);
      return { id: addr.id, coords };
    });
    
    const batchResults = await Promise.all(promises);
    batchResults.forEach(result => {
      results.set(result.id, result.coords);
    });
    
    // Petit délai entre les batches pour éviter de surcharger l'API
    if (i + batchSize < addresses.length) {
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  }
  
  return results;
};

// Fonction pour vider le cache de géocodage
export const clearGeocodeCache = () => {
  geocodeCache.clear();
};