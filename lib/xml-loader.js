import _ from 'lodash';
import xml2js from 'xml2js';

const parseXml = (function() {
  'use strict';

  const parser = new xml2js.Parser({
    xmlns: true,
    tagNameProcessors: [ xml2js.processors.stripPrefix ],
    attrNameProcessors: [ xml2js.processors.stripPrefix ],
  });

  return (xmlData) => new Promise(function(resolve, reject) {
    parser.parseString(xmlData, function (err, json) {
      if (err) {
        reject(err);
      } else {
        resolve(json);
      }
    });
  });
}());

class Context {
  constructor() {
  }

  set(arg) {
    return _.isString(arg) ? (value) => {
      _.set(this, arg, value);
    } : () => {
      _.extend(this, arg);
    };
  }
}

function loadNode(node, def, context) {
  if (!context) context = new Context();
  if (_.isFunction(def)) def = def(context);
  if (_.isFunction(def['#begin'])) def['#begin'](node);
  _.forEach(node.$, (attr, name) => {
    if (_.isFunction(def[`@${name}`])) def[`@${name}`](attr.value, attr);
  });
  _.forEach(node, (child, name) => {
    if (name[0] !== '$' && name in def) {
      if (_.isArray(child)) {
        _.forEach(child, (nodeChild) => loadNode(nodeChild, def[name]));
      } else {
        loadNode(child, def[name]);
      }
    }
  });
  if (_.isFunction(def['#end'])) def['#end']();
}

export default class XMLLoader {
  constructor(definition, context) {
    this.definition = definition;
    this.context = context;
  }

  load(xml) {
    return parseXml(xml).then((root) => {
      loadNode(root, this.definition, this.context);
    });
  }
}
