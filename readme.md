# Frosthaven Tracker

## Design Concepts

* Track everything that's permanent only
    * Scenario status
    * Building status
    * Alchemy board
    * Rules stickers?
    * Not enhancements (impractical to play this way)
* Use JS modules to organize code
* Store entire campaign state as a JSON object, allow for base 64 export, local storage, etc. (maybe even file save?)
* Have update function that only revises things that actually change.
    * Keep current state and new state separately and compare them
* Integrate with item and enhancement pages (update them with the same code techniques)
* Hide names of everything until it's unlocked
* Have an option to pop a confirmation dialog before unlocking anything new (maybe a list of options of what to confirm)
* Generic unlockable UI: you can choose a type of thing (e.g., winter road events) then enter an identifier (this should support card #, WR-##, and just ## without WR-), and if it has something to track, that's presented.

## Future Considerations

* Support for campaign and character sheets
* Automatically unlocking things based on what's unlocked or upgraded (e.g., buildings)
* Drawing cards (random item, random side scenario, etc.) or event handling
* Tracking sections (only showing those you've been exposed to so far) - useful for using play surface books
* Track challenges, pets, trials, any similar decks
* Campaign event log
