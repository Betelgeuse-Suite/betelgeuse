import { Data } from './Data.d';

type AugmentedWindow = Window & {
  __beetlejuice__getJSONP?: (data: any) => void;
}

class Store {
  constructor(private storage: Storage) { }

  setItem(key: string, data: string) {
    this.storage.setItem(key, data);
  }

  getItem(key: string): string {
    return this.storage.getItem(key) || '';
  }
}

const store = new Store(window.localStorage);



export type __APP_NAME__ = Data;

export const getModel = (): __APP_NAME__ => {
  var cached = store.getItem('__beetlejuice__data');

  if (cached) {
    return JSON.parse(cached);
  }

  const json = require('./Data.json');
  store.setItem('__APP_NAME__', JSON.stringify(json));

  return json;
};


((window: AugmentedWindow, URL: string, VERSION: string, APP_NAME: string) => {
  console.log('Current version:', VERSION);

  const document = window.document;

  type Version = {
    major: number;
    minor: number;
    patch: number;
  }

  const toVersion = (v: string): Version => {
    if (isValidStringVersion(v)) {
      throw `The given string: ${v} is not a valid version!`;
    }

    const [major, minor, patch] = v.split('.');

    return {
      major: Number(major),
      minor: Number(minor),
      patch: Number(patch),
    };
  };

  const isValidStringVersion = (v: string) => {
    const [major, minor, patch] = v.split('.');

    return !(isNumeric(major) && isNumeric(minor) && isNumeric(patch));
  }

  function isNumeric(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  const toString = (v: Version) => {
    v = v || {};

    return `${v.major}.${v.minor}.${v.patch}`;
  }

  const compareVersions = (vA: Version, vB: Version) => {
    if (isEqualVersion(vA, vB)) {
      return 0;
    }
    else if (isNewerVersion(vA, vB)) {
      return -1;
    }
    return 1;
  }

  const isEqualVersion = (vA: Version, vB: Version) => {
    return vA.major === vB.major
      && vA.minor === vB.minor
      && vA.patch === vB.patch;
  }

  const isNewerVersion = (vA: Version, vB: Version) => {
    return vB.major > vA.major
      || vB.major === vA.major && vB.minor > vA.minor
      || vB.major === vA.major && vB.minor === vA.minor && vB.patch > vA.patch;
  };

  const isNonBreakingReleaseVersion = (vA: Version, vB: Version) => {
    return vA.major === vB.major;
  }

  const getJSONP = (url: string, success: (data: any) => void) => {
    // var ud = '_' + +new Date,
    var script = document.createElement('script'),
      head = document.getElementsByTagName('head')[0]
        || document.documentElement;

    window.__beetlejuice__getJSONP = (data: any) => {
      head.removeChild(script);
      success && success(data);
    };

    script.src = url;
    // script.src = url.replace('callback=?', 'callback=' + ud);
    head.appendChild(script);
  }

  const sortVersionsDesc = (vv: Version[] = []) => vv.sort((a, b) => compareVersions(b, a));

  const onlyNewerAndNonBreakingVersions = (vv: Version[]) => vv
    .filter((v) => {
      return isNewerVersion(version, v) && isNonBreakingReleaseVersion(version, v)
    });

  const getBestVersion = (vv: Version[]) => {
    return sortVersionsDesc(onlyNewerAndNonBreakingVersions(vv))[0];
  }

  const version = toVersion(VERSION);

  const versionsJsonURL = URL + '/master/versions.js';
  const getDataUrl = (version: Version) => {
    return `${URL}/v${toString(version)}/.bin/${APP_NAME}.js`;
  }


  console.log('Attempting to fetch json from', versionsJsonURL);
  getJSONP(versionsJsonURL, (data) => {
    // have some validation in place

    console.log('Versions JSON data', data);

    const allVersions = Object
      .keys(data)
      .map(toVersion);

    allVersions.forEach((v) => {
      console.log(toString(v));
    });

    const bestVersion = getBestVersion(allVersions);

    if (bestVersion) {
      console.log('Best Version:', toString(bestVersion));

      console.log('Loading', getDataUrl(bestVersion));
      getJSONP(getDataUrl(bestVersion), (data: __APP_NAME__) => {
        console.log('New data', data);
      });
    }
    else {
      console.log('Nothing new!');
    }
  });
})(window, '__ENDPOINT_BASE_URL__', '__CURRENT_VERSION__', '__APP_NAME__');
