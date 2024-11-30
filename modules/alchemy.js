import { readSpoiler, loadJSON } from './utility.js';

// Handle alchemy chart data loaded from JSON
class AlchemyChart {
    static loadPromise;
    static loadedData;

    // Load data from JSON (force reload if previously load is complete)
    static loadData = function() {
        if (!AlchemyChart.loadPromise) {
            AlchemyChart.loadPromise = loadJSON('./data/alchemy.json')
                .then(alchemyChart => {
                    AlchemyChart.loadPromise = null;
                    AlchemyChart.loadedData = alchemyChart;
                    return AlchemyChart.loadedData;
                });
        }
        return AlchemyChart.loadPromise;
    }

    // Get existing loaded data (do not reload if already retrieved)
    static getData = function() {
        if (AlchemyChart.loadedData) {
            return Promise.resolve(AlchemyChart.loadedData);
        } else {
            return AlchemyChart.loadData();
        }
    }
}

function updateAlchemyChart() {
    AlchemyChart.getData().then(alchemyChart => {
        for (const [number, alchemy] of Object.entries(alchemyChart)) {
            console.log(alchemy.herbDescription);
        }
    });
}

export { updateAlchemyChart };
