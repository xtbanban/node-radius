// Example radius server doing authentication

const radius = require('../lib/radius');
const dgram = require("dgram");

const secret = 'gxds';
const server = dgram.createSocket("udp4");

server.on("message", function (msg, rinfo) {
  console.log('========= message on! =========');

  let code, username, password, ip_address, packet;
  try {
    packet = radius.decode({packet: msg, secret: secret});
  } catch (e) {
    console.log("Failed to decode radius packet, silently dropping:", e);
    return;
  }

  if (packet.code != 'Accounting-Request') {
    console.log('unknown packet type: ', packet.code);
    return;
  }

  username = packet.attributes['User-Name'];
  ip_address = packet.attributes['NAS-IP-Address'];
  acct_status = packet.attributes['Acct-Status-Type'];
  event_time = packet.attributes['Event-Timestamp'];

  console.log('Accounting-Request for:' + username + ' from:' + ip_address + ' Status:' + acct_status + ' Time:' + event_time);
  
  // 看一下数据包
  // console.log(packet)

  // 不响应，退出，但是 Stop 包要响应，否则交换机会不停地重发
  // if (!(acct_status === 'Stop')) {
  //   return
  // }

  // 收到立即响应
  code = 'Accounting-Response';

  const response = radius.encode_response({
    packet: packet,
    code: code,
    secret: secret
  });

  console.log('Sending ' + code + ' for user ' + username);
  server.send(response, 0, response.length, rinfo.port, rinfo.address, function(err, bytes) {
    if (err) {
      console.log('Error sending response to ', rinfo);
    }
  });
});

server.on("listening", function () {
  const address = server.address();
  console.log("radius server listening " +
      address.address + ":" + address.port);
});

server.bind(1813);
