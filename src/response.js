module.exports.createSuccessResponse = function (data) {
    return {
      status: 'ok',
      ...data,
    };
  };
  module.exports.createErrorResponse = function (code, message) {
    return {
        status: 'error',
        error: {
            code: code, 
            message: message
        }
    };
  };