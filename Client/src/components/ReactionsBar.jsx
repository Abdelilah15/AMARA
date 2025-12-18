// Client/src/components/ReactionsBar.jsx
import React from 'react';
import { formatCompactNumber } from '../utils/formatNumber'; // Assurez-vous d'avoir cette fonction ou utilisez une simple fonction locale pour l'instant
import { IconBookmark, IconBookmarkOff, IconBookmarksOff } from '@tabler/icons-react';

const ReactionsBar = ({
    post,
    isLiked,
    isSaved,
    handleLike,
    handleComment,
    handleShare,
    handleSave
}) => {


    return (
        <div className="flex items-center justify-between text-gray-500 bg-gray-100 rounded-full px-2">
            <div className='flex gap-4'>
                {/* Bouton Like */}
                <button
                    onClick={handleLike}
                    className="flex items-center space-x-1 group transition-colors"
                    title="J'aime"
                >
                    <div className={`p-2 rounded-full transition-colors ${isLiked ? 'bg-red-50' : ''
                        }`}>

                        {isLiked && (
                            <i className="fi fi-ss-heart flex fill-current text-red-500"></i>
                        )}
                        {!isLiked && (
                            <i className="fi fi-rr-heart flex"></i>
                        )}

                    </div>
                    <span className="text-sm font-medium">
                        {formatCompactNumber(post.likes?.length || 0)}
                    </span>
                </button>

                {/* Bouton Commentaire */}
                <button
                    onClick={handleComment}
                    className="flex items-center space-x-1 group hover:text-blue-500 transition-colors"
                    title="Commenter"
                >
                    <div className="p-2 rounded-full  transition-colors">
                        <i className="fi fi-tr-comment-alt"></i>
                    </div>
                    <span className="text-sm font-medium">
                        {formatCompactNumber(post.comments?.length || 0)}
                    </span>
                </button>

                {/* Bouton Repost */}
                <button className="flex items-center space-x-1 group hover:text-green-500 transition-colors" title="Reposter">
                    <div className="p-2 rounded-full  transition-colors">
                        <i className="fi fi-tr-arrows-repeat flex"></i>
                    </div>
                    <span className="text-sm font-medium">0</span>
                </button>
            </div>


            <div className='flex gap-4'>
                {/* Bouton Intérissant  */}
                <button className="flex items-center space-x-1 group hover:text-green-500 transition-colors" title="Reposter">
                    <div className="p-2 rounded-full  transition-colors">
                        <i className="fi fi-tr-up flex"></i>
                    </div>
                </button>

                {/* Bouton non Intérissant  */}
                <button className="flex items-center space-x-1 group hover:text-red-500 transition-colors" title="Reposter">
                    <div className="p-2 rounded-full  transition-colors">
                        <i className="fi fi-tr-down flex"></i>
                    </div>
                </button>

                {/* Bouton Partager */}
                <button
                    onClick={handleShare}
                    className="flex items-center space-x-1 group hover:text-blue-500 transition-colors"
                    title="Partager"
                >
                    <div className="p-2 rounded-full  transition-colors">
                        <i className="fi fi-tr-share-square flex"></i>
                    </div>
                </button>

                {/* Bouton Enregistrer */}
                <button
                    onClick={handleSave}
                    className={`flex items-center space-x-1 group transition-colors ${isSaved ? 'text-yellow-600' : 'hover:text-yellow-600'}`}
                    title={isSaved ? "Retirer des éléments enregistrés" : "Enregistrer"}
                >
                    <div className="p-2 rounded-full transition-colors">
                        {/* Condition ternaire pour changer l'icône */}
                        {isSaved ? (
                            <i className="fi fi-ts-bookmark flex"></i>
                        ) : (
                            <i className="fi fi-ts-bookmark-slash flex"></i>
                        )}
                    </div>
                </button>
            </div>
        </div>
    );
};

export default ReactionsBar;