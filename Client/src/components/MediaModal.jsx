import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';

const MediaModal = () => {
    const context = useContext(AppContext);
    const { mediaModalData, setMediaModalData } = useContext(AppContext);
    const safeData = mediaModalData || {};

    const [showControls, setShowControls] = useState(false);
    const [isLandscape, setIsLandscape] = useState(true);

    const isLegacy = !safeData.mediaList;
    const mediaList = isLegacy
        ? (safeData.url ? [safeData.url] : [])
        : (safeData.mediaList || []);
    const initialIndex = isLegacy ? 0 : (safeData.initialIndex || 0);

    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(null);
    const [touchEnd, setTouchEnd] = useState(null);

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
    const minSwipeDistance = 50;

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
    }, [currentIndex, mediaList, mediaModalData]);

    useEffect(() => {
        if (mediaModalData) {
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [mediaModalData]);

    if (!mediaModalData) return null;

    // Rendu du média actuel
    const currentUrl = mediaList[currentIndex];
    if (!currentUrl) return null;
    const extension = currentUrl.split('.').pop().split('?')[0].toLowerCase(); // Hack pour gérer les query params éventuels
    const isVideo = ['mp4', 'webm', 'ogg', 'mov'].includes(extension);


    const { url, type } = mediaModalData;

    return (
        <div
            className="z-100 fixed inset-0 bg-black bg-opacity-90 flex justify-center items-center p-4"
            onClick={onClose}
        >

            {/* Bouton de fermeture en haut à droite */}
            <button
                type="button"
                onClick={onClose}
                className="absolute top-5 right-5 text-white bg-gray-800 p-3 rounded-full hover:bg-gray-700 transition-colors z-10"
            >
                <i class="fi fi-tr-circle-xmark flex text-xl"></i>
            </button>

            {/* Bouton Précédent (Visible seulement si index > 0) */}
            {currentIndex > 0 && (
                <button
                    onClick={handlePrev}
                    className="absolute left-4 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-50 hidden md:block"
                >
                    <i class="fi fi-tr-circle-xmark flex text-xl"></i>
                </button>
            )}

            {/* Conteneur du Média (avec gestion du touch) */}
            <div
                className="relative w-full h-full max-w-7xl max-h-screen p-4 flex items-center justify-center "
                onClick={(e) => e.stopPropagation()}
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
                        style={{borderRadius:"10px"}}
                        className="w-full h-full object-contain rounded-lg animate-fade-in select-none"
                        draggable={false}
                    />
                )}
            </div>

            {/* Bouton Suivant (Visible seulement si ce n'est pas le dernier) */}
            {currentIndex < mediaList.length - 1 && (
                <button
                    onClick={handleNext}
                    className="absolute right-4 text-white p-3 bg-white/10 hover:bg-white/20 rounded-full backdrop-blur-md transition-all z-50 hidden md:block"
                >
                    <i class="fi fi-tr-circle-xmark flex text-xl"></i>
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