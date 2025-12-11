import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

const MediaModal = () => {
    const { mediaModalData, setMediaModalData } = useContext(AppContext);
    const [showControls, setShowControls] = useState(false);
    const [isLandscape, setIsLandscape] = useState(true);

    const isLegacy = !mediaModalData.mediaList;
    const mediaList = isLegacy ? [mediaModalData.url] : mediaModalData.mediaList;
    const initialIndex = isLegacy ? 0 : (mediaModalData.initialIndex || 0);
    const [currentIndex, setCurrentIndex] = useState(initialIndex);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

    // Met à jour l'index interne quand la prop initialIndex change
    useEffect(() => {
        setCurrentIndex(initialIndex);
    }, [initialIndex]);

    const onClose = () => setMediaModalData(null);  

  // --- Gestion de la Navigation ---
  const handleNext = (e) => {
    if (e) e.stopPropagation();
    if (currentIndex < mediaList.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePrev = (e) => {
    if (e) e.stopPropagation();
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  // --- Gestion du Swipe (Tactile) ---
  const minSwipeDistance = 50; // Distance minimum pour valider un swipe

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      // Swipe vers la gauche -> Suivant
      if (currentIndex < mediaList.length - 1) handleNext();
    } 
    if (isRightSwipe) {
      // Swipe vers la droite -> Précédent
      if (currentIndex > 0) handlePrev();
    }
  };

  // Gestion du clavier (Flèches et Echap)
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
            if (e.key === 'Escape') onClose();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [currentIndex, mediaList]);

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

    // Rendu du média actuel
    const currentUrl = mediaList[currentIndex];
    const extension = currentUrl.split('.').pop().split('?')[0].toLowerCase(); // Hack pour gérer les query params éventuels
    const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(extension);

    // Si aucune donnée de média n'est présente, on n'affiche rien
    if (!mediaModalData) return null;

    const { url, type } = mediaModalData;

    return (
        // L'arrière-plan noir semi-transparent qui couvre tout l'écran (z-50 est important)
        <div
            className="z-100 fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center p-4"
            onClick={onClose} // Cliquer sur le fond ferme la modale
        >

            {/* Bouton de fermeture en haut à droite */}
            <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 text-white bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors z-10"
            >
                <i class="fi fi-tr-circle-xmark flex text-xl"></i>
            </button>

            {/* Conteneur du Média (avec gestion du touch) */}
            <div 
                className="relative w-full h-full max-w-7xl max-h-screen p-4 flex items-center justify-center overflow-hidden"
                onClick={(e) => e.stopPropagation()} // Empêche de fermer si on clique sur l'image
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
            >
                {isVideo ? (
                    <video 
                        src={currentUrl} 
                        controls 
                        autoPlay 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                    />
                ) : (
                    <img 
                        src={currentUrl} 
                        alt={`Media ${currentIndex + 1}`} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-2xl animate-fade-in select-none"
                        draggable={false} // Important pour éviter le drag & drop natif qui gêne le swipe
                    />
                )}
            </div>

            {/* Bouton Suivant (Visible seulement si ce n'est pas le dernier) */}
            {currentIndex < mediaList.length - 1 && (
                <button 
                    onClick={handleNext}
                    className="absolute right-4 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-50 hidden md:block"
                >
                    <ChevronRight />
                </button>
            )}

            {/* Compteur (Ex: 1/4) */}
            {mediaList.length > 1 && (
                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 bg-black/60 text-white px-4 py-1.5 rounded-full text-sm font-medium backdrop-blur-sm pointer-events-none">
                    {currentIndex + 1} / {mediaList.length}
                </div>
            )}
        </div>
    );
};

export default MediaModal;