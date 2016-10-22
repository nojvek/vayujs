let c = console;
let $ = (selector) => document.querySelector(selector);
const todos = [
    { completed: false, title: "wake up in morning" },
    { completed: true, title: "do work" },
    { completed: true, title: "create dom" },
    { completed: false, title: "do diffs" },
    { completed: false, title: "create delegated events tomorrow" }
];
let todoList = {
    todos,
    addTodo() {
        let todo = { title: this.newTodo };
        this.todos.push(todo);
        this.newTodo = "";
        return todo;
    },
    editTodo(todo) {
        todo.editing = true;
    },
    toggleComplete(todo) {
        todo.completed = !todo.completed;
    },
    deleteTodo(todo) {
        let index = this.todos.indexOf(todo);
        if (index)
            this.todos.splice();
    },
    render() {
        return Vayu.createElement("section", {class: "todoapp"}, 
            Vayu.createElement("header", {class: "header"}, 
                Vayu.createElement("h4", null, "todos"), 
                Vayu.createElement("input", {class: "new-todo", autofocus: true, autocomplete: "off", placeholder: "What needs to be done?", value: this.newTodo, "on-change": this.addTodo})), 
            Vayu.createElement("section", {class: "main", style: { display: (this.todos && this.todos.length) ? "block" : "none" }}, 
                Vayu.createElement("ul", {class: "todo-list"}, this.todos.map((todo) => Vayu.createElement("li", {class: { todo: true, completed: todo.completed, editing: todo.editing }}, 
                    Vayu.createElement("div", {class: "view"}, 
                        (!todo.editing) ?
                            Vayu.createElement("input", {class: "toggle", type: "checkbox", checked: todo.completed})
                            : null, 
                        Vayu.createElement("button", {class: "destroy", "on-click": () => this.deleteTodo(todo)}, "X"), 
                        todo.title, 
                        Vayu.createElement("div", {class: "iconBorder"}, 
                            Vayu.createElement("div", {class: "icon"})
                        ))
                )))
            ));
    }
};
let randomGrid = {
    size: 70,
    getRandomNumber() {
        //return "0";
        return Math.random() > 0.5 ? 1 : 0;
        //return Math.floor(Math.random() * 10).toString();
    },
    render() {
        return (Vayu.createElement("table", null, new Array(this.size).fill(0).map(() => Vayu.createElement("tr", null, new Array(this.size).fill(0).map(() => Vayu.createElement("td", {style: "border: 1px solid gray"}, this.getRandomNumber()))))));
    }
};
document.addEventListener('DOMContentLoaded', () => {
    Vayu.apply(document.body, randomGrid.render());
    requestAnimationFrame(function render() {
        Vayu.apply(document.body, randomGrid.render());
        requestAnimationFrame(render);
    });
});
//# sourceMappingURL=todo.js.map