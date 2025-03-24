document.addEventListener('DOMContentLoaded', () => {
    let section = document.getElementById("favoris")
    loadData().then(data => {
        let fav = getSavedTrips()
        for(let i of data) {
            if (fav.includes(i.Identifier)){
                console.log(i)
                section.innerHTML += `<div class="card">
            <img src="${i.Images.split(',')[0]}" alt="Image de ${i.City}">
            <header>
              <h3 class="title">${i.City}</h3>
              <h3 class="title">${i.Country}</h3>
              <h3 class="title">dès ${i.Price}€</h3>
            </header>
            <div class="content">
              <p>${i.Country}</p>
              <p>${i.FlyTime}</p>
            </div></div>
                `
            }

        }                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                    

    })
})


