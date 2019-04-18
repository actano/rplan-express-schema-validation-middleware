import apiSchemaBuilder from 'api-schema-builder'
import * as HttpStatus from 'http-status-codes'
import get from 'lodash/get'

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


const OpenApiValidator = async (swaggerPath, options) => {
  const schema = await apiSchemaBuilder.buildSchema(swaggerPath, options)

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
    getResponseValidationEndPoint,
  }
}

export {
  OpenApiValidator,
}
