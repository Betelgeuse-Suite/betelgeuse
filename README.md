# Betelgeuse
An all-in-one solution to manage configuration and language versioning in native mobile apps.

or 

A full-blown configuration deployment service.

## Why?

TLDR;
So you can fix typos in a matter of minutes not days. 

---

### 1. Saves Time

The changes are deployed on the fly, skipping the need for a new submission to the App Store. 

### 2. Takes the developer out of the loop

The Language files now reside outside of the source code able to be updated (and automatically deployed) by anybody in the team not only the developer

### 3. Built with the developer in mind

All the language/config bundles are type safe out of the box, and betelgeuse ensures there are no runtime errors. 



## How does it work?

### Server Side:

Looking at it from the Server's perspective, a Betelgeuse Bundle at it's core is a simple git repository of yaml files, living somewhere remotely (like Github or your own private server)

Anytime a change is commited and pushed, a webhook triggers a Betelgeuse process (that runs on a server), which:
1. Compares the changes with the current version
2. Figures out the Release Type (Major, Minor, Patch - following Semver)
3. Compiles all the YAML files into a single JSON file
4. Looks at the new JSON file and generates a Typed Model based on its schema (Typescript and Swift currently)
5. Increments the Version based on it's Release Type and Adds it to a Version Registry file inside the repo
6. Tags the current Repo state, and pushes the changes

### Client Side:

From the Client's perspective, the Betelgeuse Bundle is a valid dependency (NPM Package or CocoaPod currently), that comes with the SDK, the Data (the generated json file) and the Typed Model, and can easily be installed like any other dependencies using:
`pod install` or `npm install`

This gives access to the Data and brings Type Safety out of the box at development time, so the developer always knows what the data looks like. And yes, s/he gets Autocomplete!



After the App is deployed, the SDK seemingly checks for updates in the background and downloads the best version (latest non-breaking release). At the next App Start (or Load), the new Data is in effect.


## Legend

Breaking Version 
- a yaml key rename
- a yaml key remove
- a type change

Non-Breaking Version
- value change
- key additions
- value added to an Array



## Development


## Global Dependencies

`npm i -g typescript`

`npm i -g typings`

`npm i -g ts-node`


## Usage

`ts-node ./src/index.ts --help`
