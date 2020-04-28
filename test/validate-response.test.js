import bodyParser from 'body-parser'
import express, { Router } from 'express'
import * as HttpStatus from 'http-status-codes'
import request from 'supertest'
import { OpenApiValidator } from '../src'
import { validateResponse } from '../src/validate-response'

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

      const res = await request(getTestUrl())
        .get('/route-with-response-body')

      await validateResponse('test/private.yaml', '/route-with-response-body', 'get', 200, res)
    })
  })
})
