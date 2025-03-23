document.addEventListener('DOMContentLoaded', async () => {
    const tripId = new URLSearchParams(window.location.search).get('id').trim()
    const liked = getSavedTrips().includes(tripId)

    const citiesElements = document.querySelectorAll(".city")
    const countriesElements = document.querySelectorAll(".country")
    const image = document.getElementById("image")
    const flyTime = document.getElementById("flyTime")
    const price = document.getElementById("price")
    const closestPlace = document.getElementById("closestPlace")
    const closestPlaceFlyTime = document.getElementById("closestPlaceFlyTime")
    const description = document.getElementById("description")

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
    if (liked) {
        const likeIcon = likeButton.querySelector(".icon svg")
        const likeIconPrefix = likeIcon.dataset.prefix
        likeIcon.dataset.prefix = likeIconPrefix === "far" ? "fas" : "far"
        likeIcon.parentElement.classList.toggle("is-red")
        likeButton.querySelector("span").innerText = "Retirer de ma liste d'envies"
    }

    loadData().then(data => {
        const trip = data.find(row => row.Identifier === tripId)

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
    })
})


