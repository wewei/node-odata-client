import _ from 'lodash';
import { splitQName } from './util';

export default class SchemaObject {

  constructor(options) {
    this.pickOptions(options, [
      'namespace',
      'simpleIdentifier',
      'qualifiedName'
    ]);

    if (!this.qualifiedName) {
      this.qualifiedName = `${this.namespace}.${this.simpleIdentifier}`;
    }

    if (!this.simpleIdentifier) {
      [ this.namespace, this.simpleIdentifier ] = splitQName(this.qualifiedName);
    }
  }

  pickOptions(options, keys) {
    if (_.isArray(keys)) {
      _.extend(this, _.pick(options, keys));
    } else {
      _.forEach(keys, (v, k) => this[k] = options[v]);
    }
  }

  resolve(resolver) { }

}
