document.addEventListener('DOMContentLoaded', async () => {
    const resultsGrid = document.getElementById("results")
    const searchForm = document.getElementById("search")
    const priceFilter = document.getElementById("price")
    const priceLabel = document.getElementById("priceLabel")
    const countryFilter = document.getElementById("country")
    const applyFiltersButton = document.getElementById("applyFilters")
    const searchbar = document.getElementById("query")

    priceFilter.addEventListener("input", updatePriceLabel)

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
        const card = document.createElement("div")
        card.setAttribute("class", "card")
        card.innerHTML = `
            <img src="${place.Images.split(',')[0]}" alt="Image de ${place.City}">
            <a href="#" class="button is-light">
              <span class="icon">
                <i class="far fa-heart"></i>
              </span>
            </a>
            <header>
              <h3 class="title">${place.City}</h3>
              <h3 class="title">dès ${place.Price}€</h3>
            </header>
            <div class="content">
              <p>${place.Country}</p>
              <p>${place["Fly time"]}</p>
            </div>`
        resultsGrid.appendChild(card)
    }

    function insertNoResultMessage() {
        const message = document.createElement("p")
        message.setAttribute("class", "content")
        message.innerHTML = "Aucun résultat."
        resultsGrid.appendChild(message)
    }

    loadData().then(result => {
        const data = result.data

        function search(query) {
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
                console.log(place)
                insertPlace(place)
            }
            if (results.length === 0) {
                insertNoResultMessage()
            }
        }

        searchForm.onsubmit = () => {
            dynamicSearch(searchbar.value)
            return false
        }
        applyFiltersButton.addEventListener("click", () => {
            dynamicSearch(searchbar.value || "")
        })

        setupFilters(data)
        dynamicSearch(getQuery())
    })
})


