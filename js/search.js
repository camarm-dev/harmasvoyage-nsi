document.addEventListener('DOMContentLoaded', async () => {
    const resultsGrid = document.getElementById("results")
    const searchForm = document.getElementById("search")
    const priceFilter = document.getElementById("price")
    const priceLabel = document.getElementById("priceLabel")
    const countryFilter = document.getElementById("country")
    const applyFiltersButton = document.getElementById("applyFilters")
    const searchbar = document.getElementById("query")

    const typeFilterInputs = document.querySelectorAll("input[name=type]")
    for (const radio of typeFilterInputs) {
        radio.addEventListener("click", (event) => {
            if (event.ctrlKey || event.metaKey) {
                radio.checked = false
            }
        })
    }

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
            countries: countryFilter.value === "*" ? [] : countryFilter.value,
            type: document.querySelector("input[name=type]:checked")?.value
        }
    }

    function getQuery() {
        const query = new URLSearchParams(window.location.search)
        return query && query.get('query').trim()
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

        function dynamicSearch(query) {
            resultsGrid.innerHTML = ""
            const results = search(query.trim(), data, getFilters())
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


