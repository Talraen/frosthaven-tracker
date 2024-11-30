import { readSpoiler, loadJSON } from './utility.js';

// Handle scenario data loaded from JSON
class Scenarios {
    static loadPromise;
    static loadedData;

    // Load data from JSON (force reload if previously load is complete)
    static loadData = function() {
        if (!Scenarios.loadPromise) {
            Scenarios.loadPromise = loadJSON('./data/scenarios.json')
                .then(scenarios => {
                    Scenarios.loadPromise = null;
                    Scenarios.loadedData = scenarios;
                    return Scenarios.loadedData;
                });
        }
        return Scenarios.loadPromise;
    }

    // Get existing loaded data (do not reload if already retrieved)
    static getData = function() {
        if (Scenarios.loadedData) {
            return Promise.resolve(Scenarios.loadedData);
        } else {
            return Scenarios.loadData();
        }
    }
}

function updateScenarios() {
    Scenarios.getData().then(scenarios => {
        for (const [number, scenario] of Object.entries(scenarios)) {
            console.log(readSpoiler(scenario.name));
        }
    });
}

export { updateScenarios };
