import * as commander from 'commander';
const pkg = require('../package.json');

import { Platform } from './Betelgeuse';
import { 
  command_compile,
  command_compile_sdk,
  command_generateJson,
  command_generateTypes,
  command_generateClientSDK,
  command_getReleaseType,
  command_deploy,
 } from './commands';


commander
  .version(pkg.version)

// Step 1 - Generate the json from yaml
commander
  .command('generate-json <srcDir>')
  .option('--out [out]', 'Output file path')
  .action(command_generateJson);

// Step 2 - Get the Release Type by comparing the previous file with the generated one
commander
  .command('get-release-type <nextJsonPath> <prevJsonPath>')
  .action(command_getReleaseType);

// Step 3 - Generate the Type file
commander
  .command('generate-types <jsonFilePath> <platform>')
  .option('--out [out]', 'Output directory path')
  .action((jsonFilePath: string, platform: string, options: any) => {
    if (platform === 'swift') {
      return command_generateTypes(jsonFilePath, Platform.swift, options)
    } else if (platform === 'typescript') {
      return command_generateTypes(jsonFilePath, Platform.typescript, options)
    } else {
      console.error(`Platform ${platform} is not valid!`);
    }
  });

// Step 4 - Generate Client SDK template
commander
  .command('generate-client-sdks <AppName>')
  .option('--out [out]', 'Output directory path')
  .option('--repo-version <repoVersion>', 'Repo Version')
  .option('--endpoint-base-url <endpointBaseUrl>', 'The endpoint base url')
  .action(command_generateClientSDK);

commander
  .command('compile <repositoryPath>')
  .action(command_compile);

// Step 5 - Compile
commander
  .command('compile-sdks <repositoryPath>')
  .action(command_compile_sdk);

// Step 6 - Push new files to the CDN
commander
  .command('deploy')
  .action(command_deploy)


commander.parse(process.argv);
