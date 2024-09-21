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
        console.log('Initializing peer connection...');
        
        const peerOptions = {
            debug: 2, // Set debug level (0-3)
            config: {
                'iceServers': [
                    { urls: 'stun:stun.l.google.com:19302' },
                    { urls: 'turn:0.peerjs.com:3478', username: 'peerjs', credential: 'peerjsp' }
                ]
            }
        };

        this.peer = new Peer(peerOptions);

        this.peer.on('open', (id) => {
            console.log('Peer connection opened. My peer ID is: ' + id);
            document.getElementById('myPeerIdDisplay').textContent = `My Peer ID: ${id}`;
            this.id = id;
            this.game.setNetworkId(id);
        });

        this.peer.on('connection', (conn) => {
            console.log('Incoming connection from peer: ' + conn.peer);
            this.handleConnection(conn);
        });

        this.peer.on('disconnected', () => {
            console.log('Peer disconnected. Attempting to reconnect...');
            this.peer.reconnect();
        });

        this.peer.on('close', () => {
            console.log('Peer connection closed. Cleaning up...');
            this.connections.clear();
            this.game.removeAllPlayers();
        });

        this.peer.on('error', (err) => {
            console.error('PeerJS error:', err);
            this.handleNetworkError(err);
            if (err.type === 'network' || err.type === 'server-error' || err.type === 'unavailable-id') {
                console.log('Network or server error. Retrying connection...');
                this.retryConnection();
            } else if (err.type === 'browser-incompatible') {
                console.error('Your browser is not compatible with PeerJS');
                alert('Your browser is not compatible with PeerJS. Please try a different browser.');
            } else {
                console.error('Unhandled PeerJS error:', err);
                alert('An error occurred with the peer connection. Please try refreshing the page.');
            }
        });
    }

    retryConnection() {
        console.log('Retrying connection in 5 seconds...');
        setTimeout(() => {
            console.log('Retrying connection now...');
            this.initializePeer();
        }, 5000);
    }

    connect(peerId) {
        if (!this.connections.has(peerId)) {
            console.log(`Attempting to connect to peer: ${peerId}`);
            const conn = this.peer.connect(peerId);
            this.isHost = false; // We're connecting to someone, so we're not the host
            this.handleConnection(conn);
        } else {
            console.log(`Already connected to peer: ${peerId}`);
        }
    }

    handleConnection(conn) {
        conn.on('open', () => {
            console.log('Connected to: ' + conn.peer);
            this.connections.set(conn.peer, conn);
            this.game.addRemotePlayer(conn.peer);
    
            if (this.isHost) {
                console.log('Sending initial game state to new player');
                const gameState = this.game.getGameState();
                conn.send({ type: 'initial_state', state: gameState });
            }
    
            conn.on('data', (data) => {
                console.log(`Received data from ${conn.peer}:`, data);
            
                // Ignore data from the local player
                if (conn.peer === this.id) {
                    console.log('Ignoring data from local peer to prevent double processing');
                    return;
                }
            
                switch (data.type) {
                    case 'move':
                        this.game.handleRemoteMove(conn.peer, data.move);
                        break;
                    case 'position':
                        this.game.updatePlayerPosition(conn.peer, data.position);
                        break;
                    case 'initial_state':
                        if (!this.isHost) {
                            console.log('Received initial game state');
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
    }
    

    broadcastPosition(position) {
        const data = { type: 'position', position: position };
        console.log('Broadcasting position:', data);
    
        // Prevent broadcasting position to self
        if (this.id !== this.game.localPlayer.id) {
            this.broadcast(data);
        }
    }
    
    broadcastMove(move) {
        const data = { type: 'move', move: move };
    
        // Prevent broadcasting move to self
        if (this.id !== this.game.localPlayer.id) {
            this.broadcast(data);
        }
    }
    
    

    broadcast(data) {
        console.log('Broadcasting data:', data);
        for (let conn of this.connections.values()) {
            conn.send(data);
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
            console.log(`Disconnecting from peer: ${peerId}`);
            conn.close();
            this.connections.delete(peerId);
            this.game.removePlayer(peerId);
            this.updateConnectionStatus();
        } else {
            console.log(`No connection found for peer: ${peerId}`);
        }
    }

    disconnectAll() {
        console.log('Disconnecting from all peers');
        for (let conn of this.connections.values()) {
            conn.close();
        }
        this.connections.clear();
        this.game.removeAllPlayers();
        this.updateConnectionStatus();
    }

    reconnect(peerId) {
        console.log(`Attempting to reconnect to peer: ${peerId}`);
        this.disconnect(peerId);
        this.connect(peerId);
    }

    sendDirectMessage(peerId, message) {
        const conn = this.connections.get(peerId);
        if (conn) {
            console.log(`Sending direct message to ${peerId}: ${message}`);
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
            errorElement.textContent = `Network error: ${error.type}. Please try refreshing the page.`;
            errorElement.style.display = 'block';
        }
    }
    
}