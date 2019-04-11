[![Build Status](https://travis-ci.org/actano/rplan-express-schema-validation-middleware.svg?branch=master)](https://travis-ci.org/actano/rplan-express-schema-validation-middleware)

rplan/express-schema-validation-middleware
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
  OpenApiValidator,
} from '@rplan/express-schema-validation-middleware'

export async function createRestRoute() {
  const openApiValidator = await OpenApiValidator('docs/private.yaml')
  const validateJSONBody = openApiValidator
    .getBodyValidationMiddleware(['/my-route', 'post'])

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
  const openApiValidator = await OpenApiValidator('docs/private.yaml')
  
  const responseValidator = openApiValidator
      .getResponseValidationEndPoint(['/my-route', 'post'])
      .validator(httpStatusCode)

  return responseValidator
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

# Known issues

The query and params validation middleware returned by 
`getParamsValidationMiddleware` and `getQueryValidationMiddleware`
seems to not validate types correctly, but just checking for correct 
and required property names. 
That seems to be a bug in the `api-schema-builder` npm module.
See skipped tests at `./test/validate-json-schema-middleware.test.js`
and https://github.com/Zooz/api-schema-builder/pull/14

In opposite to that, the request and response body validators 
returned by `getBodyValidationMiddleware` and `getResponseValidationEndPoint`
perform a fully functional validation.
