const MessageType = {
    ChatMessage: "chatmessage",
    CharSheetRoll: "charsheetroll",
    CanvasUpdate:"canvasupdate",
    BroadcastAction:"broadcastaction",
    InaraConnect:"inaraconnect"
}

function initSocket() {
    var socket = new WebSocket('wss://5v891qyp15.execute-api.us-west-1.amazonaws.com/Prod');
    // socket.onmessage = function(evt) {receiveSocketMessage(evt);};
    return socket;
}

function sendSocketMessage(type, username, contents) {
    var msg;
    switch (type) {
        case MessageType.CanvasUpdate:
            msg = {
                action: type,
                data : {'sender': username, 'contents': contents}};
            if(username == 'getcanvasstate' && contents ==''){
                console.log('Getting the current canvas state by sending blank update');
            }
            else {
                console.log("Canvas update going out to socket");
            }
            break;
        case MessageType.ChatMessage:
            msg = {
                action: type,
                data : {'sender': username, 'contents': contents}};
            console.log("Sending a chat message to the socket");
            break;
        case MessageType.BroadcastAction:
            msg = {
                action: type,
                data : {'sender': username, 'contents': contents}};
            console.log("Broadcasting an action to other users");
            break;
        case MessageType.InaraConnect:
            msg = {
                action: type,
                data : {'sender': username, 'contents': contents}};
            console.log("Broadcasting an action to other users");
            break;
        default:
            console.log("No case statement in sendsocketmessage to handle this message: " + type);
            return;
        console.log(msg);
    };
    socket.send(JSON.stringify(msg));
}


function rolld20(dieRoll) {
    var toRoll = dieRoll.attribute;
    var rollBonus = dieRoll.rollbonus;

    sendSocketMessage(MessageType.ChatMessage, rollBonus+':'+toRoll);
}