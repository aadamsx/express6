const express = require('../'),
  request = require('supertest')

describe('app', () => {
  describe('.VERB()', () => {
    it('should not get invoked without error handler on error', done => {
      const app = express()

      app.use((req, res, next) => {
        next(new Error('boom!'))
      })

      app.get('/bar', (req, res) => {
        res.send('hello, world!')
      })

      request(app)
        .post('/bar')
        .expect(500, /Error: boom!/, done)
    })

    it('should only call an error handling routing callback when an error is propagated', done => {
      const app = express()

      let a = false
      let b = false
      let c = false
      let d = false

      app.get(
        '/',
        (req, res, next) => {
          next(new Error('fabricated error'))
        },
        (req, res, next) => {
          a = true
          next()
        },
        (err, req, res, next) => {
          b = true
          err.message.should.equal('fabricated error')
          next(err)
        },
        (err, req, res, next) => {
          c = true
          err.message.should.equal('fabricated error')
          next()
        },
        (err, req, res, next) => {
          d = true
          next()
        },
        (req, res) => {
          a.should.be.false()
          b.should.be.true()
          c.should.be.true()
          d.should.be.false()
          res.sendStatus(204)
        }
      )

      request(app).get('/').expect(204, done)
    })
  })
})
