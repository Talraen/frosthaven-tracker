import { readSpoiler, loadJSON } from './utility.js';

function updateBuildings() {
    loadJSON('./data/buildings.json');
    console.log('update buildings');
}

export { updateBuildings };
