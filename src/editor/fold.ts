import { EditorView, Decoration, ViewPlugin, DecorationSet, ViewUpdate, WidgetType } from "@codemirror/view";
import { Range } from "@codemirror/rangeset";
import { codeFolding, unfoldEffect, foldEffect, foldedRanges } from "@codemirror/fold";
import { EditorState } from "@codemirror/state";
import { foldable } from "@codemirror/language";

// unfortunately, foldState is not exported, therefore we either have to do this or rewrite the thing entirely
// eslint-disable-next-line
// @ts-ignore
//const [foldState, baseTheme] = codeFolding() as [StateField<DecorationSet>, Extension];

function foldInside(state: EditorState, from: number, to: number) {
    let found: { from: number, to: number } | null = null;
    foldedRanges(state).between(from, to, (from, to) => {
        if (!found || found.from > from) {
            found = { from, to }
        }
    });

    return found;
}

class FoldingWidget extends WidgetType {
    constructor(readonly folded: boolean) {
        super();
    }

    eq(other: FoldingWidget) {
        return other.folded == this.folded;
    }

    toDOM(view: EditorView): HTMLElement {
        const wrap = document.createElement("span")
        wrap.setAttribute("aria-hidden", "true")

        const box = wrap.appendChild(document.createElement("input"))
        box.type = "checkbox"
        box.checked = this.folded;

        box.onclick = event => {
            const line = view.visualLineAt(view.posAtDOM(event.target as HTMLElement))
            const folded = foldInside(view.state, line.from, line.to)

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
                || foldedRanges(update.startState) != foldedRanges(update.state))
                this.foldDecorations = this.buildFoldDecorations(update.view);
        }

        buildFoldDecorations(view: EditorView) {
            const decorations: Range<Decoration>[] = [];

            view.viewportLines(({ from, to }) => {
                console.log(from, to);
                const widget = (foldInside(view.state, from, to)) ? unfoldedWidget
                    : foldable(view.state, from, to) ? foldedWidget
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
