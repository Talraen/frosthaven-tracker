import { readSpoiler, loadJSON } from './utility.js';

let scenarioData = null;
let loadInProgress = false;

// TODO: This should be an object and handle load blocking and such internally (one promise, extra calls return the one in progress)
class Scenarios {
    static loadPromise;

    static loadData = function() {
        if (!loadPromise) {
            loadPromise = loadJSON('./data/scenarios.json')
                .then(scenarios => {
                    loadInProgress = false;
                    scenarioData = scenarios;
                });
        }
        return loadPromise;
    }
}

function updateScenarios() {
    Scenarios.loadData().then(scenarios => {
        for (const [number, scenario] of Object.entries(scenarioData)) {
            console.log(readSpoiler(scenario.name));
        }
    });
}

export { updateScenarios };
