import { Game } from './game.js';
import { Network } from './network.js';


document.addEventListener('DOMContentLoaded', () => {
    const game = new Game();
    const network = new Network(game);
    game.setNetwork(network);

    game.init();

    // UI Interaction
    const peerIdInput = document.getElementById('peerIdInput');
    const connectButton = document.getElementById('connectButton');
    const createGameButton = document.createElement('button');
    createGameButton.textContent = 'Create Game';
    document.getElementById('connectionUI').appendChild(createGameButton);
    
    createGameButton.addEventListener('click', () => {
        network.createPeer(true);
    });
    

    connectButton.addEventListener('click', () => {
        const signalData = peerIdInput.value.trim();
        if (signalData) {
            network.connect(signalData);
        }
    });

    peerIdInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter') {
            connectButton.click();
        }
    });

    copyPeerIdButton.addEventListener('click', () => {
        const peerId = myPeerIdDisplay.textContent.replace('My Peer ID: ', '');
        navigator.clipboard.writeText(peerId).then(() => {
            // Visual feedback that the ID was copied
            const originalText = copyPeerIdButton.textContent;
            copyPeerIdButton.textContent = 'Copied!';
            copyPeerIdButton.style.backgroundColor = '#45b7a4';
            
            setTimeout(() => {
                copyPeerIdButton.textContent = originalText;
                copyPeerIdButton.style.backgroundColor = '#4ECDC4';
            }, 2000);
        }).catch(err => {
            console.error('Failed to copy text: ', err);
        });
    });

    // Optional: Add keyboard shortcut for copying Peer ID (Ctrl+C when focused on the Peer ID display)
    myPeerIdDisplay.addEventListener('keydown', (event) => {
        if (event.ctrlKey && event.key === 'c') {
            event.preventDefault(); // Prevent default copy behavior
            copyPeerIdButton.click(); // Simulate click on copy button
        }
    });

    // Make the Peer ID display focusable for keyboard accessibility
    myPeerIdDisplay.tabIndex = 0;

    // Optional: Add a tooltip to explain how to use the Peer ID
    const tooltip = document.createElement('div');
    tooltip.textContent = 'Share this ID with a friend to connect and play together!';
    tooltip.style.cssText = `
        position: absolute;
        background-color: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    `;
    document.body.appendChild(tooltip);

    myPeerIdDisplay.addEventListener('mouseenter', () => {
        const rect = myPeerIdDisplay.getBoundingClientRect();
        tooltip.style.left = `${rect.left}px`;
        tooltip.style.top = `${rect.bottom + 5}px`;
        tooltip.style.opacity = '1';
    });

    myPeerIdDisplay.addEventListener('mouseleave', () => {
        tooltip.style.opacity = '0';
    });
});