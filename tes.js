// // const moment= require('moment')
// // // // let jam = "9:00 PM"

// // // // let curdate = moment().format('YYYY-MM-DD')
// // // // let n = `${curdate},${jam}`
// // // // let h = moment(n,'YYYY-MM-DD,hh mm A').format('YYYY-MM-DD HH-mm-ss')
// // // // console.log(h);
// // // // var dt = moment(jam, ["h:mm A"]).format("HH:mm");
// // // // console.log(dt);


// // // // console.log( moment('2022-10-16 11:00 PM', 'YYYY-MM-DD hh:mm A').format('YYYY-MM-DD hh:mm:ss') );

// // // let curdate= moment().add(1,'d').format('YYYY-MM-DD')

// // // console.log(curdate);

// // let t = moment().format('x')
// // console.log(t.substring(t.length - 6));


// {
//     status: 404,
//     statusText: 'Not Found',
//     headers: AxiosHeaders {
//       date: 'Tue, 03 Jan 2023 10:11:14 GMT',
//       server: 'Apache/2.4.35 (Win32) OpenSSL/1.1.0i PHP/7.2.11',
//       'x-powered-by': 'PHP/7.2.11',
//       'set-cookie': [
//         'advanced-frontend=mgnb38gbu0k3i99si345s3goer; path=/; HttpOnly',
//         '_identity-frontend=deleted; expires=Thu, 01-Jan-1970 00:00:01 GMT; Max-Age=0; path=/; samesite=Lax; HttpOnly',
//         '_csrf-frontend=906c96abab833b01961f4fa824e984492abf1304db533b4d73911685f09b3af7a%3A2%3A%7Bi%3A0%3Bs%3A14%3A%22_csrf-frontend%22%3Bi%
//   3A1%3Bs%3A32%3A%22a7QMDDyU-O6v7Xkr6IDiDxBnmnsDD6Wg%22%3B%7D; path=/; samesite=Lax; HttpOnly'
//       ],
//       expires: 'Thu, 19 Nov 1981 08:52:00 GMT',
//       'cache-control': 'no-store, no-cache, must-revalidate',
//       pragma: 'no-cache',
//       'content-length': '45',
//       connection: 'close',
//       'content-type': 'application/json; charset=UTF-8'
//     },
//     config: {
//       transitional: {
//         silentJSONParsing: true,
//         forcedJSONParsing: true,
//         clarifyTimeoutError: false
//       },
//       adapter: [ 'xhr', 'http' ],
//       transformRequest: [ [Function: transformRequest] ],
//       transformResponse: [ [Function: transformResponse] ],
//       timeout: 0,
//       xsrfCookieName: 'XSRF-TOKEN',
//       xsrfHeaderName: 'X-XSRF-TOKEN',
//       maxContentLength: -1,
//       maxBodyLength: -1,
//       env: { FormData: [Function], Blob: null },
//       validateStatus: [Function: validateStatus],
//       headers: AxiosHeaders {
//         Accept: 'application/json, text/plain, */*',
//         Authorization: 'Bearer agAW4AUAgjOtCMwIxcKnGjkDj6jj64vr',
//         'Content-Type': 'application/json',
//         'User-Agent': 'axios/1.2.1',
//         'Accept-Encoding': 'gzip, compress, deflate, br'
//       },
//       method: 'get',
//       url: 'http://103.121.123.87/rsudapi/reg/get-pasien?no=null',
//       data: undefined
//     },
//     request: <ref *1> ClientRequest {
//       _events: [Object: null prototype] {
//         abort: [Function (anonymous)],
//         aborted: [Function (anonymous)],
//         connect: [Function (anonymous)],
//         error: [Function (anonymous)],
//         socket: [Function (anonymous)],
//         timeout: [Function (anonymous)],
//         finish: [Function: requestOnFinish]
//       },
//       _eventsCount: 7,
//       _maxListeners: undefined,
//       outputData: [],
//       outputSize: 0,
//       writable: true,
//       destroyed: false,
//       _last: true,
//       chunkedEncoding: false,
//       shouldKeepAlive: false,
//       maxRequestsOnConnectionReached: false,
//       _defaultKeepAlive: true,
//       useChunkedEncodingByDefault: false,
//       sendDate: false,
//       _removedConnection: false,
//       _removedContLen: false,
//       _removedTE: false,
//       strictContentLength: false,
//       _contentLength: 0,
//       _hasBody: true,
//       _trailer: '',
//       finished: true,
//       _headerSent: true,
//       _closed: false,
//       socket: Socket {
//         connecting: false,
//         _hadError: false,
//         _parent: null,
//         _host: null,
//         _closeAfterHandlingError: false,
//         _readableState: [ReadableState],
//         _events: [Object: null prototype],
//         _eventsCount: 7,
//         _maxListeners: undefined,
//         _writableState: [WritableState],
//         allowHalfOpen: false,
//         _sockname: null,
//         _pendingData: null,
//         _pendingEncoding: '',
//         server: null,
//         _server: null,
//         parser: null,
//         _httpMessage: [Circular *1],
//         [Symbol(async_id_symbol)]: 69,
//         [Symbol(kHandle)]: [TCP],
//         [Symbol(lastWriteQueueSize)]: 0,
//         [Symbol(timeout)]: null,
//         [Symbol(kBuffer)]: null,
//         [Symbol(kBufferCb)]: null,
//         [Symbol(kBufferGen)]: null,
//         [Symbol(kCapture)]: false,
//         [Symbol(kSetNoDelay)]: false,
//         [Symbol(kSetKeepAlive)]: true,
//         [Symbol(kSetKeepAliveInitialDelay)]: 60,
//         [Symbol(kBytesRead)]: 0,
//         [Symbol(kBytesWritten)]: 0,
//         [Symbol(RequestTimeout)]: undefined
//       },
//       _header: 'GET /rsudapi/reg/get-pasien?no=null HTTP/1.1\r\n' +
//         'Accept: application/json, text/plain, */*\r\n' +
//         'Authorization: Bearer agAW4AUAgjOtCMwIxcKnGjkDj6jj64vr\r\n' +
//         'Content-Type: application/json\r\n' +
//         'User-Agent: axios/1.2.1\r\n' +
//         'Accept-Encoding: gzip, compress, deflate, br\r\n' +
//         'Host: 103.121.123.87\r\n' +
//         'Connection: close\r\n' +
//         '\r\n',
//       _keepAliveTimeout: 0,
//       _onPendingData: [Function: nop],
//       agent: Agent {
//         _events: [Object: null prototype],
//         _eventsCount: 2,
//         _maxListeners: undefined,
//         defaultPort: 80,
//         protocol: 'http:',
//         options: [Object: null prototype],
//         requests: [Object: null prototype] {},
//         sockets: [Object: null prototype],
//         freeSockets: [Object: null prototype] {},
//         keepAliveMsecs: 1000,
//         keepAlive: false,
//         maxSockets: Infinity,
//         maxFreeSockets: 256,
//         scheduling: 'lifo',
//         maxTotalSockets: Infinity,
//         totalSocketCount: 1,
//         [Symbol(kCapture)]: false
//       },
//       socketPath: undefined,
//       method: 'GET',
//       maxHeaderSize: undefined,
//       insecureHTTPParser: undefined,
//       path: '/rsudapi/reg/get-pasien?no=null',
//       _ended: true,
//       res: IncomingMessage {
//         _readableState: [ReadableState],
//         _events: [Object: null prototype],
//         _eventsCount: 4,
//         _maxListeners: undefined,
//         socket: [Socket],
//         httpVersionMajor: 1,
//         httpVersionMinor: 1,
//         httpVersion: '1.1',
//         complete: true,
//         rawHeaders: [Array],
//         rawTrailers: [],
//         aborted: false,
//         upgrade: false,
//         url: '',
//         method: null,
//         statusCode: 404,
//         statusMessage: 'Not Found',
//         client: [Socket],
//         _consuming: false,
//         _dumped: false,
//         req: [Circular *1],
//         responseUrl: 'http://103.121.123.87/rsudapi/reg/get-pasien?no=null',
//         redirects: [],
//         [Symbol(kCapture)]: false,
//         [Symbol(kHeaders)]: [Object],
//         [Symbol(kHeadersCount)]: 24,
//         [Symbol(kTrailers)]: null,
//         [Symbol(kTrailersCount)]: 0,
//         [Symbol(RequestTimeout)]: undefined
//       },
//       aborted: false,
//       timeoutCb: null,
//       upgradeOrConnect: false,
//       parser: null,
//       maxHeadersCount: null,
//       reusedSocket: false,
//       host: '103.121.123.87',
//       protocol: 'http:',
//       _redirectable: Writable {
//         _writableState: [WritableState],
//         _events: [Object: null prototype],
//         _eventsCount: 3,
//         _maxListeners: undefined,
//         _options: [Object],
//         _ended: true,
//         _ending: true,
//         _redirectCount: 0,
//         _redirects: [],
//         _requestBodyLength: 0,
//         _requestBodyBuffers: [],
//         _onNativeResponse: [Function (anonymous)],
//         _currentRequest: [Circular *1],
//         _currentUrl: 'http://103.121.123.87/rsudapi/reg/get-pasien?no=null',
//         [Symbol(kCapture)]: false
//       },
//       [Symbol(kCapture)]: false,
//       [Symbol(kBytesWritten)]: 0,
//       [Symbol(kEndCalled)]: true,
//       [Symbol(kNeedDrain)]: false,
//       [Symbol(corked)]: 0,
//       [Symbol(kOutHeaders)]: [Object: null prototype] {
//         accept: [Array],
//         authorization: [Array],
//         'content-type': [Array],
//         'user-agent': [Array],
//         'accept-encoding': [Array],
//         host: [Array]
//       },
//       [Symbol(kUniqueHeaders)]: null
//     },
//     data: { code: 404, message: 'Data Tidak Ditemukan' }
//   }