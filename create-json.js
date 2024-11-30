import { popMessage, popError, popConfirm, capitalize, hideSpoiler, makeRadioButtons, copyText, readTabs } from './modules/utility.js';

const $processTabInput = document.getElementById('process-tab-input');
const $tabInput = document.getElementById('tab-input');
const $jsonOutput = document.getElementById('json-output');
let tabInputType = null;

makeRadioButtons(document.getElementsByClassName('tab-input-type'), value => {
    tabInputType = value;
    $processTabInput.disabled = tabInputType === null;
});

$processTabInput.addEventListener('click', function(event) {
    const input = $tabInput.value;
    let output;
    switch (tabInputType) {
        case 'scenarios':
            output = processScenarioData(input);
            break;

        case 'buildings':
            output = processBuildingData(input);
            break;

        case 'alchemy':
            output = processAlchemyData(input);
            break;

        default:
            popError('Unknown tab input type', tabInputType);
            output = null;
    }

    document.getElementById('json-output-area').classList.add('shown');
    copyText(JSON.stringify(output), $jsonOutput);
});

// Turn tabular data for scenario list into JSON (for use as data/scenarios.json)
function processScenarioData(data) {
    const scenarios = {};
    let index = 0;
    readTabs(data).forEach(scenarioData => {
        if (!scenarioData.Number) {
            return; // Invalid scenario, bad data, ignore it
        }
        const scenario = {
            number: null,
            name: parseInt(scenarioData.Number) < 2 ? scenarioData.Name : hideSpoiler(scenarioData.Name || '???'),
            region: hideSpoiler(scenarioData.Region),
            randomItem: scenarioData['Loot: Random Item'] !== '',
            soloScenario: false,
        };
        if (scenarioData.Number.match(/^\d+$/)) {
            scenario.number = parseInt(scenarioData.Number);
        } else {
            scenario.soloScenario = true;
        }
        scenarios[index++] = scenario;
    });
    return scenarios;
}

// Turn tabular data for building list into JSON (for use as data/buildings.json)
function processBuildingData(data) {
    const buildings = {};
    readTabs(data).forEach(buildingData => {
        if (!buildingData.Number) {
            return; // Invalid building, bad data, ignore it
        }
        if (typeof buildings[buildingData.Number] === 'undefined') {
            buildings[buildingData.Number] = {
                name: hideSpoiler(buildingData.Name),
                number: buildingData.Number,
                levels: [],
            };
        }
        buildings[buildingData.Number].levels[parseInt(buildingData.Level) - 1 || 0] = {
            prosperity: hideSpoiler(buildingData.Prosperity),
            lumber: hideSpoiler(buildingData.Lumber),
            metal: hideSpoiler(buildingData.Metal),
            hide: hideSpoiler(buildingData.Hide),
            money: hideSpoiler(buildingData.Money),
        }
    });
    return buildings;
}

// Turn tabular data for alchemy chart list into JSON (for use as data/alchemy.json)
function processAlchemyData(data) {
    const alchemyChartEntries = [];
    readTabs(data).forEach(alchemyData => {
        if (!alchemyData['#']) {
            console.log(alchemyData)
             return; // Invalid data, ignore it
        }

        const herbs = {
            arrowvine: alchemyData.Arrowvine.length,
            rockroot: alchemyData.Rockroot.length,
            snowthistle: alchemyData.Snowthistle.length,
            axenut: alchemyData.Axenut.length,
            flamefruit: alchemyData.Flamefruit.length,
            corpsecap: alchemyData.Corpsecap.length,
        };

        let herbDescription = '';
        if (herbs.arrowvine > 2) {
            herbs.arrowvine = 0; // Deadly mixture
            herbDescription = '3 herbs, 2 or more the same';
        } else {
            const herbList = [];
            for (const [herb, amount] of Object.entries(herbs)) {
                for (let i = 0; i < amount; i++) {
                    herbList.push(capitalize(herb));
                }
                herbDescription = herbList.join(' + ');
            }
        }

        alchemyChartEntries.push({
            itemName: hideSpoiler(alchemyData.Name),
            itemNumber: hideSpoiler(alchemyData['#']),
            herbDescription: herbDescription,
            herbs: herbs,
        });
    });
    return alchemyChartEntries;
}
