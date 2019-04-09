import apiSchemaBuilder from 'api-schema-builder'
import * as HttpStatus from 'http-status-codes'
import get from 'lodash/get'

const getSwaggerEndPoint = (schema, path) => {
  const swaggerEndPoint = get(schema, path)
  if (!swaggerEndPoint) {
    throw new Error(`path '${path.join(',')}' not found in schema ${JSON.stringify(schema)}`)
  }
  return swaggerEndPoint
}

const buildSwaggerSchema = async swaggerPath =>
  apiSchemaBuilder.buildSchema(swaggerPath)

const validatorFactory = (swaggerSchema, path) => {
  const swaggerEndPoint = getSwaggerEndPoint(swaggerSchema, path)

  const bodyValidator = swaggerEndPoint.body
  const parametersValidator = swaggerEndPoint.parameters
  const responseEndPoint = swaggerEndPoint.responses

  const validateJSONBody = (req, res, next) => {
    if (!bodyValidator.validate(req.body)) {
      res.status(HttpStatus.BAD_REQUEST).json(bodyValidator.errors)
      return
    }
    next()
  }

  const validateJSONParams = (req, res, next) => {
    if (!parametersValidator.validate({ path: req.params })) {
      res.status(HttpStatus.BAD_REQUEST).json(parametersValidator.errors)
      return
    }
    next()
  }

  const validateJSONQuery = (req, res, next) => {
    if (!parametersValidator.validate({ query: req.query })) {
      res.status(HttpStatus.BAD_REQUEST).json(parametersValidator.errors)
      return
    }
    next()
  }

  const responseValidator = httpStatusCode =>
    responseEndPoint[httpStatusCode]

  return {
    validateJSONBody,
    validateJSONParams,
    validateJSONQuery,
    responseValidator,
  }
}

export {
  buildSwaggerSchema,
  validatorFactory,
}
