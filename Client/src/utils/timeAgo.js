// Client/src/utils/timeAgo.js (créez ce fichier si nécessaire)
export const timeAgo = (date) => {
    const seconds = Math.floor((new Date() - new Date(date)) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return "il y a " + Math.floor(interval) + " an(s)";
    interval = seconds / 2592000;
    if (interval > 1) return "il y a " + Math.floor(interval) + " mois";
    interval = seconds / 86400;
    if (interval > 1) return "il y a " + Math.floor(interval) + " jour(s)";
    interval = seconds / 3600;
    if (interval > 1) return "il y a " + Math.floor(interval) + " heure(s)";
    interval = seconds / 60;
    if (interval > 1) return "il y a " + Math.floor(interval) + " minute(s)";
    
    return "à l'instant";
};