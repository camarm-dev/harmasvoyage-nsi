function getClosestPlace(startPlace, places) {
    // Il faut renvoyer le lieu le plus proche de "startPlace" parmit "places"
    let shortestDistance = undefined
    let closestPlace = places[0]
    const [startLatitude, startLongitude] = startPlace.Location.split(",")
    for (const destination of places) {
        const [destinationLatitude, destinationLongitude] = destination.Location.split(",")
        const distance = getDistance([Number(startLatitude), Number(startLongitude)], [Number(destinationLatitude), Number(destinationLongitude)])
        if (shortestDistance > distance || shortestDistance == undefined) {
            shortestDistance = distance
            closestPlace = destination
        }
    }
    closestPlace.FlyTime = getFlyTime(shortestDistance)
    return closestPlace

}

// Trouver le chemin le plus court de startPlace, à endPlaces, en passant par places
function getShortestWay(startPlace, endPlace, steps) {
    const places = [...steps]
    const trip = [startPlace]
    let place = startPlace
    while (places.length !== 0) {
        place = getClosestPlace(place, places)
        const targetIndex = places.findIndex(el => el.Identifier === place.Identifier)
        places.splice(targetIndex, 1)
        trip.push(place)
    }
    if (endPlace) {
        const [lastPlaceLatitude, lastPlaceLongitude] = place.Location.split(",")
        const [endPlaceLatitude, endPlaceLongitude] = endPlace.Location.split(",")
        const lastStepDistance = getDistance(
            [Number(lastPlaceLatitude), Number(lastPlaceLongitude)],
            [Number(endPlaceLatitude), Number(endPlaceLongitude)]
        )
        endPlace.FlyTime = getFlyTime(lastStepDistance)
        trip.push(endPlace)
    }
    return trip

}

// getDistance([latitude, longitude], [...])
// trip.Location "34.04000000,-4.6531000"
// const location = "34.04000000,-4.6531000".split(",")


// Pour chaque lieu on trouve le lieu le plus proche
// On enlève le lieu trouvé des destinations
// On remplit FlyTime de manière à mettre le temps de vol entre les deux lieux.
