import _ from 'lodash';

export function splitQName(qualifiedName) {
  const segments = qualifiedName.split('.');
  return [ segments.slice(0, -1).join('.'), _.last(segments) ];
}

export function generateProperty(obj, name, generator) {
  Object.defineProperty(obj, name, {
    configurable: true,
    get() {
      let value = generator.call(this);
      Object.defineProperty(this, name, { value });
      return value;
    }
  });
}
