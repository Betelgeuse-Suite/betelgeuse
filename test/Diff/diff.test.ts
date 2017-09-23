import { expect } from 'chai';
import { getReleaseType } from '../../src/Diff';


describe('Diff', () => {

  it('detects no changes', () => {
    expect(getReleaseType({}, {})).to.equal('none');
    expect(getReleaseType({ a: 4 }, { a: 4 })).to.equal('none');
    expect((getReleaseType(
      { a: 4, nes: { ted: { val: 'a' } } },
      { a: 4, nes: { ted: { val: 'a' } } }
    ))).to.equal('none');
  });

  it('detects patch changes', () => {
    expect((getReleaseType(
      { a: 'asd' },
      { a: 'asds' }
    ))).to.equal('patch');

    expect((getReleaseType(
      { a: 'asd', b: '4fa' },
      { a: 'asds', b: 'roigh' }
    ))).to.equal('patch');

    expect((getReleaseType(
      { a: 'asd', nes: { ted: { val: 3 } } },
      { a: 'asd', nes: { ted: { val: 2 } } }
    ))).to.equal('patch');
  });

  it('patch takes priority over none', () => {
    expect((getReleaseType(
      { a: 'asd' },
      { a: 'asd' },
    ))).to.equal('none');

    expect((getReleaseType(
      { a: 'asd' },
      { a: 'asd has changed' },
    ))).to.equal('patch');
  });

  it('detects minor changes', () => {
    expect((getReleaseType(
      { a: 'asd' },
      { a: 'asd', b: 'wed' }
    ))).to.equal('minor');

    expect((getReleaseType(
      { a: 'asd', b: 'wed' },
      { a: 'asd', b: 'wed', c: 'qwe' }
    ))).to.equal('minor');

    expect((getReleaseType(
      { a: 'asd', nes: { ted: { val: 'a' } } },
      { a: 'asd', nes: { ted: { val: 'a' }, next_ted: { val: 'b' } } }
    ))).to.equal('minor');
  });

  it('minor takes priority over patch', () => {
    expect((getReleaseType(
      { a: 'asd' },
      { a: 'asd has changed' },
    ))).to.equal('patch');


    expect((getReleaseType(
      { a: 'asd' },
      { a: 'asd has changed', b: 'but b is new' },
    ))).to.equal('minor');
  });

  it('detects major changes', () => {
    expect((getReleaseType(
      { a: 'asd' },
      { b: 'asd' }
    ))).to.equal('major');

    expect((getReleaseType(
      { a: 'asd' },
      { b: 'asd', c: 'oih' }
    ))).to.equal('major');

    expect((getReleaseType(
      { a: 'asd', nes: { ted: { val: 'a' } } },
      { a: 'asd', nes: { ted: { value: 'a' } } }
    ))).to.equal('major');

    expect((getReleaseType(
      { a: 'asd', nes: { ted: { val: 'a' } } },
      { b: 'asd', c: 'oih' }
    ))).to.equal('major');
  });

  it('major takes priority over minor', () => {
    expect((getReleaseType(
      { a: 'asd' },
      { a: 'asd has changed', b: 'but b is new' },
    ))).to.equal('minor');

    expect((getReleaseType(
      { a: 'asd' },
      { c: 'asd has changed to another prop', b: 'but b is new' },
    ))).to.equal('major');
  });

});
