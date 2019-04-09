import apiSchemaBuilder from 'api-schema-builder'
import * as HttpStatus from 'http-status-codes'
import get from 'lodash/get'

const getBodyValidator = swaggerEndPoint => swaggerEndPoint.body
const getParametersValidator = swaggerEndPoint => swaggerEndPoint.parameters
const getResponseEndPoint = swaggerEndPoint => swaggerEndPoint.responses

const getSwaggerEndPoint = (schema, path) => {
  const swaggerEndPoint = get(schema, path)
  if (!swaggerEndPoint) {
    throw new Error(`path '${path.join(',')}' not found in schema ${JSON.stringify(schema)}`)
  }
  return swaggerEndPoint
}

const ensureValidator = (validator, schema, ...path) => {
  if (typeof validator.validate !== 'function') {
    throw new Error(`validator not found at path '${path.join(',')}' in schema '${JSON.stringify(schema)}'`)
  }
}

const middlewareFactory = (schema, getValidator, getValidationData, path) => {
  const swaggerEndPoint = getSwaggerEndPoint(schema, path)
  const validator = getValidator(swaggerEndPoint)
  ensureValidator(validator, schema, path)
  return (req, res, next) => {
    if (!validator.validate(getValidationData(req))) {
      res.status(HttpStatus.BAD_REQUEST).json(validator.errors)
      return
    }
    next()
  }
}


const OpenApiValidator = async (swaggerPath) => {
  const schema = await apiSchemaBuilder.buildSchema(swaggerPath)

  const validateJSONBody = path =>
    middlewareFactory(
      schema,
      getBodyValidator,
      req => req.body,
      path,
    )

  const validateJSONParams = path =>
    middlewareFactory(
      schema,
      getParametersValidator,
      req => ({ path: req.params }),
      path,
    )

  const validateJSONQuery = path =>
    middlewareFactory(
      schema,
      getParametersValidator,
      req => ({ query: req.query }),
      path,
    )


  const responseValidator = path => (httpStatusCode) => {
    const swaggerEndPoint = getSwaggerEndPoint(schema, path)
    const responseEndPoint = getResponseEndPoint(swaggerEndPoint)
    const validator = responseEndPoint[httpStatusCode]
    ensureValidator(validator, schema, path, httpStatusCode)
    return validator
  }


  return {
    validateJSONBody,
    validateJSONParams,
    validateJSONQuery,
    responseValidator,
  }
}

export {
  OpenApiValidator,
}
