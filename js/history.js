
class CommandHistory {
  commands = [];
  index = 0;

  getIndex() {
    return this.index;
  }
  back() {
    action = false;
    console.log('Command History back (trying to undo an event)');
    if (this.index > 0) {
      console.log('rolling back state history');
      this.index = this.index-1
      let command = this.commands[this.index];
      command.undo();
    }
    action=true;
    return this;
  }
  forward() {
    action = false;
    console.log('Command History forward (trying to redo an event)');
    if (this.index < this.commands.length) {
      console.log('Redoing event');
      let command = this.commands[this.index];
      this.index = this.index+1
      command.execute();
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
  constructor(receiver, controller) {
    this.receiver = receiver;
    this.controller = controller;
  }
  execute() {
    console.log('redoing add command');
    this.controller.add(this.receiver.target);
  }
  undo() {
    console.log('Undoing add command');
    this.controller.getObjects().forEach((obj) => {
        console.log(this.receiver.target.translationX == obj.translationX && this.receiver.target.translationY == obj.translationY);

        if(obj.selectable && this.receiver.target.translationX == obj.translationX && this.receiver.target.translationY == obj.translationY) {
            console.log(obj);
            console.log(this.controller.remove(obj));
        }
        // canvas.remove(obj)
    });
    // console.log(this.receiver);
    // canvas.remove(this.receiver);
  }
}

// When you will add object on your canvas invoke also this.history.add(new AddCommand(object, controller))

class RemoveCommand {
  constructor(receiver, controller) {
    this.receiver = receiver;
    this.controller = controller;
  }
  execute() {
    this.controller.getObjects().forEach((obj) => {
        console.log(this.receiver.target.translationX == obj.translationX && this.receiver.target.translationY == obj.translationY);

        if(obj.selectable && this.receiver.target.translationX == obj.translationX && this.receiver.target.translationY == obj.translationY) {
            console.log(obj);
            console.log(this.controller.remove(obj));
        }
        // canvas.remove(obj)
    });  
  }
  undo() {
    this.controller.add(this.receiver.target);
  }
}

class TransformCommand {
  constructor(receiver, options = {}) {
    this.receiver = receiver;
    this._initStateProperties(options);

    this.state = {};
    this.prevState = {};

    this._saveState();
    this._savePrevState();
  }
  execute() {
    this._restoreState();
    this.receiver.setCoords();
  }
  undo() {
    this._restorePrevState();
    this.receiver.setCoords();
  }
  // private
  _initStateProperties(options) {
    this.stateProperties = this.receiver.stateProperties;
    if (options.stateProperties && options.stateProperties.length) {
      this.stateProperties.push(...options.stateProperties);
    }
  }
  _restoreState() {
    this._restore(this.state);
  }
  _restorePrevState() {
    this._restore(this.prevState);
  }
  _restore(state) {
    this.stateProperties.forEach((prop) => {
      this.receiver.set(prop, state[prop]);
    });
  }
  _saveState() {
    this.stateProperties.forEach((prop) => {
      this.state[prop] = this.receiver.get(prop);
    });
  }
  _savePrevState() {
    if (this.receiver._stateProperties) {
      this.stateProperties.forEach((prop) => {
        this.prevState[prop] = this.receiver._stateProperties[prop];
      });
    }
  }
}