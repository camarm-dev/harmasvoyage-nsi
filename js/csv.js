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
