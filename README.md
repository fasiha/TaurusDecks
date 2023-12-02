# TaurusDecks

![Demo of the Taurus Decks app](taurus-decks.gif)

A simple app for the kids to organize their Pokémon cards into locations. They can search for a card with its number and the Pokémon's name, and specify its location (e.g., which deck, which binder, which box), finish, condition, and any notes, and add it to a database.

## Setup

1. Install [Git](https://git-scm.com) if it's not already on your computer and 
2. Install [Node.js](https://nodejs.org) (any recent version)
3. In your command prompt (Terminal app in macOS, Command Prompt or Git Bash in Windows, xterm in Linux, etc.), run `git clone https://github.com/fasiha/TaurusDecks.git` to clone this repository
4. `cd TaurusDecks` to enter into the directory Git just created
5. `npm i` to install dependencies with `npm` which Node.js installed; if you're like me and you prefer `pnpm` to save disk space, run `npx pnpm i` (`npx` was installed by Node.js too)
6. Download a recent release of [Pokemon TCG Data](https://github.com/PokemonTCG/pokemon-tcg-data/releases), unzip it, rename the directory `pokemon-tcg-data`, and drop it into this `TaurusDecks` directory
7. Run `npm run tcg:combine` to bundle all the TCG data into a single file for Taurus Decks
8. Run `npm run dev` to start the web server and open the URL it tells you!

## Tech

This is an Astro app built with Preact. Astro also hosts the Express.js webserver that stores the data in SQLite. We use the fantastic [Pokemon TCG Data](https://github.com/PokemonTCG/pokemon-tcg-data/) directory.

## Notes

For each card:

- card identifier
- number we own
- their locations
- notes?
- finishes

Finish has a few different types:

- normal
- holographic
- reverse-holographic
