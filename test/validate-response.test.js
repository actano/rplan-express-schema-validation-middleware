import bodyParser from 'body-parser'
import express, { Router } from 'express'
import * as HttpStatus from 'http-status-codes'
import request from 'supertest'
import { expect } from 'chai'
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

  async function runRoute(route, responseBody) {
    const router = new Router()
    router.get(route,
      (req, res) => {
        res.status(HttpStatus.OK)
          .json(responseBody)
      })

    await runServer(router)
  }

  describe('validate response body', () => {
    it('should validate a valid response', async () => {
      const myRoute = '/route-with-response-body'
      await runRoute(myRoute, {
        dateProp: '2012-12-12',
        numberProp: 2,
      })

      const res = await request(getTestUrl())
        .get(myRoute)

      await validateResponse('test/private.yaml', myRoute, 'get', 200, res)
    })

    it('should allow integer format int32 and int64', async () => {
      const myRoute = '/route-with-integer-response-body'
      await runRoute(myRoute, {
        integer: 1,
        integer32: 2147483647,
        integer64: 1578581895245,
      })

      const res = await request(getTestUrl())
        .get(myRoute)

      await validateResponse('test/private.yaml', myRoute, 'get', 200, res)
    })

    it('should allow number format float and double', async () => {
      const myRoute = '/route-with-number-response-body'
      await runRoute(myRoute, {
        number: 2 ** 256,
        float: 2 ** 127,
        double: 2 ** 1023,
      })

      const res = await request(getTestUrl())
        .get(myRoute)

      await validateResponse('test/private.yaml', myRoute, 'get', 200, res)
    })
  })
})
