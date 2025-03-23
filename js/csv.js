function loadData() {
    return new Promise((resolve, reject) => {
        Papa.parse("/data.csv", {
            header: true,
            download: true,
            complete: function(results) {
                resolve(results)
            },
            error: function(error) {
                console.error('Error parsing CSV:', error);
                reject(error)
            }
        })
    })
}

function getMaxPrice(data) {
    return Math.max(...data.map(row => Number(row.Price)).filter(price => price))
}

function getMinPrice(data) {
    return Math.min(...data.map(row => Number(row.Price)).filter(price => price))
}

function getCountries(data) {
    const countries = data.map(row => row.Country)
    // Remove duplicates
    return countries.filter((item, index) => countries.indexOf(item) === index && item)
}
