import { expect } from 'chai'
import { OpenApiValidator } from './validate-json-schema-middleware'

let lastFilePath
let openApiValidator

/**
 * Validates header and body of the response.
 */
async function validateResponse(openApiFilePath, path, method, httpCode, res) {
  if (openApiFilePath !== lastFilePath) {
    openApiValidator = await OpenApiValidator(openApiFilePath, {
      ajvConfigBody: {
        nullable: true,
      },
    })
    lastFilePath = openApiFilePath
  }
  const responseValidationEndPoint = openApiValidator.getResponseValidationEndPoint([path, method])

  const validator = responseValidationEndPoint.validator(httpCode)

  expect(validator.validate(res), JSON.stringify(validator.errors, null, 2)).to.equal(true)
}

export {
  validateResponse,
}
