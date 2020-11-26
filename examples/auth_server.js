// radius server doing authentication
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
    // 根据配置文件，是否自动增加交换机信息，新增后默认不能用，需要设置共享密钥及改状态
    if (!(process.env.AUTH_AUTO_ADDSWICTH === '0')) {
      sw = await Switch.create({
        IP: rinfo.address,
        Secert: '',
        status: 0
      })
      if (!(process.env.SHOW_AUTH_LOG === '0')) {
        console.log('Auto add switch:' + sw.IP)
      }
    }
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

  if (packet.code != 'Access-Request') {
    console.log('unknown packet type: ', packet.code);
    return;
  }

  username = packet.attributes['User-Name'];
  password = packet.attributes['User-Password'];
  ip_address = packet.attributes['NAS-IP-Address'];

  if (username != password) {
    console.log('unknown username type: ', username);
    return;
  }

  // 检查mac地址，用户名
  code = 'Access-Accept';
  wherestr = { mac: username }
  let mac = await Mac.findOne(wherestr)
  if (!mac) {
    // 根据配置文件，是否自动增加mac地址，及设置状态，默认只能在本交换机上登录
    if (!(process.env.AUTH_AUTO_ADDMAC === '0')) {
      mac = await Mac.create({
        mac: username,
        group: 'this',
        sw_ip: rinfo.address,
        status: process.env.AUTH_AUTO_ADDMAC_ENABLE
      })
      if (!(process.env.SHOW_AUTH_LOG === '0')) {
        console.log('Auto add mac:' + mac.mac + ' status:' + mac.status)
      }
    }
    code = 'Access-Reject';
  } else {
    if (mac.status === 0) {
      code = 'Access-Reject';
    } else {
      if (!(mac.group === 'all')) {
        if (!(mac.group === 'this' && mac.sw_ip === rinfo.address)) {
          // 检查所属组中是否有此交换机
          
        }
      }
    }
  }

  if (!(process.env.SHOW_AUTH_LOG === '0')) {
    let time = sd.format(new Date(), 'YYYY-MM-DD HH:mm:ss')
    console.log('Access-Request for ' + username + ' from:' + ip_address + ' Response:' + code + ' At:' + time);
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

server.bind(1812);
