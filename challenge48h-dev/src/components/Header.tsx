import React from 'react';
import { Search, MapPin } from 'lucide-react';

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  associationsCount: number;
}

const Header: React.FC<HeaderProps> = ({ searchQuery, onSearchChange, associationsCount }) => {
  return (
    <div className="bg-white shadow-lg border-b-4 border-bordeaux">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between py-6">
          <div className="flex items-center mb-4 lg:mb-0">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-bordeaux mr-3" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                  Associations de Bordeaux Métropole
                </h1>
                <p className="text-gray-600 text-sm lg:text-base">
                  {associationsCount} associations référencées
                </p>
              </div>
            </div>
          </div>
          
          <div className="relative w-full lg:w-96">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-bordeaux focus:border-transparent transition-all duration-200"
              placeholder="Rechercher une association, catégorie..."
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;