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
    for (const destination of destinations) {
        rawHTML +=  `
        <div class="divider">
        <span></span>
        <p>${destination.FlyTime}</p>
        </div>`
        rawHTML += getHTMLTripStep(destination, false, false)
    }
    if (endPlace) {
        rawHTML +=  `
        <div class="divider">
            <span></span>
            <p>${endPlace.FlyTime}</p>
        </div>`
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
    const addStepButton = document.getElementById("add")
    const searchModal = document.getElementById("searchModal")
    const closeModalButton = document.getElementById("close")
    const searchForm = document.getElementById("search")
    const searchbar = document.getElementById("query")
    const resultsContainer = document.getElementById("results")

    addStepButton.addEventListener("click", () => {
        toggleModal()
    })
    closeModalButton.addEventListener("click", () => {
        toggleModal()
    })

    mapboxgl.accessToken = 'pk.eyJ1IjoiY2FtYXJtLWRldiIsImEiOiJja3B6czl2bGowa2g2Mm5ycmdqMThhOHEzIn0.H-PjLIG_jQqZqvz3gPvjeQ';
    const map = new mapboxgl.Map({
        container: 'map',
        projection: 'globe',
        zoom: 3.5
    })

    function toggleModal() {
        searchModal.classList.toggle("is-active")
    }

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
        // Check if functionnal
        const places = getShortestWay(trip.startPlace, trip.endPlace, trip.destinations)
        const startPlace = places.shift()
        const endPlace = places.pop()
        tripElement.innerHTML = getHTMLTrip(startPlace, endPlace, places)
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
        updateMap(map, startPlace, endPlace, places)
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

    function addPlace(place) {
        trip.destinations.push(place)
    }


    loadData().then(data => {
        // Get start / end destination if provided
        const startPlaceIdentifier = new URLSearchParams(location.search).get("startPlace")
        const startPlace = data.find(place => place.Identifier === startPlaceIdentifier)
        const endPlaceIdentifier = new URLSearchParams(location.search).get("endPlace")
        const endPlace = data.find(place => place.Identifier === endPlaceIdentifier)

        trip.startPlace = startPlace
        trip.endPlace = endPlace

        // Fill trip timeline & add map markers
        map.on("load", () => {
            updateTrip()
        })

        const filters = {
            price: 0,
            countries: [],
            type: undefined
        }
        // Events and function requiring data
        searchForm.onsubmit = () => {
            const selectedDestinationsIds = [trip.startPlace, trip.endPlace, ...trip.destinations]
                .filter(destination => destination) // TO remove undefined values
                .map(destination => destination.Identifier)
            const results = search(searchbar.value, data, filters)
                .filter(destination => !selectedDestinationsIds.includes(destination.Identifier))
            resultsContainer.innerHTML = ""
            for (const destination of results) {
                const resultElement = document.createElement("div")
                resultElement.classList.add("result")
                resultElement.innerHTML = `
                  <img src="${destination.Images.split(',')[0]}" alt="">
                  <div class="meta">
                    <h4 class="title is-5">${destination.City}</h4>
                    <p class="subtitle is-6">${destination.Country}</p>
                  </div>
                  <button class="button is-text">
                    <span>Ajouter l'étape</span>
                    <span class="icon">
                      <i class="fas fa-chevron-right"></i>
                    </span>
                  </button>`
                resultElement.addEventListener("click", () => {
                    addPlace(destination)
                    toggleModal()
                    resultsContainer.innerHTML = ""
                    searchbar.value = ""
                    updateTrip()
                })
                resultsContainer.appendChild(resultElement)
            }
            if (results.length === 0) {
                resultsContainer.innerHTML = "<p>Aucun résultat</p>"
            }
            return false
        }
    })
})

