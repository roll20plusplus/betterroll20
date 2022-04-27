
class CommandHistory {
  commands = [];
  index = 0;

  getIndex() {
    return this.index;
  }
  back(canvas) {
    action = false;
    console.log('Command History back (trying to undo an event)');
    if (this.index > 0) {
      console.log('rolling back state history');
      this.index = this.index-1
      let command = this.commands[this.index];
      command.undo(canvas);
    }
    action=true;
    return this;
  }
  forward(canvas) {
    action = false;
    console.log('Command History forward (trying to redo an event)');
    if (this.index < this.commands.length) {
      console.log('Redoing event');
      let command = this.commands[this.index];
      this.index = this.index+1
      command.execute(canvas);
    }
    action = true;
    return this;
  }
  add(command) {
    if (this.commands.length) {
      this.commands.splice(this.index, this.commands.length - this.index);
    }
    this.commands.push(command);
    this.index++;
    return this;
  }
  clear() {
    this.commands.length = 0;
    this.index = 0;
    return this;
  }
}

// use when you init your Canvas, like this.history = new CommandHistory();

class AddCommand {
  constructor(receiver) {
    this.receiver = receiver;
  }
  execute(canvas) {
    console.log('redoing add command');
    canvas.add(this.receiver.target);
  }
  undo(canvas) {
    console.log('Undoing add command');
    canvas.getObjects().forEach((obj) => {
        console.log(this.receiver.target.translationX == obj.translationX && this.receiver.target.translationY == obj.translationY);
          if(this.receiver.target == obj) {
            console.log(obj);
            console.log(canvas.remove(obj));
        }
    });
  }
}

// When you will add object on your canvas invoke also this.history.add(new AddCommand(object, controller))

class RemoveCommand {
  constructor(receiver) {
    this.receiver = receiver;
  }
  execute(canvas) {
    canvas.getObjects().forEach((obj) => {
        console.log(this.receiver.target.translationX == obj.translationX && this.receiver.target.translationY == obj.translationY);
          if(this.receiver.target == obj) {
//        if(obj.selectable && this.receiver.target.translationX == obj.translationX && this.receiver.target.translationY == obj.translationY) {
            console.log(obj);
            console.log(canvas.remove(obj));
        }
    });
  }
  undo(canvas) {
    canvas.add(this.receiver.target);
  }
}

class TransformCommand {
  constructor(receiver) {
    this.receiver = receiver;
    this.original = this.receiver.transform.original;
    this.transform = {};
    console.log(Object.entries(this.original));
    for (const [key, value] of Object.entries(this.original)) {
        this.transform[key] = this.receiver.target[key];
    }
    console.log(this.original);
    console.log(this.transform);
  }
  execute(canvas) {
    canvas.getObjects().forEach((obj) => {
        console.log(this.original.left == obj.left && this.original.top == obj.top);
          if(this.original.left == obj.left && this.original.top == obj.top) {
            console.log("Found the matching item")
            for (const [key, value] of Object.entries(this.transform)) {
                console.log("Changing attribute " + key + " to value " + value);
                obj.set(key, value);
            }
        }
    });
  }
  undo(canvas) {
    canvas.getObjects().forEach((obj) => {
//        console.log(this.receiver.target.translationX == obj.translationX && this.receiver.target.translationY == obj.translationY);
          if(this.transform.left == obj.left && this.transform.top == obj.top) {
            console.log("Found the matching item")
            console.log(Object.entries(this.original));
            for (const [key, value] of Object.entries(this.original)) {
                console.log("Changing attribute " + key + " to value " + value);
                obj.set(key, value);
            }
        }
    });
  }
}