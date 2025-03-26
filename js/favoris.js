document.addEventListener('DOMContentLoaded', () => {
    const section = document.getElementById("favoris")
    loadData().then(data => {
        const fav = getSavedTrips()
        for (const i of data) {
            if (fav.includes(i.Identifier)) {
                const card = document.createElement("a") 
                card.class = "card"
                card.href = "trip.html?id=" + i.Identifier
                card.innerHTML = `
                <img src="${i.Images.split(',')[0]}" alt="Image de ${i.City}">
                <header>
                    <h3 class="title">${i.City}</h3>
                    <h3 class="title">${i.Country}</h3>
                    <h3 class="title">dès ${i.Price}€</h3>
                </header>
                <div class="content">
                    <p>${i.Country}</p>
                    <p>${i.FlyTime}</p>
                </div>`
                section.appendChild(card)
            }
        }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    

    })
})


