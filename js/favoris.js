document.addEventListener('DOMContentLoaded', () => {
    const grid = document.getElementById("favoris")
    loadData().then(data => {
        const savedTrips = getSavedTrips()

        for (const trip of data) {
            if (savedTrips.includes(trip.Identifier)) {

                const card = document.createElement("a")
                card.classList.add("card")
                card.href = "trip.html?id=" + trip.Identifier
                card.innerHTML = `
                <a href="#" class="button is-light" id="like${trip.Identifier}">
                  <span class="icon is-red">
                    <i class="fas fa-heart"></i>
                  </span>
                </a>
                <img src="${trip.Images.split(',')[0]}" alt="Image de ${trip.City}">
                <header>
                    <h3 class="title">${trip.City}</h3>
                    <h3 class="title">dès ${trip.Price}€</h3>
                </header>
                <div class="content">
                    <p>${trip.Country}</p>
                    <p>${trip.FlyTime}</p>
                </div>`

                const button = card.querySelector("a.button")
                const addFavorite = (event) => {
                    event.preventDefault()
                    saveTrip(trip.Identifier)
                    if (!savedTrips.includes(trip.Identifier)) {
                        savedTrips.push(trip.Identifier)
                    } else {
                        savedTrips.splice(savedTrips.indexOf(trip.Identifier), 1)
                    }
                    const icon = button.querySelector(".icon svg")
                    const prefix = icon.dataset.prefix
                    icon.dataset.prefix = prefix == "far" ? "fas" : "far"
                    icon.parentElement.classList.toggle("is-red")
                }
                button.addEventListener("click", addFavorite)

                grid.appendChild(card)
            }
        }

    })
})


