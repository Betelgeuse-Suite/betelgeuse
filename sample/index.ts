// import x = require('../mocks/prev.d');

import { Prev } from '../mocks/prev.d';
import { A } from '../mocks/a.d'

const getPrev = () => {
  var x: Prev;
  return <Prev>x;
}

const getA = () => {
  var x: A;
  return <A>x;
}

getA().arrayValue[0].a;


console.log(getPrev().array[0]);
