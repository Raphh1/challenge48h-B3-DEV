import React, { useMemo } from 'react';
import { Association } from '../types/association';

interface VirtualizedListProps {
  associations: Association[];
  onAssociationClick?: (association: Association) => void;
  searchQuery: string;
}

const VirtualizedList: React.FC<VirtualizedListProps> = ({ 
  associations, 
  onAssociationClick,
  searchQuery 
}) => {
  // Limiter l'affichage à 50 associations pour optimiser les performances
  const visibleAssociations = useMemo(() => {
    return associations.slice(0, 50);
  }, [associations]);

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 max-h-96 overflow-y-auto">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-semibold text-gray-900">
          {associations.length > 50 
            ? `Affichage des 50 premières associations sur ${associations.length}`
            : `${associations.length} association${associations.length > 1 ? 's' : ''} trouvée${associations.length > 1 ? 's' : ''}`
          }
        </h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {visibleAssociations.map((association, index) => (
          <div
            key={association.id || `${association.nom}-${index}`}
            className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
            onClick={() => onAssociationClick?.(association)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-medium text-gray-900 truncate">
                  {searchQuery ? highlightText(association.nom || '', searchQuery) : association.nom}
                </h4>
                
                {association.contact_ville && (
                  <p className="text-sm text-gray-600 mt-1">
                    📍 {association.contact_ville}
                    {association.contact_cp && ` (${association.contact_cp})`}
                  </p>
                )}
                
                {association.liste_activites && association.liste_activites.length > 0 && (
                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {association.liste_activites.slice(0, 3).map((activite, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-bordeaux-50 text-bordeaux-700"
                        >
                          {searchQuery ? highlightText(activite, searchQuery) : activite}
                        </span>
                      ))}
                      {association.liste_activites.length > 3 && (
                        <span className="text-xs text-gray-500">
                          +{association.liste_activites.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="ml-4 flex-shrink-0">
                {association.coordinates ? (
                  <span className="inline-flex items-center text-xs text-green-600">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    Géolocalisée
                  </span>
                ) : (
                  <span className="inline-flex items-center text-xs text-gray-400">
                    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
                    </svg>
                    Non localisée
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {associations.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p>Aucune association trouvée pour cette recherche.</p>
        </div>
      )}
    </div>
  );
};

export default VirtualizedList;
