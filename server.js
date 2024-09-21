import { PeerServer } from 'peer';

const peerServer = PeerServer({ port: 9000, path: '/myapp' });

console.log('Serveur PeerJS démarré sur le port 9000 avec le chemin /myapp');