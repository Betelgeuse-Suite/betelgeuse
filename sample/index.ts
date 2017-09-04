// import x = require('../mocks/prev.d');

import { Prev } from '../mocks/prev.d';
import { A } from '../mocks/a.d'

const getPrev = () => {
  var x: Prev;
  return <Prev>x;
}


console.log(getPrev().funding);
