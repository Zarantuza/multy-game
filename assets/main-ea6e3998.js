(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const o of document.querySelectorAll('link[rel="modulepreload"]'))l(o);new MutationObserver(o=>{for(const s of o)if(s.type==="childList")for(const r of s.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&l(r)}).observe(document,{childList:!0,subtree:!0});function t(o){const s={};return o.integrity&&(s.integrity=o.integrity),o.referrerPolicy&&(s.referrerPolicy=o.referrerPolicy),o.crossOrigin==="use-credentials"?s.credentials="include":o.crossOrigin==="anonymous"?s.credentials="omit":s.credentials="same-origin",s}function l(o){if(o.ep)return;o.ep=!0;const s=t(o);fetch(o.href,s)}})();class y{constructor(e=null){this.id=e,this.points=0,this.name=this.generateFunName(),this.color=this.generateRandomColor(),this.solvedCells=[]}generateFunName(){const e=["Swift","Puzzling","Clever","Speedy","Brainy","Nimble","Quick","Witty","Zippy","Dazzling","Genius","Lightning","Mastermind","Whizbang","Stellar"],t=["Solver","Sudoku","Player","Wizard","Champion","Master","Guru","Ninja","Prodigy","Whiz","Ace","Expert","Savant","Brainiac","Dynamo"],l=e[Math.floor(Math.random()*e.length)],o=t[Math.floor(Math.random()*t.length)];return`${l}${o}`}setId(e){this.id=e}addPoints(e){this.points+=e}setName(e){this.name=e}getScore(){return this.points}generateRandomColor(){return`hsl(${Math.floor(Math.random()*360)}, 70%, 60%)`}resetScore(){this.points=0}getState(){return{id:this.id,name:this.name,points:this.points,color:this.color,solvedCells:this.solvedCells}}setState(e){this.id=e.id,this.name=e.name,this.points=e.points,this.color=e.color,this.solvedCells=e.solvedCells||[]}}class f{constructor(){this.board=[],this.solution=[],this.players=new Map,this.localPlayer=null,this.network=null,this.selectedCell={row:0,col:0},this.cellColors=Array(9).fill().map(()=>Array(9).fill(null)),this.chronometerInterval=null,this.startTime=null}setNetwork(e){this.network=e}init(){this.generateSudoku(),this.renderBoard(),this.addEventListeners(),this.addLocalPlayer(),this.updatePlayersDisplay(),this.startChronometer(),this.addInfoIcon()}generateSudoku(){this.solution=this.generateSolution(),this.board=this.solution.map(e=>[...e]),this.removeNumbers()}generateSolution(){let e=Array(9).fill().map(()=>Array(9).fill(0));return this.fillCell(e,0,0),e}fillCell(e,t,l){if(l===9&&(l=0,t++,t===9))return!0;if(e[t][l]!==0)return this.fillCell(e,t,l+1);const o=this.shuffleArray([1,2,3,4,5,6,7,8,9]);for(let s of o)if(this.isValid(e,t,l,s)){if(e[t][l]=s,this.fillCell(e,t,l+1))return!0;e[t][l]=0}return!1}isValid(e,t,l,o){for(let n=0;n<9;n++)if(e[t][n]===o||e[n][l]===o)return!1;let s=Math.floor(t/3)*3,r=Math.floor(l/3)*3;for(let n=0;n<3;n++)for(let c=0;c<3;c++)if(e[s+n][r+c]===o)return!1;return!0}shuffleArray(e){for(let t=e.length-1;t>0;t--){const l=Math.floor(Math.random()*(t+1));[e[t],e[l]]=[e[l],e[t]]}return e}removeNumbers(){for(let t=0;t<40;t++){let l=Math.floor(Math.random()*9),o=Math.floor(Math.random()*9);for(;this.board[l][o]===0;)l=Math.floor(Math.random()*9),o=Math.floor(Math.random()*9);this.board[l][o]=0}}renderBoard(){const e=document.getElementById("gameBoard");e.innerHTML="";for(let t=0;t<9;t++)for(let l=0;l<9;l++){const o=document.createElement("div");o.className="cell",o.dataset.row=t,o.dataset.col=l,this.board[t][l]!==0&&(o.textContent=this.board[t][l],this.cellColors[t][l]?o.style.color=this.cellColors[t][l]:o.classList.add("fixed")),e.appendChild(o)}this.updateSelectedCell()}addEventListeners(){this.listenersAdded||(document.addEventListener("keydown",this.handleKeyPress.bind(this)),document.getElementById("gameBoard").addEventListener("click",this.handleCellClick.bind(this)),this.listenersAdded=!0)}handleKeyPress(e){e.stopPropagation();const t=e.key.toLowerCase();switch(console.log(`Key pressed: ${t}`),t){case"arrowup":case"z":case"w":this.moveSelection(0,-1);break;case"arrowdown":case"s":this.moveSelection(0,1);break;case"arrowleft":case"q":case"a":this.moveSelection(-1,0);break;case"arrowright":case"d":this.moveSelection(1,0);break;case"enter":this.submitNumber();break;case"backspace":case"delete":this.clearNumber();break;default:t>="1"&&t<="9"&&this.setNumber(parseInt(t))}(["arrowup","arrowdown","arrowleft","arrowright","z","q","w","s","a","d","enter","backspace","delete"].includes(t)||t>="1"&&t<="9")&&e.preventDefault()}handleCellClick(e){const t=e.target.closest(".cell");if(t){const l=parseInt(t.dataset.row),o=parseInt(t.dataset.col);this.selectedCell={row:l,col:o},this.updateSelectedCell()}}moveSelection(e,t){console.log("Moving selection");const l=Math.max(0,Math.min(8,this.selectedCell.row+t)),o=Math.max(0,Math.min(8,this.selectedCell.col+e));(l!==this.selectedCell.row||o!==this.selectedCell.col)&&(this.selectedCell={row:l,col:o},this.updateSelectedCell(),this.localPlayer&&(console.log("Broadcasting position"),this.network.broadcastPosition(this.selectedCell)))}updateSelectedCell(){document.querySelectorAll(".cell").forEach(t=>t.classList.remove("selected"));const e=document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);e&&e.classList.add("selected")}setNumber(e){const t=document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);t&&!t.classList.contains("fixed")&&(t.textContent=e,t.classList.add("user-input"))}clearNumber(){const e=document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);e&&!e.classList.contains("fixed")&&(e.textContent="",e.classList.remove("user-input"))}submitNumber(){const e=document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`);if(e&&!e.classList.contains("fixed")&&e.classList.contains("user-input")){const t=parseInt(e.textContent);t&&this.makeMove(this.selectedCell.row,this.selectedCell.col,t)}}makeMove(e,t,l){if(!this.localPlayer){console.error("No local player set");return}if(this.board[e][t]!==0){console.log("This cell is already solved");return}const o=this.calculateDifficultyScore(e,t),s=this.calculatePoints(o);if(this.solution[e][t]===l)this.localPlayer.addPoints(s),this.board[e][t]=l,this.cellColors[e][t]=this.localPlayer.color,this.localPlayer.solvedCells||(this.localPlayer.solvedCells=[]),this.localPlayer.solvedCells.push({row:e,col:t}),this.network.broadcastMove({row:e,col:t,value:l,playerId:this.localPlayer.id,points:this.localPlayer.getScore()}),this.animateCell(e,t,"correct"),this.showScoreChange(s);else{const r=Math.max(1,Math.floor(s/2));this.localPlayer.addPoints(-r),this.network.broadcastMove({row:e,col:t,value:null,playerId:this.localPlayer.id,points:this.localPlayer.getScore()}),this.animateCell(e,t,"incorrect"),this.showScoreChange(-r)}this.updatePlayersDisplay(),this.checkGameEnd()}calculateDifficultyScore(e,t){const l=this.countFilledInRow(e),o=this.countFilledInColumn(t),s=this.countFilledInBox(e,t),r=this.countTotalFilled();return 1-(l+o+s)/24*(r/81)}calculatePoints(e){return 1+Math.round(4*e)}countFilledInRow(e){return this.board[e].filter(t=>t!==0).length}countFilledInColumn(e){return this.board.filter(t=>t[e]!==0).length}countFilledInBox(e,t){const l=Math.floor(e/3)*3,o=Math.floor(t/3)*3;let s=0;for(let r=0;r<3;r++)for(let n=0;n<3;n++)this.board[l+r][o+n]!==0&&s++;return s}countTotalFilled(){return this.board.flat().filter(e=>e!==0).length}addInfoIcon(){const e=document.createElement("div");e.innerHTML="&#9432;",e.className="info-icon",e.title="Click for scoring information";const t=document.createElement("div");t.className="tooltip",t.innerHTML=`
            <h3>Scoring System</h3>
            <p>Points are awarded based on the difficulty of each move:</p>
            <ul>
                <li>Easier moves: 1-2 points</li>
                <li>Average moves: 3 points</li>
                <li>Difficult moves: 4-5 points</li>
            </ul>
            <p>Difficulty increases when fewer numbers are filled in the row, column, and 3x3 box.</p>
            <p>Incorrect guesses: Penalty is half the potential points (rounded down, minimum 1 point)</p>
        `,e.appendChild(t),e.addEventListener("click",o=>{o.stopPropagation(),t.classList.toggle("show")}),document.addEventListener("click",()=>{t.classList.remove("show")}),document.getElementById("gameContainer").appendChild(e)}animateCell(e,t,l){const o=document.querySelector(`.cell[data-row="${e}"][data-col="${t}"]`);o.classList.add(l==="correct"?"correct-animation":"incorrect-animation"),setTimeout(()=>{o.classList.remove("correct-animation","incorrect-animation"),l==="incorrect"?(o.classList.remove("user-input"),o.textContent=""):o.style.color=this.localPlayer.color},500)}showScoreChange(e){const t=document.createElement("div");t.textContent=e>0?`+${e}`:`${e}`,t.className=`score-change ${e>0?"positive":"negative"}`,document.body.appendChild(t);const o=document.querySelector(`.cell[data-row="${this.selectedCell.row}"][data-col="${this.selectedCell.col}"]`).getBoundingClientRect();t.style.left=`${o.left+o.width/2}px`,t.style.top=`${o.top+o.height/2}px`,t.offsetHeight,t.classList.add("show"),setTimeout(()=>{t.classList.remove("show"),setTimeout(()=>{document.body.removeChild(t)},500)},1e3)}updatePlayersDisplay(){const e=document.getElementById("players");if(e){e.innerHTML="";for(let[t,l]of this.players){const o=document.createElement("div");o.className="player",o.textContent=`${l.name}: ${l.points} points`,o.style.backgroundColor=l.color,o.style.color=this.getContrastColor(l.color),e.appendChild(o)}}}getContrastColor(e){e.slice(0,1)==="#"&&(e=e.slice(1));var t=parseInt(e.substr(0,2),16),l=parseInt(e.substr(2,2),16),o=parseInt(e.substr(4,2),16),s=(t*299+l*587+o*114)/1e3;return s>=128?"black":"white"}addLocalPlayer(){this.localPlayer=new y,this.players.set("local",this.localPlayer),this.updatePlayersDisplay()}setNetworkId(e){this.localPlayer&&(this.localPlayer.setId(e),this.players.delete("local"),this.players.set(e,this.localPlayer),this.updatePlayersDisplay())}addRemotePlayer(e){if(!this.players.has(e)){const t=new y(e);this.players.set(e,t),this.updatePlayersDisplay()}}removePlayer(e){this.players.delete(e),this.updatePlayersDisplay()}removeAllPlayers(){this.players.clear(),this.localPlayer=null,this.updatePlayersDisplay()}handleRemoteMove(e,t){if(e===this.localPlayer.id){console.log("Ignoring move from local player to prevent double processing.");return}const l=this.players.get(e);if(!l){console.error(`Player with id ${e} not found`);return}if(t.value!==null&&this.solution[t.row][t.col]===t.value){if(this.board[t.row][t.col]!==0){console.log("This cell is already solved");return}this.board[t.row][t.col]=t.value,this.cellColors[t.row][t.col]=l.color,l.solvedCells||(l.solvedCells=[]),l.solvedCells.push({row:t.row,col:t.col});const o=document.querySelector(`.cell[data-row="${t.row}"][data-col="${t.col}"]`);o.textContent=t.value,o.style.color=l.color,o.classList.remove("user-input"),this.animateCell(t.row,t.col,"correct")}l.addPoints(t.points-l.getScore()),this.renderBoard(),this.updatePlayersDisplay(),this.checkGameEnd()}updatePlayerPosition(e,t){if(!document.getElementById(`player-marker-${e}`)){const s=document.createElement("div");s.id=`player-marker-${e}`,s.className="player-marker",s.style.backgroundColor=this.players.get(e).color,document.getElementById("gameBoard").appendChild(s)}const o=document.querySelector(`.cell[data-row="${t.row}"][data-col="${t.col}"]`);if(o){const s=o.getBoundingClientRect(),r=document.getElementById(`player-marker-${e}`);r.style.left=`${s.left}px`,r.style.top=`${s.top}px`}}checkGameEnd(){if(this.isBoardFull()){let e=null,t=-1/0;for(let[l,o]of this.players)o.points>t&&(t=o.points,e=o);alert(`Game Over! Winner: ${e.name} with ${e.points} points!`),this.stopChronometer()}}isBoardFull(){for(let e of this.board)if(e.includes(0))return!1;return!0}getGameState(){return{board:this.board,solution:this.solution,cellColors:this.cellColors,players:Array.from(this.players.values()).map(e=>e.getState()),elapsedTime:this.getElapsedTime()}}setGameState(e){this.board=e.board,this.solution=e.solution,this.cellColors=e.cellColors||Array(9).fill().map(()=>Array(9).fill(null)),this.renderBoard(),this.players.clear();for(let t of e.players){const l=new y(t.id);l.setState(t),this.players.set(t.id,l),t.id===this.network.getMyId()&&(this.localPlayer=l)}this.updatePlayersDisplay(),this.setElapsedTime(e.elapsedTime||0)}startChronometer(){this.startTime=Date.now(),this.chronometerInterval=setInterval(()=>{this.updateChronometer()},1e3)}stopChronometer(){this.chronometerInterval&&clearInterval(this.chronometerInterval)}updateChronometer(){const e=this.getElapsedTime(),t=Math.floor(e/6e4),l=Math.floor(e%6e4/1e3),o=`${t.toString().padStart(2,"0")}:${l.toString().padStart(2,"0")}`;document.getElementById("chronometer").textContent=o}getElapsedTime(){return Date.now()-this.startTime}setElapsedTime(e){this.startTime=Date.now()-e,this.updateChronometer()}resetGame(){this.stopChronometer(),this.board=[],this.solution=[],this.cellColors=Array(9).fill().map(()=>Array(9).fill(null)),this.players.forEach(e=>e.resetScore()),this.init(),this.updatePlayersDisplay()}highlightConflicts(){for(let e=0;e<9;e++)for(let t=0;t<9;t++)if(this.board[e][t]!==0){const l=this.board[e][t],o=document.querySelector(`.cell[data-row="${e}"][data-col="${t}"]`);for(let n=0;n<9;n++)n!==t&&this.board[e][n]===l&&(o.classList.add("conflict"),document.querySelector(`.cell[data-row="${e}"][data-col="${n}"]`).classList.add("conflict")),n!==e&&this.board[n][t]===l&&(o.classList.add("conflict"),document.querySelector(`.cell[data-row="${n}"][data-col="${t}"]`).classList.add("conflict"));let s=Math.floor(e/3)*3,r=Math.floor(t/3)*3;for(let n=s;n<s+3;n++)for(let c=r;c<r+3;c++)n!==e&&c!==t&&this.board[n][c]===l&&(o.classList.add("conflict"),document.querySelector(`.cell[data-row="${n}"][data-col="${c}"]`).classList.add("conflict"))}}removeHighlights(){document.querySelectorAll(".cell").forEach(e=>{e.classList.remove("conflict")})}hint(){if(!this.localPlayer)return;let e=[];for(let o=0;o<9;o++)for(let s=0;s<9;s++)this.board[o][s]===0&&e.push({row:o,col:s});if(e.length===0)return;const t=e[Math.floor(Math.random()*e.length)],l=this.solution[t.row][t.col];this.localPlayer.addPoints(-1),this.board[t.row][t.col]=l,this.cellColors[t.row][t.col]="gray",this.renderBoard(),this.updatePlayersDisplay(),this.showScoreChange(-1),this.animateCell(t.row,t.col,"hint")}undo(){if(!this.localPlayer||!this.localPlayer.solvedCells||this.localPlayer.solvedCells.length===0)return;const e=this.localPlayer.solvedCells.pop();this.board[e.row][e.col]=0,this.cellColors[e.row][e.col]=null,this.localPlayer.addPoints(-1),this.renderBoard(),this.updatePlayersDisplay(),this.showScoreChange(-1)}}class g{constructor(e){this.game=e,this.peer=null,this.connections=new Map,this.isHost=!0,this.id=null,this.initializePeer()}initializePeer(){console.log("Initializing peer connection..."),this.peer=new Peer(void 0,{debug:2}),this.peer.on("open",e=>{console.log("Peer connection opened. My peer ID is: "+e),document.getElementById("myPeerIdDisplay").textContent=`My Peer ID: ${e}`,this.id=e,this.game.setNetworkId(e)}),this.peer.on("connection",e=>{console.log("Incoming connection from peer: "+e.peer),this.handleConnection(e)}),this.peer.on("disconnected",()=>{console.log("Peer disconnected. Attempting to reconnect..."),this.peer.reconnect()}),this.peer.on("close",()=>{console.log("Peer connection closed. Cleaning up..."),this.connections.clear(),this.game.removeAllPlayers()}),this.peer.on("error",e=>{console.error("PeerJS error:",e),this.handleNetworkError(e),e.type==="network"||e.type==="server-error"?(console.log("Network or server error. Retrying connection..."),this.retryConnection()):e.type==="browser-incompatible"&&(console.error("Your browser is not compatible with PeerJS"),alert("Your browser is not compatible with PeerJS. Please try a different browser."))})}retryConnection(){console.log("Retrying connection..."),setTimeout(()=>{this.initializePeer()},5e3)}connect(e){if(!this.connections.has(e)){const t=this.peer.connect(e);this.isHost=!1,this.handleConnection(t)}}handleConnection(e){e.on("open",()=>{if(console.log("Connected to: "+e.peer),this.connections.set(e.peer,e),this.game.addRemotePlayer(e.peer),this.isHost){console.log("Sending initial game state to new player");const t=this.game.getGameState();e.send({type:"initial_state",state:t})}e.on("data",t=>{switch(console.log(`Received data from ${e.peer}:`,t),t.type){case"move":this.game.handleRemoteMove(e.peer,t.move);break;case"position":this.game.updatePlayerPosition(e.peer,t.position);break;case"initial_state":this.isHost||(console.log("Received initial game state"),this.game.setGameState(t.state));break;case"direct_message":console.log(`Direct message from ${e.peer}: ${t.message}`);break;default:console.warn("Unknown data type received:",t.type)}}),this.updateConnectionStatus()}),e.on("close",()=>{console.log("Disconnected from: "+e.peer),this.connections.delete(e.peer),this.game.removePlayer(e.peer),this.updateConnectionStatus()}),e.on("error",t=>{console.error("Connection error:",t),this.handleNetworkError(t)})}broadcastMove(e){const t={type:"move",move:e};console.log("Broadcasting move:",t),this.broadcast(t)}broadcastPosition(e){const t={type:"position",position:e};this.broadcast(t)}broadcast(e){for(let t of this.connections.values())t.send(e)}getMyId(){return this.id}getConnectedPeers(){return Array.from(this.connections.keys())}disconnect(e){const t=this.connections.get(e);t&&(t.close(),this.connections.delete(e),this.game.removePlayer(e),this.updateConnectionStatus())}disconnectAll(){for(let e of this.connections.values())e.close();this.connections.clear(),this.game.removeAllPlayers(),this.updateConnectionStatus()}reconnect(e){this.disconnect(e),this.connect(e)}sendDirectMessage(e,t){const l=this.connections.get(e);l?l.send({type:"direct_message",message:t}):console.warn(`No connection found for peer ${e}`)}updateConnectionStatus(){const e=document.getElementById("connectionStatus");if(e){const t=this.getConnectedPeers();e.textContent=`Connected to ${t.length} peer(s): ${t.join(", ")}`}}handleNetworkError(e){console.error("Network error:",e);const t=document.getElementById("networkError");t&&(t.textContent=`Network error: ${e.type}`,t.style.display="block")}}document.addEventListener("DOMContentLoaded",()=>{const a=new f,e=new g(a);a.setNetwork(e),a.init();const t=document.getElementById("peerIdInput"),l=document.getElementById("connectButton"),o=document.getElementById("copyPeerIdButton"),s=document.getElementById("myPeerIdDisplay");l.addEventListener("click",()=>{const i=t.value.trim();i&&e.connect(i)}),t.addEventListener("keypress",i=>{i.key==="Enter"&&l.click()}),o.addEventListener("click",()=>{const i=s.textContent.replace("My Peer ID: ","");navigator.clipboard.writeText(i).then(()=>{const m=o.textContent;o.textContent="Copied!",o.style.backgroundColor="#45b7a4",setTimeout(()=>{o.textContent=m,o.style.backgroundColor="#4ECDC4"},2e3)}).catch(m=>{console.error("Failed to copy text: ",m)})}),s.addEventListener("keydown",i=>{i.ctrlKey&&i.key==="c"&&(i.preventDefault(),o.click())}),s.tabIndex=0;const r=document.createElement("div");r.textContent="Share this ID with a friend to connect and play together!",r.style.cssText=`
        position: absolute;
        background-color: #333;
        color: white;
        padding: 5px 10px;
        border-radius: 5px;
        font-size: 14px;
        opacity: 0;
        transition: opacity 0.3s ease;
        pointer-events: none;
    `,document.body.appendChild(r),s.addEventListener("mouseenter",()=>{const i=s.getBoundingClientRect();r.style.left=`${i.left}px`,r.style.top=`${i.bottom+5}px`,r.style.opacity="1"}),s.addEventListener("mouseleave",()=>{r.style.opacity="0"}),document.getElementById("gameBoard").addEventListener("click",i=>{a.handleCellClick(i)});const n=document.createElement("div");n.id="buttonContainer",document.getElementById("gameContainer").appendChild(n);const c=document.createElement("button");c.textContent="Hint",c.addEventListener("click",()=>a.hint()),n.appendChild(c);const h=document.createElement("button");h.textContent="Undo",h.addEventListener("click",()=>a.undo()),n.appendChild(h);const u=document.createElement("button");u.textContent="Reset Game",u.addEventListener("click",()=>{confirm("Are you sure you want to reset the game?")&&a.resetGame()}),n.appendChild(u);let p=!1;const d=document.createElement("button");d.textContent="Show Conflicts",d.addEventListener("click",()=>{p?(a.removeHighlights(),d.textContent="Show Conflicts"):(a.highlightConflicts(),d.textContent="Hide Conflicts"),p=!p}),n.appendChild(d)});
