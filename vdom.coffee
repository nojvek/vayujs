
VDOM = 
	elem: (tagName, props, children) ->
		if !tagName or tagName == ""
			throw new Error "tagName is empty string"
		
		if !children and props
			if props.constructor == Array or props.constructor == String
				children = props
				props = undefined
		
		if children and children.constructor == String
			children = [children]	
		
		return {tagName:tagName, props:props, children:children}

	toDOM: (vtree) ->
		domElem = undefined
		doc = document

		if vtree.constructor == String
			domElem = doc.createTextNode(vtree)

		else if vtree.constructor == Object
			domElem = doc.createElement(vtree.tagName)

			if vtree.children
				for child in vtree.children
					if child
						childElem = VDOM.toDOM(child)
						domElem.appendChild(childElem)

			if vtree.props
				for prop, value of vtree.props
					if value and value.constructor == String
						domElem.setAttribute(prop, value)

		return domElem

	mount: (component, domElem) ->
		component.setState(component.getInitialState())
		tree = component.renderTree()
		domElem = VDOM.toDOM(tree)
		console.log("domElem", domElem)
		$(domElem).empty().append(domElem)


class VComponent
	constructor: ->
		@isDirty = false;
		@state = {};
		@oldTree = {}
		@newTree = {}
		@element = undefined

	initialize: ->
		@state = @getInitialState()

	setState: (newState) ->
		$.extend(@state, newState);
		@isDirty = true;

	#Component functions

	getInitialState: ->
		return {}

	render: ->

