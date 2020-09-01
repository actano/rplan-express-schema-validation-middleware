import apiSchemaBuilder from 'api-schema-builder'
import * as HttpStatus from 'http-status-codes'
import get from 'lodash/get'
import validators from './openapi/validators'

const getBodyValidator = swaggerEndPoint => swaggerEndPoint.body
const getParametersValidator = swaggerEndPoint => swaggerEndPoint.parameters
const getResponseEndPoint = swaggerEndPoint => swaggerEndPoint.responses

const getSwaggerEndPoint = (schema, path) => {
  const swaggerEndPoint = get(schema, path)
  if (!swaggerEndPoint) {
    throw new Error(`missing schema definition on path '${path.join(',')}'`)
  }
  return swaggerEndPoint
}

const ensureValidator = (validator, ...path) => {
  if (!validator || typeof validator.validate !== 'function') {
    throw new Error(`missing schema definition on path '${path.join(',')}'`)
  }
}

const middlewareFactory = (schema, getValidator, getValidationData, path) => {
  const swaggerEndPoint = getSwaggerEndPoint(schema, path)
  const validator = getValidator(swaggerEndPoint)
  ensureValidator(validator, path)
  return (req, res, next) => {
    if (!validator.validate(getValidationData(req))) {
      res.status(HttpStatus.BAD_REQUEST).json(validator.errors)
      return
    }
    next()
  }
}

const optionsWithOpenApiFormats = (options) => {
  const formats = options.formats ? [...options.formats] : []

  /**
   * Some OpenAPI-specific Formats are not supported in the ajv and have be added manually.
   * This adds support for:
   * - integer formats: "int32", "int64"
   * - floating point number formats: "float", "double"
   */
  formats.push({ name: 'int32', pattern: { type: 'number', validate: validators.int32 } })
  formats.push({ name: 'int64', pattern: { type: 'number', validate: validators.int64 } })
  formats.push({ name: 'float', pattern: { type: 'number', validate: validators.float } })
  formats.push({ name: 'double', pattern: { type: 'number', validate: validators.double } })

  return { ...options, formats }
}

const OpenApiValidator = async (swaggerPath, options = {}) => {
  const optionsIncludingOpenApiFormats = optionsWithOpenApiFormats(options)
  const schema = await apiSchemaBuilder.buildSchema(swaggerPath, optionsIncludingOpenApiFormats)

  const getBodyValidationMiddleware = path =>
    middlewareFactory(
      schema,
      getBodyValidator,
      req => req.body,
      path,
    )

  const getParamsValidationMiddleware = path =>
    middlewareFactory(
      schema,
      getParametersValidator,
      req => ({ path: req.params }),
      path,
    )

  const getQueryValidationMiddleware = path =>
    middlewareFactory(
      schema,
      getParametersValidator,
      req => ({ query: req.query }),
      path,
    )

  const getHeaderValidationMiddleware = path =>
    middlewareFactory(
      schema,
      getParametersValidator,
      req => ({ headers: req.headers }),
      path,
    )

  const getResponseValidationEndPoint = (path) => {
    const swaggerEndPoint = getSwaggerEndPoint(schema, path)
    const responseEndPoint = getResponseEndPoint(swaggerEndPoint)
    return {
      validator: (httpStatusCode) => {
        const validator = responseEndPoint[httpStatusCode]
        ensureValidator(validator, path, httpStatusCode)
        return validator
      },
    }
  }


  return {
    getBodyValidationMiddleware,
    getParamsValidationMiddleware,
    getQueryValidationMiddleware,
    getHeaderValidationMiddleware,
    getResponseValidationEndPoint,
  }
}

export {
  OpenApiValidator,
}
