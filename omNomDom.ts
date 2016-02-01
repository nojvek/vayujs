namespace OmNomDom {
    export function createElement(name:string, attrs:any){
        let children = null
        const restIndex = 2
        const argLen = arguments.length

        // consume children as rest param
        // convert arrays as part of children
        // convert numbers/booleans to strings
        if (argLen > 2) {
            // preallocate children for perf
            children = new Array(argLen - restIndex)
            let childIndex = 0

            for (let i = 2; i < argLen; i++) {
                let child = arguments[i]
                if (child !== undefined && child !== null) {
                    let type = typeof child
                    if (child instanceof Array){
                        for (let j = 0, n = child.length; j < n; j++) {
                            children[childIndex] = child[j];
                            childIndex++
                        }
                    }
                    else if (child instanceof Object) {
                        children[childIndex] = child
                        childIndex++
                    }
                    else {
                        children[childIndex] = child.toString()
                        childIndex++
                    }
                }

            }
        }

        return {name, attrs, children}
    }

    export function toDom(vtree){
        let {name, attrs, children} = vtree
        let element = document.createElement(name)

        if (attrs) {
            for (let attrName in attrs) {
                let attrValue = attrs[attrName]
                if (attrValue instanceof Array) {
                    element.setAttribute(attrName, attrValue.join(" "))
                }
                else if (attrValue instanceof Object) {
                    // if attrName is classlist, copy to classList property
                    // we can efficiently diff and apply if its left as an object
                    // for others convert it to a string
                    //values = []
                }
                else if (typeof attrValue === "string") {
                    element.setAttribute(attrName, attrValue)
                }

                // for booleans, if true then value is attrName
            }
        }

        if (children) {
            for (let child of children) {
                if (child) {
                    if (typeof child === "string") {
                        element.appendChild(document.createTextNode(child))
                    }
                    else {
                        element.appendChild(toDom(child))
                    }
                }

            }
        }

        return element
    }

    export function mount(element:Element, app) {
        if (!element) throw new Error("element is undefined or null")
        let vtree = app.render()
        let domElem = toDom(vtree)
        app.vtree = vtree;
        let child;
        while (child = element.firstChild) element.removeChild(child); // remove all children
        element.appendChild(domElem);
    }
}

let tree = {
    name: "table",
    attrs: {
        class: "selected",
        style: {
            border: "1px solid red"
        }
    },


}