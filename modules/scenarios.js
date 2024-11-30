import { readSpoiler, makeToggle, loadJSON } from './utility.js';

// Handle scenario data loaded from JSON
class Scenarios {
    static loadPromise;
    static loadedData;
    static userData;

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

    // Gets the current state of user data
    static getUserData = function() {
        if (!Scenarios.userData) {
            try {
                Scenarios.userData = JSON.parse(window.localStorage.getItem('user-scenario-data'));
            } catch (error) {
                Scenarios.userData = null;
            }
            if (Scenarios.userData === null) {
                // Default (scenarios 0 and 1 revealed)
                Scenarios.userData = {
                    0: {
                        status: 'revealed',
                    },
                    1: {
                        status: 'revealed',
                    },
                }
            }
        }
        return Scenarios.userData;
    }

    // Saves current user data to local storage
    static updateUserData = function() {
        window.localStorage.setItem('user-scenario-data', JSON.stringify(Scenarios.userData));
    }
}

// Full scenario list rewrite based on current data
function updateScenarios() {
    const $scenarioList = document.getElementById('scenario-list');
    Scenarios.getData().then(scenarios => {
        const userData = Scenarios.getUserData();
        for (const [number, scenario] of Object.entries(scenarios)) {
            if (!userData[number]) {
                continue;
            }
            const userScenario = userData[number];

            const $li = document.createElement('li');

            const $number = document.createElement('span');
            $number.classList.add('scenario-number');
            $number.appendChild(document.createTextNode(readSpoiler(scenario.number)));
            $li.appendChild($number);

            const $name = document.createElement('span');
            $name.classList.add('scenario-name');
            $name.appendChild(document.createTextNode(readSpoiler(scenario.name)));
            $li.appendChild($name);

            const $status = document.createElement('div');
            $status.classList.add('scenario-status-toggle');
            makeToggle($status, [
                {
                    text: 'Revealed',
                    class: 'revealed',
                },
                {
                    text: 'Complete',
                    class: 'complete',
                },
                {
                    text: 'Locked Out',
                    class: 'locked',
                },
            ], status => {
                userScenario.status = status;
                Scenarios.updateUserData();
            }, {current: userScenario.status});
            $li.appendChild($status);

            if (scenario.randomItem) {
                const $randomItem = document.createElement('div');
                $randomItem.classList.add('scenario-random-item-toggle');
                $randomItem.classList.add(userScenario.randomItem || 'not-found');
                makeToggle($randomItem, [
                    {
                        text: 'Random Item Not Found',
                        class: 'not-found',
                    },
                    {
                        text: 'Random Item Found',
                        class: 'found',
                    },
                ], status => {
                    userScenario.randomItem = status === 'found';
                    Scenarios.updateUserData();
                });
                $li.appendChild($randomItem);
            }

            $scenarioList.appendChild($li);
        }
    });
}

export { updateScenarios };
