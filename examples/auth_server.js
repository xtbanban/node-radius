// Example radius server doing authentication
require("dotenv").config()

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

  if (packet.code != 'Access-Request') {
    console.log('unknown packet type: ', packet.code);
    return;
  }

  username = packet.attributes['User-Name'];
  password = packet.attributes['User-Password'];
  ip_address = packet.attributes['NAS-IP-Address'];

  console.log('Access-Request for ' + username + ' from:' + ip_address);

  // 看一下数据包
  // console.log(packet)

//  if (username == 'jlpicard' && password == 'beverly123') {
  if (username == 'c40938f6d1c6') {
      code = 'Access-Accept';
  } else {
    code = 'Access-Reject';
  }

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

server.bind(1812);
