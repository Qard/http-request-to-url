const awaitEvent = require('await-event')
const socketLocation = require('socket-location')

module.exports = async function httpRequestToUrl (request, opts = {}) {
  // default to true
  opts.followProxies = opts.followProxies !== false

  if (!request.socket) {
    await awaitEvent(request, 'socket')
  }

  const { socket } = request
  const proto = `http${socket.encrypted ? 's' : ''}:`
  const location = await socketLocation(socket)

  if (isProxiedRequest(request) && opts.followProxies) {
    return request.path
  }

  if (isProxiedRequest(request) && !opts.followProxies) {
    return `${proto}//${location}`
  }

  return `${proto}//${location}${request.path}`
}

function isProxiedRequest (request) {
  return request.path.indexOf('https:') === 0 || request.path.indexOf('http:') === 0
}
