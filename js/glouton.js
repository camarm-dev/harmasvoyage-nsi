function getClosestPlace(startPlace, places) {
    // Il faut renvoyer le lieu le plus proche de "startPlace" parmit "places"
    let plus_petite_distance = undefined
    let destination_plus_proche = undefined
    const [startLatitude, startLongitude] = startPlace.Location.split(",")
    for (const destination of places) {
        const [destinationLatitude, destinationLongitude] = destination.Location.split(",")
        const distance = getDistance([Number(startLatitude), Number(startLongitude)], [Number(destinationLatitude), Number(destinationLongitude)])
        if (plus_petite_distance > distance || plus_petite_distance == undefined) {
            plus_petite_distance = distance
            destination_plus_proche = destination
        }
    }
    return destination_plus_proche
    
}

// Trouver le chemin le plus court de startPlace, à endPlaces, en passant par places
function getShortestWay(startPlace, endPlace, places) {
    const trip = [startPlace]
    let depart = startPlace
    while (places.length !== 0){
        depart = getClosestPlace(depart, places)
        const targetIndex = places.findIndex(el => el.Identifer === depart.Identifier)
        places.splice(targetIndex, 1)
        trip.push(depart)
    }
    trip.push(endPlace)
    return trip

}   

// getDistance([latitude, longitude], [...])
// trip.Location "34.04000000,-4.6531000"
// const location = "34.04000000,-4.6531000".split(",")


// Pour chaque lieu on trouve le lieu le plus proche
// On enlève le lieu trouvé des destinations
// On remplit FlyTime de manière à mettre le temps de vol entre les deux lieux.
