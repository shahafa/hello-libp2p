const Libp2p = require('libp2p');
const Ping = require('libp2p/src/ping');
const TCP = require('libp2p-tcp');
const Multiplex = require('libp2p-mplex');
const SECIO = require('libp2p-secio');
const PeerId = require('peer-id');
const PeerInfo = require('peer-info');
const multiaddr = require('multiaddr');
const defaultsDeep = require('@nodeutils/defaults-deep');

class P2PNode extends Libp2p {
  constructor(opts) {
    super(
      defaultsDeep(opts, {
        modules: {
          transport: [TCP],
          connEncryption: [SECIO],
          streamMuxer: [Multiplex],
        },
      }),
    );
  }

  ip4Addr() {
    const addresses = this.peerInfo.multiaddrs.toArray();
    return addresses.find((addr) => addr.toString().startsWith('/ip4/'));
  }

  ping(addr) {
    const remoteAddr = multiaddr(addr);

    const peerId = PeerId.createFromB58String(remoteAddr.getPeerId());
    const remotePeerInfo = new PeerInfo(peerId);
    remotePeerInfo.multiaddrs.add(remoteAddr);

    const p = new Ping(this._switch, remotePeerInfo);

    p.on('ping', (time) => {
      p.stop(); // stop sending pings
      console.log(`pinged ${remoteAddr.toString()} in ${time}ms`);
    });

    p.on('error', (err) => console.error('error pinging: ', err));

    console.log('pinging remote peer at ', remoteAddr.toString());
    p.start();
  }
}

module.exports = { P2PNode };
