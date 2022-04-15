/*!
* Start Bootstrap - Simple Sidebar v6.0.5 (https://startbootstrap.com/template/simple-sidebar)
* Copyright 2013-2022 Start Bootstrap
* Licensed under MIT (https://github.com/StartBootstrap/startbootstrap-simple-sidebar/blob/master/LICENSE)
*/
/*global WildRydes _config AmazonCognitoIdentity AWSCognito*/
// 
// Scripts
//

var socket;

var current;
var list = [];
var state = [];
var index = 0;
var index2 = 0;
var action = false;
var refresh = true;

var s3;
var sessionToken;

var charSheetButtonEl = $('open-character-sheet'),
  drawingModeEl = $('drawing-mode'),
  drawingOptionsEl = $('drawing-mode-options'),
  drawingColorEl = $('drawing-color'),
  drawingShadowColorEl = $('drawing-shadow-color'),
  drawingLineWidthEl = $('drawing-line-width'),
  drawingShadowWidth = $('drawing-shadow-width'),
  drawingShadowOffset = $('drawing-shadow-offset'),
  clearEl = $('clear-canvas');

var grid = 70;

var $ = function(id){return document.getElementById(id)};

var canvas = this.__canvas = new fabric.Canvas('canvas', {
isDrawingMode: true
});

canvas.counter = 0;
var newleft = 0;
canvas.selection = false;

var backgroundURL = 'img/background_53x56.png';

fabric.Object.prototype.transparentCorners = false;

var state = [];
var mods = 0;

const MessageType = {
    ChatMessage: "chatmessage",
    CharSheetRoll: "charsheetroll",
    CanvasUpdate:"canvasupdate",
}

function sendSocketMessage(type, contents) {
    switch (type) {
        case MessageType.CanvasUpdate:
            console.log("Canvas update going out to socket");
            var msg = {
                "action": MessageType.CanvasUpdate.name,
                "data": contents
            };
            socket.send(JSON.stringify(msg));
            break;
        case MessageType.ChatMessage:
            console.log("Sending a chat message to the socket");
            var msg = {
                "action" : MessageType.ChatMessage.name,
                "data" : contents
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
    var msg = JSON.parse(socketMessage);
    if (typeof(msg) == 'string') {
        msg = JSON.parse(msg);
    }
    if(msg.messageType == MessageType.CanvasUpdate) {
        action = false;
        canvas.loadFromJSON(JSON.parse(msg.data), function() {drawBackground(); action = true;});
        canvas.renderAll();
    }
    else if (msg.messageType == MessageType.ChatMessage) {
        jsonData = JSON.parse(msg.data);
        msgSender = jsonData.sender;
        msgContents = json.contents;
        console.log("Got a chat message");
        var node = document.createElement('li');
        node.appendChild(document.createTextNode(msgContents));
        document.querySelector(".chatlist").appendChild(node);
    }
    else {
        console.log("Encountered a problem retrieving a message from the websocket");
    }
}

function sendChatMessage() {
    //console.log("Sending a chat message " + MessageType.ChatMessage + " " + document.getElementById("message").value);
    sendSocketMessage(MessageType.ChatMessage, document.getElementById("message").value);

    // Blank the text input element, ready to receive the next line of text from the user.
    document.getElementById("message").value = "";
}

window.addEventListener('DOMContentLoaded', event => {
    init();
    //socket.onmessage = receiveSocketMessage(event);
});


function init() {
    console.log("Initializing the app");
    socket = new WebSocket('wss://5v891qyp15.execute-api.us-west-1.amazonaws.com/Prod');
    action=false;
    drawBackground();
    drawGrid();
    sidebarToggleConfig();
    //updateModifications();
    popUpDragConfig();
    chatInputConfig();
    drawingOptionsInit();
    drawModeSelectorConfig();
    getUserProfile();
    initS3();
    console.log("Fetching current canvas state");
    loadCanvasState();
    action=true;
}

function sidebarToggleConfig() {
    // Toggle the side navigation
    const sidebarToggle = document.body.querySelector('#sidebarToggle');
    if (sidebarToggle) {
        // Uncomment Below to persist sidebar toggle between refreshes
        // if (localStorage.getItem('sb|sidebar-toggle') === 'true') {
        //     document.body.classList.toggle('sb-sidenav-toggled');
        // }
        sidebarToggle.addEventListener('click', event => {
            event.preventDefault();
            document.body.classList.toggle('sb-sidenav-toggled');
            localStorage.setItem('sb|sidebar-toggle', document.body.classList.contains('sb-sidenav-toggled'));
        });
    }
}


function chatInputConfig() {
    // Get the input field
    var messageinput = document.getElementById("message");

    // Execute a function when the user releases a key on the keyboard
    messageinput.addEventListener("keyup", function(event) {
      // Number 13 is the "Enter" key on the keyboard
      if (event.keyCode === 13) {
        // Cancel the default action, if needed
        event.preventDefault();
        // Trigger the button element with a click
        document.getElementById("messagebutton").click();
      }
    });
}

function drawBackground() {
    canvas.setBackgroundImage(backgroundURL, canvas.renderAll.bind(canvas));
}

function drawGrid() {
    console.log('Drawing grid');
    canvasEl = document.getElementById("canvas");
    bw = canvasEl.width;
    bh = canvasEl.height;
    var x = 0;
    var y = 0;
    console.log(bw + " " + bh);
    for (x = 0; x <= bw; x+= grid) {
        canvas.add(new fabric.Line([x, 0, x, bh], {
          fill: 'black',
          stroke: 'black',
          strokeWidth: 1,
          selectable: false,
          evented: false,
          excludeFromExport: true
        }));
    }
    for (y = 0; y <= bh; y+= grid) {
        canvas.add(new fabric.Line([0, y, bw, y], {
          fill: 'black',
          stroke: 'black',
          strokeWidth: 1,
          selectable: false,
          evented: false,
          excludeFromExport: true
        }));
    }
}

function popUpDragConfig() {
    document.onkeyup = KeyPress;
    $('.draggable-handler').mousedown(function(e){
      drag = $(this).closest('.draggable')
      drag.addClass('dragging')
      drag.css('left', e.clientX-$(this).width()/2)
      drag.css('top', e.clientY-$(this).height()/2)
      $(this).on('mousemove', function(e){
        drag.css('left', e.clientX-$(this).width()/2)
        drag.css('top', e.clientY-$(this).height()/2)
        window.getSelection().removeAllRanges()
      })
    })

    $('.draggable-handler').mouseleave(stopDragging)
    $('.draggable-handler').mouseup(stopDragging)

    function stopDragging(){
      drag = $(this).closest('.draggable')
      drag.removeClass('dragging')
      $(this).off('mousemove')
    }

    // setTimeout(function(
    //           $("")
    //           ){}, 4000);

    $(document).on('click', 'a#check-iframe-content-url', function(){
      // blocked by CORS
      alert($("#iframe-source").contents().find('.primary'));
    });
}

function drawingOptionsInit() {
    charSheetButtonEl.onclick = function () {
        charSheetEl = document.getElementById("panel1 dragcharsheet");
        if (charSheetEl.style.visibility == 'hidden') {
            charSheetButtonEl.innerHTML = 'Hide Character Sheet';
            charSheetEl.style.visibility = 'visible';
        }
        else {
            charSheetButtonEl.innerHTML = 'Show Character Sheet';
            charSheetEl.style.visibility = 'hidden';
        }
    }

    clearEl.onclick = function() { clearcan()};

    drawingModeEl.onclick = function() {
        canvas.isDrawingMode = !canvas.isDrawingMode;
        if (canvas.isDrawingMode) {
          drawingModeEl.innerHTML = 'Cancel drawing mode';
          drawingOptionsEl.style.display = '';
        }
        else {
          drawingModeEl.innerHTML = 'Enter drawing mode';
          drawingOptionsEl.style.display = 'none';
        }
    };

    if (fabric.PatternBrush) {
        var vLinePatternBrush = new fabric.PatternBrush(canvas);
        vLinePatternBrush.getPatternSrc = function() {

          var patternCanvas = fabric.document.createElement('canvas');
          patternCanvas.width = patternCanvas.height = 10;
          var ctx = patternCanvas.getContext('2d');

          ctx.strokeStyle = this.color;
          ctx.lineWidth = 5;
          ctx.beginPath();
          ctx.moveTo(0, 5);
          ctx.lineTo(10, 5);
          ctx.closePath();
          ctx.stroke();

          return patternCanvas;
        };

        var hLinePatternBrush = new fabric.PatternBrush(canvas);
        hLinePatternBrush.getPatternSrc = function() {

        var patternCanvas = fabric.document.createElement('canvas');
        patternCanvas.width = patternCanvas.height = 10;
        var ctx = patternCanvas.getContext('2d');

        ctx.strokeStyle = this.color;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(5, 0);
        ctx.lineTo(5, 10);
        ctx.closePath();
        ctx.stroke();

        return patternCanvas;
    };

        var squarePatternBrush = new fabric.PatternBrush(canvas);
        squarePatternBrush.getPatternSrc = function() {

          var squareWidth = 10, squareDistance = 2;

          var patternCanvas = fabric.document.createElement('canvas');
          patternCanvas.width = patternCanvas.height = squareWidth + squareDistance;
          var ctx = patternCanvas.getContext('2d');

          ctx.fillStyle = this.color;
          ctx.fillRect(0, 0, squareWidth, squareWidth);

          return patternCanvas;
        };

        var diamondPatternBrush = new fabric.PatternBrush(canvas);
        diamondPatternBrush.getPatternSrc = function() {

          var squareWidth = 10, squareDistance = 5;
          var patternCanvas = fabric.document.createElement('canvas');
          var rect = new fabric.Rect({
            width: squareWidth,
            height: squareWidth,
            angle: 45,
            fill: this.color
          });

          var canvasWidth = rect.getBoundingRect().width;

          patternCanvas.width = patternCanvas.height = canvasWidth + squareDistance;
          rect.set({ left: canvasWidth / 2, top: canvasWidth / 2 });

          var ctx = patternCanvas.getContext('2d');
          rect.render(ctx);

          return patternCanvas;
        };

        var img = new Image();
        img.src = 'img/70x70-0000ffff.png';

        var texturePatternBrush = new fabric.PatternBrush(canvas);
        texturePatternBrush.source = img;
    }
}

function drawModeSelectorConfig() {
    $('drawing-mode-selector').onchange = function() {

    if (this.value === 'hline') {
      canvas.freeDrawingBrush = vLinePatternBrush;
    }
    else if (this.value === 'vline') {
      canvas.freeDrawingBrush = hLinePatternBrush;
    }
    else if (this.value === 'square') {
      canvas.freeDrawingBrush = squarePatternBrush;
    }
    else if (this.value === 'diamond') {
      canvas.freeDrawingBrush = diamondPatternBrush;
    }
    else if (this.value === 'texture') {
      canvas.freeDrawingBrush = texturePatternBrush;
    }
    else {
      canvas.freeDrawingBrush = new fabric[this.value + 'Brush'](canvas);
    }

    if (canvas.freeDrawingBrush) {
      var brush = canvas.freeDrawingBrush;
      brush.color = drawingColorEl.value;
      if (brush.getPatternSrc) {
        brush.source = brush.getPatternSrc.call(brush);
      }
      brush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
      brush.shadow = new fabric.Shadow({
        blur: parseInt(drawingShadowWidth.value, 10) || 0,
        offsetX: 0,
        offsetY: 0,
        affectStroke: true,
        color: drawingShadowColorEl.value,
      });
    }
    };

    drawingColorEl.onchange = function() {
        var brush = canvas.freeDrawingBrush;
        brush.color = this.value;
        if (brush.getPatternSrc) {
          brush.source = brush.getPatternSrc.call(brush);
        }
    };
    drawingShadowColorEl.onchange = function() {
        canvas.freeDrawingBrush.shadow.color = this.value;
    };
    drawingLineWidthEl.onchange = function() {
        canvas.freeDrawingBrush.width = parseInt(this.value, 10) || 1;
        this.previousSibling.innerHTML = this.value;
    };
    drawingShadowWidth.onchange = function() {
        canvas.freeDrawingBrush.shadow.blur = parseInt(this.value, 10) || 0;
        this.previousSibling.innerHTML = this.value;
    };
    drawingShadowOffset.onchange = function() {
        canvas.freeDrawingBrush.shadow.offsetX = parseInt(this.value, 10) || 0;
        canvas.freeDrawingBrush.shadow.offsetY = parseInt(this.value, 10) || 0;
        this.previousSibling.innerHTML = this.value;
    };

    if (canvas.freeDrawingBrush) {
        canvas.freeDrawingBrush.color = drawingColorEl.value;
        //canvas.freeDrawingBrush.source = canvas.freeDrawingBrush.getPatternSrc.call(this);
        canvas.freeDrawingBrush.width = parseInt(drawingLineWidthEl.value, 10) || 1;
        canvas.freeDrawingBrush.shadow = new fabric.Shadow({
          blur: parseInt(drawingShadowWidth.value, 10) || 0,
          offsetX: 0,
          offsetY: 0,
          affectStroke: true,
          color: drawingShadowColorEl.value,
        });
    }
}

//Image Drag and Drop Functions

function drop_handler(ev) {
    console.log('Drop');
    console.log(ev);
    ev.preventDefault();
    var data = ev.dataTransfer.items;
    for (var i = 0; i < data.length; i += 1) {
        if ((data[i].kind == 'string') &&
           (data[i].type.match('^text/plain'))) {
            // This item is the target node
            data[i].getAsString(function (s){
            ev.target.appendChild(document.getElementById(s));
         });
    } else if ((data[i].kind == 'string') &&
        (data[i].type.match('^text/html'))) {
         // Drag data item is HTML
         console.log("... Drop: HTML");
    } else if ((data[i].kind == 'string') &&
        (data[i].type.match('^text/uri-list'))) {
        // Drag data item is URI
        console.log("... Drop: URI");
    } else if ((data[i].kind == 'file') &&
        (data[i].type.match('^image/'))) {
            // Drag data item is an image file
            var f = data[i].getAsFile();
            var base_image = new Image();
            let reader = new FileReader();
            s3Upload(f);
            reader.onload = function(event) {
                var img = new Image();
                var truePos = getMousePos(canvas, ev);
                placeImage(event.target.result, truePos.x, truePos.y);
            }
            reader.readAsDataURL(f)
            console.log("... Drop: File ");
        }
    }
}

function s3Upload(file) {
    var fileName = file.name;
    var filePath = 'img/' + fileName;
    //var fileUrl = 'https://' + _config.s3.region + '.amazonaws.com/my-    first-bucket/' +  filePath;
    s3.upload({
        Key: filePath,
        Body: file,
        }, function(err, data) {
        if(err) {
            console.log('error uploading file to s3');
        }
        alert('Successfully Uploaded!');
        }).on('httpUploadProgress', function (progress) {
        var uploaded = parseInt((progress.loaded * 100) / progress.total);
        $("progress").attr('value', uploaded);
    });
}

function placeImage(base_image, imageX, imageY) {
    fabric.Image.fromURL(base_image, function(oImg) {
        canvas.add(oImg);
        oImg.left = imageX;
        oImg.top = imageY;
        oImg.setCoords();
        canvas.renderAll();
    });
    console.log('image placed');
    canvas.counter++;
    updateModifications();
}

function dragOverHandler(event) {
    console.log(event);
    event.preventDefault();
    return;
}

function getMousePos(canvas, evt) {
  var rect = document.getElementById("canvas").getBoundingClientRect();
  return {
    x: evt.clientX - rect.left,
    y: evt.clientY - rect.top
  };
}

canvas.on(
    'object:modified', function () {
        console.log('Object Modified');
        updateModifications();
});

canvas.on(
    'object:added', function () {
        console.log('Object added');
        updateModifications();
});

//canvas.on(
//    'path:created', function(e) {
//        console.log('Path Created');
//        updateModifications(true);
//});

function updateModifications() {
    if (action) {
        console.log("Updating Modifications")
        myjson = JSON.stringify(canvas);
        sendSocketMessage(MessageType.CanvasUpdate, myjson);
        state.push(myjson);
        console.log(state);
        //mods += 1;
        console.log("Number of saved states:" + state.length);
        console.log("mods " + mods);
        //console.log("states " + state);
    }
}

undo = function undo() {
    console.log('undo');
    if (mods < state.length-1) {
        action = false;
        canvas.clear().renderAll();
        stateIndex = state.length - 1 - mods - 1;
        console.log('loading from state index ' + stateIndex)
        canvas.loadFromJSON(state[stateIndex], function() {drawBackground(); action = true;});
        canvas.renderAll();
        //console.log("geladen " + (state.length-1-mods-1));
        console.log("state " + state.length);
        mods += 1;
        console.log("mods " + mods);
        //console.log("states " + state);
    }
}

redo = function redo() {
    if (mods > 0) {
        action = false;
        canvas.clear().renderAll();
        canvas.loadFromJSON(state[state.length - 1 - mods + 1], function() {action=true});
        canvas.renderAll();
        //console.log("geladen " + (state.length-1-mods+1));
        mods -= 1;
        //console.log("state " + state.length);
        //console.log("mods " + mods);
    }
}

clearcan = function clearcan() {
    console.log('Clearing Canvas');
    action = false;
    canvas.loadFromJSON(state[0], function() {drawBackground(); canvas.renderAll.bind(canvas); action=true;});
    //canvas.renderAll();
}

function KeyPress(e) {
    var evtobj = window.event? event : e
    if (evtobj.keyCode == 90 && evtobj.ctrlKey) undo();
    if (evtobj.keyCode == 89 && evtobj.ctrlKey) redo();
}

canvas.on('mouse:wheel', function(opt) {
    var delta = opt.e.deltaY;
    var zoom = canvas.getZoom();
    zoom *= 0.999 ** delta;
    if (zoom > 20) zoom = 20;
    if (zoom < 0.01) zoom = 0.01;
    canvas.setZoom(zoom);
    opt.e.preventDefault();
    opt.e.stopPropagation();
})

function getUserProfile() {

    var data = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId,
    };
    var userPool = new AWSCognito.CognitoIdentityServiceProvider.CognitoUserPool(data);
    var cognitoUser = userPool.getCurrentUser();

    try {
        if (cognitoUser != null) {
        cognitoUser.getSession(function(err, session) {
            if (err) {
                console.log(err);
                return;
            }
            console.log('session validity: ' + session.isValid());
            console.log('session token: ' + session.getIdToken().getJwtToken());
            sessionToken = session.getIdToken().getJwtToken();

            AWS.config.region = _config.cognito.region;
            //var loginKey = 'cognito-idp.'.concat(${AWS.config.region}, '.amazonaws.com/', ${data.UserPoolId});
            AWS.config.credentials = new AWS.CognitoIdentityCredentials({
                IdentityPoolId : _config.cognito.identityPoolId,
                Logins : {
                  // Change the key below according to the specific region your user pool is in.
                  'cognito-idp.us-west-1.amazonaws.com/us-west-1_bJ5HhIOsZ' : session.getIdToken().getJwtToken()
                }
            });
          //saveCharToDB(null);
        });
        } else {
        console.log(err);
        return;
        }
    } catch (e) {
        console.log(e);
        return;
    }

}

function loadCanvasState() {
    AWS.config.credentials.get(function(err) {
        if (!err) {
            var id = AWS.config.credentials.identityId;
            console.log('Cognito Identity ID '+ id);

            // Instantiate aws sdk service objects now that the credentials have been updated
            var docClient = new AWS.DynamoDB.DocumentClient({ region: AWS.config.region });
            var params = {
            TableName: 'Archive',
            Key:{'messageID': 'Canvas', 'date': 'Current'}
            };
            docClient.get(params, function(err, data) {
                if (err) {
                    console.log("Error", err);
                } else {
                    action = false;
                    console.log("Success");
                    console.log(data.Item);
                    canvas.loadFromJSON(JSON.parse(data.Item.contents), function() {drawBackground(); action = true;}); 
                }
            });
        }
    });
}

function loadCharFromDB() {
    AWS.config.credentials.get(function(err) {
    if (!err) {
      var id = AWS.config.credentials.identityId;
      console.log('Cognito Identity ID '+ id);

      // Instantiate aws sdk service objects now that the credentials have been updated
      var docClient = new AWS.DynamoDB.DocumentClient({ region: AWS.config.region });
      var params = {
        TableName: 'Inara',
        Key:{'userID': id}
      };
    docClient.get(params, function(err, data) {
        if (err) {
            console.log("Error", err);
        } else {
            console.log("Success");
            console.log(data.Item);
            document.getElementById('serviceFrameSend').contentWindow.load_character_json(data.Item.character);
data.Item
        }
    });
    }
  });
}

function saveCharToDB(charToSave) {
  AWS.config.credentials.get(function(err) {
    if (!err) {
      var id = AWS.config.credentials.identityId;
      console.log('Cognito Identity ID '+ id);

      // Instantiate aws sdk service objects now that the credentials have been updated
      var docClient = new AWS.DynamoDB.DocumentClient({ region: AWS.config.region });
      var params = {
        TableName: 'Inara',
        Item:{userID:id, character:charToSave}
      };
      docClient.put(params, function(err, data) {
        if (err)
          console.error(err);
        else
          console.log(data);
      });
    }
  });
}

if (window.addEventListener) {
    window.addEventListener("message", onCharSheetMessage, false);
}
else if (window.attachEvent) {
    window.attachEvent("onmessage", onCharSheetMessage, false);
}

function onCharSheetMessage(event) {
    // Check sender origin to be trusted
    //if (event.origin !== "http://example.com") return;

    var data = event.data;

    if (typeof(window[data.func]) == "function") {
        window[data.func].call(null, data.message);
    }
}


function initS3() {

    var bucketName = _config.s3.bucketName;
    var bucketRegion = _config.s3.region;
    s3 = new AWS.S3({
        apiVersion: '2006-03-01',
        params: {Bucket: bucketName}
    });
}

function rolld20(dieRoll) {
    var toRoll = dieRoll.toRoll;
    var rollBonus = dieRoll.rollBonus;


}