// tests/unit/response.test.js

const { createErrorResponse, createSuccessResponse } = require('../../src/response');

// Define (i.e., name) the set of tests we're about to do
describe('API Responses', () => {
  // Write a test for calling createErrorResponse()
  test('createErrorResponse()', () => {
    const errorResponse = createErrorResponse(404, 'not found');
    // Expect the result to look like the following
    expect(errorResponse).toEqual({
      status: 'error',
      error: {
        code: 404,
        message: 'not found',
      },
    });
  });
  // Write a test for calling createSuccessResponse()

  test('createSuccessResponse()', ()=>{

    //No arg passed
    const successResponse = createSuccessResponse();
    //Expect the result to look like the following
    expect(successResponse).toEqual({
        status: 'ok',
    });
  });

  // Write a test for calling createSuccessResponse() with arguments
  test('createSuccessResponse(data)', () =>{
    //Data arguments included
    const data = {a: 1, b: 2};
    const successResponse = createSuccessResponse(data);

    //Expect the result to look like the following
    expect(successResponse).toEqual({
        status: 'ok',
        a: 1, 
        b: 2,
    });
  })
});
