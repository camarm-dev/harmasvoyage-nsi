## Pour HARMAS & CHIELLO

Tâches que vous devez réaliser
- [ ] Fonction pour trouver le lieu le plus proche d'une destination
  - Ne pas oublier de remplir le temps de vol: de la destination à son lieu le plus proche
- [ ] Algo glouton pour déterminer le chemin le plus court pour les marathons
Si vous vous ennuyer
- [ ] Refaire les fonctions pour déterminer le minimum / maximum d'une liste et fonctions de tri / filtrage

### Algos gloutons

L'objectif est que vous réalisiez une fonction, qui prend comme arguments un lieu de départ, une liste de destinations et un lieu d'arrivée et qui trouve le chemin le plus court en passant par toutes les destinations.

Étape par étape :
1. Trouver la destination la plus proche du point de départ
2. Trouver la destination la plus proche de la précédente
3. Répéter jusqu'à ce que toutes les destinations soient visitées.

Pour vous aider :
- Une fois qu'une destination est ajoutée au périple du chemin le plus court, la supprimer de la liste des destinations permet d'éviter qu'elle soit choisie comme la destination suivante la plus proche.

### Comment on code ?

Pour récupérer la base de voyages
```javascript
loadData().then(data => {
    // Data est une liste de dictionnaires
    
    // Parcourire une liste
    for (const trip of data) {
        // Accéder / modfier les valeurs
        trip.Country = "Mamawid"
    }
})
```

Liste des valeurs d'un voyage
```text
City,Country,FlyTime,Images,Price,Description,Location,Identifier
```
