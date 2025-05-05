# CA2 Fitness
An RPG-themed game where players can collect loot from ancient lands, learn powerful skills and fight to decide who's the best.

## Game Mechanics
To get started, a user can create a character for free. They can choose to create more than 1 character at the cost of skillpoints.

Characters can enter dungeons to collect items and may encounter monsters that will force them into battle.
A battle cannot be escaped - forfeiting will instantly kill the character.

### Progression
- Clearing dungeons and defeating opponents will award characters with experience points, which is used in levelling up and increasing their maximum Mana capacity.
- Characters can equip items that range in rarity from Common to Legendary and strengthen themselves, becoming stronger and able to face tougher opponents.

### PvP
- Duels can be made between characters, allowing users to test their skills in strategic combat.
- Unlike PvE, users must wait for the other to make their turn before they can.

## Development
To setup the project locally, run the command `npm i`. Node.js needs to be installed on the local machine.

A .env file is required in the repository root which specifies a database to use for the project. e.g.:
```
DB_HOST=localhost
DB_USER=userhere
DB_PASSWORD=passwordhere
DB_DATABASE=databasehere
ACCESS_TOKEN_SECRET=accesstokensecrethere
REFRESH_TOKEN_SECRET=refreshtokensecrethere
PEPPER=pepperhere

JWT_EXPIRES_IN=30m
JWT_REFRESH_EXPIRES_IN=7d
JWT_ALGORITHM=HS256
```

To setup the database, use the command `npm run init_tables`.
To run the project, do `npm run dev`.

By default, the website will be hosted on `localhost:3000`. The API can be found on `localhost:3000/api`, and will be on this directory for production servers too.

## Documentation
Endpoint documentation for this project can be found here: https://documenter.getpostman.com/view/38989336/2sAYHzFNFP