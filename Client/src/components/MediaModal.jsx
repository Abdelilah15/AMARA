import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';

const MediaModal = () => {
    const { mediaModalData, setMediaModalData } = useContext(AppContext);

    // Si aucune donnée de média n'est présente, on n'affiche rien
    if (!mediaModalData) return null;

    const { url, type } = mediaModalData;

    const handleClose = () => {
        setMediaModalData(null);
    };

    return (
        // L'arrière-plan noir semi-transparent qui couvre tout l'écran (z-50 est important)
        <div 
            className="fixed inset-0 bg-black bg-opacity-90 z-50 flex justify-center items-center p-4"
            onClick={handleClose} // Cliquer sur le fond ferme la modale
        >
            
            {/* Bouton de fermeture en haut à droite */}
            <button 
                onClick={handleClose}
                className="absolute top-5 right-5 text-white bg-gray-800 p-2 rounded-full hover:bg-gray-700 transition-colors z-10"
            >
                <i class="fi fi-tr-circle-xmark"></i>
            </button>

            {/* Conteneur du média. onStopPropagation empêche que le clic sur l'image ne ferme la modale */}
            <div 
                className="relative max-w-full max-h-full flex justify-center items-center"
                onClick={(e) => e.stopPropagation()} 
            >
                {type === 'image' ? (
                    <img 
                        src={url} 
                        alt="Full screen view" 
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    />
                ) : type === 'video' ? (
                    <video 
                        src={url} 
                        controls 
                        autoPlay 
                        className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                    >
                        Your browser does not support the video tag.
                    </video>
                ) : null}
            </div>
        </div>
    );
};

export default MediaModal;