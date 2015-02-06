c = console
e = VDOM.elem
doc = document



class TodoList extends VComponent
	constructor: (@list) ->

	getInitialState: ->
		todos: @list

	addTodo: ->
		@setState(todos: @list.push(@refs.todoInput.value))

	render: (state) ->
		e('div', [
			e('ul', @state.todos.map((item) -> e("li",[item]))) ,
			e('input', {ref:'todoInput', placeholder:'Enter Todo'}),
			e('button',{'on-click':'addTodo'}, 'Add Todo')
		])


$ ->
	list = ['Hello', 'World', 'This', 'is', 'a', 'list']
	todoList = new TodoList(list)
	tree = todoList.render()
	domElem = VDOM.toDOM(tree)
	console.log("domElem", domElem)
	$("#container").empty().append(domElem)
	c.log 'tree', tree