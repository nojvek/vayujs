var c = console;
var $ = function (selector) { return document.querySelector(selector); };
var todos = [
    { completed: false, title: "wake up in morning" },
    { completed: true, title: "do work" },
    { completed: true, title: "create dom" },
    { completed: false, title: "do diffs" },
    { completed: false, title: "create delegated events tomorrow" }
];
var todoList = {
    todos: todos,
    addTodo: function () {
        var todo = { title: this.newTodo };
        this.todos.push(todo);
        this.newTodo = "";
        return todo;
    },
    editTodo: function (todo) {
        todo.editing = true;
    },
    toggleComplete: function (todo) {
        todo.complete = !todo.complete;
    },
    deleteTodo: function (todo) {
        var index = this.todos.indexOf(todo);
        if (index)
            this.todos.splice();
    },
    render: function () {
        var _this = this;
        return OmNomDom.createElement("section", {class: "todoapp"}, 
            OmNomDom.createElement("header", {class: "header"}, 
                OmNomDom.createElement("h4", null, "todos"), 
                OmNomDom.createElement("input", {class: "new-todo", autofocus: true, autocomplete: "off", placeholder: "What needs to be done?", value: this.newTodo, "on-change": this.addTodo})), 
            OmNomDom.createElement("section", {class: "main", style: { display: (this.todos && this.todos.length) ? "block" : "none" }}, 
                OmNomDom.createElement("ul", {class: "todo-list"}, this.todos.map(function (todo) {
                    return OmNomDom.createElement("li", {class: { todo: true, completed: todo.completed, editing: todo.editing }}, 
                        OmNomDom.createElement("div", {class: "view"}, 
                            (!todo.editing) ?
                                OmNomDom.createElement("input", {class: "toggle", type: "checkbox", checked: todo.completed})
                                : null, 
                            OmNomDom.createElement("button", {class: "destroy", "on-click": function () { return _this.deleteTodo(todo); }}, "X"), 
                            todo.title, 
                            OmNomDom.createElement("div", {class: "iconBorder"}, 
                                OmNomDom.createElement("div", {class: "icon"})
                            ))
                    );
                }))
            ));
    }
};
var randomGrid = {
    getRandomNumber: function () {
        return Math.floor(Math.random() * 10);
    },
    render: function () {
        var _this = this;
        return (OmNomDom.createElement("table", null, Array(2).fill().map(function () {
            return OmNomDom.createElement("tr", null, Array(2).fill().map(function () {
                return OmNomDom.createElement("td", {style: "border: 1px solid gray"}, _this.getRandomNumber());
            }));
        })));
    }
};
document.addEventListener('DOMContentLoaded', function () {
    requestAnimationFrame(function render() {
        OmNomDom.mount($("body"), randomGrid);
        //requestAnimationFrame(render);
    });
});
var treeA = {
    "name": "table",
    "attrs": null,
    "children": [
        {
            "name": "tr",
            "attrs": null,
            "children": [
                {
                    "name": "td",
                    "attrs": {
                        "style": "border: 1px solid gray"
                    },
                    "children": [
                        "8"
                    ]
                },
                {
                    "name": "td",
                    "attrs": {
                        "style": "border: 1px solid gray"
                    },
                    "children": [
                        "5"
                    ]
                }
            ]
        },
        {
            "name": "tr",
            "attrs": null,
            "children": [
                {
                    "name": "td",
                    "attrs": {
                        "style": "border: 1px solid gray"
                    },
                    "children": [
                        "8"
                    ]
                },
                {
                    "name": "td",
                    "attrs": {
                        "style": "border: 1px solid gray"
                    },
                    "children": [
                        "5"
                    ]
                }
            ]
        }
    ]
};
//let rootElem = vdom.toDom(vtree);
var treeB = {
    "name": "table",
    "attrs": null,
    "children": [
        {
            "name": "tr",
            "attrs": null,
            "children": [
                {
                    "name": "td",
                    "attrs": {
                        "style": "border: 1px solid gray"
                    },
                    "children": [
                        "4"
                    ]
                },
                {
                    "name": "td",
                    "attrs": {
                        "style": "border: 1px solid gray"
                    },
                    "children": [
                        "8"
                    ]
                }
            ]
        },
        {
            "name": "tr",
            "attrs": null,
            "children": [
                {
                    "name": "td",
                    "attrs": {
                        "style": "border: 1px solid gray"
                    },
                    "children": [
                        "4"
                    ]
                },
                {
                    "name": "td",
                    "attrs": {
                        "style": "border: 1px solid gray"
                    },
                    "children": [
                        "3"
                    ]
                }
            ]
        }
    ]
};
