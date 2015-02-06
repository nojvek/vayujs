(function() {
  var TodoList, c, doc, e,
    __hasProp = {}.hasOwnProperty,
    __extends = function(child, parent) { for (var key in parent) { if (__hasProp.call(parent, key)) child[key] = parent[key]; } function ctor() { this.constructor = child; } ctor.prototype = parent.prototype; child.prototype = new ctor(); child.__super__ = parent.prototype; return child; };

  c = console;

  e = VDOM.elem;

  doc = document;

  TodoList = (function(_super) {
    __extends(TodoList, _super);

    function TodoList(list) {
      this.list = list;
    }

    TodoList.prototype.getInitialState = function() {
      return {
        todos: this.list
      };
    };

    TodoList.prototype.addTodo = function() {
      return this.setState({
        todos: this.list.push(this.refs.todoInput.value)
      });
    };

    TodoList.prototype.render = function(state) {
      return e('div', [
        e('ul', this.state.todos.map(function(item) {
          return e("li", [item]);
        })), e('input', {
          ref: 'todoInput',
          placeholder: 'Enter Todo'
        }), e('button', {
          'on-click': 'addTodo'
        }, 'Add Todo')
      ]);
    };

    return TodoList;

  })(VComponent);

  $(function() {
    var domElem, list, todoList, tree;
    list = ['Hello', 'World', 'This', 'is', 'a', 'list'];
    todoList = new TodoList(list);
    tree = todoList.render();
    domElem = VDOM.toDOM(tree);
    console.log("domElem", domElem);
    $("#container").empty().append(domElem);
    return c.log('tree', tree);
  });

}).call(this);
