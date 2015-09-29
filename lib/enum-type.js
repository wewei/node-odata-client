import Type from './type';

export default class EnumType extends Type {
  constructor(options) {
    super(options);
    this.pickOptions(options, [ 'members' ]);
  }
}
