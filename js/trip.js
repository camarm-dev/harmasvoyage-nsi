document.addEventListener('DOMContentLoaded', async () => {
    const tripId = new URLSearchParams(window.location.search).get('id').trim()
    const liked = getSavedTrips().includes(tripId)

    const citiesElements = document.querySelectorAll(".city")
    const countriesElements = document.querySelectorAll(".country")
    const image = document.getElementById("image")
    const flyTime = document.getElementById("flyTime")
    const price = document.getElementById("price")
    const checkoutModal = document.getElementById("checkout")
    const closestPlaceName = document.getElementById("closestPlace")
    const closestPlaceFlyTime = document.getElementById("closestPlaceFlyTime")
    const description = document.getElementById("description")
    const marathonButton = document.getElementById("startMarathon")

    document.querySelectorAll(".checkout").forEach(button => {
        button.addEventListener("click", () => {
            checkoutModal.classList.toggle('is-active')
        })
    }) 

    const likeButton = document.getElementById("like")
    likeButton.addEventListener("click", () => {
        saveTrip(tripId)
        const icon = likeButton.querySelector(".icon svg")
        const prefix = icon.dataset.prefix
        icon.dataset.prefix = prefix === "far" ? "fas" : "far"
        icon.parentElement.classList.toggle("is-red")
        const text = likeButton.querySelector("span")
        if (text.innerText === "Ajouter à ma liste d'envies") {
            text.innerText = "Retirer de ma liste d'envies"
        } else {
            text.innerText = "Ajouter à ma liste d'envies"
        }
    })

    // Wait for Fontawesome icon ot be loaded
    setTimeout(() => {
        if (liked) {
            const likeIcon = likeButton.querySelector(".icon svg")
            const likeIconPrefix = likeIcon.dataset.prefix
            likeIcon.dataset.prefix = likeIconPrefix === "far" ? "fas" : "far"
            likeIcon.parentElement.classList.toggle("is-red")
            likeButton.querySelector("span").innerText = "Retirer de ma liste d'envies"
        }
    }, 500)

    loadData().then(data => {
        const trip = data.find(row => row.Identifier === tripId)
        const closestPlace = getClosestPlace(trip, data.filter(row => !(row.Identifier === tripId)))
        closestPlaceName.innerText = closestPlace.City
        closestPlaceFlyTime.innerText = closestPlace.FlyTime
        marathonButton.href = `marathon.html?startPlace=${trip.Identifier}`

        if (trip) {
            citiesElements.forEach(el => {
                el.innerText = trip.City
            })
            countriesElements.forEach(el => {
                el.innerText = trip.Country
            })
            const imageUrl = new URL(trip.Images)
            image.src = imageUrl.protocol + "//" + imageUrl.host + "/" + imageUrl.pathname
            image.alt = `Image de ${trip.City}`
            flyTime.innerText = trip.FlyTime
            price.innerText = `dès ${trip.Price}€`
            description.innerHTML = trip.Description
        }
        const [latitude, longitude] = trip.Location.split(",")

        mapboxgl.accessToken = 'pk.eyJ1IjoiY2FtYXJtLWRldiIsImEiOiJja3B6czl2bGowa2g2Mm5ycmdqMThhOHEzIn0.H-PjLIG_jQqZqvz3gPvjeQ';
        const map = new mapboxgl.Map({
            container: 'map',
            center: [Number(longitude), Number(latitude)], // Long, lat
            zoom: 9
        })

        map.on("load", () => {
            map.addSource("marker", {
                'type': 'geojson',
                'data': {
                    'type': 'FeatureCollection',
                    'features': [
                        {
                            'type': 'Feature',
                            'geometry': {
                                'type': 'Point',
                                'coordinates': [Number(longitude), Number(latitude)]
                            },
                            'properties': {
                                'title': `${trip.City}`
                            }
                        }
                    ]
                }
            })

            map.addLayer({
                'id': 'marker',
                'type': 'symbol',
                'source': 'marker'
            });
        })
    })
})



