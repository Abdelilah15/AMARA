import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

const MediaModal = () => {
    const { mediaModalData, setMediaModalData } = useContext(AppContext);
    const [showControls, setShowControls] = useState(false);
    const [isLandscape, setIsLandscape] = useState(true);

    useEffect(() => {
        // Si la modale est ouverte (il y a des données), on bloque le scroll
        if (mediaModalData) {
            document.body.style.overflow = 'hidden';
        }

        // Nettoyage : quand le composant est démonté ou que les données changent
        return () => {
            document.body.style.overflow = 'unset';
        };
    }, [mediaModalData]); // On dépend de mediaModalData

    const handleClose = (e) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setMediaModalData(null);
        setShowControls(false); // Arrête la propagation du clic
    };

    const handleImageLoad = (e) => {
        const { naturalWidth, naturalHeight } = e.target;
        // Si la largeur est plus grande que la hauteur, c'est un paysage
        setIsLandscape(naturalWidth > naturalHeight);
    };

    // Si aucune donnée de média n'est présente, on n'affiche rien
    if (!mediaModalData) return null;

    const { url, type } = mediaModalData;

    return (
        // L'arrière-plan noir semi-transparent qui couvre tout l'écran (z-50 est important)
        <div
            className="z-100 fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center p-4"
            onClick={handleClose} // Cliquer sur le fond ferme la modale
        >

            {/* Bouton de fermeture en haut à droite */}
            <button
                type="button"
                onClick={handleClose}
                className="absolute top-5 right-5 text-white bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors z-10"
            >
                <i class="fi fi-tr-circle-xmark flex text-xl"></i>
            </button>

            {/* Conteneur du média. onStopPropagation empêche que le clic sur l'image ne ferme la modale */}
            <div
                className="relative w-full h-full flex justify-center items-center"
                // 3. Quand la souris entre, on montre les contrôles
                onMouseEnter={() => setShowControls(true)}
                // 4. Quand la souris sort, on cache les contrôles
                onMouseLeave={() => setShowControls(false)}
                onClick={(e) => e.stopPropagation()}
            >
                {type === 'image' ? (
                    <img
                        src={url}
                        alt="Full screen view"
                        style={{ borderRadius: "15px" }}
                        onLoad={handleImageLoad}
                        // 5. Application conditionnelle des classes
                        className={`rounded-lg shadow-2xl object-contain transition-all duration-300 ${isLandscape
                            ? 'w-full h-auto max-h-[90vh]'   // Cas w > h (Paysage) : Largeur max
                            : 'h-[90vh] w-auto max-w-full'   // Cas w < h (Portrait) : Hauteur max
                            }`}
                    />
                ) : type === 'video' ? (
                    <video
                        src={url}
                        controls={showControls}
                        preload="auto"
                        autoPlay
                        loop
                        muted
                        style={{ borderRadius: "15px" }}
                        className="w-full"
                    >
                        Your browser does not support the video tag.
                    </video>
                ) : null}
            </div>
        </div>
    );
};

export default MediaModal;