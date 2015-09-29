'use strict';

import _ from 'lodash';
import rp from 'request-promise';

function polish(object) {
  if (_.isArray(object)) {
    return _.map(object, polish);
  } else if (_.isPlainObject(object)) {
    let ret = {};
    _.forEach(object, (value, key) => {
      value = polish(value);
      if (key[0] === '@') {
        Object.defineProperty(ret, key, { value });
      } else {
        ret[key] = value;
      }
    });
    return ret;
  } else {
    return object;
  }
}

export default class TypeAccessor {
  constructor(options /* { url, type, data } */) {
    if (options.url) options.url = options.url.replace(/\/?$/, '');
    Object.defineProperty(this, '$', {
      value: _.pick(options, [ 'url', 'type', 'data', 'host', 'sel' ]),
      enumerable: false
    });
    if (options.data) this.$.p$data = Promise.resolve(options.data);
  }

  get() {
    if (_.isUndefined(this.$.p$data)) {
      if (this.$.host && this.$.sel) {
        this.$.p$data = this.$.host.get().then(this.$.sel);
      } else if (this.$.url) {
        this.$.p$data = rp.get(this.$.url).then(JSON.parse).then(polish);
      }
    }
    return this.$.p$data.then((data) => {
      this.$.data = data;
      return data;
    });
  }
}
