import { __SAMPLE__ } from './__SAMPLE__.d';

const json = require('./__SAMPLE__.json');

export const getModel = () => <__SAMPLE__>json;

// UNCOMMENT IN DEV
// const versionsJSON = require('./versions.sample.json');
// const __CURRENT_VERSION__ = '2.0.0';
// const __ENDPOINT_BASE_URL__ = 'https://rawgit.com/GabrielCTroia/beetlejuice-sample-repo1';


const window: any = global;
((global: any, document: any, URL: string, VERSION: string) => {
  console.log('Current version:', VERSION);

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

    global['__beetlejuice__getVersions'] = (data: any) => {
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


  console.log('Attempting to get', versionsJsonURL);
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
    }
    else {
      console.log('Nothing new!');
    }
  });

})(window, window.document, __ENDPOINT_BASE_URL__, __CURRENT_VERSION__);
