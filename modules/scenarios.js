import { readSpoiler, loadJSON } from './utility.js';
import { popPrompt, makeButton, makeToggle, emptyElement, popError } from './ui.js';

// Handle scenario data loaded from JSON
class Scenarios {
    static loadPromise;
    static loadedData;
    static userData;

    // Codes for scenario locking and unlocking
    static UNLOCKED = 0;
    static LOCKED = 1;
    static NOT_FOUND = 2;
    static ALREADY_UNLOCKED = 3;
    static NOT_UNLOCKED = 4;

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

    // Unlocks a scenario, returning whether it succeeded and an error message if not
    static unlockScenario(scenario) {
        if (typeof scenario === 'number' || scenario.match(/^\d+$/)) {
            const number = parseInt(scenario);
            if (!Scenarios.loadedData[number] || !Scenarios.loadedData[number].number === number) {
                return [Scenarios.NOT_FOUND, 'No scenario number ' + number + ' found'];
            }
            if (typeof Scenarios.userData[number] !== 'undefined') {
                return [Scenarios.ALREADY_UNLOCKED, 'Scenario ' + number + ' already unlocked'];
            }
            Scenarios.userData[number] = { status: 'revealed' };
            return [Scenarios.UNLOCKED, null];
        } else {
            for (const [number, scenarioData] of Object.entries(Scenarios.loadedData)) {
                if (scenario === readSpoiler(scenarioData.name)) {
                    if (typeof Scenarios.userData[number] !== 'undefined') {
                        return [Scenarios.ALREADY_UNLOCKED, 'Scenario "' + scenario + '" already unlocked'];
                    }
                    Scenarios.userData[number] = { status: 'revealed' };
                    return [Scenarios.UNLOCKED, null];
                }
            }
            return [Scenarios.NOT_FOUND, 'Scenario "' + scenario + '" not found'];
        }
    }

    // Locks a scenario, returning whether it succeeded and an error message if not
    static lockScenario(scenario) {
        if (typeof scenario === 'number' || scenario.match(/^\d+$/)) {
            const number = parseInt(scenario);
            if (!Scenarios.loadedData[number] || !Scenarios.loadedData[number].number === number) {
                return [Scenarios.NOT_FOUND, 'No scenario number ' + number + ' found'];
            }
            if (typeof Scenarios.userData[number] === 'undefined') {
                return [Scenarios.NOT_UNLOCKED, 'Scenario ' + number + ' not yet unlocked'];
            }
            delete Scenarios.userData[number];
            return [Scenarios.LOCKED, null];
        } else {
            for (const [number, scenarioData] of Object.entries(Scenarios.loadedData)) {
                if (scenario === readSpoiler(scenarioData.name)) {
                    if (typeof Scenarios.userData[number] === 'undefined') {
                        return [Scenarios.NOT_UNLOCKED, 'Scenario "' + scenario + '" not yet unlocked'];
                    }
                    delete Scenarios.userData[number];
                    return [Scenarios.LOCKED, null];
                }
            }
            return [Scenarios.NOT_FOUND, 'Scenario "' + scenario + '" not found'];
        }
    }
}

// Full scenario list rewrite based on current data
function updateScenarios() {
    const $scenarioList = document.getElementById('scenario-list');
    emptyElement($scenarioList);
    Scenarios.getData().then(scenarios => {
        const userData = Scenarios.getUserData();
        let lockedScenarios = 0;
        for (const [number, scenario] of Object.entries(scenarios)) {
            if (!userData[number]) {
                lockedScenarios++;
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

        const $buttonLi = document.createElement('li');

        if (lockedScenarios > 0) {
            const $unlockButton = document.createElement('div');
            $unlockButton.appendChild(document.createTextNode('Unlock Scenarios'));
            makeButton($unlockButton, function(event) {
                event.preventDefault();
                popPrompt('Enter one or more scenario numbers or names to unlock')
                    .then(response => {
                        const scenarios = response.split(/,/g).map(a => a.trim());
                        let successes = 0;
                        let errors = {};
                        errors[Scenarios.NOT_FOUND] = [];
                        errors[Scenarios.ALREADY_UNLOCKED] = [];

                        scenarios.forEach(scenario => {
                            const [code, message] = Scenarios.unlockScenario(scenario);
                            if (code === Scenarios.UNLOCKED) {
                                successes++;
                            } else {
                                errors[code].push(scenario);
                            }
                        });
                        if (successes > 0) {
                            Scenarios.updateUserData();
                            updateScenarios();
                        }
                        const errorMessages = [];
                        if (errors[Scenarios.NOT_FOUND].length > 0) {
                            errorMessages.push('Not found: ' + errors[Scenarios.NOT_FOUND].join(', '));
                        }
                        if (errors[Scenarios.ALREADY_UNLOCKED].length > 0) {
                            errorMessages.push('Already unlocked: ' + errors[Scenarios.ALREADY_UNLOCKED].join(', '));
                        }
                        if (errorMessages.length > 0) {
                            popError("Errors unlocking scenarios:\n" + errorMessages.join("\n"));
                        }
                    })
                    .catch(() => {});
            });
            $buttonLi.appendChild($unlockButton);
        }

        const $lockButton = document.createElement('div');
        $lockButton.appendChild(document.createTextNode('Re-Lock Scenarios'));
        makeButton($lockButton, function(event) {
            event.preventDefault();
            popPrompt('Enter one or more scenario numbers or names to re-lock')
                .then(response => {
                    const scenarios = response.split(/,/g).map(a => a.trim());
                    let successes = 0;
                    let errors = [];

                    scenarios.forEach(scenario => {
                        const [code, message] = Scenarios.lockScenario(scenario);
                        if (code === Scenarios.LOCKED) {
                            successes++;
                        } else {
                            errors.push(scenario);
                        }
                    });
                    if (successes > 0) {
                        Scenarios.updateUserData();
                        updateScenarios();
                    }
                    if (errors.length > 0) {
                        popError("Some scenarios could not be found and locked:\n" + errors.join(', '));
                    }
                })
                .catch(() => {});
        });
        $buttonLi.appendChild($lockButton);

        $scenarioList.appendChild($buttonLi);
    });
}

export { updateScenarios };
