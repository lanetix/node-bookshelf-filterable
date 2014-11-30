(function () {
  'use strict';

  var _ = require('lodash');

  module.exports = function (Bookshelf, pluginOptions) {

    Bookshelf.Model = Bookshelf.Model.extend({

      applyFilter: function (relation, filter, options) {
        var query;

        options = _.defaults({},
          filter || {},
          options || {},
          pluginOptions || {}
        );

        options.parse = _.defaults({},
          options.parse || {},
          (pluginOptions || {}).parse || {});

        query = this[relation](options.relation);

        query.query(function (qb) {

          // filter
          _.without(Object.keys(filter), 'limit', 'offset', 'sort', 'fields')
            .forEach(function (key) {
              var value = filter[key],
                operator = '=';
              if (!value || !value.length) {
                return;
              } else if (/^<:/.test(value)) {
                operator = '<=';
                value = value.substring(2);
              } else if (/^>:/.test(value)) {
                operator = '>=';
                value = value.substring(2);
              } else if (/^</.test(value)) {
                operator = '<';
                value = value.substring(1);
              } else if (/^>/.test(value)) {
                operator = '>';
                value = value.substring(1);
              } else if (/^~/.test(value)) {
                operator = 'LIKE';
                value = value.substring(1);
              }
              if (options.parse[key]) {
                value = options.parse[key](value);
              }
              qb.where(key, operator, value);
            });

          // sort
          if (options.sort) {
            options.sort.split(',').forEach(function (key) {
              var direction = 'asc';

              if (key[0] === '-') {
                direction = 'desc';
                key = key.substring(1);
              } else if (key[1] === '+') {
                key = key.substring(1);
              }

              qb.orderBy(key, direction);
            });
          }

          // limit
          if (options.limit) {
            qb.limit(Number(options.limit));
          }

          // offset
          if (options.offset) {
            qb.offset(Number(options.offset));
          }

          // field projection
          // NOTE: not yet supported

        });

        return query;
      }

    });

  };

}());
