c = console
e = VDOM.elem
doc = document




class TodoList
	constructor: (@list) -> 

	addTodo: ->

	render: ->
		e('div', [
			e('ul', @list.map((item) -> e("li",[item]))) ,
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