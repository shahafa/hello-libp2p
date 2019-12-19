const multiaddr = require('multiaddr');
const PeerInfo = require('peer-info');
const { P2PNode } = require('./P2PNode');

async function createNode() {
  const listenAddress = multiaddr('/ip4/127.0.0.1/tcp/0');

  const peerInfo = await PeerInfo.create();
  peerInfo.multiaddrs.add(listenAddress);

  const node = new P2PNode({ peerInfo });
  await node.start();

  console.log(`node started. listening on addresses: ${node.ip4Addr()}`);
  return node;
}

async function main() {
  const firstNode = await createNode();
  const secondNode = await createNode();

  firstNode.ping(secondNode.ip4Addr());
}

main();
