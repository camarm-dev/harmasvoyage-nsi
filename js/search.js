document.addEventListener('DOMContentLoaded', async () => {
    const resultsGrid = document.getElementById("results")
    const searchForm = document.getElementById("search")
    const priceFilter = document.getElementById("price")
    const priceLabel = document.getElementById("priceLabel")
    const countryFilter = document.getElementById("country")
    const applyFiltersButton = document.getElementById("applyFilters")
    const searchbar = document.getElementById("query")

    priceFilter.addEventListener("input", updatePriceLabel)

    const savedTrips = getSavedTrips()

    function setupFilters(data) {
        const minPrice = getMinPrice(data)
        const maxPrice = getMaxPrice(data)
        const countries = getCountries(data)

        priceFilter.max = maxPrice
        priceFilter.min = minPrice
        priceFilter.value = maxPrice
        updatePriceLabel()

        for (const country of countries) {
            const option = document.createElement("option")
            option.innerText = country
            option.value = country
            countryFilter.appendChild(option)
        }
        const option = document.createElement("option")
        option.innerText = "Tous"
        option.value = "*"
        countryFilter.appendChild(option)
        countryFilter.value = "*"
    }

    function updatePriceLabel() {
        priceLabel.innerText = priceFilter.value + "€"
    }

    function getFilters() {
        return {
            price: Number(priceFilter.value) || 0,
            countries: countryFilter.value === "*" ? [] : countryFilter.value
        }
    }

    function getQuery() {
        return new URLSearchParams(window.location.search).get('query').trim()
    }

    function insertPlace(place) {
        const card = document.createElement("a")
        const liked = savedTrips.includes(place.Identifier)
        card.setAttribute("href", `trip.html?id=${place.Identifier}`)
        card.setAttribute("class", "card")
        card.innerHTML = `
            <a href="#" class="button is-light" id="like${place.Identifier}">
              <span class="icon ${liked && 'is-red'}">
                <i class="fa${liked ? 's' : 'r'} fa-heart"></i>
              </span>
            </a>
            <img src="${place.Images.split(',')[0]}" alt="Image de ${place.City}">
            <header>
              <h3 class="title">${place.City}</h3>
              <h3 class="title">dès ${place.Price}€</h3>
            </header>
            <div class="content">
              <p>${place.Country}</p>
              <p>${place.FlyTime}</p>
            </div>
            `
        const button = card.querySelector("a.button")
        const addFavorite = (event) => {
            event.preventDefault()
            saveTrip(place.Identifier)
            if (!savedTrips.includes(place.Identifier)) {
                savedTrips.push(place.Identifier)
            } else {
                savedTrips.splice(savedTrips.indexOf(place.Identifier), 1)
            }
            const icon = button.querySelector(".icon svg")
            const prefix = icon.dataset.prefix
            icon.dataset.prefix = prefix == "far" ? "fas" : "far"
            icon.parentElement.classList.toggle("is-red")
        }
        button.addEventListener("click", addFavorite)
        resultsGrid.appendChild(card)
    }

    function insertNoResultMessage() {
        const message = document.createElement("p")
        message.setAttribute("class", "content")
        message.innerHTML = "Aucun résultat."
        resultsGrid.appendChild(message)
    }

    loadData().then(data => {

        function search(query) {
            query = query.toLowerCase()
            const filters = getFilters()
            const filteredTrips = data
                .filter(trip => filters.countries.length > 0 ? filters.countries.includes(trip.Country) : true) // Country filter
                .filter(trip => filters.price > 0 ? Number(trip.Price) <= filters.price : true) // Price filter
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

        function dynamicSearch(query) {
            resultsGrid.innerHTML = ""
            const results = search(query.trim())
            for (const place of results) {
                insertPlace(place)
            }
            if (results.length === 0) {
                insertNoResultMessage()
            }
        }

        searchForm.onsubmit = () => {
            dynamicSearch(searchbar.value)
            if (history.pushState) {
                const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname + `?query=${searchbar.value}`;
                history.pushState({
                    path: newUrl
                }, "", newUrl)
            }
            return false
        }
        applyFiltersButton.addEventListener("click", () => {
            dynamicSearch(searchbar.value || "")
        })

        setupFilters(data)
        dynamicSearch(getQuery())
        searchbar.value = getQuery()
    })
})


