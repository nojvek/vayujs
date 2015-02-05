var TodoList, c, doc, e;

c = console;

e = VDOM.elem;

doc = document;

TodoList = (function() {
  function TodoList(list) {
    this.list = list;
  }

  TodoList.prototype.addTodo = function() {};

  TodoList.prototype.render = function() {
    return e('div', [
      e('ul', this.list.map(function(item) {
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

})();

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
