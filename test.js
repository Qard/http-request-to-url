const http = require('http')
const tap = require('tap')
const awaitEvent = require('await-event')
const httpRequestToUrl = require('./')

tap.test('before connect', async t => {
  const { port } = await makeServer()

  const url = `http://127.0.0.1:${port}/hello?name=world`
  const client = http.request(url, res => res.resume())
  client.end()

  const location = await httpRequestToUrl(client)
  t.equal(location, url)
  t.end()
})

tap.test('after connect', async t => {
  const { port } = await makeServer()

  const url = `http://127.0.0.1:${port}/hello?name=world`
  const client = http.request(url, res => res.resume())
  client.end()

  await awaitEvent(client, 'socket')

  const location = await httpRequestToUrl(client)
  t.equal(location, url)
  t.end()
})

tap.test('proxy', async t => {
  const { port } = await makeServer()

  const opts = {
    host: '127.0.0.1',
    port,
    method: 'GET',
    path: 'http://example.com/foo'
  }
  const client = http.request(opts, res => res.resume())
  client.end()

  const location = await httpRequestToUrl(client)
  t.equal(location, 'http://example.com/foo')

  const location2 = await httpRequestToUrl(client, { followProxies: true })
  t.equal(location2, 'http://example.com/foo')

  t.end()
})

tap.test('proxy do not follow', async t => {
  const { port } = await makeServer()

  const opts = {
    host: '127.0.0.1',
    port,
    method: 'GET',
    path: 'http://example.com/foo'
  }
  const client = http.request(opts, res => res.resume())
  client.end()

  const location = await httpRequestToUrl(client, { followProxies: false })
  t.equal(location, `http://127.0.0.1:${port}`)

  t.end()
})
function makeServer () {
  return new Promise(resolve => {
    const server = http.createServer((req, res) => {
      res.end('hello')
    })
    server.unref()
    server.listen(0, '0.0.0.0', () => {
      resolve({ port: server.address().port })
    })
  })
}
