document.addEventListener('DOMContentLoaded', async () => {
    const resultsGrid = document.getElementById("results")
    const searchForm = document.getElementById("search")
    loadData().then(result => {
        const data = result.data
        function getQuery() {
            return new URLSearchParams(window.location.search).get('query').trim()
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

        function search(query) {
            if (query === "") {
                return data
            }
            const results = []
            for (const row of data) {
                if (!row.Country) {
                    continue
                }
                if (row.Country.toLowerCase().startsWith(query) ||
                    row.Country.toLowerCase().endsWith(query) ||
                    row.City.toLowerCase().startsWith(query) ||
                    row.City.toLowerCase().endsWith(query)) {
                    results.push(row)
                }
            }
            return results
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
              <h3 class="title">${place.Price}</h3>
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
        }

        dynamicSearch(getQuery())

        searchForm.onsubmit = () => {
            dynamicSearch(document.getElementById("query").value)
            return false
        }
    })
})


