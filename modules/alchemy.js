import { readSpoiler, loadJSON } from './utility.js';

function updateAlchemyChart() {
    loadJSON('./data/alchemy.json');
    console.log('update alchemy chart');
}

export { updateAlchemyChart };
