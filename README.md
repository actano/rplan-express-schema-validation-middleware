@rplan/express-schema-validation-middleware
===========================================

# Introduction

This module provides a express middleware to validate 
REST request bodies and parameters against swagger openapi 
specifications.

Further on it provides functionality to validate REST response bodies
against swagger openapi specifications, typically used in rest api tests.


# Usage

## Usage in express middleware

The following example shows how to automatically validate your
request body against the schema specified in `docs/private.yaml`

```javascript
import {
  buildSwaggerSchema,
  validatorFactory,
} from '@rplan/express-schema-validation-middleware'

export async function createRestRoute() {
  const swaggerSchema = await buildSwaggerSchema('docs/private.yaml')

  const { validateJSONBody } = validatorFactory(
    swaggerSchema,
    ['/my-route', 'post'],
  )

  const router = new Router()

  router.post(
    '/my-route',
    validateJSONBody,
    (req, res) => {
      const { myValidateProperties } = req.body
      // ...
    },
  )
  
  return router
}
```

## Usage in REST API tests


```javascript

async function getResponseValidator(httpStatusCode) {
  const swaggerSchema = await buildSwaggerSchema('docs/private.yaml')

  const { responseValidator } = await validatorFactory(
    swaggerSchema,
    ['/my-route', 'post'],
  )

  return responseValidator(httpStatusCode)
}

// ...

it('should validate response', async () => {
      const { body } = await request(testHost)
        .post('/my-route')
        .send({ someData: 'values' })
        .expect(HttpStatusCodes.CREATED)

      const validator = await getResponseValidator(HttpStatusCodes.CREATED)
      expect(validator.validate({ body }), validator.errors).to.equal(true)
})

```
