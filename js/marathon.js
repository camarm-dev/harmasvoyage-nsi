function getHTMLTripStep(step, start, end) {
    return `
    ${start ? '<span class="step is-uppercase">Début du voyage</span>' : end ? '<span class="step is-uppercase">Fin du voyage</span>' : ''}
    <div class="item">
      <img src="${step.Images.split(',')[0]}" alt="Image de ${step.City}">
      <div class="content">
        <h4 class="title is-6">${step.City}</h4>
        <p class="subtitle is-6">${step.Country}</p>
      </div>
      <div class="actions">
        ${!start ?
    `<button class="button is-light is-primary" data-action="setStart" data-trip="${step.Identifier}">
          <span class="icon">
            <i class="fas fa-flag"></i>
          </span>
        </button>`: ''}
        ${!end ?
    `<button class="button is-light is-primary" data-action="setEnd" data-trip="${step.Identifier}">
          <span class="icon">
            <i class="fas fa-flag-checkered"></i>
          </span>
        </button>`: ''}
      </div>
    </div>`
}

function getHTMLTrip(startPlace, endPlace, destinations) {
    let rawHTML = ""
    rawHTML += getHTMLTripStep(startPlace, true, false)
    rawHTML +=  `
      <div class="divider">
        <span></span>
        <p>${startPlace.FlyTime} de vol</p>
      </div>`
    for (const destination of destinations) {
        rawHTML += getHTMLTripStep(destination, false, false)
        rawHTML +=  `
          <div class="divider">
            <span></span>
            <p>${destination.FlyTime}</p>
          </div>`
    }
    if (endPlace) {
        rawHTML += getHTMLTripStep(endPlace, false, true)
    }
    return rawHTML
}

function getGeoJSONLine(from, to) {
    const [fromLatitude, fromLongitude] = from.Location.split(",")
    const [toLatitude, toLongitude] = to.Location.split(",")
    return {
        'type': 'Feature',
        'properties': {},
        'geometry': {
            'type': 'LineString',
            'coordinates': [
                [Number(fromLongitude), Number(fromLatitude)],
                [Number(toLongitude), Number(toLatitude)]
            ]
        }
    }
}

function getSource(startPlace, endPlace, steps) {
    const lines = []
    const destinations = [...steps] // Copy array, to avoid propagation of modifications
    let lastStep = destinations.shift()
    lines.push(getGeoJSONLine(startPlace, lastStep))
    for (const step of destinations) {
        lines.push(getGeoJSONLine(lastStep, step))
        lastStep = step
    }
    lines.push(getGeoJSONLine(lastStep, endPlace))
    return {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': lines
        }
    }
}

function updateMap(map, startPlace, endPlace, destinations) {
    const [latitude, longitude] = startPlace.Location.split(",")
    map.setCenter([Number(longitude), Number(latitude)])
    try {
        map.removeLayer("trip")
        map.removeSource("trip")
    } finally {
        map.addSource("trip", getSource(startPlace, endPlace, destinations))
        map.addLayer({
            'id': 'trip',
            'type': 'line',
            'source': 'trip',
            'layout': { 'line-cap': 'round' },
            'paint': {
                'line-color': '#f45500',
                'line-width': 3
            }
        })

    }
}

document.addEventListener("DOMContentLoaded", () => {
    const trip = {
        startPlace: undefined,
        endPlace: undefined,
        destinations: []
    }
    const tripElement = document.getElementById("trip")
    mapboxgl.accessToken = '';
    const map = new mapboxgl.Map({
        container: 'map',
        projection: 'globe',
        zoom: 3.5
    })

    function updateTrip() {
        if (!trip.startPlace && trip.destinations.length > 0) {
            trip.startPlace = trip.destinations.shift()
        }
        if (!trip.endPlace && trip.destinations.length > 0) {
            trip.endPlace = trip.destinations.pop()
        }
        if (!trip.startPlace) {
            tripElement.innerHTML = "<p class='content'>Pas d'étape ajoutée.</p>"
        }
        tripElement.innerHTML = getHTMLTrip(trip.startPlace, trip.endPlace, trip.destinations)
        const actionsButtons = tripElement.querySelectorAll(".actions button")
        for (const button of actionsButtons) {
            button.addEventListener("click", () => {
                const action = button.dataset.action
                const allTrips = [trip.startPlace, trip.endPlace, ...trip.destinations]
                const destination = allTrips.find(destination => destination.Identifier === button.dataset.trip)
                if (action === "setStart") {
                    setStartPlace(destination)
                } else {
                    setEndPlace(destination)
                }
                updateTrip()
            })
        }
        updateMap(map, trip.startPlace, trip.endPlace, trip.destinations)
    }

    function setStartPlace(place) {
        trip.destinations.push(trip.startPlace)
        const targetIndex = trip.destinations.findIndex(el => el.Identifier === place.Identifier)
        trip.startPlace = place

        // Special case if destination was trip end (let the updateTrip function choose a new end)
        if (trip.endPlace.Identifier === place.Identifier) {
            trip.endPlace = undefined
        }

        if (targetIndex !== -1) {
            trip.destinations.splice(targetIndex, 1)
        }
    }

    function setEndPlace(place) {
        trip.destinations.push(trip.endPlace)
        const targetIndex = trip.destinations.findIndex(el => el.Identifier === place.Identifier)
        trip.endPlace = place

        // Special case if destination was trip beginning (let the updateTrip function choose a new start)
        if (trip.startPlace.Identifier === place.Identifier) {
            trip.startPlace = undefined
        }

        if (targetIndex !== -1) {
            trip.destinations.splice(targetIndex, 1)
        }
    }

// getDistance([latitude, longitude], [...])
// trip.Location "34.04000000,-4.6531000"
// const location = "34.04000000,-4.6531000".split(",")

    loadData().then(data => {
        // Get start destination if defined
        const startPlaceIdentifier = new URLSearchParams(location.search).get("startPlace")
        const startPlace = data.find(place => place.Identifier === startPlaceIdentifier)
        const paris = data.find(row => row.City === "Paris")
        const istanbul = data.find(row => row.City === "Istanbul")
        const checkpoints = data.filter(row => row.Country === "Italie")
        trip.startPlace = startPlace
        // trip.endPlace = istanbul
        // trip.destinations = checkpoints
        updateTrip()
        getShortestWay(paris, istanbul, checkpoints)
    })

    map.on("load", () => {
        updateTrip()
    })
})

// Trouver le chemin le plus court de startPlace, à endPlaces, en passant par places
function getShortestWay(startPlace, endPlace, places) {
    const [startLatitude, startLongitude] = startPlace.Location.split(",")
    for (const destination of places){
        const [destinationLatitude, destinationLongitude] = destination.Location.split(",")
        const distance = getDistance([Number(startLatitude), Number(startLongitude)],[Number(destinationLatitude),Number(destinationLongitude)])
        console.log(distance)
    }
}
