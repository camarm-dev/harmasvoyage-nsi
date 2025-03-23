const KEYS = {
    savedTrips: "HARMAS_SAVED_TRIPS"
}

function getSavedTrips() {
    return JSON.parse(localStorage.getItem(KEYS.savedTrips) || "[]")
}

function saveTrip(id) {
    const trips = getSavedTrips()
    trips.push(id)
    localStorage.setItem(KEYS.savedTrips, JSON.stringify(trips))
}
