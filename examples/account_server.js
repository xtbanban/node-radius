// Example radius server doing authentication
require("dotenv").config()

const radius = require('../lib/radius');
const dgram = require("dgram");

const server = dgram.createSocket("udp4");

const Mac = require('../models/Macs')
const Switch = require('../models/Switchs')

let sd = require('silly-datetime')

let secret = ''

server.on("message", async function (msg, rinfo) {

  // 根据ip地址，取得共享密钥Secert
  let wherestr = { IP: rinfo.address }
  let sw = await Switch.findOne(wherestr)
  if (!sw) {
    console.log('no set switch!')
    return
  }
  if (sw.status === 0) {
    console.log('switch status set disable!')
    return
  }
  secret = sw.Secert // 赋值共享密钥

  let code, username, password, ip_address, packet;
  try {
    packet = radius.decode({ packet: msg, secret: secret });
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

  // Stop 包任何时候都要响应，否则交换机会不停地重发
  code = 'Accounting-Response';
  if (!(acct_status === 'Stop')) {
    // 检查mac地址，用户名
    wherestr = { mac: username }
    let mac = await Mac.findOne(wherestr)
    if (!mac) {
      code = 'Accounting-Reject';
    } else {
      if (mac.status === 0) {
        code = 'Accounting-Reject';
      }
    }
  }

  if (!(process.env.SHOW_ACCOUNT_LOG === '0')) {
    let time = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
    console.log('Accounting-Request for:' + username + ' from:' + ip_address + ' Status:' + acct_status + ' Response:' + code + ' At:' + time);
  }

  // 有问题的不响应 （不支持拒绝包，只能超时断线）
  if (code === 'Accounting-Reject') {
    return
  }

  const response = radius.encode_response({
    packet: packet,
    code: code,
    secret: secret
  });

  server.send(response, 0, response.length, rinfo.port, rinfo.address, function (err, bytes) {
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
