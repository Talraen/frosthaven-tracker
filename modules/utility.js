const popMessage = message => {
    alert(message);
};

const popError = message => {
    console.error(message);
    alert(message);
}

const popConfirm = message =>
    new Promise((resolve, reject) => {
        if (confirm(message)) {
            resolve();
        } else {
            reject();
        }    
    });

const capitalize = string => string.charAt(0).toUpperCase() + string.slice(1);

const rotateString = (string, rotation) => {
    let rotated = '';
    for (let i = 0; i < string.length; i++) {
        const charCode = string.charCodeAt(i);

        if (charCode > 127) {
            rotated += string.charAt(i); // Anything above 127 should be kept as-is
        } else {
            rotated += String.fromCharCode(((charCode + rotation) % 128)); // Anything else is rotated mod 128
        }
    }
    return rotated;
}

// Hashes an integer (intended for three digit numbers, to hide puzzle solutions)
function hash(number) {
    let string, start;

    number *= 3583;
    for (let i = 1; i < 6; i++) {
        string = '' + (number * number * (number % 443) * (number % 347));
        start = Math.floor(string.length / 3);
        number = parseInt(string.slice(0, start)) * parseInt(string.slice(start, start * 2)) * parseInt(string.slice(start * 2));
        number %= 1500450271;
    }

    return number % 7219;
}

// Obviously any spoiler written in JS can be decoded trivially, the idea here is to avoid accidental exposure in the code or data
const hideSpoiler = string => {
    const letters = 'abcdefghijklmnopqrstuvwxyz';
    const rotation = Math.floor(Math.random() * 128); // Randomly decide how much to rotate by
    let paddingLength = Math.max(Math.floor(Math.random() * 20) - string.length, 1) + Math.floor(Math.random() * 9); // Generate some amount of garbage text padding
    string += Array.from({length: paddingLength}, () => letters.charAt(Math.floor(Math.random() * letters.length))).join('');; // Add the garbage text to the end to obscure length

    // The code (which is itself base 64 encoded, prepended with a #) consists of the number of the rotation, -, the amount of padding, |, and then the converted string (with padding text)
    return '#' + btoa(rotation + '-' + paddingLength + '|' + rotateString(string, rotation));
};

const readSpoiler = string => {
    if (typeof string === 'object') {
        return readSpoilerObject(string);
    } else if (typeof string !== 'string' || string.charAt(0) !== '#') {
        return string;
    } else {
        let decoded = atob(string.slice(1));
        let matches = decoded.match(/^(\d+)-(\d+)\|/);
        if (matches) {
            decoded = rotateString(decoded.slice(matches[0].length), 128 - parseInt(matches[1]));
            return decoded.slice(0, decoded.length - parseInt(matches[2]));
        } else {
            console.warn('Invalid spoiler string', string, decoded);
            return string;
        }
    }
};

const readSpoilerObject = data => {
    const spoiled = {};
    for (const [key, value] of Object.entries(data)) {
        spoiled[key] = readSpoiler(value);
    }
    return spoiled;
};

function makeRadioButtons($buttons, clickCallback, { deselect = false } = {}) {
    [...$buttons].forEach($button => {
        // Give created radio buttons the radio-button class
        if (!$button.classList.contains('radio-button')) {
            $button.classList.add('radio-button');
        }

        // On click, update the value of the element
        $button.addEventListener('click', function(event) {
            event.preventDefault();

            let groupValue = null
            if ($button.classList.contains('enabled')) {
                if (!deselect) {
                    return; // If deselect is disnabled, do nothing upon clicking the selected option
                }
                $button.classList.remove('enabled');
            } else {
                $button.classList.add('enabled');
                // Disable all other buttons
                [...$buttons].forEach($otherButton => {
                    if ($button !== $otherButton) {
                        $otherButton.classList.remove('enabled');
                    }
                });
                groupValue = this.dataset.value;
            }
            clickCallback(groupValue);
        });
    });
}

function copyText(text, $textarea) {
    $textarea.value = text;
    if (typeof $textarea.select === 'function') {
        $textarea.select();
        document.execCommand('copy');
    } else {
        $textarea.focus();
    }
}

const loadJSON = filename => fetch(filename).then(response => response.json());

function readTabs(tabText, { headers = true } = {}) {
    const lines = tabText.split(/\n/);
    const headerNames = lines[0].split(/\t/);
    const data = [];
    for (let i = headers ? 1 : 0; i < lines.length; i++) {
        const line = lines[i].split(/\t/);
        const item = {};
        for (let j = 0; j < line.length; j++) {
            item[headers && headerNames[j] ? headerNames[j] : j] = line[j]
        }
        data.push(item);
    }
    return data;
}

export { popMessage, popError, popConfirm, capitalize, hash, hideSpoiler, readSpoiler, makeRadioButtons, loadJSON, copyText, readTabs };
