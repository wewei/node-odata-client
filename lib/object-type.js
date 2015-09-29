import _ from 'lodash';
import Type from './type';
import TypeAccessor from './type-accessor';
import { generateProperty } from './util';

class ObjectType extends Type {
  constructor(options) {
    super(options);
    this.pickOptions(options, [
      'baseType',
      'properties',
      'navigationProperties'
    ]);
  }

  resolve(resolver) {
    super.resolve(resolver);
    if (this.baseType) this.baseType = resolver(this.baseType);
    _.forEach(this.properties, (prop) => {
      prop.type = resolver(prop.type);
    });
    _.forEach(this.navigationProperties, (nav) => {
      nav.type = resolver(nav.type);
    })
  }

}

generateProperty(ObjectType.prototype, 'TypeAccessor', function () {
  class ObjectTypeAccessor extends TypeAccessor { }

  const defineNavigationProperty = (nav, name) => {
    generateProperty(ObjectTypeAccessor.prototype, name, function () {
      return nav.type.accessor({
        url: `${this.$.url}/${name}`,
        data: _.result(this.$.data, name)
      });
    });
  };

  const defineProperty = (prop, name) => {
    generateProperty(ObjectTypeAccessor.prototype, name, function () {
      return prop.type.accessor({
        host: this,
        sel: (d) => d[name]
      });
    });
  }

  _.forEach(this.navigationProperties, defineNavigationProperty);
  _.forEach(this.properties, defineProperty);

  return ObjectTypeAccessor;

});

export default ObjectType;
