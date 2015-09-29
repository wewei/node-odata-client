import SchemaObject from './schema-object';

export default class Singleton extends SchemaObject {
  constructor(options) {
    super(options);
    this.pickOptions(options, {
      type: 'type',
      navigationPropertyBindings: 'navBindings'
    });
  }

  resolve(resolver) {
    super.resolve(resolver);
    this.type = resolver(this.type);
  }
}
