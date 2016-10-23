declare namespace JSX {
    interface Element extends Vayu.VElementNode { }
    interface IntrinsicElements {
        [name: string]: any;
    }
}

namespace Vayu {
    const INIT_HASH = 5381;

    const enum NodeType {
        Element = 1,
        Text = 3
    }

    export interface VBaseNode {
        type: NodeType;
        hash: number;
        dom: DomNode;
    }

    export interface VTextNode extends VBaseNode {
        type: NodeType.Text;
        text: string;
    }

    export interface VElementNode extends VBaseNode {
        type: NodeType.Element;
        name: string;
        attrs?: any;
        children?: VNode[];
        key?: string;
    }

    export interface Attrs {
        [attr: string]: any;
    }

    export type VNode = VElementNode | VTextNode;

    // Extensions on Dom
    type DomElement = Element;

    interface DomNode extends Node {
        vnode?: VNode;
    }

    /**
     * The main function that translates JSX into VNode's
     */
    export function createElement(name: string | Function, attrs: Attrs): VNode {
        const restIndex = 2;
        const argLen = arguments.length;
        let children: VNode[] = null;
        let key: string = null;
        let hash = 5381; // See djb2 hash - http://www.cse.yorku.ca/~oz/hash.html

        // Flatten arrays inside children to be a single array
        if (argLen > restIndex) {
            children = new Array(argLen - restIndex); // preallocate for perf
            for (let i = restIndex, childIndex = 0; i < argLen; i++) {
                let child = arguments[i];
                if (child instanceof Array) {
                    for (let j = 0, n = child.length; j < n; j++) {
                        let arrChild = child[j];
                        if (hasValue(arrChild)) {
                            const childNode = normalizeNode(arrChild);
                            children[childIndex++] = childNode;
                            hash = updateHashNum(hash, childNode.hash);
                        }
                    }
                }
                else if (hasValue(child)) {
                    const childNode = normalizeNode(child);
                    children[childIndex++] = childNode;
                    hash = updateHashNum(hash, childNode.hash);
                }
            }
        }

        if (typeof name === "string") {
            hash = updateHashStr(hash, name);
            if (attrs) {
                for (let attrName of Object.keys(attrs)) {
                    let attrValue = attrs[attrName];
                    if (hasValue(attrValue)) {
                        attrs[attrName] = attrValue = normalizeAttr(attrName, attrValue);
                        updateHashStr(hash, attrName);
                        updateHashStr(hash, attrValue);

                        if (attrName === "key") {
                            key = attrValue;
                        }
                    }
                }
            }

            return { type: NodeType.Element, name, hash, attrs, key, children, dom: null };
        }
        else if (typeof name === "function") {
            return name(attrs, children); // Stateless component
        }

        throw new Error(`unrecognized node name:${name}`);
    }

    function createTextNode(text: string): VTextNode {
        return { type: NodeType.Text, text: text, hash: updateHashStr(INIT_HASH, text), dom: null };
    }

    function hasValue(val: any): boolean {
        return (val !== null && val !== void 0);
    }

    function normalizeAttr(attrName: string, attrValue: any): string {
        const valueType = typeof attrValue;
        switch(typeof attrValue) {
            case "string":
                return attrValue;
            case "number":
                return attrValue.toString();
            case "boolean":
                return attrValue ? attrName : "";
            default:
                throw new Error(`attrType ${valueType} is not supported`);
        }
    }

    function normalizeNode(node: any): VNode {
        switch (typeof node) {
            case "object":
                if (node.type == NodeType.Element) {
                    return node
                }
                break;

            case "string":
                return createTextNode(node);

            case "boolean":
            case "number":
                return createTextNode(node.toString());
        }

        throw Error("Invalid node type: " + typeof node);
    }


    function updateHashStr(hash: number, str: string): number {
        for (let i = str.length; i; hash = (hash * 33) ^ str.charCodeAt(--i));
        return hash;
    }

    function updateHashNum(hash: number, num: number): number {
        return (hash * 33) ^ num;
    }


    export function apply(elem: DomElement, node: VNode) {
        //console.log(toHtml(node));
        //console.log(node);
        patchElem(elem, elem.firstElementChild, node);
    }

    export function toHtml(vnode: VNode, indent = 0): string {
        if (!vnode) return "";

        if (vnode.type == NodeType.Text) {
            return vnode.text;
        }

        let indentStr = (<any>"  ").repeat(indent);
        let str = `${indentStr}<${vnode.name}`;

        if (vnode.attrs) {
            str += Object.keys(vnode.attrs).map(attr => ` ${attr}="${vnode.attrs[attr]}"`).join("");
        }

        if (vnode.children && vnode.children.length) {
            str += ">" + vnode.children.map(child => toHtml(child, indent + 1)).join("\n");
            str += `\n${indentStr}</${vnode.name}>`;
        }
        else {
            str += `/>`;
        }

        return str;
    }

    export function fromDomNode(domNode: DomNode): VNode {
        const name = domNode.nodeName.toLowerCase();
        const attrs: Attrs = {};
        const children: VNode[] = [];
        let key: string = undefined;
        let hash = INIT_HASH;

        hash = updateHashStr(hash, name);

        for (let i = 0, attributes = domNode.attributes, len = attributes.length; i < len; ++i) {
            const elemAttr = attributes[i];
            attrs[elemAttr.name] = elemAttr.value;
            hash = updateHashStr(hash, elemAttr.name)
            hash = updateHashStr(hash, elemAttr.value)
        }

        if (attrs["key"])
            key = attrs["key"];

        for (let i = 0, childNodes = domNode.childNodes, len = childNodes.length; i < len; ++i) {
            const childNode = childNodes[i];
            const nodeType = childNode.nodeType;
            let vnode: VNode;

            if (nodeType === NodeType.Element) {
                vnode = fromDomNode(<DomNode>childNode);
            }
            else if (nodeType === NodeType.Text) {
                vnode = createTextNode(childNode.nodeValue);
            }

            if (vnode) {
                hash = updateHashNum(hash, vnode.hash);
                children.push(vnode);
            }
        }

        return { type: NodeType.Element, name, hash, attrs, key, children, dom: domNode };
    }

    export function toDomNode(vnode: VNode): DomNode {
        let domNode: DomNode;

        if (vnode.type == NodeType.Element) {
            const {name, attrs, children} = vnode;
            domNode = document.createElement(name);

            // TODO: Setup event listeners and proper inline styles from class and style variables
            if (attrs) {
                for (let attrName of Object.keys(attrs)) {
                    (<DomElement>domNode).setAttribute(attrName, attrs[attrName]);
                }
            }

            if (children) {
                for (let child of children) {
                    (<DomElement>domNode).appendChild(toDomNode(child));
                }
            }

        } else {
            domNode = document.createTextNode(vnode.text);
        }

        vnode.dom = domNode;
        return domNode;
    }

    export function patchElem(parentElem: DomNode, domVNode: VNode, curVNode: VNode, ) {
        // Create new domNode from curVNodeii
        if (!domVNode && curVNode) {
            parentElem.appendChild(toDomNode(curVNode));
        }
        // Remove existing domNode
        else if (domVNode && !curVNode) {
            parentElem.removeChild(domVNode.dom);
        }
        else if (domVNode === curVNode || domVNode.hash === curVNode.hash) {
            return; // No subtree changes. Netflix and chill
        }
        // Either elem->text change or div->iframe change. Replace node
        else if (curVNode.type == NodeType.Element && (domVNode.type === NodeType.Text || curVNode.name !== domVNode.name)) {
           parentElem.replaceChild(toDomNode(curVNode), domVNode.dom);
        }
        // Edit Text
        else if (curVNode.type == NodeType.Text) {
            if ((<VTextNode>domVNode).text !== curVNode.text) {
                domVNode.dom.nodeValue = curVNode.text;
            }
        }
        // Edit DomElement
        else {
            //patchAttrs(elem, getElemAttrs(elem), newNode.attrs);
            //patchChildren(elem, elem.childNodes, newNode.children);
        }
    }

    export function patchAttrs(elem: DomElement, oldAttrs: any, newAttrs: any) {
        // Add/edit attributes
        for (let attr of Object.keys(newAttrs || {})) {
            const attrExists = oldAttrs.hasOwnProperty(attr);
            if (!attrExists || newAttrs[attr] !== oldAttrs[attr]) {
                elem.setAttribute(attr, newAttrs[attr]);
                //console.log("setAttribute", elem, attr, oldAttrs[attr], newAttrs[attr]);
            }
            if (attrExists) {
                delete oldAttrs[attr];
            }
        }

        // Remove attributes
        for (let key of Object.keys(oldAttrs)) {
            elem.removeAttribute(key);
            //console.log("removeAttribute", elem, key);
        }
    }

    /*
    export function patchChildren(elem: Element, oldChildren: NodeList, newChildren: VChildNode[] = []) {
        const oldKeys: { [key: string]: Node } = {};
        const newKeys: { [key: string]: VChildNode } = {};
        let nodeCountMap: { [key: string]: number } = {};

        // Compute old & new keys. We assign keys to child.
        // Children of same type match. If a key is defined, it is used for matching
        for (let i = 0, len = oldChildren.length; i < len; ++i) {
            const childNode = oldChildren[i];
            const nodeType = childNode.nodeType;

            if (nodeType === NodeType.Element || nodeType === NodeType.Text) {
                const nodeName = childNode.nodeName.toLowerCase();
                if (nodeType === NodeType.Element && (<Element>childNode).hasAttribute("key")) {
                    oldKeys[`${nodeName}_${(<Element>childNode).getAttribute("key")}`] = childNode;
                } else {
                    const nodeCount = (nodeCountMap[nodeName] ? ++nodeCountMap[nodeName] : nodeCountMap[nodeName] = 1);
                    oldKeys[`${nodeName}${nodeCount}`] = childNode;
                }
            }
        }

        nodeCountMap = {};
        for (let i = 0, len = newChildren.length; i < len; ++i) {
            const childNode = newChildren[i];
            if (childNode) {
                const nodeName = (typeof childNode === "string") ? "#text" : childNode.tag;
                if (typeof childNode !== "string" && childNode.key){
                    newKeys[`${nodeName}_${childNode.key}`] = childNode;
                } else {
                    const nodeCount = (nodeCountMap[nodeName] ? ++nodeCountMap[nodeName] : nodeCountMap[nodeName] = 1);
                    newKeys[`${nodeName}${nodeCount}`] = childNode;
                }
            }
        }


        for (let key of Object.keys(newKeys)) {
            // Patch element
            const newNode = newKeys[key];

            if (oldKeys.hasOwnProperty(key)) {
                if (typeof newNode === "string") {
                    oldKeys[key].nodeValue = newNode;
                    //console.log("setText", elem, key);
                }
                else {
                    patchElem(elem, <Element>oldKeys[key], newNode);
                }
                delete oldKeys[key];
            }
            else {
                if (typeof newNode === "string") {
                    elem.appendChild(document.createTextNode(newNode));
                    //console.log("createText", elem, key);
                }
                else {
                    elem.appendChild(toDomElem(newNode));
                    //console.log("addChild", elem, key);
                }
            }
        }

        // Remove elements
        for (let key of Object.keys(oldKeys)) {
            elem.removeChild(oldKeys[key]);
            //console.log("removeChild", elem, key);
        }

        // console.log(oldKeys, newKeys);
    }
    */
}