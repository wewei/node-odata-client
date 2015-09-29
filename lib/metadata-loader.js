import _ from 'lodash';
import rp from 'request-promise';

import XMLLoader from './xml-loader';

import EnumType from './enum-type';
import ComplexType from './complex-type';
import EntityType from './entity-type';

import EntitySet from './entity-set';
import Singleton from './singleton';

const propertyLoader = (cb) => (prop) => ({
  '#begin': prop.set({ value: {} }),
  '@Name': prop.set('name'),
  '@Type': prop.set('value.type'),
  '@Nullable': prop.set('value.nullable'),
  '#end': () => cb(prop.name, prop.value)
});

const navigationPropertyLoader = (cb) => (nav) => ({
  '#begin': nav.set({ value: {} }),
  '@Name': nav.set('name'),
  '@Type': nav.set('value.type'),
  '@Nullable': nav.set('value.nullable'),
  '#end': () => cb(nav.name, nav.value)
});

const navigationPropertyBingdingLoader = (cb) => (binding) => ({
  '@Path': binding.set('path'),
  '@Target': binding.set('target'),
  '#end': () => cb(binding)
});

const loaderDefinition = (ctx) => ({
  'Edmx': {
    'DataServices': {
      'Schema': (schema) => ({
        '@Namespace': schema.set('namespace'),

        // EnumType Loader
        'EnumType': (type) => ({
          '#begin': type.set({ members: {} }),

          '@Name': type.set('simpleIdentifier'),

          'Member': (member) => ({
            '@Name': member.set('name'),
            '@Value': member.set('value'),
            '#end': () => type.members[member.name] = member.value
          }),

          '#end': () => ctx.regObj(new EnumType(_.extend({}, schema, type)))
        }),

        // ComplextType Loader
        'ComplexType': (type) => ({
          '#begin': type.set({
            properties: {},
            navigationProperties: {}
          }),

          '@Name': type.set('simpleIdentifier'),
          '@BaseType': type.set('baseType'),

          'Property': propertyLoader(
            (name, value) => type.properties[name] = value
          ),

          'NavigationProperty': navigationPropertyLoader(
            (name, value) => type.navigationProperties[name] = value
          ),

          '#end':() => ctx.regObj(new ComplexType(_.extend({}, schema, type)))
        }),

        // EntityType Loader
        'EntityType': (type) => ({
          '#begin': type.set({
            properties: {},
            navigationProperties: {}
          }),

          '@Name': type.set('simpleIdentifier'),
          '@BaseType': type.set('baseType'),

          'Key': {
            '#begin': type.set({ key: {} }),
            'PropertyRef': {
              '@Name': type.set('key.name'),
              '@Alias': type.set('key.alias')
            }
          },

          'Property': propertyLoader(
            (name, value) => type.properties[name] = value
          ),

          'NavigationProperty': navigationPropertyLoader(
            (name, value) => type.navigationProperties[name] = value
          ),

          '#end': () => ctx.regObj(new EntityType(_.extend({}, schema, type)))
        }),

        'EntityContainer': {
          'EntitySet': (eset) => ({
            '#begin': eset.set({ navBindings: {} }),

            '@Name': eset.set('simpleIdentifier'),
            '@EntityType': eset.set('entityType'),

            'NavigationPropertyBinding': navigationPropertyBingdingLoader(
              (binding) => eset.navBindings[binding.path] =  binding.target
            ),

            '#end': () => ctx.regObj(new EntitySet(_.extend({}, schema, eset)))
          }),

          'Singleton': (sgt) => ({
            '#begin': sgt.set({ navBindings: {} }),

            '@Name': sgt.set('simpleIdentifier'),
            '@Type': sgt.set('type'),

            'NavigationPropertyBinding': navigationPropertyBingdingLoader(
              (binding) => sgt.navBindings[binding.path] =  binding.target
            ),

            '#end': () => ctx.regObj(new Singleton(_.extend({}, schema, sgt)))
          })
        }
      })
    }
  }
});

export default class MetadataLoader {
  constructor(service) {
    this.service = service;
    this.xmlloader = new XMLLoader(loaderDefinition, {
      regObj: (object) => this.service.registerObject(object)
    });
  }

  load() {
    return rp(this.service.url + '$metadata').then(
      (xml) => this.xmlloader.load(xml)
    ).then(
      () => this.service
    );
  }
}
