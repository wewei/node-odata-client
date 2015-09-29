import SchemaObject from './schema-object';

export default class EntityType extends SchemaObject{
  constructor(options) {
    super(options);
    this.pickOptions(options, {
      entityType: 'entityType',
      navigationPropertyBindings: 'navBindings'
    });
  }

  resolve(resolver) {
    super.resolve(resolver);
    this.entityType = resolver(this.entityType);
  }
}
