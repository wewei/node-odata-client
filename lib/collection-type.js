import _ from 'lodash';

import Type from './type';
import EntityType from './entity-type';
import TypeAccessor from './type-accessor';
import { generateProperty } from './util';

class CollectionType extends Type {
  constructor(options) {
    super(options);
    this.pickOptions(options, [ 'elementType' ]);
  }

  resolve(resolver) {
    super.resolve(resolver);
    this.elementType = super.resolver(this.elementType);
  }
}

class EntitySetAccessor extends TypeAccessor {
  constructor(options) {
    super(options);
    this.$.memberAccessors = {};
    this.$.memberIndex = {};
  }

  $withKey(key) {
    if (!(key in this.$.memberAccessors)) {
      let pathKey = JSON.stringify(key).replace(/\"/g, '\'');
      this.$.memberAccessors[key] = this.$.type.elementType.accessor({
        url: `${this.$.url}(${pathKey})`,
        data: _.result(this.$.memberIndex, key)
      });
    }
    return this.$.memberAccessors[key];
  }

  get() {
    return super.get().then((data) => {
      _.forEach(data.value, (entity) => {
        var key = entity[this.$.type.elementType.key.name];
        this.$.memberIndex[key] = entity;
      });
      return data;
    });
  }
}

class CollectionTypeAccessor extends TypeAccessor { }

generateProperty(CollectionTypeAccessor.prototype, '$first', function() {
  return this.$.type.elementType.accessor({ host: this, sel: _.first });
});

generateProperty(CollectionTypeAccessor.prototype, '$last', function() {
  return this.$.type.elementType.accessor({ host: this, sel: _.last });
});

generateProperty(CollectionType.prototype, 'TypeAccessor', function () {
  return (this.elementType instanceof EntityType) ?
    EntitySetAccessor :
    CollectionTypeAccessor;
});

export default CollectionType;
