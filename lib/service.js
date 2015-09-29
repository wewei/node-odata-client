import _ from 'lodash';

import { splitQName } from './util';

import ObjectType from './object-type';
import CollectionType from './collection-type';
import PrimitiveType from './primitive-type';
import MetadataLoader from './metadata-loader';
import ComplexType from './complex-type';

import EntitySet from './entity-set';
import Singleton from './singleton';

function getCollectionType(elementType) {
  const qualifiedName = elementType.qualifiedName + '@COLL';
  return this.getObject(qualifiedName) || this.registerObject(
    new CollectionType({ qualifiedName, elementType })
  );
}

function resolveType(typeName) {
  const m = typeName.match(/Collection\(([_0-9a-zA-Z\.]+)\)/);
  if (m) typeName = m[1];
  const type = this.getObject(typeName);
  return m? getCollectionType.call(this, type): type;
}

function initiateService() {
  return new MetadataLoader(this).load().then(() => {
    this.iterateObjects((object) => {
      object.resolve(resolveType.bind(this));
    });
  }).then(() => {
    let navProps = {};
    this.iterateObjects((object) => {
      if (object instanceof EntitySet) {
        navProps[object.simpleIdentifier] = {
          type: getCollectionType.call(this, object.entityType)
        };
      } else if (object instanceof Singleton) {
        navProps[object.simpleIdentifier] = { type: object.type }
      }
    });
    this.rootType = new ComplexType({
      namespace: '@SERVICE',
      simpleIdentifier: '@ROOT',
      navigationProperties: navProps
    });

    this.$ = this.rootType.accessor({ url: this.url });
  }).then(() => { return this; });
}

const primitiveTypes = {
  'Binary': { description: 'Binary data' },
  'Boolean': { description: 'Binary-valued logic' },
  'Byte': { description: 'Unsigned 8-bit integer' },
  'Date': { description: 'Date without a time-zone offset' },
  'DateTimeOffset': { description: 'Date and time with a time-zone offset, no leap seconds' },
  'Decimal': { description: 'Numeric values with fixed precision and scale' },
  'Double': { description: 'IEEE 754 binary64 floating-point number (15-17 decimal digits)' },
  'Duration': { description: 'Signed duration in days, hours, minutes, and (sub)seconds' },
  'Guid': { description: '16-byte (128-bit) unique identifier' },
  'Int16': { description: 'Signed 16-bit integer' },
  'Int32': { description: 'Signed 32-bit integer' },
  'Int64': { description: 'Signed 64-bit integer' },
  'SByte': { description: 'Signed 8-bit integer' },
  'Single': { description: 'IEEE 754 binary32 floating-point number (6-9 decimal digits)' },
  'Stream': { description: 'Binary data stream' },
  'String': { description: 'Sequence of UTF-8 characters' },
  'TimeOfDay': { description: 'Clock time 00:00-23:59:59.999999999999' },
  'Geography': { description: 'Abstract base type for all Geography types' },
  'GeographyPoint': { description: 'A point in a round-earth coordinate system' },
  'GeographyLineString': { description: 'Line string in a round-earth coordinate system' },
  'GeographyPolygon': { description: 'Polygon in a round-earth coordinate system' },
  'GeographyMultiPoint': { description: 'Collection of points in a round-earth coordinate system' },
  'GeographyMultiLineString': { description: 'Collection of line strings in a round-earth coordinate system' },
  'GeographyMultiPolygon': { description: 'Collection of polygons in a round-earth coordinate system' },
  'GeographyCollection': { description: 'Collection of arbitrary Geography values' },
  'Geometry': { description: 'Abstract base type for all Geometry types' },
  'GeometryPoint': { description: 'Point in a flat-earth coordinate system' },
  'GeometryLineString': { description: 'Line string in a flat-earth coordinate system' },
  'GeometryPolygon': { description: 'Polygon in a flat-earth coordinate system' },
  'GeometryMultiPoint': { description: 'Collection of points in a flat-earth coordinate system' },
  'GeometryMultiLineString': { description: 'Collection of line strings in a flat-earth coordinate system' },
  'GeometryMultiPolygon': { description: 'Collection of polygons in a flat-earth coordinate system' },
  'GeometryCollection': { description: 'Collection of arbitrary Geometry values' },
};

class Service {
  constructor(url, options) {
    this.url = url;
    this.options = options;
    this.initiateObjectPool();
    this.ready = _.memoize(() => initiateService.apply(this));
  }

  // A 2 level hash namespace/simpleIdentifier
  initiateObjectPool() {
    this.objectPool = {};
    _.chain(primitiveTypes).map(
      (options, name) => new PrimitiveType(_.extend(options, {
        namespace: 'Edm',
        simpleIdentifier: name
      }))
    ).forEach(this.registerObject.bind(this)).value();
  }

  registerObject(object) {
    const namespace = object.namespace;
    const simpleIdentifier = object.simpleIdentifier;
    if (!(namespace in this.objectPool)) this.objectPool[namespace] = {};
    this.objectPool[namespace][simpleIdentifier] = object;
    return object;
  }

  getObject(/* namespace, simpleIdentifier */) {
    if (arguments.length > 0) {
      let [ ns, sid ] = arguments[1] ? arguments : splitQName(arguments[0]);
      return _.chain(this.objectPool).result(ns).result(sid).value();
    }
    // otherwise return undeinfed;
  }

  iterateObjects(cb) {
    _.forEach(this.objectPool, (nsPool) => _.forEach(nsPool, cb));
  }

}

export default Service;
