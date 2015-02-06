(function() {
  var VComponent, VDOM;

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
    },
    mount: function(component, domElem) {
      var tree;
      component.setState(component.getInitialState());
      tree = component.renderTree();
      domElem = VDOM.toDOM(tree);
      console.log("domElem", domElem);
      return $(domElem).empty().append(domElem);
    }
  };

  VComponent = (function() {
    function VComponent() {
      this.isDirty = false;
      this.state = {};
      this.oldTree = {};
      this.newTree = {};
      this.element = void 0;
    }

    VComponent.prototype.initialize = function() {
      return this.state = this.getInitialState();
    };

    VComponent.prototype.setState = function(newState) {
      $.extend(this.state, newState);
      return this.isDirty = true;
    };

    VComponent.prototype.getInitialState = function() {
      return {};
    };

    VComponent.prototype.render = function() {};

    return VComponent;

  })();

}).call(this);
