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

// Quickly clear out DOM element
function emptyElement($element) {
    while ($element.firstChild) {
        $element.removeChild($element.firstChild);
    }
}

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

function makeToggle($element, options, clickCallback, { current = null } = {}) {
    $element.classList.add('toggle');

    let defaultOption = options[0];
    if (current !== null) {
        for (let i = 0; i < options.length; i++) {
            if (options[i].class === current) {
                defaultOption = options[i];
                break;
            }
        }
    }
    assignToggleOption($element, defaultOption);

    $element.addEventListener('click', function(event) {
        event.preventDefault();

        for (let i = 0; i < options.length; i++) {
            if ($element.classList.contains(options[i].class)) {
                $element.classList.remove(options[i].class);
                clickCallback(assignToggleOption($element, options[(i + 1) % options.length]));
                break;
            }
        }
    });
}

// Sets an option on a toggle, returns the current class
function assignToggleOption($element, option) {
    emptyElement($element);
    $element.appendChild(document.createTextNode(option.text));
    if (option.class) {
        $element.classList.add(option.class);
        return option.class;
    } else {
        return false;
    }
}

export { popMessage, popError, popConfirm, emptyElement, makeRadioButtons, makeToggle };
