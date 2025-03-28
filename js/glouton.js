function getClosestPlace(startPlace, places) {
    // Il faut renvoyer le lieu le plus proche de "startPlace" parmit "places"
}

// Trouver le chemin le plus court de startPlace, à endPlaces, en passant par places
function getShortestWay(startPlace, endPlace, places) {
    const [startLatitude, startLongitude] = startPlace.Location.split(",")
    for (const destination of places) {
        const [destinationLatitude, destinationLongitude] = destination.Location.split(",")
        const distance = getDistance([Number(startLatitude), Number(startLongitude)],[Number(destinationLatitude),Number(destinationLongitude)])
        console.log(distance)
    }
}
// getDistance([latitude, longitude], [...])
// trip.Location "34.04000000,-4.6531000"
// const location = "34.04000000,-4.6531000".split(",")


// Pour chaque lieu on trouve le lieu le plus proche
// On enlève le lieu trouvé des destinations
// On remplit FlyTime de manière à mettre le temps de vol entre les deux lieux.
