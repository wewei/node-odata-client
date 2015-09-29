import _ from 'lodash';

import SchemaObject from './schema-object';
import TypeAccessor from './type-accessor';

import { generateProperty } from './util';

class Type extends SchemaObject{
  constructor(options) {
    super(options);
  }

  accessor(options) {
    return new this.TypeAccessor(_.extend({}, options, { type: this }));
  }
}

generateProperty(Type.prototype, 'TypeAccessor', () => TypeAccessor);

export default Type;
