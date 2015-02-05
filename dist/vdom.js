var VDOM;

VDOM = {
  elem: function(tagName, props, children) {
    if (!tagName || tagName === "") {
      throw new Error("tagName is empty string");
    }
    if (!children && props) {
      if (props.constructor === Array || props.constructor === String) {
        children = props;
        props = void 0;
      }
    }
    if (children && children.constructor === String) {
      children = [children];
    }
    return {
      tagName: tagName,
      props: props,
      children: children
    };
  },
  toDOM: function(vtree) {
    var child, childElem, doc, domElem, prop, value, _i, _len, _ref, _ref1;
    domElem = void 0;
    doc = document;
    if (vtree.constructor === String) {
      domElem = doc.createTextNode(vtree);
    } else if (vtree.constructor === Object) {
      domElem = doc.createElement(vtree.tagName);
      if (vtree.children) {
        _ref = vtree.children;
        for (_i = 0, _len = _ref.length; _i < _len; _i++) {
          child = _ref[_i];
          if (child) {
            childElem = VDOM.toDOM(child);
            domElem.appendChild(childElem);
          }
        }
      }
      if (vtree.props) {
        _ref1 = vtree.props;
        for (prop in _ref1) {
          value = _ref1[prop];
          if (value && value.constructor === String) {
            domElem.setAttribute(prop, value);
          }
        }
      }
    }
    return domElem;
  }
};
