document.addEventListener('DOMContentLoaded', async () => {
    const citiesElements = document.querySelectorAll(".city")
    const countriesElements = document.querySelectorAll(".country")
    const image = document.getElementById("image")
    const flyTime = document.getElementById("flyTime")
    const price = document.getElementById("price")
    const closestPlace = document.getElementById("closestPlace")
    const closestPlaceFlyTime = document.getElementById("closestPlaceFlyTime")
    const description = document.getElementById("description")

    const tripId = new URLSearchParams(window.location.search).get('id').trim()
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


