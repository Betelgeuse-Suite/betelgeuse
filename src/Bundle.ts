
export const getBundleInformation = (fromPath: string) => {
  // validate bundle at path

  // todo: replace with betelgeuse.json
  const pkgJson = require(`${process.cwd()}/${fromPath}/package.json`);
  const root = `${process.cwd()}/${fromPath}`;
  
  return {
    // This should come from somewhere else :) betelgeuse.json file
    appName: 'MyApp',
    version: pkgJson.version,
    cdn: pkgJson.cdn,
    paths: {
      root,
      bin: `${root}/.bin`,
      source: `${root}/source`,
      tmp: `${root}/tmp`,
    }
  }
}

export type validateBundle = (atPath: string) => {
  // not ready yet
}