var OmNomDom;
(function (OmNomDom) {
    function createElement(name, attrs) {
        var children = null;
        var restIndex = 2;
        var argLen = arguments.length;
        // consume children as rest param
        // convert arrays as part of children
        // convert numbers/booleans to strings
        if (argLen > 2) {
            // preallocate children for perf
            children = new Array(argLen - restIndex);
            var childIndex = 0;
            for (var i = 2; i < argLen; i++) {
                var child = arguments[i];
                if (child !== undefined && child !== null) {
                    var type = typeof child;
                    if (child instanceof Array) {
                        for (var j = 0, n = child.length; j < n; j++) {
                            children[childIndex] = child[j];
                            childIndex++;
                        }
                    }
                    else if (child instanceof Object) {
                        children[childIndex] = child;
                        childIndex++;
                    }
                    else {
                        children[childIndex] = child.toString();
                        childIndex++;
                    }
                }
            }
        }
        return { name: name, attrs: attrs, children: children };
    }
    OmNomDom.createElement = createElement;
    function toDom(vtree) {
        var name = vtree.name, attrs = vtree.attrs, children = vtree.children;
        var element = document.createElement(name);
        element.vtree = vtree;
        if (attrs) {
            for (var attrName in attrs) {
                var attrValue = attrs[attrName];
                if (attrValue instanceof Array) {
                    element.setAttribute(attrName, attrValue.join(" "));
                }
                else if (attrValue instanceof Object) {
                }
                else if (typeof attrValue === "string") {
                    element.setAttribute(attrName, attrValue);
                }
            }
        }
        if (children) {
            for (var _i = 0, children_1 = children; _i < children_1.length; _i++) {
                var child = children_1[_i];
                if (child) {
                    if (typeof child === "string") {
                        element.appendChild(document.createTextNode(child));
                    }
                    else {
                        element.appendChild(toDom(child));
                    }
                }
            }
        }
        return element;
    }
    OmNomDom.toDom = toDom;
    function mount(element, app) {
        if (!element)
            throw new Error("element is undefined or null");
        var vtree = app.render();
        var domElem = toDom(vtree);
        app.vtree = vtree;
        var child;
        while (child = element.firstChild)
            element.removeChild(child); // remove all children
        element.appendChild(domElem);
    }
    OmNomDom.mount = mount;
})(OmNomDom || (OmNomDom = {}));
var tree = {
    name: "table",
    attrs: {
        class: "selected",
        style: {
            border: "1px solid red"
        }
    }
};
