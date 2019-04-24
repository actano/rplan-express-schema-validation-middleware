import { expect } from 'chai'
import bodyParser from 'body-parser'
import express, { Router } from 'express'
import * as HttpStatus from 'http-status-codes'
import request from 'supertest'
import { OpenApiValidator } from '../src'

describe('validate-json-schema-middleware', () => {
  let server

  async function runServer(router) {
    const app = express()
    app.use(bodyParser.json())
    app.use(router)
    server = app.listen()
  }

  const getTestUrl = () => `http://localhost:${server.address().port}`

  afterEach(() => {
    if (server) {
      server.close()
      server = null
    }
  })

  describe('validate request body', () => {
    async function runRoute() {
      const validateJSONBody = (await OpenApiValidator('test/private.yaml'))
        .getBodyValidationMiddleware(['/route-with-request-body', 'post'])

      const router = new Router()
      router.post('/route-with-request-body', validateJSONBody,
        (req, res) => {
          res.sendStatus(HttpStatus.CREATED)
        })

      await runServer(router)
    }

    it('should not fail on valid request body', async () => {
      await runRoute()

      const response = await request(getTestUrl())
        .post('/route-with-request-body')
        .send({ validRequiredProperty: 'a string' })

      expect(response.status, JSON.stringify(response.body)).to.equal(HttpStatus.CREATED)
    })

    it('should fail on invalid request body', async () => {
      await runRoute()

      const response = await request(getTestUrl())
        .post('/route-with-request-body')
        .send({ invalidProperty: 'a string' })

      expect(response.status, JSON.stringify(response.body)).to.equal(HttpStatus.BAD_REQUEST)
    })
  })

  describe('validate request path parameters', () => {
    async function runRoute() {
      const validateJSONParams = (await OpenApiValidator('test/private.yaml'))
        .getParamsValidationMiddleware(
          ['/route-with-path-params/:dateParam/:stringParam', 'post'],
        )

      const router = new Router()
      router.post('/route-with-path-params/:dateParam/:stringParam', validateJSONParams,
        (req, res) => {
          res.sendStatus(HttpStatus.CREATED)
        })

      await runServer(router)
    }

    it('should not fail on valid request path parameters', async () => {
      await runRoute()

      const response = await request(getTestUrl())
        .post('/route-with-path-params/2012-12-12/valid-string')

      expect(response.status, JSON.stringify(response.body)).to.equal(HttpStatus.CREATED)
    })

    it('should fail on invalid request path parameters', async () => {
      await runRoute()

      const response = await request(getTestUrl())
        .post('/route-with-path-params/invalid-date/valid-string')

      expect(response.status, JSON.stringify(response.body)).to.equal(HttpStatus.BAD_REQUEST)
    })
  })

  describe('validate request query parameters', () => {
    async function runRoute() {
      const validateJSONQuery = (await OpenApiValidator('test/private.yaml'))
        .getQueryValidationMiddleware(['/route-with-query-params', 'get'])

      const router = new Router()
      router.get('/route-with-query-params', validateJSONQuery,
        (req, res) => {
          res.sendStatus(HttpStatus.OK)
        })

      await runServer(router)
    }

    it('should not fail on valid request query parameters', async () => {
      await runRoute()

      const response = await request(getTestUrl())
        .get('/route-with-query-params?stringParam=a_string&dateParam=2012-12-12')

      expect(response.status, JSON.stringify(response.body)).to.equal(HttpStatus.OK)
    })

    it('should fail on invalid query parameters', async () => {
      await runRoute()

      const response = await request(getTestUrl())
        .get('/route-with-query-params?stringParam=a_string&dateParam=invalid date')

      expect(response.status, JSON.stringify(response.body)).to.equal(HttpStatus.BAD_REQUEST)
    })

    it('should fail on missing query parameters', async () => {
      await runRoute()

      const response = await request(getTestUrl())
        .get('/route-with-query-params?invalidParam=invalidValue')

      expect(response.status, JSON.stringify(response.body)).to.equal(HttpStatus.BAD_REQUEST)
    })
  })

  describe('validate request headers', () => {
    async function runRoute() {
      const validateHeaders = (await OpenApiValidator('test/private.yaml'))
        .getHeaderValidationMiddleware(['/route-with-header', 'get'])

      const router = new Router()
      router.get('/route-with-header', validateHeaders,
        (req, res) => {
          res.sendStatus(HttpStatus.OK)
        })

      await runServer(router)
    }

    it('should not fail on valid request headers', async () => {
      await runRoute()

      const response = await request(getTestUrl())
        .get('/route-with-header')
        .set('x-date-header', '2012-12-12')

      expect(response.status, JSON.stringify(response.body)).to.equal(HttpStatus.OK)
    })

    it('should fail on invalid request headers', async () => {
      await runRoute()

      const response = await request(getTestUrl())
        .get('/route-with-header')
        .set('x-date-header', 'invalid date')

      expect(response.status, JSON.stringify(response.body)).to.equal(HttpStatus.BAD_REQUEST)
    })

    it('should fail on missing request headers', async () => {
      await runRoute()

      const response = await request(getTestUrl())
        .get('/route-with-header')

      expect(response.status, JSON.stringify(response.body)).to.equal(HttpStatus.BAD_REQUEST)
    })
  })

  describe('validate response body', () => {
    async function runRoute(responseBody) {
      const router = new Router()
      router.get('/route-with-response-body',
        (req, res) => {
          res.status(HttpStatus.OK).json(responseBody)
        })

      await runServer(router)
    }

    async function getResponseValidator() {
      return (await OpenApiValidator('test/private.yaml'))
        .getResponseValidationEndPoint(['/route-with-response-body', 'get'])
        .validator(HttpStatus.OK)
    }

    it('should validate a valid response', async () => {
      await runRoute({
        dateProp: '2012-12-12',
        numberProp: 2,
      })

      const { body } = await request(getTestUrl())
        .get('/route-with-response-body')

      const validator = await getResponseValidator()
      expect(validator.validate({ body }), JSON.stringify(validator.errors)).to.equal(true)
    })

    it('should not validate if a property has a wrong type', async () => {
      await runRoute({
        dateProp: 'invalid-date-format',
      })

      const { body } = await request(getTestUrl())
        .get('/route-with-response-body')

      const validator = await getResponseValidator()

      expect(validator.validate({ body }), JSON.stringify(validator.errors)).to.equal(false)
    })

    it('should not validate if a required property is missing', async () => {
      await runRoute({
        numberProp: 2,
      })

      const { body } = await request(getTestUrl())
        .get('/route-with-response-body')

      const validator = await getResponseValidator()
      expect(validator.validate({ body }), JSON.stringify(validator.errors)).to.equal(false)
    })

    it('should not validate if a additional property is send', async () => {
      await runRoute({
        dateProp: '2012-12-12',
        numberProp: 2,
        invalidProp: 'some-value',
      })

      const { body } = await request(getTestUrl())
        .get('/route-with-response-body')

      const validator = await getResponseValidator()
      expect(validator.validate({ body }), JSON.stringify(validator.errors)).to.equal(false)
    })
  })

  describe('invalid filename and path', () => {
    it('should throw an exception if swagger file do not exists', async () => {
      try {
        await OpenApiValidator('invalid-path/private.yaml')
      } catch (err) {
        return
      }
      expect(false, 'OpenApiValidator should throw an exception').to.equal(true)
    })

    it('should throw an exception if an endpoint does not exist', async () => {
      const openApiValidator = await OpenApiValidator('test/private.yaml')

      expect(
        () =>
          openApiValidator.getBodyValidationMiddleware(['/invalid-route', 'get']),
      ).to.throw(Error)

      expect(
        () =>
          openApiValidator.getParamsValidationMiddleware(['/invalid-route', 'get']),
      ).to.throw(Error)

      expect(
        () =>
          openApiValidator.getQueryValidationMiddleware(['/invalid-route', 'get']),
      ).to.throw(Error)

      expect(
        () =>
          openApiValidator.getResponseValidationEndPoint(['/invalid-route', 'get']),
      ).to.throw(Error)
    })

    it('should throw an exception if the response validator does not exist', async () => {
      const openApiValidator = await OpenApiValidator('test/private.yaml')
      const responseValidationEndpoint = openApiValidator
        .getResponseValidationEndPoint(['/route-with-response-body', 'get'])

      const UNKNOWN_STATUS_CODE = 500
      expect(
        () =>
          responseValidationEndpoint.validator(UNKNOWN_STATUS_CODE),
      ).to.throw(Error)
    })
  })
})
