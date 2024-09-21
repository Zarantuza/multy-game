import Peer from 'peerjs';

export class Network {
    constructor(game) {
        this.game = game;
        this.peer = null;
        this.connections = new Map();
        this.isHost = true; // Assume we're the host initially
        this.id = null;

        this.initializePeer();
    }

    initializePeer() {
        const peerOptions = {
            host: 'peerjs.thecatworld.us', // CORS-enabled PeerJS server
            secure: true,
            port: 443,
            debug: 3,
            config: {
                'iceServers': [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'turn:numb.viagenie.ca', credential: 'muazkh', username: 'webrtc@live.com' }
                ]
            }
        };

        this.peer = new Peer(undefined, peerOptions);

        this.peer.on('open', (id) => {
            console.log('My peer ID is: ' + id);
            document.getElementById('myPeerIdDisplay').textContent = `My Peer ID: ${id}`;
            this.id = id;
            this.game.setNetworkId(id);
        });

        this.peer.on('connection', (conn) => {
            this.handleConnection(conn);
        });

        this.peer.on('error', (err) => {
            console.error('PeerJS error:', err);
            this.handleNetworkError(err);
            if (err.type === 'network' || err.type === 'server-error') {
                this.retryConnection();
            }
        });
    }

    retryConnection() {
        console.log('Retrying connection...');
        setTimeout(() => {
            this.initializePeer();
        }, 5000); // Retry after 5 seconds
    }

    connect(peerId) {
        if (!this.connections.has(peerId)) {
            const conn = this.peer.connect(peerId);
            this.isHost = false; // We're connecting to someone, so we're not the host
            this.handleConnection(conn);
        }
    }

    handleConnection(conn) {
        conn.on('open', () => {
            console.log('Connected to: ' + conn.peer);
            this.connections.set(conn.peer, conn);
            this.game.addRemotePlayer(conn.peer);

            if (this.isHost) {
                // If we're the host, send our game state to the new player
                const gameState = this.game.getGameState();
                conn.send({ type: 'initial_state', state: gameState });
            }

            conn.on('data', (data) => {
                switch (data.type) {
                    case 'move':
                        this.game.handleRemoteMove(conn.peer, data.move);
                        break;
                    case 'position':
                        this.game.updatePlayerPosition(conn.peer, data.position);
                        break;
                    case 'initial_state':
                        if (!this.isHost) {
                            // Only update our game state if we're not the host
                            this.game.setGameState(data.state);
                        }
                        break;
                    case 'direct_message':
                        console.log(`Direct message from ${conn.peer}: ${data.message}`);
                        break;
                    default:
                        console.warn('Unknown data type received:', data.type);
                }
            });

            this.updateConnectionStatus();
        });

        conn.on('close', () => {
            console.log('Disconnected from: ' + conn.peer);
            this.connections.delete(conn.peer);
            this.game.removePlayer(conn.peer);
            this.updateConnectionStatus();
        });

        conn.on('error', (err) => {
            console.error('Connection error:', err);
            this.handleNetworkError(err);
        });
    }

    broadcastMove(move) {
        const data = { type: 'move', move: move };
        this.broadcast(data);
    }

    broadcastPosition(position) {
        const data = { type: 'position', position: position };
        this.broadcast(data);
    }

    broadcast(data) {
        for (let conn of this.connections.values()) {
            conn.send(data);  // Broadcast data to all connected peers
        }
    }

    getMyId() {
        return this.id;
    }

    getConnectedPeers() {
        return Array.from(this.connections.keys());
    }

    disconnect(peerId) {
        const conn = this.connections.get(peerId);
        if (conn) {
            conn.close();
            this.connections.delete(peerId);
            this.game.removePlayer(peerId);
            this.updateConnectionStatus();
        }
    }

    disconnectAll() {
        for (let conn of this.connections.values()) {
            conn.close();
        }
        this.connections.clear();
        this.game.removeAllPlayers();
        this.updateConnectionStatus();
    }

    reconnect(peerId) {
        this.disconnect(peerId);
        this.connect(peerId);
    }

    sendDirectMessage(peerId, message) {
        const conn = this.connections.get(peerId);
        if (conn) {
            conn.send({ type: 'direct_message', message: message });
        } else {
            console.warn(`No connection found for peer ${peerId}`);
        }
    }

    updateConnectionStatus() {
        const statusElement = document.getElementById('connectionStatus');
        if (statusElement) {
            const connectedPeers = this.getConnectedPeers();
            statusElement.textContent = `Connected to ${connectedPeers.length} peer(s): ${connectedPeers.join(', ')}`;
        }
    }

    handleNetworkError(error) {
        console.error('Network error:', error);
        const errorElement = document.getElementById('networkError');
        if (errorElement) {
            errorElement.textContent = `Network error: ${error.type}`;
            errorElement.style.display = 'block';
        }
    }
}