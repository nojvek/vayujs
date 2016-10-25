let c = console;
let $ = (selector) => document.querySelector(selector);
const todoList = [
    { completed: false, title: "wake up in morning" },
    { completed: true, title: "do work" },
    { completed: true, title: "create dom" },
    { completed: false, title: "do diffs" },
    { completed: false, title: "create delegated events tomorrow" }
];
/**
 * View Model acts like a store.
 * Its the only place where state is mutated and changed
 * When any mutator function is called, it will re-render the bound view.
 */
class TodoViewModel {
    constructor() {
        this._newTodo = "";
        this._todos = todoList;
    }
    get todos() {
        return this._todos;
    }
    get newTodo() {
        return this._newTodo;
    }
    set newTodo(value) {
        this._newTodo = value;
    }
    addTodo() {
        const todo = { title: this._newTodo, completed: false };
        this._todos.push(todo);
        this._newTodo = "";
        return todo;
    }
    toggleComplete(todo) {
        todo.completed = !todo.completed;
    }
    deleteTodo(todo) {
        let index = this._todos.indexOf(todo);
        if (index)
            this._todos.splice(index);
    }
}
var TodoView;
(function (TodoView) {
    const TodoItem = (p) => {
        const { todo, vm } = p;
        Vayu.createElement("li", {class: { todo: true, completed: p.todo.completed, editing: p.todo.editing }}, 
            Vayu.createElement("div", {class: "view"}, 
                (!todo.editing) ?
                    Vayu.createElement("input", {class: "toggle", type: "checkbox", checked: todo.completed})
                    : null, 
                Vayu.createElement("button", {class: "destroy", "on-click": () => vm.deleteTodo(todo)}, "X"), 
                todo.title, 
                Vayu.createElement("div", {class: "iconBorder"}, 
                    Vayu.createElement("div", {class: "icon"})
                ))
        );
    };
    TodoView.render = (vm) => Vayu.createElement("section", {class: "todoapp"}, 
        Vayu.createElement("header", {class: "header"}, 
            Vayu.createElement("h4", null, "Todos"), 
            Vayu.createElement("input", {class: "new-todo", autofocus: true, autocomplete: "off", placeholder: "What needs to be done?", value: vm.newTodo, "on-change": (e) => vm.newTodo = e.target.value})), 
        Vayu.createElement("section", {class: "main", style: { display: (vm.todos && vm.todos.length) ? "block" : "none" }}, 
            Vayu.createElement("ul", {class: "todo-list"}, vm.todos.map((todo) => Vayu.createElement(TodoItem, {todo: todo, vm: vm})))
        ));
})(TodoView || (TodoView = {}));
let randomGrid = {
    size: 20,
    getRandomNumber() {
        //return "0";
        return Math.random() > 0.9 ? 1 : 0;
        //return Math.floor(Math.random() * 10).toString();
    },
    render() {
        return (Vayu.createElement("table", null, new Array(Math.ceil(Math.random() * this.size)).fill(0).map(() => Vayu.createElement("tr", null, new Array(this.size).fill(0).map(() => Vayu.createElement("td", {style: "border: 1px solid gray"}, this.getRandomNumber()))))));
    }
};
document.addEventListener('DOMContentLoaded', () => {
    Vayu.render(document.body, randomGrid.render());
    requestAnimationFrame(function render() {
        Vayu.render(document.body, randomGrid.render());
        requestAnimationFrame(render);
    });
});
//# sourceMappingURL=todo.js.map