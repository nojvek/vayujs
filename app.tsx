
let c = console;
let $ = selector => document.querySelector(selector);


let todos = [
	{completed: false, title: "wake up in morning"},
	{completed: true, title: "do work"},
	{completed: true, title: "create dom"},
	{completed: false, title: "do diffs"},
	{completed: false, title: "create delegated events tomorrow"}
]

let todoList = {
	todos,
	addTodo(){
		let todo = {title: this.newTodo}
		this.todos.push(todo)
		this.newTodo = ""
		return todo;
	},
	editTodo(todo){
		todo.editing = true
	},
	toggleComplete(todo){
		todo.complete = !todo.complete
	},
	deleteTodo(todo){
		let index = this.todos.indexOf(todo);
		if (index) this.todos.splice();
	},
    render(){
        return <section class="todoapp">
            <header class="header">
                <h4>todos</h4>
                <input class="new-todo" autofocus autocomplete="off" placeholder="What needs to be done?" value={this.newTodo} on-change={this.addTodo} />
            </header>
            <section class="main" style={{display:(this.todos && this.todos.length) ? "block" : "none"}}>
                <ul class="todo-list">
                    {this.todos.map((todo) =>
                        <li class={{todo: true, completed: todo.completed, editing: todo.editing}}>
                            <div class="view">
                                {(!todo.editing) ?
                                    <input class="toggle" type="checkbox" checked={todo.completed}></input>
                                    : null
                                }
                                <button class="destroy" on-click={() => this.deleteTodo(todo)}>X</button>
                                {todo.title}
                                <div class="iconBorder">
                                    <div class="icon"/>
                                </div>
                            </div>
                        </li>
                    )}
                </ul>
            </section>
        </section>
    }

}

let randomGrid = {
    size: 10,
    getRandomNumber(){
        return Math.floor(Math.random() * 10)
    },
    render(){
        return (
            <table>
            {Array(this.size).fill().map(() =>
                <tr>
                {Array(this.size).fill().map(()=>
                    <td style="border: 1px solid gray">{this.getRandomNumber()}</td>
                )}
                </tr>
            )}
            </table>
        )
    }
}

document.addEventListener('DOMContentLoaded', ()=>{
    requestAnimationFrame(function render(){
        OmNomDom.mount($("body"), randomGrid)
        //requestAnimationFrame(render);
    })
})


let treeA = {
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
}



//let rootElem = vdom.toDom(vtree);

let treeB = {
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
}

/*
 object (attrs)
 for keys in new
 if not in old
  //add attr
 if in old and not same value
  // change attr

  for remainingKeys in old
    // remove Attr

  if newName isnt oldName
    // replace



*/