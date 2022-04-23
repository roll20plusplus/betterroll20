const MessageType = {
    ChatMessage: "chatmessage",
    CharSheetRoll: "charsheetroll",
    CanvasUpdate:"canvasupdate",
    BroadcastAction:"broadcastaction"
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
        case MessageType.ChatMessage:
            console.log("Sending a chat message to the socket");
            break;
        case MessageType.BroadcastAction:
            console.log("Broadcasting an action to other users");
            break;
        default:
            console.log("Tried to send a message that was neither a Canvas Update or a Chat Message: " + type);
            break;
        };
    var msg = {
        action: type,
        data : {'sender': username, 'contents': contents}};
    console.log(msg);
    socket.send(JSON.stringify(msg));
}


function rolld20(dieRoll) {
    var toRoll = dieRoll.attribute;
    var rollBonus = dieRoll.rollbonus;

    sendSocketMessage(MessageType.ChatMessage, rollBonus+':'+toRoll);
}