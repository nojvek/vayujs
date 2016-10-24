
let c = console;
let $ = (selector: string) => document.querySelector(selector);

interface Todo {
    title: string;
    completed: boolean;
    editing?: boolean;
}

const todoList: Todo[] = [
    { completed: false, title: "wake up in morning" },
    { completed: true, title: "do work" },
    { completed: true, title: "create dom" },
    { completed: false, title: "do diffs" },
    { completed: false, title: "create delegated events tomorrow" }
]

/**
 * View Model acts like a store.
 * Its the only place where state is mutated and changed
 * When any mutator function is called, it will re-render the bound view.
 */
class TodoViewModel {
    private _todos: Todo[];
    private _newTodo = "";

    constructor() {
        this._todos = todoList;
    }

    get todos(): Todo[] {
        return this._todos;
    }

    get newTodo(): string {
        return this._newTodo;
    }

    set newTodo(value: string) {
        this._newTodo = value;
    }

    addTodo() {
        const todo = { title: this._newTodo, completed: false }
        this._todos.push(todo)
        this._newTodo = ""
        return todo;
    }

    toggleComplete(todo: Todo) {
        todo.completed = !todo.completed
    }

    deleteTodo(todo: Todo) {
        let index = this._todos.indexOf(todo);
        if (index) this._todos.splice(index);
    }
}

namespace TodoView {
    const TodoItem = (p: {todo: Todo, vm: TodoViewModel}) => {
        const {todo,vm} = p;
        <li class={{ todo: true, completed: p.todo.completed, editing: p.todo.editing }}>
            <div class="view">
                {(!todo.editing) ?
                    <input class="toggle" type="checkbox" checked={todo.completed}></input>
                    : null
                }
                <button class="destroy" on-click={() => vm.deleteTodo(todo) }>X</button>
                {todo.title}
                <div class="iconBorder">
                    <div class="icon"/>
                </div>
            </div>
        </li>
    }

    export const render = (vm: TodoViewModel) =>
        <section class="todoapp">
            <header class="header">
                <h4>Todos</h4>
                <input class="new-todo" autofocus autocomplete="off" placeholder="What needs to be done?" value={vm.newTodo} on-change={(e:any) => vm.newTodo =  e.target.value} />
            </header>
            <section class="main" style={{ display: (vm.todos && vm.todos.length) ? "block" : "none" }}>
                <ul class="todo-list">
                    {vm.todos.map((todo: Todo) => <TodoItem todo={todo} vm={vm} />)}
                </ul>
            </section>
        </section>
}

let randomGrid = {
    size: 70,
    getRandomNumber() {
        //return "0";
        return Math.random() > 0.999 ? 1 : 0
        //return Math.floor(Math.random() * 10).toString();
    },
    render() {
        return (
            <table>
                {new Array(this.size).fill(0).map(() =>
                    <tr>
                        {new Array(this.size).fill(0).map(() =>
                            <td style="border: 1px solid gray">{ this.getRandomNumber() }</td>
                        ) }
                    </tr>
                ) }
            </table>
        )
    }
}

document.addEventListener('DOMContentLoaded', () => {
    Vayu.render(document.body, randomGrid.render())
    requestAnimationFrame(function render() {
        Vayu.render(document.body, randomGrid.render());
        requestAnimationFrame(render);
    })
})