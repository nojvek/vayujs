
let c = console;
let $ = (selector: string) => document.querySelector(selector);

interface Todo {
    title: string;
    completed: boolean;
    editing?: boolean;
}

const todos: Todo[] = [
    { completed: false, title: "wake up in morning" },
    { completed: true, title: "do work" },
    { completed: true, title: "create dom" },
    { completed: false, title: "do diffs" },
    { completed: false, title: "create delegated events tomorrow" }
]

let todoList = {
    todos,
    addTodo() {
        let todo = { title: this.newTodo }
        this.todos.push(todo)
        this.newTodo = ""
        return todo;
    },
    editTodo(todo: Todo) {
        todo.editing = true
    },
    toggleComplete(todo: Todo) {
        todo.completed = !todo.completed
    },
    deleteTodo(todo: Todo) {
        let index = this.todos.indexOf(todo);
        if (index) this.todos.splice();
    },
    render() {
        return <section class="todoapp">
            <header class="header">
                <h4>todos</h4>
                <input class="new-todo" autofocus autocomplete="off" placeholder="What needs to be done?" value={this.newTodo} on-change={this.addTodo} />
            </header>
            <section class="main" style={{ display: (this.todos && this.todos.length) ? "block" : "none" }}>
                <ul class="todo-list">
                    {this.todos.map((todo: Todo) =>
                        <li class={{ todo: true, completed: todo.completed, editing: todo.editing }}>
                            <div class="view">
                                {(!todo.editing) ?
                                    <input class="toggle" type="checkbox" checked={todo.completed}></input>
                                    : null
                                }
                                <button class="destroy" on-click={() => this.deleteTodo(todo) }>X</button>
                                {todo.title}
                                <div class="iconBorder">
                                    <div class="icon"/>
                                </div>
                            </div>
                        </li>
                    ) }
                </ul>
            </section>
        </section>
    }

}

let randomGrid = {
    size: 70,
    getRandomNumber() {
        //return "0";
        return Math.random() > 0.5 ? 1 : 0
        //return Math.floor(Math.random() * 10).toString();
    },
    render() {
        return (
            <table>
                {new Array(this.size).fill(0).map(() =>
                    <tr>
                        {new Array(this.size).fill(0).map(() =>
                            <td style="border: 1px solid gray">{this.getRandomNumber() }</td>
                        ) }
                    </tr>
                ) }
            </table>
        )
    }
}

document.addEventListener('DOMContentLoaded', () => {
    Vayu.apply(document.body, randomGrid.render())
    requestAnimationFrame(function render() {
        Vayu.apply(document.body, randomGrid.render());
        requestAnimationFrame(render);
    })
})