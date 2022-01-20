import { foldedRanges as getFoldedRanges, foldEffect, unfoldEffect } from "@codemirror/fold";
import { syntaxTree, foldInside as foldInsideRange } from "@codemirror/language";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { NodeType, Tree, TreeCursor } from "@lezer/common";
import { BasicRange } from './types';

export function isFoldInside(state: EditorState, from: number, to: number) {
    let found: BasicRange | null = null;

    getFoldedRanges(state).between(from, to, (from, to) => {
        if (!found || found.from > from) {
            found = { from, to };
        }
    });

    return found;
}

// Identical to Tree.iterate, with the only exception being that 
// returning false from enter callback will terminate the loop entirely
export function lazilyIterateTree(spec: {
    tree: Tree,
    enter: (spec: { type: NodeType, from: number, to: number, cursor: TreeCursor }) => boolean | null,
    from: number,
    to?: number
}) {
    const { tree, enter, from = 0, to = tree.length } = spec;

    for (let c = tree.cursor(); ;) {
        if (c.from <= to && c.to >= from) {
            const { from, to, type } = c;
            if (!c.type.isAnonymous && enter({ from, to, type, cursor: c }) === false) {
                return;
            }
            if (c.firstChild()) {
                continue;
            }
        }
        for (; ;) {
            if (c.nextSibling()) {
                break;
            }
            if (!c.parent()) {
                return;
            }
        }
    }
}

export function getFoldableObjectAndArrayRanges(
    view: EditorView,
    from: number,
    toLimitByFirst: boolean, 
) {
    const ranges: Array<BasicRange> = [];
    const outerFrom = from;

    lazilyIterateTree({
        from: outerFrom,
        tree: syntaxTree(view.state),
        enter: ({ type, from, cursor }) => {
            if (outerFrom > from) {
                return null;
            }

            if (toLimitByFirst && ranges.length != 0 && from >= ranges[0].to) {
                return false;
            }

            switch (type.name) {
                case 'Array':
                case 'Object': {
                    const node = cursor.node;
                    const range = foldInsideRange(node);
                    if (range) {
                        ranges.push(range);
                    }
                    break;
                }
            }
            return null;
        },
    });

    return ranges;
}

function foldAll(
    view: EditorView,
    from: number,
    callback: (range: BasicRange) => ReturnType<typeof foldEffect.of>
) {
    const effects = getFoldableObjectAndArrayRanges(view, from, true)
        .map(callback);

    if (effects.length) {
        view.dispatch({ effects });
    }

    return !!effects.length;
}

export function foldAllDeep(view: EditorView, from: number) {
    return foldAll(view, from, range => foldEffect.of(range));
}

export function unfoldAllDeep(view: EditorView, from: number) {
    return foldAll(view, from, range => unfoldEffect.of(range));
}
