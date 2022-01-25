import { foldedRanges as getFoldedRanges, foldEffect, unfoldEffect } from "@codemirror/fold";
import { syntaxTree, foldInside as foldInsideRange, IndentContext, getIndentation, indentString } from "@codemirror/language";
import { ChangeSpec, EditorState } from "@codemirror/state";
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

function indentRange({ state, dispatch }: EditorView, range: BasicRange) {
    if (state.readOnly) {
        return false;
    }

    const updated: { [lineStart: number]: number } = Object.create(null)
    const context = new IndentContext(state, {
        overrideIndentation: start => {
            const found = updated[start];
            return found == null ? -1 : found;
        },
        simulateDoubleBreak: true
    });

    let atLine = -1
    const changes: ChangeSpec[] = []

    for (let pos = range.from; pos <= range.to;) {
        const line = state.doc.lineAt(pos)
        if (line.number > atLine && range.to > line.from) {
            const indent = getIndentation(context, line.from)
            if (indent == null) {
                continue;
            }

            const cur = /^\s*/.exec(line.text);
            if (cur == null) {
                continue;
            }

            const prevIndent = cur[0];
            const norm = indentString(state, indent)

            if (prevIndent != norm || range.from < line.from + prevIndent.length) {
                updated[line.from] = indent
                changes.push({from: line.from, to: line.from + prevIndent.length, insert: norm})
            }

            atLine = line.number
        }
        pos = line.to + 1
    }

    if (!changes.length) {
        return false;
    }

    const changeSet = state.changes(changes)

    dispatch(state.update({
        changes,
        selection: state.selection.map(changeSet)
    }));

    return true;
}

export function indentAll(view: EditorView) {
    return indentRange(view, { from: 0, to: view.state.doc.length });
}
