import React from 'react';

interface PerformanceStatsProps {
  totalAssociations: number;
  geocodedAssociations: number;
  loadingTime?: number;
  cacheHit?: boolean;
}

const PerformanceStats: React.FC<PerformanceStatsProps> = ({
  totalAssociations,
  geocodedAssociations,
  loadingTime,
  cacheHit
}) => {
  const geocodingRate = totalAssociations > 0 ? Math.round((geocodedAssociations / totalAssociations) * 100) : 0;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-900 mb-3">Statistiques de performance</h3>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className="text-2xl font-bold text-bordeaux-600">{totalAssociations}</div>
          <div className="text-xs text-gray-600">Associations</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">{geocodedAssociations}</div>
          <div className="text-xs text-gray-600">Géolocalisées</div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-blue-600">{geocodingRate}%</div>
          <div className="text-xs text-gray-600">Taux de géolocalisation</div>
        </div>
        
        <div className="text-center">
          <div className="flex items-center justify-center">
            {cacheHit ? (
              <div className="text-2xl font-bold text-green-600 flex items-center">
                <svg className="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Cache
              </div>
            ) : (
              <div className="text-2xl font-bold text-orange-600">
                {loadingTime ? `${loadingTime}s` : '⏱️'}
              </div>
            )}
          </div>
          <div className="text-xs text-gray-600">
            {cacheHit ? 'Données en cache' : 'Temps de chargement'}
          </div>
        </div>
      </div>
      
      {cacheHit && (
        <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded-md">
          <p className="text-xs text-green-700 text-center">
            ⚡ Chargement ultra-rapide grâce au cache !
          </p>
        </div>
      )}
    </div>
  );
};

export default PerformanceStats;
