# Beetlejuice
An all-in-one solution to manage configuration and language versioning in native mobile apps.

## Global Dependencies

`npm i -g typescript`

`npm i -g typings`

`npm i -g ts-node`


## Usage

- Get an output of the next concatonated build

`ts-node ./src/index.ts --prev ./mocks/a|prev|*.json --src ./mocks/lang`

- Generate a tsd file

`ts-node src/TypeGenerator/index.ts`