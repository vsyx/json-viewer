import { EditorView, Decoration, ViewPlugin, DecorationSet, ViewUpdate, WidgetType } from "@codemirror/view";
import { Range } from "@codemirror/rangeset";
import { codeFolding, unfoldEffect, foldEffect, foldedRanges } from "@codemirror/fold";
import { combineConfig, EditorState, Facet } from "@codemirror/state";
import { foldable, syntaxTree, foldInside as foldInsideRange } from "@codemirror/language";
import { NodeType, Tree, TreeCursor } from "@lezer/common";

function foldInside(state: EditorState, from: number, to: number) {
    let found: { from: number, to: number } | null = null;
    foldedRanges(state).between(from, to, (from, to) => {
        if (!found || found.from > from) {
            found = { from, to };
        }
    });

    return found;
}

// Identical to Tree.iterate, with the only exception being that 
// returning false from enter callback will terminate the loop entirely
function lazilyIterateTree(spec: {
    tree: Tree,
    enter: (spec: { type: NodeType, from: number, to: number, cursor: TreeCursor }) => boolean | void,
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

function getFoldableObjectAndArrayRanges(view: EditorView, from: number) {
    const ranges: { from: number, to: number }[] = [];
    const outerFrom = from;

    lazilyIterateTree({
        from: outerFrom,
        tree: syntaxTree(view.state),
        enter: ({type, from, cursor}) => {
            if (outerFrom > from) {
                return;
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
        },
    });

    return ranges;
}

function foldAllDeep(view: EditorView, from: number) {
    const effects = getFoldableObjectAndArrayRanges(view, from)
        .filter(({ from, to }) => !foldInside(view.state, from, to))
        .map(range => foldEffect.of(range));

    if (effects.length) {
        view.dispatch({ effects: effects });
    }

    return !!effects.length;
}

function unfoldAllDeep(view: EditorView, from: number) {
    const effects = getFoldableObjectAndArrayRanges(view, from)
        .filter(({ from, to }) => !!foldInside(view.state, from, to))
        .map(range => unfoldEffect.of(range));

    if (effects.length) {
        view.dispatch({ effects: effects });
    }

    return !!effects.length;
}

interface FoldConfig {
    longPressTreshold: number;
}

const defaultFoldConfig: FoldConfig = {
    longPressTreshold: 500
}

const foldConfig = Facet.define<FoldConfig, Required<FoldConfig>>({
    combine: values => combineConfig(values, defaultFoldConfig)
});

class FoldingWidget extends WidgetType {
    constructor(readonly folded: boolean) {
        super();
    }

    eq(other: FoldingWidget) {
        return other.folded == this.folded;
    }

    toDOM(view: EditorView): HTMLElement {
        const { longPressTreshold } = view.state.facet(foldConfig);

        const wrap = document.createElement("span")
        wrap.setAttribute("aria-hidden", "true")

        const button = wrap.appendChild(document.createElement("button"));
        button.textContent = (this.folded) ? '+' : '-';

        button.setAttribute('data-long-press-delay', longPressTreshold.toString());

        button.addEventListener('long-press', event => {
            console.debug('long-press');
            const line = view.visualLineAt(view.posAtDOM(event.target as HTMLElement));
            
            if (!this.folded) {
                foldAllDeep(view, line.from);
            } else {
                unfoldAllDeep(view, line.from);
            }
        });

        button.onclick = event => {
            console.debug('onClick');
            const line = view.visualLineAt(view.posAtDOM(event.target as HTMLElement));
            const folded = foldInside(view.state, line.from, line.to);

            if (folded) {
                view.dispatch({ effects: unfoldEffect.of(folded) });
            } else {
                const foldableLine = foldable(view.state, line.from, line.to);
                if (foldableLine !== null) {
                    view.dispatch({ effects: foldEffect.of(foldableLine) });
                }
            }

            event.preventDefault()
        }

        return wrap
    }
}

export function foldPlugin() {
    const foldedWidget = new FoldingWidget(true);
    const unfoldedWidget = new FoldingWidget(false);

    const folds = ViewPlugin.fromClass(class {
        foldDecorations: DecorationSet

        constructor(view: EditorView) {
            this.foldDecorations = this.buildFoldDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged
                || update.viewportChanged
                || foldedRanges(update.startState) != foldedRanges(update.state)
                || syntaxTree(update.startState).length != syntaxTree(update.state).length) {
                this.foldDecorations = this.buildFoldDecorations(update.view);
            }
        }

        buildFoldDecorations(view: EditorView) {
            const decorations: Range<Decoration>[] = [];

            view.viewportLines(({ from, to }) => {
                const widget = foldInside(view.state, from, to) ? foldedWidget
                    : foldable(view.state, from, to) ? unfoldedWidget
                    : null;

                if (widget !== null) {
                    const deco = Decoration.widget({
                        widget,
                        side: 1,
                    });
                    decorations.push(deco.range(to));
                }
            });
            return Decoration.set(decorations);
        }
    }, {
        decorations: v => v.foldDecorations
    });

    return [folds, codeFolding()];
}
