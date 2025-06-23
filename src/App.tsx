import React, { useState } from 'react';
import Header from './components/Header';
import InteractiveMap from './components/InteractiveMap';
import LoadingSpinner from './components/LoadingSpinner';
import ErrorMessage from './components/ErrorMessage';
import PerformanceStats from './components/PerformanceStats';
import VirtualizedList from './components/VirtualizedList';
import { useAssociations, useFilteredAssociations } from './hooks/useAssociations';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'map' | 'list'>('map');
  const { 
    associations, 
    loading, 
    error, 
    geocodingProgress, 
    geocodingStatus, 
    performanceStats,
    retry 
  } = useAssociations();
  
  const filteredAssociations = useFilteredAssociations(associations, searchQuery);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        associationsCount={filteredAssociations.length}
      />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {!loading && !error && (
          <>
            <PerformanceStats
              totalAssociations={associations.length}
              geocodedAssociations={performanceStats.geocodedCount}
              loadingTime={performanceStats.loadingTime}
              cacheHit={performanceStats.cacheHit}
            />
            
            <div className="flex justify-center mb-4">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1">
                <button
                  onClick={() => setViewMode('map')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'map'
                      ? 'bg-bordeaux-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  🗺️ Vue Carte
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-bordeaux-600 text-white'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  📋 Vue Liste
                </button>
              </div>
            </div>
          </>
        )}
        
        <div className="h-[calc(100vh-300px)] min-h-[500px]">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <LoadingSpinner />
              {geocodingProgress > 0 && (
                <div className="mt-4 w-80">
                  <div className="bg-gray-200 rounded-full h-3">
                    <div 
                      className="bg-bordeaux h-3 rounded-full transition-all duration-300"
                      style={{ width: `${geocodingProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-gray-600 mt-2 text-center">
                    {geocodingStatus}
                  </p>
                  <p className="text-xs text-gray-500 mt-1 text-center">
                    {Math.round(geocodingProgress)}% terminé
                  </p>
                </div>
              )}
            </div>
          ) : error ? (
            <ErrorMessage message={error} onRetry={retry} />
          ) : viewMode === 'map' ? (
            <InteractiveMap associations={filteredAssociations} />
          ) : (
            <VirtualizedList 
              associations={filteredAssociations} 
              searchQuery={searchQuery}
            />
          )}
        </div>
      </main>
      
      <footer className="bg-white border-t border-gray-200 mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <p className="text-sm text-gray-600 text-center">
            Données fournies par{' '}
            <a
              href="https://datahub.bordeaux-metropole.fr/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-bordeaux hover:underline"
            >
              Bordeaux Métropole Open Data
            </a>
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;