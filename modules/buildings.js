import { readSpoiler, loadJSON } from './utility.js';

// Handle building data loaded from JSON
class Buildings {
    static loadPromise;
    static loadedData;

    // Load data from JSON (force reload if previously load is complete)
    static loadData = function() {
        if (!Buildings.loadPromise) {
            Buildings.loadPromise = loadJSON('./data/buildings.json')
                .then(buildings => {
                    Buildings.loadPromise = null;
                    Buildings.loadedData = buildings;
                    return Buildings.loadedData;
                });
        }
        return Buildings.loadPromise;
    }

    // Get existing loaded data (do not reload if already retrieved)
    static getData = function() {
        if (Buildings.loadedData) {
            return Promise.resolve(Buildings.loadedData);
        } else {
            return Buildings.loadData();
        }
    }
}

function updateBuildings() {
    Buildings.getData().then(buildings => {
        for (const [number, building] of Object.entries(buildings)) {
            console.log(readSpoiler(building.name));
        }
    });
}

export { updateBuildings };
