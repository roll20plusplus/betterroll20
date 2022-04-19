function initSocket() {
    var socket = new WebSocket('wss://5v891qyp15.execute-api.us-west-1.amazonaws.com/Prod');
    socket.onmessage = function(evt) {receiveSocketMessage(evt);};
    return socket;
}

function sendSocketMessage(type, contents) {
    switch (type) {
        case MessageType.CanvasUpdate:
            console.log("Canvas update going out to socket");
            var msg = {
                action: MessageType.CanvasUpdate,
                data: contents
            };
            socket.send(JSON.stringify(msg));
            break;
        case MessageType.ChatMessage:
            console.log("Sending a chat message to the socket");
            var msg = {
                action : MessageType.ChatMessage,
                data : {'sender': username, 'contents': contents}
            };
            socket.send(JSON.stringify(msg));
            break;
        default:
            console.log("Tried to send a message that was neither a Canvas Update or a Chat Message: " + type);
    }
}

function receiveSocketMessage(socketMessage) {
    console.log("Receiving a message from the websocket");
    console.log(socketMessage);
    //var msg = JSON.parse(socketMessage);
    var msg = JSON.parse(socketMessage['data']);
    if (typeof(msg) == 'string') {
        msg = JSON.parse(msg);
    }

    if(msg.messageType == MessageType.CanvasUpdate) {
        action = false;
        console.log("Got a canvas update message");
        console.log(msg.data);
        canvas.loadFromJSON(JSON.parse(msg.data), function() {drawBackground(); action = true;});
        canvas.renderAll();
    }
    else if (msg.messageType == MessageType.ChatMessage) {
        console.log(msg);
        console.log("Got a chat message");
        msgContents = msg.data;
        var chatMessageList = document.querySelector(".chatlist");

        if(msgContents.diceroll.S != '') {
            var template = document.querySelector('#rollMessageTemplate');
            var clone = template.content.cloneNode(true);
            clone.querySelector('.messageSender').textContent = msgContents.sender.S + ':';
            clone.querySelector('.rollAttribute').textContent = msgContents.rollAttribute.S+ ':';
            clone.querySelector('.diceRoll').textContent = msgContents.contents.S;
            clone.querySelector('.diceResult').textContent = msgContents.diceroll.S;
            chatMessageList.appendChild(clone);
            // chatMessageList.insertBefore(clone, chatMessageList.firstChild);
        }
        else {
            var template = document.querySelector('#chatMessageTemplate');
            var clone = template.content.cloneNode(true);
            clone.querySelector('.messageSender').textContent = msgContents.sender.S+ ':';
            clone.querySelector('.messageContents').textContent = msgContents.contents.S;
            chatMessageList.appendChild(clone);
            // chatMessageList.insertBefore(clone, chatMessageList.firstChild);
        }
    }
    else {
        console.log("Encountered a problem retrieving a message from the websocket");
    }
}

function rolld20(dieRoll) {
    var toRoll = dieRoll.attribute;
    var rollBonus = dieRoll.rollbonus;

    sendSocketMessage(MessageType.ChatMessage, rollBonus+':'+toRoll);
}