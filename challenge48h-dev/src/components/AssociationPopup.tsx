import React from 'react';
import { Association } from '../types/association';
import { ExternalLink, MapPin, Tag, Calendar, Users } from 'lucide-react';

interface AssociationPopupProps {
  association: Association;
}

const AssociationPopup: React.FC<AssociationPopupProps> = ({ association }) => {
  return (
    <div className="max-w-sm">
      <div className="bg-white rounded-lg shadow-lg p-4">
        <h3 className="text-lg font-bold text-gray-900 mb-2 leading-tight">
          {association.nom || 'Association sans nom'}
        </h3>
        
        {association.sigle && (
          <div className="text-sm text-gray-600 mb-2 font-medium">
            {association.sigle}
          </div>
        )}
        
        {association.liste_activites && association.liste_activites.length > 0 && (
          <div className="flex items-start mb-3">
            <Tag className="h-4 w-4 text-bordeaux mr-2 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {association.liste_activites.slice(0, 3).map((activite, index) => (
                <span key={index} className="text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded">
                  {activite}
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
        
        {association.contact_adresse && (
          <div className="flex items-start mb-2">
            <MapPin className="h-4 w-4 text-gray-500 mr-2 mt-0.5" />
            <div className="text-sm text-gray-600">
              <p>{association.contact_adresse}</p>
              {association.contact_cp && association.contact_ville && (
                <p>{association.contact_cp} {association.contact_ville}</p>
              )}
            </div>
          </div>
        )}
        
        {association.anneecreation && (
          <div className="flex items-center mb-2">
            <Calendar className="h-4 w-4 text-gray-500 mr-2" />
            <span className="text-sm text-gray-600">
              Créée en {association.anneecreation}
            </span>
          </div>
        )}
        
        {association.etat && (
          <div className="flex items-center mb-3">
            <Users className="h-4 w-4 text-gray-500 mr-2" />
            <span className={`text-sm px-2 py-1 rounded ${
              association.etat === 'Validée' 
                ? 'bg-green-100 text-green-800' 
                : 'bg-yellow-100 text-yellow-800'
            }`}>
              {association.etat}
            </span>
          </div>
        )}
        
        {association.description && (
          <p className="text-sm text-gray-700 mb-3 leading-relaxed line-clamp-3">
            {association.description.length > 150 
              ? `${association.description.substring(0, 150)}...`
              : association.description
            }
          </p>
        )}
        
        {association.site_web && (
          <div className="mt-3">
            <a
              href={association.site_web}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-white bg-bordeaux rounded-md hover:bg-bordeaux-dark transition-colors duration-200"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Visiter le site web
            </a>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssociationPopup;