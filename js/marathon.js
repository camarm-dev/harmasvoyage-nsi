// Trouver le chemin le plus court de startPlace, à endPlaces, en passant par places
function getShortestWay(startPlace, endPlace, places) {
    const [startLatitude, startLongitude] = startPlace.Location.split(",")
    for (const destination of places){
        const [destinationLatitude, destinationLongitude] = destination.Location.split(",")
        const distance = getDistance([Number(startLatitude), Number(startLongitude)],[Number(destinationLatitude),Number(destinationLongitude)])
        console.log(distance)
    }   
}
    
    

// getDistance([latitude, longitude], [...])
// trip.Location "34.04000000,-4.6531000"
// const location = "34.04000000,-4.6531000".split(",")

loadData().then(data => {
    const paris = data.find(row => row.City === "Paris")
    const istanbul = data.find(row => row.City === "Istanbul")
    const checkpoints = data.filter(row => row.Country === "Italie")

    // On part de paris, on va à istanbul et on passepar toutresles villes d'italie
    getShortestWay(paris, istanbul, checkpoints)
})
