import { Data } from './Data.d';

type AugmentedWindow = Window & {
  __betelgeuse__getJSONP?: (data: any) => void;
}

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


const now = () => (new Date()).getTime();

class DataStore {

  private KEY = '__betelgeuse__data';

  constructor(private storage: Storage) { }

  update(version: Version, data: Data) {
    this.storage.setItem(this.KEY, JSON.stringify({
      version: toString(version),
      updated_at: now(),
      data,
    }));
  }

  getCurrent(): { data: Data, version: Version, updatedAt: Date } | undefined {
    try {
      const json = JSON.parse(this.storage.getItem(this.KEY) || '');
      return {
        data: <Data>json.data,
        version: toVersion(<string>json.version),
        updatedAt: new Date(<string>json.updated_at),
      };
    } catch (e) {
      return undefined;
    }
  }
}

const store = new DataStore(window.localStorage);

export type __APP_NAME__ = Data;


const getCurrentVersion = () => {
  return (store.getCurrent() || { version: toVersion('__CURRENT_VERSION_AT_BUILDTIME__') }).version;
}

export const getModel = (): __APP_NAME__ => {
  var cached = store.getCurrent();

  if (cached) {
    return cached.data;
  }

  const json = require('./Data.json');
  store.update(toVersion('__CURRENT_VERSION_AT_BUILDTIME__'), json);

  return json;
};


((window: AugmentedWindow, URL: string, VERSION: Version) => {
  console.log('Current version:', toString(VERSION));

  const document = window.document;


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
    var script = document.createElement('script'),
      head = document.getElementsByTagName('head')[0]
        || document.documentElement;

    window.__betelgeuse__getJSONP = (data: any) => {
      head.removeChild(script);
      success && success(data);
    };

    script.src = url;
    head.appendChild(script);
  }

  const sortVersionsDesc = (vv: Version[] = []) => vv.sort((a, b) => compareVersions(b, a));

  const onlyNewerAndNonBreakingVersions = (vv: Version[]) => vv
    .filter((v) => {
      return isNewerVersion(VERSION, v) && isNonBreakingReleaseVersion(VERSION, v)
    });

  const getBestVersion = (vv: Version[]) => {
    return sortVersionsDesc(onlyNewerAndNonBreakingVersions(vv))[0];
  }

  const cacheTimestamp = (seconds: number) => {
    // return a different timestamp per minute, which
    return '?at=' + Math.floor(now() / (seconds * 1000));
  }

  const versionsJsonURL = URL + '/master/versions.js' + cacheTimestamp(60);
  const getDataUrl = (version: Version) => {
    return `${URL}/v${toString(version)}/.bin/Data.js`;
  }


  console.log('Attempting to fetch json from', versionsJsonURL);
  getJSONP(versionsJsonURL, (data) => {
    // have some validation in place

    const allVersions = Object
      .keys(data)
      .map(toVersion);

    const bestVersion = getBestVersion(allVersions);

    if (bestVersion) {
      console.log('New version found:', toString(bestVersion));
      console.log('Loading', getDataUrl(bestVersion));

      getJSONP(getDataUrl(bestVersion), (data: Data) => {
        console.log('Data', toString(bestVersion), ':', data);

        store.update(bestVersion, data);
      });
    }
    else {
      console.log('Nothing new! Current Version:', toString(VERSION));
    }
  });
})(window, '__ENDPOINT_BASE_URL__', getCurrentVersion());
