import ObjectType from './object-type';

export default class EntityType extends ObjectType {
  constructor(options) {
    super(options);
    this.pickOptions(options, [ 'key' ]);
  }
}
