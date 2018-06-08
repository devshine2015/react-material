'use strict';

module.exports = function (fileobject) {
  fileobject.beforeRemote('create', function (context, file_object, next) {
    context.args.data.status = 'new';
    next();
  })
};
