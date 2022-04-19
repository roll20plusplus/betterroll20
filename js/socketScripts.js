const MessageType = {
    ChatMessage: "chatmessage",
    CharSheetRoll: "charsheetroll",
    CanvasUpdate:"canvasupdate",
}

function initSocket() {
    var socket = new WebSocket('wss://5v891qyp15.execute-api.us-west-1.amazonaws.com/Prod');
    // socket.onmessage = function(evt) {receiveSocketMessage(evt);};
    return socket;
}

function sendSocketMessage(type, username, contents) {
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


function rolld20(dieRoll) {
    var toRoll = dieRoll.attribute;
    var rollBonus = dieRoll.rollbonus;

    sendSocketMessage(MessageType.ChatMessage, rollBonus+':'+toRoll);
}