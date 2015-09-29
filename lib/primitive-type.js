import Type from './type';

export default class PrimitiveType extends Type {
  constructor(options) {
    super(options);
    this.pickOptions(options, [ 'description' ]);
  }
}
