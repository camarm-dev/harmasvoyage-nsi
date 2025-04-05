async function loadData() {
    const position = await getLocation()
    return await new Promise((resolve, reject) => {
        Papa.parse("/data.csv", {
            header: true,
            download: true,
            complete: function(results) {
                resolve(fillFlyTime(results.data, position).filter(trip => trip.Location))
            },
            error: function(error) {
                console.error('Error parsing CSV:', error);
                reject(error)
            }
        })
    })
}

function getLocation(){
    return new Promise((resolve) => {
        if (navigator.geolocation) {
            navigator.permissions.query({
                name: "geolocation"
            })
            navigator.geolocation.getCurrentPosition((position) => {
                resolve([position.coords.latitude, position.coords.longitude])
            })
        }
        resolve([47.2488, 6.0182]) // Setting Besançon as default place
    })
}

function getMaxPrice(data) {
    return Math.max(...data.map(row => Number(row.Price)).filter(price => price))
}

function getMinPrice(data) {
    return Math.min(...data.map(row => Number(row.Price)).filter(price => price))
}

function getCountries(data) {
    const countries = data.map(row => row.Country)
    // Remove duplicates
    return countries.filter((item, index) => countries.indexOf(item) === index && item)
}

const EARTH_RADIUS = 6371
const AVERAGE_FLY_SPEED = 804
const toRadians = Math.PI / 180

/*
    Calculate the distance between two geographic coordinates in kilometers
 */
const getDistance = (position1, position2) => {
    // d = 2R × sin⁻¹(√[sin²((θ₂ - θ₁)/2) + cosθ₁ × cosθ₂ × sin²((φ₂ - φ₁)/2)])
    const [latitude1, longitude1] = position1
    const [latitude2, longitude2] = position2
    const deltaLatitude = (latitude2 - latitude1) * toRadians
    const deltaLongitude = (longitude2 - longitude1) * toRadians

    const a = Math.sin(deltaLatitude / 2) ** 2 +
        Math.cos(latitude1 * toRadians) *
        Math.cos(latitude2 * toRadians) *
        Math.sin(deltaLongitude / 2) ** 2
    return 2 * EARTH_RADIUS * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function getReadableFlyTime(time) {
    const hours = Math.floor(time / 60)
    const minutes = Math.round(time - hours * 60)
    return `${hours}h${minutes.toString().padStart(2, "0")} de vol`
}

function getFlyTime(distance) {
    let time = 30 // In minutes
    time += (distance / AVERAGE_FLY_SPEED) * 60
    return getReadableFlyTime(time)
}

function fillFlyTime(data, location) {
    // Average commercial fly speed is 500mph => 804km/h
    // We add 30 minutes for take off / landing
    for (const trip of data) {
        if (!trip.Location || trip.Location === "") {
            trip.FlyTime = "5h de vol"
            continue
        }
        const [latitude, longitude] = trip.Location.split(",")
        const distance = getDistance(location, [Number(latitude), Number(longitude)])
        trip.FlyTime = getFlyTime(distance)
    }
    return data
}

function search(query, data, filters) {
    query = query.toLowerCase()
    const filteredTrips = data
        .filter(trip => filters.countries.length > 0 ? filters.countries.includes(trip.Country) : true) // Country filter
        .filter(trip => filters.price > 0 ? Number(trip.Price) <= filters.price : true) // Price filter
        .filter(trip => filters.type ? trip.Type.split(",").some(type => type === filters.type): true)
    if (query === "") {
        return filteredTrips
    }
    const results = []
    for (const row of filteredTrips) {
        if (!row.Country) {
            continue
        }
        if (
            // Title and country search
            (row.Country.toLowerCase().startsWith(query) || row.Country.toLowerCase().endsWith(query)
                || row.City.toLowerCase().startsWith(query) || row.City.toLowerCase().endsWith(query))
        ) {
            results.push(row)
        }
    }
    return results
}
