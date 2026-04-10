# Chapter 5 — Tell It How: Solutions & Patterns

Solutions and commentary for the flag series in Chapter 5. Every exercise builds on the previous ones — the helpers introduced early are reused in every later flag, culminating in the USA as the capstone.

> **Scope:** this document covers sections **06–21** (the flag exercises). Sections 01–05 (function/parameter fundamentals) are not covered here.

---

## Table of Contents

1. [Core language gotchas](#core-language-gotchas)
2. [Shared helpers — the abstraction ladder](#shared-helpers--the-abstraction-ladder)
3. [Flag proportions quick reference](#flag-proportions-quick-reference)
4. [Angle & formula cheat sheet](#angle--formula-cheat-sheet)
5. **Section solutions**
   - [06 — Denmark](#section-06--denmark)
   - [07 — Sweden](#section-07--sweden)
   - [08 — Norway](#section-08--norway)
   - [09 — St Andrew](#section-09--st-andrew)
   - [10 — St Patrick](#section-10--st-patrick)
   - [11 — St George](#section-11--st-george)
   - [12 — Union Jack](#section-12--union-jack)
   - [13 — Filled Star](#section-13--filled-star)
   - [14 — Australia](#section-14--australia)
   - [15 — Netherlands](#section-15--netherlands)
   - [16 — France](#section-16--france)
   - [17 — Positions](#section-17--positions)
   - [18 — Switzerland](#section-18--switzerland)
   - [19 — Tonga](#section-19--tonga)
   - [20 — Puerto Rico](#section-20--puerto-rico)
   - [21 — United States](#section-21--united-states)
6. [Cross-cutting patterns](#cross-cutting-patterns)

---

## Core language gotchas

Six bugs that appear in **every** flag starter template. Memorise these — they're the first things to fix.

| # | Bug | Symptom | Fix |
|---|---|---|---|
| 1 | `let p = Pen()` | "cannot use mutating member on immutable value" | `var p = Pen()` — Pens are mutated via method calls |
| 2 | `pen.addShape(pen: p)` | compile error, no such method | `addShape(pen: p)` — `addShape` is a free function, not a method |
| 3 | `Color` type | compile error | `UIColor` — the Playground API uses `UIColor` throughout |
| 4 | `180 / points` in angle formula | wrong result when `points: Int` | cast with `Double(points)` first — integer division truncates |
| 5 | Missing `penColor` | black outline shows around filled shapes | set `penColor` to match `fillColor`, or use `lineWidth: 0` |
| 6 | "Cannot find type 'UIColor' in scope" | function signatures with `color: UIColor` fail to compile | add `import UIKit` at the top of the file |
| 7 | Thick diagonal stroke spills past flag corners | saltire's white ends poke out beyond the flag rectangle | use a **filled polygon** for the bar, not a `lineWidth` stroke — line caps extend past the endpoints |

### ⚠ UIColor scope — the `import UIKit` requirement

This one deserves its own call-out because it's confusing: **color literals work without an import, but explicit type annotations don't.**

```swift
// ✅ Works without any import — Swift infers the type from context
var p = Pen()
p.penColor = .red
p.fillColor = .systemYellow

// ❌ Fails with "Cannot find type 'UIColor' in scope"
func drawFoo(color: UIColor) { ... }
```

The reason: Swift Playgrounds exposes the color literals through type inference on `Pen.penColor`, but the `UIColor` **type itself** lives in UIKit and must be imported explicitly to use it in a function signature.

**Fix — add this at the top of every file that defines helpers with `color: UIColor` parameters:**

```swift
import Foundation
import UIKit      // ← required for UIColor in function signatures
```

`CGColor` (from CoreGraphics) is **not** a substitute — `Pen.penColor` expects `UIColor`, not `CGColor`.

Worked example — the correct skeleton for every flag function:

```swift
var p = Pen()
p.penColor = .red
p.fillColor = .red
p.goto(x: someX, y: someY)
for _ in 1...2 {
    p.addLine(distance: w); p.turn(degrees: 90)
    p.addLine(distance: h); p.turn(degrees: 90)
}
addShape(pen: p)
```

---

## Shared helpers — the abstraction ladder

These four helpers are used across almost every flag in the chapter. Define them **once** in a shared file and reuse them everywhere — the later flags become unreadable without them.

### `drawRectAt` — positioned filled rectangle

```swift
func drawRectAt(at pos: Point,
                w: Double, h: Double, color: UIColor) {
    var p = Pen()
    p.penColor = color
    p.fillColor = color
    p.goto(x: pos.x, y: pos.y)
    for _ in 1...2 {
        p.addLine(distance: w); p.turn(degrees: 90)
        p.addLine(distance: h); p.turn(degrees: 90)
    }
    addShape(pen: p)
}
```

**Used by:** every flag. This is the foundation.

### `drawSaltire` — thick diagonal cross (hexagonal polygon version)

```swift
import Foundation
import UIKit

// Draws a saltire (×) as two filled HEXAGONS whose long edges are strictly
// parallel to the flag's main diagonal (w, h). Because polygon edges are
// pinned to exact vertex positions, the saltire can never spill past the
// flag rectangle, AND — crucially — saltires of different thicknesses
// (white St Andrew + red St Patrick) remain perfectly parallel to each
// other when layered on the same flag.
func drawSaltire(ox: Double, oy: Double,
                 w: Double, h: Double,
                 color: UIColor, perpendicular T: Double) {
    let diag = sqrt(w*w + h*h)
    let eh = T * diag / (2 * h)    // offset along the horizontal edge
    let ew = T * diag / (2 * w)    // offset along the vertical edge

    // Bar 1: bottom-left → top-right (hexagon, 6 vertices, CCW)
    let bar1 = Polygon(vertices: [
        Point(x: ox,          y: oy),           // BL corner (on diagonal)
        Point(x: ox + eh,     y: oy),           // bottom edge entry
        Point(x: ox + w,      y: oy + h - ew),  // right edge exit
        Point(x: ox + w,      y: oy + h),       // TR corner (on diagonal)
        Point(x: ox + w - eh, y: oy + h),       // top edge exit
        Point(x: ox,          y: oy + ew)       // left edge entry
    ])
    addFilledPolygon(bar1, fillColor: color, borderColor: color, lineWidth: 1)

    // Bar 2: top-left → bottom-right (hexagon, 6 vertices, CCW)
    let bar2 = Polygon(vertices: [
        Point(x: ox,          y: oy + h),       // TL corner (on diagonal)
        Point(x: ox,          y: oy + h - ew),  // left edge entry
        Point(x: ox + w - eh, y: oy),           // bottom edge exit
        Point(x: ox + w,      y: oy),           // BR corner (on diagonal)
        Point(x: ox + w,      y: oy + ew),      // right edge exit
        Point(x: ox + eh,     y: oy + h)        // top edge entry
    ])
    addFilledPolygon(bar2, fillColor: color, borderColor: color, lineWidth: 1)
}
```

**Used by:** St Andrew, St Patrick, Union Jack, Australia.

**Why hexagons instead of parallelograms:** an earlier version of this helper used a 4-vertex parallelogram with horizontal short edges at `(0, 0), (t, 0), (w, h), (w − t, h)`. That fits a single saltire inside the flag, but its **long edges have direction `(w − t, h)`** — which depends on the thickness `t`. When you layer two saltires of different thicknesses (the Union Jack's white + red), their long edges are at subtly different angles, and the red appears to "twist" relative to the white.

The hexagonal version pins the long edges to direction `(w, h)` exactly — the true flag diagonal — by placing four extra vertices on the flag edges where a perpendicular strip would exit. Now two saltires of different thicknesses have genuinely parallel long edges, and layering looks clean.

**What `perpendicular T` means:** it's the perpendicular thickness of the saltire bar — measured at right angles to the diagonal. `T = h / 5` gives the traditional 1/5-of-hoist Scottish flag proportion. `eh` and `ew` are the horizontal and vertical edge offsets the helper computes internally from `T`.

### `drawStarCentered` — {n/k} star centred at a point, oriented point-up

```swift
import Foundation
import UIKit

// Draws a star polygon {n/k} centred at `center` with one vertex pointing
// straight up. Works for any valid {n/k} where gcd(n, k) = 1 — pentagram
// {5/2}, heptagram {7/2}, spiky heptagram {7/3}, nonagram {9/2} or {9/4}.
func drawStarCentered(at center: Point, n: Int, k: Int,
                      size: Double, color: UIColor) {
    // Circumradius of the star's outer vertices:
    //   chord length s = 2R·sin(πk/n)  ⇒  R = s / (2·sin(πk/n))
    let R = size / (2 * sin(.pi * Double(k) / Double(n)))

    // Place V₀ at the top of the circumscribed circle (point-up), then
    // aim the pen at V₁. The atan2 of (V₁ − V₀) simplifies algebraically
    // to this expression — one of the nicest identities in the whole file.
    let initialHeadingDeg = 180.0 + 180.0 * Double(k) / Double(n)
    let turnDeg = 360.0 * Double(k) / Double(n)

    var star = Pen()
    star.penColor = color
    star.fillColor = color

    star.goto(x: center.x, y: center.y + R)
    star.turn(degrees: initialHeadingDeg)

    for _ in 0..<n {
        star.addLine(distance: size)
        star.turn(degrees: turnDeg)
    }
    addShape(pen: star)
}
```

**Used by:** Puerto Rico (first introduced), Australia, United States.

**Why it's separate from `drawStarNK`:** `drawStarNK` (from Section 13) positions a star by its **starting vertex** and draws facing east, producing an inverted (point-down) orientation. That's fine for introducing the idea of star polygons as a turtle construction, but it makes composing stars into a flag awkward — you have to guess offset constants to approximate where the centre is.

`drawStarCentered` is the composition-ready version: pass the centre directly, and the first-vertex position + initial heading are computed analytically so one vertex always ends up at the top. No magic numbers, no per-star fudge factors, works identically for {5/2}, {7/2}, {7/3}, and any other valid {n/k}.

### `drawCrossInBox` — centred plus-cross inside a box

```swift
func drawCrossInBox(at pos: Point,
                    boxW: Double, boxH: Double,
                    arm: Double, long: Double,
                    color: UIColor) {
    // Horizontal bar: length `long`, thickness `arm`
    drawRectAt(
        at: Point(x: pos.x + (boxW - long) / 2,
                  y: pos.y + (boxH - arm)  / 2),
        w: long, h: arm, color: color
    )
    // Vertical bar: thickness `arm`, length `long`
    drawRectAt(
        at: Point(x: pos.x + (boxW - arm)  / 2,
                  y: pos.y + (boxH - long) / 2),
        w: arm, h: long, color: color
    )
}
```

**Used by:** Switzerland, Tonga, St George (with slight tweaks).

**Key insight:** the centring formula `(boxDim − shapeDim) / 2` is the same whether the box is square (Switzerland) or rectangular (Tonga's canton).

### `drawStarNK` — general {n/k} star polygon at a vertex

```swift
import Foundation
import UIKit

// Draws any star polygon {n/k} with turn angle = 360·k/n.
// Valid when gcd(n, k) = 1 and k ≥ 2.
func drawStarNK(at position: Point, n: Int, k: Int,
                size: Double, color: UIColor) {
    let angle = 360.0 * Double(k) / Double(n)

    var star = Pen()
    star.penColor = color
    star.fillColor = color
    star.goto(x: position.x, y: position.y)

    for _ in 0..<n {
        star.addLine(distance: size)
        star.turn(degrees: angle)
    }
    addShape(pen: star)
}
```

**Used by:** Section 13 Filled Star (standalone demo only).

**⚠ Important:** `position` is the **starting vertex**, not the centre of the star. For flag composition (Puerto Rico, Australia, USA) use `drawStarCentered` instead — it takes the centre directly and orients the star point-up.

### `drawUnionJack` — parameterised British flag

```swift
import Foundation
import UIKit

func drawUnionJack(at pos: Point, scale: Double) {
    // Union Jack: 2:1 ratio
    let w: Double = 60 * scale
    let h: Double = 30 * scale
    let diag: Double = sqrt(w*w + h*h)

    // Heraldic thicknesses — all expressed as fractions of the hoist
    let whiteSaltireT: Double = h / 5    // St Andrew white — 1/5 hoist
    let redSaltireT:   Double = h / 15   // St Patrick red — 1/15 hoist
    let whiteCrossT:   Double = h / 3    // St George backing — 1/3 hoist
    let redCrossT:     Double = h / 5    // St George red — 1/5 hoist

    func rect(x: Double, y: Double,
              w rw: Double, h rh: Double, color: UIColor) {
        var p = Pen()
        p.penColor = color; p.fillColor = color
        p.goto(x: pos.x + x, y: pos.y + y)
        for _ in 1...2 {
            p.addLine(distance: rw); p.turn(degrees: 90)
            p.addLine(distance: rh); p.turn(degrees: 90)
        }
        addShape(pen: p)
    }

    // Hexagonal saltire — long edges strictly parallel to the true diagonal,
    // so the white and red saltires stay parallel when layered.
    func saltire(color: UIColor, perpendicular T: Double) {
        let eh = T * diag / (2 * h)
        let ew = T * diag / (2 * w)

        let bar1 = Polygon(vertices: [
            Point(x: pos.x,          y: pos.y),
            Point(x: pos.x + eh,     y: pos.y),
            Point(x: pos.x + w,      y: pos.y + h - ew),
            Point(x: pos.x + w,      y: pos.y + h),
            Point(x: pos.x + w - eh, y: pos.y + h),
            Point(x: pos.x,          y: pos.y + ew)
        ])
        addFilledPolygon(bar1, fillColor: color, borderColor: color, lineWidth: 1)

        let bar2 = Polygon(vertices: [
            Point(x: pos.x,          y: pos.y + h),
            Point(x: pos.x,          y: pos.y + h - ew),
            Point(x: pos.x + w - eh, y: pos.y),
            Point(x: pos.x + w,      y: pos.y),
            Point(x: pos.x + w,      y: pos.y + ew),
            Point(x: pos.x + eh,     y: pos.y + h)
        ])
        addFilledPolygon(bar2, fillColor: color, borderColor: color, lineWidth: 1)
    }

    func cross(color: UIColor, thickness t: Double) {
        rect(x: 0,           y: (h - t) / 2, w: w, h: t, color: color)
        rect(x: (w - t) / 2, y: 0,           w: t, h: h, color: color)
    }

    // 5-layer cake (bottom → top)
    rect(x: 0, y: 0, w: w, h: h, color: .blue)
    saltire(color: .white, perpendicular: whiteSaltireT)
    saltire(color: .red,   perpendicular: redSaltireT)
    cross(color: .white, thickness: whiteCrossT)
    cross(color: .red,   thickness: redCrossT)
}
```

**Used by:** Union Jack standalone, Australia (nested as canton with `scale: scale / 2`).

**Three key lessons:**

1. **Spec-driven proportions.** Every thickness is expressed as a fraction of the hoist (1/5, 1/15, 1/3, 1/5), matching the official heraldic spec. Change the base dimensions and the flag still looks right — no magic numbers to re-tune.
2. **Hexagonal saltires keep multiple bars parallel.** A single saltire bar can be drawn as a 4-vertex parallelogram, but layering two saltires of different thicknesses (white + red) requires the hexagonal version because the parallelogram's long edges depend on its thickness. The hexagon pins long edges to direction `(w, h)` regardless of thickness.
3. **Composable via `at: Point, scale: Double`.** Because the function takes a position and a scale, the Union Jack can be used verbatim as a standalone flag or dropped into the top-left canton of another flag. For Australia: `drawUnionJack(at: Point(x: pos.x, y: pos.y + h / 2), scale: scale / 2)` puts a half-size Union Jack in the upper-left quarter.

---

## Flag proportions quick reference

| Flag | Ratio (W:H) | Cross type | Cross offset | Layers |
|---|---|---|---|---|
| Denmark | 28:21 (4:3) | Nordic plus | offset left (x=10) | 2 |
| Sweden | 16:10 (8:5) | Nordic plus | offset left (x=5) | 2 |
| Norway | 22:16 (11:8) | Nordic plus | offset left (x=6) | 3 (red/white/blue) |
| St George | 30:20 (3:2) | Greek plus | centred | 2 |
| St Andrew | 30:18 (5:3) | Saltire × | diagonal | 2 |
| St Patrick | 30:18 (5:3) | Saltire × | diagonal | 2 |
| Union Jack | 60:30 (2:1) | All three combined | mixed | 5 |
| Switzerland | 1:1 (square) | Greek plus | centred | 2 |
| Tonga | 48:24 (2:1) | Plus in canton | canton top-left | 3 |
| France | 30:20 (3:2) | 3 vertical stripes | n/a | 3 |
| Netherlands | 30:20 (3:2) | 3 horizontal stripes | n/a | 3 |
| Australia | 64:32 (2:1) | Union Jack canton + stars | nested | 8+ |
| Puerto Rico | 60:40 (3:2) | Stripes + triangle + star | composite | 7+ |
| USA | 38:20 (19:10) | Stripes + canton + 50 stars | composite | 64 |

---

## Angle & formula cheat sheet

| Concept | Formula | Example |
|---|---|---|
| Diagonal length of rectangle | `sqrt(w*w + h*h)` | St Andrew saltire |
| Diagonal tilt angle | `atan2(h, w) * 180 / .pi` | St Andrew saltire |
| Regular n-gon exterior angle | `360 / n` | pentagon turn = 72° |
| Star polygon {n/2} turn | `720 / n` | 5-star turn = 144° |
| Star polygon {n/k} turn | `360 * k / n` | {7/3} turn ≈ 154° |
| Equilateral triangle height | `side * √3 / 2 ≈ 0.866 × side` | Puerto Rico triangle |
| Centred shape offset | `(boxDim − shapeDim) / 2` | Swiss cross, St George |
| Triangle centroid | `((ax+bx+cx)/3, (ay+by+cy)/3)` | Puerto Rico star placement |
| Rectangle overlap area | `|A ∪ B| = |A| + |B| − |A ∩ B|` | Swiss cross area |

**Where each formula first appears:**

- `sqrt(w² + h²)` → **St Andrew** (first diagonal flag)
- `atan2` → **St Andrew** (first flag needing trigonometry)
- `720/n` → **Filled Star** (star polygon angle)
- `√3/2` → **Puerto Rico** (equilateral triangle)
- inclusion–exclusion → **Switzerland** (two overlapping rectangles)

---

## Section solutions

> **⚠ Dependencies** — every solution from Section 06 onward uses the shared helpers from the [Shared helpers](#shared-helpers--the-abstraction-ladder) section at the top of this document. Before running any flag solution, make sure you've defined these in the same file (or paste them at the top):
>
> - `drawRectAt(at:w:h:color:)` — used by almost every flag
> - `drawCrossInBox(at:boxW:boxH:arm:long:color:)` — used by Switzerland, Tonga
> - `drawStar(at:points:size:color:)` — used by Filled Star, Australia, Puerto Rico, USA
> - `drawUnionJack(ox:oy:width:)` — used by Union Jack, Australia
>
> The fastest path: copy the complete block from the [Appendix — full helper library](#appendix--full-helper-library) at the bottom of this document into the top of your playground, then the individual flag solutions will compile as-is. Don't forget `import Foundation` and `import UIKit`.

---

## Section 06 — Denmark

**Design:** Red field with a white Nordic cross offset toward the hoist.

**Proportions:** 28 × 21, cross width 4, vertical arm at x = 10, horizontal arm at y = 8.5.

```swift
func drawDenmark(at pos: Point, scale: Double) {
    let w: Double = 28 * scale
    let h: Double = 21 * scale

    drawRectAt(at: pos,                                  w: w,         h: h,         color: .red)
    drawRectAt(at: Point(x: pos.x,              y: pos.y + 8.5 * scale), w: w,        h: 4 * scale, color: .white) // horizontal
    drawRectAt(at: Point(x: pos.x + 10 * scale, y: pos.y),               w: 4 * scale, h: h,        color: .white) // vertical
}
```

**Key learning:** the Nordic cross is **offset**, not centred — the vertical arm at x = 10 splits the 28-wide flag into 10 | 4 | 14. Students almost always draw it centred by reflex.

---

## Section 07 — Sweden

**Design:** Blue field with a yellow Nordic cross offset toward the hoist. Same structure as Denmark.

**Proportions:** 16 × 10, cross width 2, vertical arm at x = 5, horizontal arm at y = 4.

```swift
func drawSweden(at pos: Point, scale: Double) {
    let w: Double = 16 * scale
    let h: Double = 10 * scale

    drawRectAt(at: pos,                                 w: w,         h: h,         color: .blue)
    drawRectAt(at: Point(x: pos.x,             y: pos.y + 4 * scale), w: w,         h: 2 * scale, color: .yellow)
    drawRectAt(at: Point(x: pos.x + 5 * scale, y: pos.y),             w: 2 * scale, h: h,         color: .yellow)
}
```

**Key learning:** same pattern as Denmark, different proportions. The first opportunity to recognise that both flags could share a helper (`drawNordicCrossFlag`) — but it's too early to abstract before seeing the third example (Norway).

---

## Section 08 — Norway

**Design:** Red field + wider white Nordic cross + narrower blue Nordic cross on top (three layers).

**Proportions:** 22 × 16, cross position x = 6, white thickness 4, blue thickness 2.

```swift
func drawNorway(at pos: Point, scale: Double) {

    func rect(x: Double, y: Double, w: Double, h: Double, color: UIColor) {
        drawRectAt(at: Point(x: pos.x + x * scale, y: pos.y + y * scale),
                   w: w * scale, h: h * scale, color: color)
    }

    // Layer 1: red background
    rect(x: 0, y: 0, w: 22, h: 16, color: .red)

    // Layer 2: white cross (thickness 4)
    rect(x: 0, y: 6, w: 22, h: 4, color: .white)
    rect(x: 6, y: 0, w: 4,  h: 16, color: .white)

    // Layer 3: blue cross (thickness 2, centred within white)
    rect(x: 0, y: 7, w: 22, h: 2, color: .blue)
    rect(x: 7, y: 0, w: 2,  h: 16, color: .blue)
}
```

**Key learning — layered rendering (painter's algorithm):** borders are created by painting a wider shape first, then a narrower shape on top. The "white border" around the blue cross isn't drawn as an outline — it's what's left of the white layer after the blue layer is painted. This trick reappears in the Union Jack (fimbriation).

---

## Section 09 — St Andrew

**Design:** Blue field with a white saltire (diagonal ×).

**Proportions:** 30 × 18 (5:3), saltire perpendicular thickness = 1/5 of hoist.

This section teaches two important ideas: **trigonometry for diagonal geometry**, and **polygons vs. strokes for thick lines**. Students almost always reach for `lineWidth` first and hit a visible bug — let's work through it end-to-end.

### First attempt — thick diagonal strokes (flawed)

The intuitive approach: compute the diagonal length and angle, then stroke a fat line from corner to corner.

```swift
import Foundation
import UIKit

func drawStAndrewStroked(at pos: Point, scale: Double) {
    let w: Double = 30 * scale
    let h: Double = 18 * scale
    let diag  = sqrt(w*w + h*h)
    let angle = atan2(h, w) * 180 / .pi

    drawRectAt(at: pos, w: w, h: h, color: .blue)

    var cross = Pen()
    cross.penColor = .white
    cross.lineWidth = 4 * scale

    cross.goto(x: pos.x, y: pos.y)
    cross.turn(degrees: angle)
    cross.addLine(distance: diag)

    cross.goto(x: pos.x, y: pos.y + h)
    cross.turn(degrees: -2 * angle)
    cross.addLine(distance: diag)

    addShape(pen: cross)
}
```

**The bug:** run this and you'll see the white saltire **spill past every corner of the flag**. The reason is that `lineWidth`-based strokes have **line caps** (the rounded or squared ends of a line) that extend **beyond** the endpoints by `lineWidth / 2`, and the perpendicular width of the stroke itself means the four corners of each "thick line" poke out past the flag rectangle. You can't clip a stroke to a bounding box with the Pen API.

### Second attempt — parallelogram polygons (close, but has a subtle issue)

The natural fix for "strokes spill past corners" is to draw a **filled polygon** with vertices pinned to the flag edges:

```swift
// 4-vertex parallelogram — works for one saltire on its own
let bar1 = Polygon(vertices: [
    Point(x: pos.x,         y: pos.y),         // BL corner
    Point(x: pos.x + t,     y: pos.y),         // bottom edge, offset right
    Point(x: pos.x + w,     y: pos.y + h),     // TR corner
    Point(x: pos.x + w - t, y: pos.y + h)      // top edge, offset left
])
```

This works fine for St Andrew on its own. **But** the parallelogram's long edges have direction `(w − t, h)`, which depends on the thickness `t`. Two parallelograms with different `t` values have long edges at **slightly different angles** — so when you layer a thick white saltire and a thin red saltire in the Union Jack (Section 12), the red appears to "twist" relative to the white. It's a subtle bug that only shows up under layering.

### Final fix — hexagonal polygons with long edges parallel to the true diagonal

The proper fix is to construct each saltire bar as a **6-vertex hexagon** whose long edges are strictly parallel to the flag's true diagonal `(w, h)`, regardless of thickness. This requires four additional vertices where the perpendicular strip would exit the flag edges:

```swift
import Foundation
import UIKit

func drawStAndrew(at pos: Point, scale: Double) {
    let w: Double = 30 * scale
    let h: Double = 18 * scale
    let diag: Double = sqrt(w*w + h*h)

    // Perpendicular thickness of the saltire bar (1/5 hoist — Scottish spec)
    let T: Double = h / 5

    // Where the perpendicular strip around the diagonal intersects the edges:
    //   eh = offset along horizontal edges from each corner
    //   ew = offset along vertical edges from each corner
    let eh = T * diag / (2 * h)
    let ew = T * diag / (2 * w)

    // Blue background
    drawRectAt(at: pos, w: w, h: h, color: .blue)

    // White saltire bar 1: bottom-left → top-right (hexagon, 6 vertices CCW)
    let bar1 = Polygon(vertices: [
        Point(x: pos.x,          y: pos.y),           // BL corner (on diagonal)
        Point(x: pos.x + eh,     y: pos.y),           // bottom edge entry
        Point(x: pos.x + w,      y: pos.y + h - ew),  // right edge exit
        Point(x: pos.x + w,      y: pos.y + h),       // TR corner (on diagonal)
        Point(x: pos.x + w - eh, y: pos.y + h),       // top edge exit
        Point(x: pos.x,          y: pos.y + ew)       // left edge entry
    ])
    addFilledPolygon(bar1, fillColor: .white, borderColor: .white, lineWidth: 1)

    // White saltire bar 2: top-left → bottom-right (hexagon, 6 vertices CCW)
    let bar2 = Polygon(vertices: [
        Point(x: pos.x,          y: pos.y + h),       // TL corner (on diagonal)
        Point(x: pos.x,          y: pos.y + h - ew),  // left edge entry
        Point(x: pos.x + w - eh, y: pos.y),           // bottom edge exit
        Point(x: pos.x + w,      y: pos.y),           // BR corner (on diagonal)
        Point(x: pos.x + w,      y: pos.y + ew),      // right edge exit
        Point(x: pos.x + eh,     y: pos.y + h)        // top edge entry
    ])
    addFilledPolygon(bar2, fillColor: .white, borderColor: .white, lineWidth: 1)
}
```

### Where `eh` and `ew` come from

Imagine an infinite strip of perpendicular thickness `T` running through the flag's centre along direction `(w, h)`. The strip's long edges are parallel to `(w, h)`, offset perpendicular by `±T/2`. Clipping this strip against the flag rectangle `[0, w] × [0, h]` gives a hexagon with:

- Two vertices on the flag's diagonal (BL and TR corners)
- Two vertices where the lower long edge hits the flag edges: `(eh, 0)` on the bottom and `(w, h − ew)` on the right
- Two vertices where the upper long edge hits the flag edges: `(w − eh, h)` on the top and `(0, ew)` on the left

Solving for those intersection distances algebraically:

```
eh = T × sqrt(w² + h²) / (2h)
ew = T × sqrt(w² + h²) / (2w)
```

For a 5:3 flag (`w = 30, h = 18`) with `T = h/5 = 3.6`:

- `diag = sqrt(900 + 324) ≈ 34.99`
- `eh = 3.6 × 34.99 / 36 ≈ 3.50`
- `ew = 3.6 × 34.99 / 60 ≈ 2.10`

All six vertices land comfortably inside `[0, 30] × [0, 18]`, and the long edges of the hexagon point in direction `(w − 2·eh, h − 2·ew) ≈ (23.0, 13.8)`, which is proportional to `(w, h) = (30, 18)` — i.e., parallel to the true diagonal. ✓

### Key learnings

1. **Trigonometry enters the curriculum here.** The diagonal isn't 45° unless the flag is square. For a 5:3 flag, `atan2(18, 30) ≈ 30.96°`. This is the first exercise where students need the Pythagorean theorem.
2. **Polygons vs. strokes.** Strokes are for outlines that follow a path. Filled shapes — even diagonal ones — should be polygons with explicit vertices.
3. **Hexagons vs. parallelograms.** A 4-vertex parallelogram works for a single saltire but its long edges depend on thickness, which breaks when layering multiple saltires. The 6-vertex hexagon pins the long edges to the true flag diagonal, so any thickness works.
4. **Vertex order matters.** The six vertices of each bar are traced CCW so they form a simple (non-self-intersecting) hexagon. Trace them on paper if the shape looks wrong — usually you've swapped two.

---

## Section 10 — St Patrick

**Design:** White field with a red saltire. Identical geometry to St Andrew — only the colours are swapped.

```swift
import Foundation
import UIKit

func drawStPatrick(at pos: Point, scale: Double) {
    let w: Double = 30 * scale
    let h: Double = 18 * scale
    let diag: Double = sqrt(w*w + h*h)

    let T: Double = h / 5   // 1/5 hoist perpendicular thickness
    let eh = T * diag / (2 * h)
    let ew = T * diag / (2 * w)

    drawRectAt(at: pos, w: w, h: h, color: .white)

    // Red saltire bar 1: bottom-left → top-right (hexagon, CCW)
    let bar1 = Polygon(vertices: [
        Point(x: pos.x,          y: pos.y),
        Point(x: pos.x + eh,     y: pos.y),
        Point(x: pos.x + w,      y: pos.y + h - ew),
        Point(x: pos.x + w,      y: pos.y + h),
        Point(x: pos.x + w - eh, y: pos.y + h),
        Point(x: pos.x,          y: pos.y + ew)
    ])
    addFilledPolygon(bar1, fillColor: .red, borderColor: .red, lineWidth: 1)

    // Red saltire bar 2: top-left → bottom-right (hexagon, CCW)
    let bar2 = Polygon(vertices: [
        Point(x: pos.x,          y: pos.y + h),
        Point(x: pos.x,          y: pos.y + h - ew),
        Point(x: pos.x + w - eh, y: pos.y),
        Point(x: pos.x + w,      y: pos.y),
        Point(x: pos.x + w,      y: pos.y + ew),
        Point(x: pos.x + eh,     y: pos.y + h)
    ])
    addFilledPolygon(bar2, fillColor: .red, borderColor: .red, lineWidth: 1)
}
```

**Key learning — time to abstract.** St Andrew and St Patrick differ only in colours. After implementing both, the duplicated hexagon code is a clear signal to extract a reusable helper:

```swift
func drawSaltireFlag(at pos: Point, scale: Double,
                     bgColor: UIColor, crossColor: UIColor) {
    let w: Double = 30 * scale
    let h: Double = 18 * scale
    let diag: Double = sqrt(w*w + h*h)

    let T: Double = h / 5
    let eh = T * diag / (2 * h)
    let ew = T * diag / (2 * w)

    drawRectAt(at: pos, w: w, h: h, color: bgColor)

    let bar1 = Polygon(vertices: [
        Point(x: pos.x,          y: pos.y),
        Point(x: pos.x + eh,     y: pos.y),
        Point(x: pos.x + w,      y: pos.y + h - ew),
        Point(x: pos.x + w,      y: pos.y + h),
        Point(x: pos.x + w - eh, y: pos.y + h),
        Point(x: pos.x,          y: pos.y + ew)
    ])
    addFilledPolygon(bar1, fillColor: crossColor, borderColor: crossColor, lineWidth: 1)

    let bar2 = Polygon(vertices: [
        Point(x: pos.x,          y: pos.y + h),
        Point(x: pos.x,          y: pos.y + h - ew),
        Point(x: pos.x + w - eh, y: pos.y),
        Point(x: pos.x + w,      y: pos.y),
        Point(x: pos.x + w,      y: pos.y + ew),
        Point(x: pos.x + eh,     y: pos.y + h)
    ])
    addFilledPolygon(bar2, fillColor: crossColor, borderColor: crossColor, lineWidth: 1)
}

// Both flags now become one-liners:
drawSaltireFlag(at: Point(x: -120, y: -54), scale: 8,
                bgColor: .blue,  crossColor: .white)  // St Andrew
drawSaltireFlag(at: Point(x:  120, y: -54), scale: 8,
                bgColor: .white, crossColor: .red)    // St Patrick
```

This is the first clean **rule-of-three** moment in the chapter: you've written the hexagonal saltire code twice (St Andrew, St Patrick) and are about to write it again for the Union Jack — extract now or pay the cost three times.

---

## Section 11 — St George

**Design:** White field with a centred red Greek cross.

**Proportions:** 30 × 20 (3:2), cross width 4, **centred** (not offset).

```swift
func drawStGeorge(at pos: Point, scale: Double) {
    let w: Double = 30 * scale
    let h: Double = 20 * scale

    drawRectAt(at: pos, w: w, h: h, color: .white)

    // Red cross, centred both axes
    drawRectAt(at: Point(x: pos.x,              y: pos.y + 8 * scale),
               w: w, h: 4 * scale, color: .red)  // horizontal
    drawRectAt(at: Point(x: pos.x + 13 * scale, y: pos.y),
               w: 4 * scale, h: h, color: .red)  // vertical
}
```

**Key learning:** the centring offsets come from `(width − thickness) / 2` and `(height − thickness) / 2`. For 30 × 20 with thickness 4, that's x = 13 and y = 8. Contrast this with the Nordic flags where the cross was at asymmetric positions (Denmark x = 10 out of 28).

---

## Section 12 — Union Jack

**Design:** Blue field + white St Andrew saltire + red St Patrick saltire + white St George backing + red St George cross. **Five layers total.**

**Proportions:** 60 × 30 (2:1). All thicknesses are expressed as fractions of the hoist, matching the official heraldic spec:

| Layer | Thickness (perpendicular) | Fraction of hoist |
|---|---|---|
| White saltire (St Andrew) | `h / 5` | 1/5 |
| Red saltire (St Patrick) | `h / 15` | 1/15 |
| White centre cross (backing) | `h / 3` | 1/3 |
| Red centre cross (St George) | `h / 5` | 1/5 |

```swift
import Foundation
import UIKit

func drawUnionJack(at pos: Point, scale: Double) {
    let w: Double = 60 * scale
    let h: Double = 30 * scale
    let diag: Double = sqrt(w*w + h*h)

    let whiteSaltireT: Double = h / 5
    let redSaltireT:   Double = h / 15
    let whiteCrossT:   Double = h / 3
    let redCrossT:     Double = h / 5

    func rect(x: Double, y: Double,
              w rw: Double, h rh: Double, color: UIColor) {
        drawRectAt(at: Point(x: pos.x + x, y: pos.y + y),
                   w: rw, h: rh, color: color)
    }

    // Hexagonal saltire — long edges strictly parallel to (w, h),
    // so red and white saltires stay geometrically parallel when layered.
    func saltire(color: UIColor, perpendicular T: Double) {
        let eh = T * diag / (2 * h)
        let ew = T * diag / (2 * w)

        let bar1 = Polygon(vertices: [
            Point(x: pos.x,          y: pos.y),
            Point(x: pos.x + eh,     y: pos.y),
            Point(x: pos.x + w,      y: pos.y + h - ew),
            Point(x: pos.x + w,      y: pos.y + h),
            Point(x: pos.x + w - eh, y: pos.y + h),
            Point(x: pos.x,          y: pos.y + ew)
        ])
        addFilledPolygon(bar1, fillColor: color, borderColor: color, lineWidth: 1)

        let bar2 = Polygon(vertices: [
            Point(x: pos.x,          y: pos.y + h),
            Point(x: pos.x,          y: pos.y + h - ew),
            Point(x: pos.x + w - eh, y: pos.y),
            Point(x: pos.x + w,      y: pos.y),
            Point(x: pos.x + w,      y: pos.y + ew),
            Point(x: pos.x + eh,     y: pos.y + h)
        ])
        addFilledPolygon(bar2, fillColor: color, borderColor: color, lineWidth: 1)
    }

    func centeredCross(color: UIColor, thickness t: Double) {
        rect(x: 0,           y: (h - t) / 2, w: w, h: t, color: color)
        rect(x: (w - t) / 2, y: 0,           w: t, h: h, color: color)
    }

    // 5-layer cake (bottom → top)
    rect(x: 0, y: 0, w: w, h: h, color: .blue)
    saltire(color: .white, perpendicular: whiteSaltireT)
    saltire(color: .red,   perpendicular: redSaltireT)
    centeredCross(color: .white, thickness: whiteCrossT)
    centeredCross(color: .red,   thickness: redCrossT)
}
```

**Key learnings:**

1. **Hexagonal saltires are mandatory when layering.** Section 09 showed that a 4-vertex parallelogram works for a single saltire, but the Union Jack layers **two** saltires of different thicknesses. A parallelogram's long edges have direction `(w − t, h)` which depends on `t`, so the white and red long edges end up at slightly different angles and the red visually "twists" inside the white. The 6-vertex hexagon pins both to direction `(w, h)` regardless of thickness.
2. **Spec-driven proportions.** Every thickness is a simple fraction of the hoist (1/5, 1/15, 1/3, 1/5), so the code directly reads as the heraldic description. No magic numbers like `16 * scale` or `10 * scale` to re-tune if you change dimensions.
3. **Fimbriation via layering (painter's algorithm).** The white border around each red element is NOT drawn as an outline — it's what's left of the white backing after the red shape is painted on top. For the centre cross, `(h/3 − h/5) / 2 = h/15` of white shows on each side. For the saltire, the gap between `h/5` white and `h/15` red also leaves `(h/5 − h/15) / 2 = h/15` on each side. **Both white borders are the same width** (`h/15`), which is what makes the flag look heraldically consistent.
4. **Known simplification — counterchange.** The real Union Jack uses heraldic counterchange: the red saltire is **offset** from the centre of the white saltire, so in each quadrant the red sits against one edge of the white rather than the middle. This creates 180° rotational symmetry but breaks reflection symmetry — the flag looks different in a mirror. Implementing counterchange properly requires drawing the red saltire as **four separate arms** (one per quadrant), each offset perpendicular to the diagonal in alternating directions. Our version centres both saltires, which is visually very close and much simpler.

---

## Section 13 — Filled Star

**Task:** Write a function that draws a filled star polygon of any density, plus three stars side by side.

This section introduces `drawStarNK` — the general `{n/k}` star polygon. It positions the star by its **starting vertex** (simplest turtle construction) and draws facing east, producing an inverted (point-down) orientation. That's fine for a standalone demo. Later sections (Puerto Rico, Australia, USA) upgrade to a centre-positioned, point-up version — `drawStarCentered`.

```swift
import Foundation
import UIKit

func drawStarNK(at position: Point, n: Int, k: Int,
                size: Double, color: UIColor) {
    // Star polygon {n/k} turn angle = 360 × k / n
    // Produces a valid single-pass star when gcd(n, k) = 1 and k ≥ 2.
    let angle = 360.0 * Double(k) / Double(n)

    var star = Pen()
    star.penColor = color
    star.fillColor = color
    star.goto(x: position.x, y: position.y)

    for _ in 0..<n {
        star.addLine(distance: size)
        star.turn(degrees: angle)
    }
    addShape(pen: star)
}

// Three stars of different densities, side by side
drawStarNK(at: Point(x: -120, y: 0), n: 5, k: 2, size: 80, color: .systemYellow)  // pentagram
drawStarNK(at: Point(x:    0, y: 0), n: 7, k: 2, size: 80, color: .systemOrange)  // {7/2} gentle heptagram
drawStarNK(at: Point(x:  120, y: 0), n: 7, k: 3, size: 80, color: .systemRed)     // {7/3} spiky heptagram
```

**The angle formula — why `360·k/n`:**

A `{n/k}` star polygon winds around its centre **`k` times** before closing, so the total turn is `k × 360°`. Distributed across `n` vertices gives `360·k/n` per step.

| n | k | Turn | Shape |
|---|---|---|---|
| 5 | 2 | 144° | classic pentagram |
| 7 | 2 | ≈102.9° | gentle 7-point star |
| 7 | 3 | ≈154.3° | spiky 7-point star (Australian flag) |
| 9 | 2 | 80° | gentle 9-point star |
| 9 | 4 | 160° | very spiky 9-point star |
| 5 | 1 | 72° | regular pentagon (degenerate — no star) |
| 6 | 2 | 120° | regular triangle traced twice (degenerate) |

**Validity rule:** a star polygon `{n/k}` is a single-pass star **only when `gcd(n, k) = 1` and `k ≥ 2`**. For 6-pointed stars (Star of David) you need **two overlapping triangles**, not a single star polygon — `{6/2}` degenerates to a triangle traced twice.

**Caveat for composition:** `drawStarNK` positions the star by its **starting vertex**, not its centre. That's fine for this standalone demo but awkward for placing a star inside another shape. **Puerto Rico (Section 20) introduces `drawStarCentered`** — a wrapper that takes a centre point and orients the star point-up — which is what all subsequent flag exercises use.

---

## Section 14 — Australia

**Design:** Blue field + Union Jack canton top-left + Commonwealth Star (7-point) + Southern Cross (4 large 7-point stars + 1 small 5-point star).

**Proportions:** 60 × 30 (2:1). Union Jack canton fills the top-left quarter (half flag width × half flag height).

```swift
import Foundation
import UIKit

func drawAustralia(at pos: Point, scale: Double) {
    let w: Double = 60 * scale
    let h: Double = 30 * scale

    // 1. Blue background (full flag)
    var bg = Pen()
    bg.penColor = .blue
    bg.fillColor = .blue
    bg.goto(x: pos.x, y: pos.y)
    for _ in 1...2 {
        bg.addLine(distance: w); bg.turn(degrees: 90)
        bg.addLine(distance: h); bg.turn(degrees: 90)
    }
    addShape(pen: bg)

    // 2. Union Jack canton — top-left quarter of the flag.
    //    Pass scale/2 so the Union Jack's native 60×30 becomes 30×15 = w/2 × h/2.
    drawUnionJack(at: Point(x: pos.x, y: pos.y + h / 2),
                  scale: scale / 2)

    // 3. Commonwealth Star — {7/3} spiky heptagram, centred in the
    //    lower-left quadrant below the Union Jack.
    //    Size bumped ~1.25× to compensate for {7/3}'s smaller circumradius
    //    (0.513·s vs 0.640·s for {7/2}).
    drawStarCentered(
        at: Point(x: pos.x + w / 4, y: pos.y + h / 4),
        n: 7, k: 3,
        size: h * 0.31,
        color: .white
    )

    // 4. Southern Cross — 4 large {7/3} heptagrams + 1 small {5/2} pentagram.
    let largeSize: Double = h * 0.14
    let smallSize: Double = h / 13

    // Gamma Crucis (top)
    drawStarCentered(
        at: Point(x: pos.x + 0.72 * w, y: pos.y + 0.80 * h),
        n: 7, k: 3, size: largeSize, color: .white
    )
    // Beta Crucis (left)
    drawStarCentered(
        at: Point(x: pos.x + 0.58 * w, y: pos.y + 0.52 * h),
        n: 7, k: 3, size: largeSize, color: .white
    )
    // Delta Crucis (right)
    drawStarCentered(
        at: Point(x: pos.x + 0.82 * w, y: pos.y + 0.46 * h),
        n: 7, k: 3, size: largeSize, color: .white
    )
    // Alpha Crucis (bottom)
    drawStarCentered(
        at: Point(x: pos.x + 0.72 * w, y: pos.y + 0.20 * h),
        n: 7, k: 3, size: largeSize, color: .white
    )
    // Epsilon Crucis (small 5-point pentagram)
    drawStarCentered(
        at: Point(x: pos.x + 0.76 * w, y: pos.y + 0.40 * h),
        n: 5, k: 2, size: smallSize, color: .white
    )
}

drawAustralia(at: Point(x: -120, y: -60), scale: 4)
```

**Key learnings:**

1. **Refactoring for reuse.** Australia forces `drawUnionJack` to accept `(at: Point, scale: Double)`. A function hardcoded to origin can't compose into a larger drawing. Every internal dimension must be expressed relative to the scale parameter, so it scales uniformly when you shrink the flag into a canton.
2. **Similar figures through scaling.** Passing `scale: scale / 2` to `drawUnionJack` produces a canton that's geometrically similar to the standalone Union Jack — same proportions, half the size. That's the definition of geometric similarity, made concrete in code.
3. **`drawStarCentered` for clean composition.** Because it takes a centre point and orients point-up automatically, you can place stars at exact fractional positions on the flag (`w * 0.72, h * 0.80`) without offset fudge factors. Compare with `drawStarNK` from Section 13, which would need `−0.5·size, −0.3·size` compensation for every call.
4. **`{7/3}` vs. `{7/2}`.** The Commonwealth Star and the four large Southern Cross stars use `{7/3}` — the denser, pointier heptagram — because the real Australian flag has distinctly spiky stars with deep valleys between points. `{7/2}` would be gentler and look wrong. Epsilon Crucis uses `{5/2}` (classic pentagram) because it's a 5-point star. Because `drawStarCentered` takes `n` and `k` as parameters, you get both from the same function — no new helpers needed.
5. **Size compensation when changing density.** For the same chord length `s`, a `{7/3}` star is smaller than a `{7/2}` star (circumradius 0.513·s vs. 0.640·s). Multiplying `size` by `1.28 / 1.026 ≈ 1.25` keeps the visual diameter roughly constant across the density change — which is why the Commonwealth Star uses `h * 0.31` (≈ `1.25 × h / 4`) instead of `h / 4`.

**Known simplification:** the Southern Cross star positions are approximations tuned by eye, not the exact coordinates from the Flags Act 1953. Tweak the fractional positions if you want strict heraldic accuracy.

---

## Section 15 — Netherlands

**Design:** Three equal horizontal stripes — red (top), white (middle), blue (bottom).

**Proportions:** 3:2 ratio (e.g. 30 × 20). Each stripe = `width × (height / 3)`, so each stripe occupies exactly 1/3 of the total area.

This section introduces a **reusable tricolour helper** that Section 16 (France) will adapt. It's scaffolded in the same style as Norway (Section 08): a local helper function inside the flag function, taking a `scale` parameter and drawing from origin. `drawRectAt` hasn't been extracted yet — that happens in Section 17 Positions.

```swift
import Foundation
import UIKit

// --- Foundation helper: draws one filled stripe at (x, y) ---
// Same pattern as the drawRect helper inside drawNorway, just factored
// to the top level so Netherlands and France can both reuse it.
func drawStripe(x: Double, y: Double,
                width w: Double, height h: Double, color: UIColor) {
    var p = Pen()
    p.penColor = color
    p.fillColor = color
    p.goto(x: x, y: y)
    for _ in 1...2 {
        p.addLine(distance: w); p.turn(degrees: 90)
        p.addLine(distance: h); p.turn(degrees: 90)
    }
    addShape(pen: p)
}

// --- Reusable tricolour helper: 3 equal horizontal stripes ---
// color1 = TOP, color2 = MIDDLE, color3 = BOTTOM.
// Remember: y increases upward, so the BOTTOM stripe is drawn at y = 0
// and the TOP stripe at y = 2 × stripeH.
func drawTricolour(color1: UIColor, color2: UIColor, color3: UIColor,
                   width: Double, height: Double) {
    let stripeH = height / 3
    drawStripe(x: 0, y: 0,             width: width, height: stripeH, color: color3)  // bottom
    drawStripe(x: 0, y: stripeH,       width: width, height: stripeH, color: color2)  // middle
    drawStripe(x: 0, y: 2 * stripeH,   width: width, height: stripeH, color: color1)  // top
}

// --- Dutch flag: red (top), white (middle), blue (bottom), 3:2 ratio ---
func drawNetherlands(scale: Double) {
    drawTricolour(
        color1: .red,     // top
        color2: .white,   // middle
        color3: .blue,    // bottom
        width:  30 * scale,
        height: 20 * scale
    )
}

drawNetherlands(scale: 6)
```

### Common student bugs (from the partial template)

| Issue | Template | Fix |
|---|---|---|
| Immutable pen | `let s = Pen()` | `var p = Pen()` — Pens need mutation |
| Wrong addShape call | `pen.addShape(pen: s)` | `addShape(pen: p)` — it's a free function |
| Wrong color type | `Color` | `UIColor` |
| Pen navigation dance | `pen.turn(270); pen.move(40); pen.turn(90)` between stripes | Use `goto(x:, y:)` directly — no shared pen state |
| Missing imports | none | `import Foundation` + `import UIKit` |

### Why `color3` is drawn first (bottom), not `color1`

Because y increases upward in this coordinate system, the **bottom** stripe lives at `y = 0` and the **top** stripe at `y = 2 × stripeH`. Students who expect "color1 goes first" will naturally write the stripes top-to-bottom and end up with the flag **upside down**. The function signature lists colours top→middle→bottom (the intuitive reading order), but the drawing order is bottom→middle→top to match the coordinate system. The same y-inversion trick appears in every stripe-based flag (Puerto Rico, USA).

**Key learning — partition into equal parts.** Three equal stripes on a `width × height` flag each occupy exactly 1/3 of the area (`width × height / 3`). The three stripes form a **disjoint union** — no overlap, no gaps — so the total painted area equals the flag area. This is the simplest instance of partitioning a region into equal parts, a core fraction-reasoning idea that reappears in Puerto Rico (5 stripes) and the USA (13 stripes).

---

## Section 16 — France

**Design:** Three equal vertical stripes — blue (hoist), white (middle), red (fly).

**Proportions:** 3:2 ratio (e.g. 30 × 20). Each stripe is `(width / 3) × height`.

```swift
import Foundation
import UIKit

// drawStripe is the same helper from Section 15 Netherlands — reuse it
// without redefinition if you keep both sections in the same playground.
// Repeated here for a self-contained France solution.
func drawStripe(x: Double, y: Double,
                width w: Double, height h: Double, color: UIColor) {
    var p = Pen()
    p.penColor = color
    p.fillColor = color
    p.goto(x: x, y: y)
    for _ in 1...2 {
        p.addLine(distance: w); p.turn(degrees: 90)
        p.addLine(distance: h); p.turn(degrees: 90)
    }
    addShape(pen: p)
}

// --- Reusable helper: 3 equal VERTICAL stripes ---
// color1 = LEFT (hoist), color2 = MIDDLE, color3 = RIGHT (fly).
// This is the horizontal tricolour "rotated 90°" — each stripe now
// has FULL height and 1/3 width, and we step right (x) instead of up (y).
func drawTricolourVertical(color1: UIColor, color2: UIColor, color3: UIColor,
                            width: Double, height: Double) {
    let stripeW = width / 3
    drawStripe(x: 0,             y: 0, width: stripeW, height: height, color: color1)  // left
    drawStripe(x: stripeW,       y: 0, width: stripeW, height: height, color: color2)  // middle
    drawStripe(x: 2 * stripeW,   y: 0, width: stripeW, height: height, color: color3)  // right
}

// --- French flag: blue (hoist), white, red (fly), 3:2 ratio ---
func drawFrance(scale: Double) {
    drawTricolourVertical(
        color1: .blue,    // hoist (left)
        color2: .white,   // middle
        color3: .red,     // fly (right)
        width:  30 * scale,
        height: 20 * scale
    )
}

drawFrance(scale: 6)
```

### The "rotate 90°" idea, properly explained

The exercise hint says "the same function with swapped width/height parameters achieves this in code." That's **not quite right** — swapping `width` and `height` in `drawTricolour` still divides the (now-swapped) height by 3, producing horizontal stripes in a flag with different proportions. It doesn't actually rotate anything.

The correct translation of "horizontal tricolour → vertical tricolour" is:

| | Horizontal (Netherlands) | Vertical (France) |
|---|---|---|
| Each stripe's width | `width` (full) | `width / 3` |
| Each stripe's height | `height / 3` | `height` (full) |
| Stepping direction | y (up) | x (right) |
| Step size | `stripeH = height / 3` | `stripeW = width / 3` |

In other words, **swap which axis gets divided and which axis gets stepped along** — not the `width` and `height` parameters themselves. The cleanest expression of this is a separate `drawTricolourVertical` function, because the symmetry between the two is exactly what you want students to see.

### Side-by-side comparison

```
drawTricolour (horizontal):           drawTricolourVertical (vertical):
  stripeH = height / 3                  stripeW = width / 3
  drawStripe(0, 0,        w, sH)        drawStripe(0,      0, sW, h)
  drawStripe(0, sH,       w, sH)        drawStripe(sW,     0, sW, h)
  drawStripe(0, 2·sH,     w, sH)        drawStripe(2·sW,   0, sW, h)
```

Exactly the same three lines, with `(x, y)` and `(w, h)` roles swapped. That's the 90° rotation the hint was pointing at — swap **which axis varies** between the three stripe calls.

### Key learnings

1. **Axis-swap as rotation.** A horizontal tricolour and a vertical tricolour are structurally identical — same helper `drawStripe`, same division into 3, same partition-into-equal-parts idea. Only the axis that varies between stripes changes. This is the simplest instance of a 90° rotation expressed directly in code.
2. **`drawStripe` now has two clients.** Netherlands and France both call it, which makes extracting it to the top level worthwhile. This is the first **rule-of-two** extraction in the stripe-based flags (Norway had a local `drawRect` because nothing else used it yet).
3. **Scaffold toward Section 17.** After France, your helper library contains `drawStripe`, `drawTricolour`, and `drawTricolourVertical`. In Section 17 (Positions), `drawStripe` gets generalised into `drawRectAt` with a `Point` parameter for positioning, and from Section 18 onward every flag uses `drawRectAt` instead.

**Scaffold summary** — the helper stack after Sections 15 and 16:

| Helper | Introduced in | Purpose |
|---|---|---|
| `drawStripe` | Section 15 Netherlands | One filled rectangle at a position |
| `drawTricolour` | Section 15 Netherlands | 3 horizontal stripes |
| `drawTricolourVertical` | Section 16 France | 3 vertical stripes |

**Geometry note:** Three equal stripes partition the flag into a disjoint union of congruent rectangles. Each stripe has area `width × height / 3`, and the three together tile the whole flag with no overlap or gaps. This is **partition into equal parts** — the first fractional-reasoning exercise in the chapter, and a foundation for Puerto Rico (5 stripes) and the USA (13 stripes).

**IM1 connection:** Fractional reasoning (dividing a region into equal parts), transformations (horizontal ↔ vertical stripe layout as a 90° axis swap), and functions & abstraction (one `drawStripe` helper composes into two different tricolour functions, and those into two different flags).

---

## Section 17 — Positions

**Task:** Update flag functions to accept a position (as a `Point`) and a `scale`, so you can draw France, Netherlands, and Denmark side by side on the same canvas.

> **🔑 This is the exercise where `drawRectAt` is born.** Up to Section 16, flags either drew their own rectangles inline with raw `Pen` calls (Denmark, Sweden, Norway, St George) or used the `drawStripe(x:y:width:height:color:)` helper from the Netherlands/France exercises (which drew at origin only). Section 17 generalises both approaches into a single `drawRectAt(at: Point, w:, h:, color:)` helper that takes a `Point` for the position. From Section 18 onward, almost every flag depends on `drawRectAt` being defined — so make sure you add it to the top of your playground file and keep it there.

### Step 1 — extract `drawRectAt`

Every flag so far has been doing the same thing: create a `Pen`, set colors, `goto` a position, trace a rectangle with two `addLine`/`turn` pairs, and call `addShape`. That's a clear signal to refactor:

```swift
import Foundation
import UIKit

// --- Filled rectangle at an absolute position ---
func drawRectAt(at pos: Point,
                w: Double, h: Double, color: UIColor) {
    var p = Pen()
    p.penColor = color
    p.fillColor = color
    p.goto(x: pos.x, y: pos.y)
    for _ in 1...2 {
        p.addLine(distance: w); p.turn(degrees: 90)
        p.addLine(distance: h); p.turn(degrees: 90)
    }
    addShape(pen: p)
}
```

**Keep this helper at the top of your playground file.** Every flag from Section 17 onward (and retroactively the earlier ones if you want to rewrite them) depends on it.

### Step 2 — flag functions that take a `Point`

With `drawRectAt` available, positioning each flag is just a matter of offsetting every rectangle by `pos.x` and `pos.y`:

```swift
// --- France: 3 vertical stripes (blue | white | red), 3:2 ratio ---
func drawFrance(at pos: Point, scale: Double) {
    let w: Double = 30 * scale
    let h: Double = 20 * scale
    let stripe = w / 3

    drawRectAt(at: Point(x: pos.x,              y: pos.y), w: stripe, h: h, color: .blue)
    drawRectAt(at: Point(x: pos.x + stripe,     y: pos.y), w: stripe, h: h, color: .white)
    drawRectAt(at: Point(x: pos.x + 2 * stripe, y: pos.y), w: stripe, h: h, color: .red)
}

// --- Netherlands: 3 horizontal stripes (red top, white, blue) ---
func drawNetherlands(at pos: Point, scale: Double) {
    let w: Double = 30 * scale
    let h: Double = 20 * scale
    let stripe = h / 3

    drawRectAt(at: Point(x: pos.x, y: pos.y + 2 * stripe), w: w, h: stripe, color: .red)
    drawRectAt(at: Point(x: pos.x, y: pos.y + stripe),     w: w, h: stripe, color: .white)
    drawRectAt(at: Point(x: pos.x, y: pos.y),              w: w, h: stripe, color: .blue)
}

// --- Denmark: red field + white Nordic cross, 28 × 21 ---
func drawDenmark(at pos: Point, scale: Double) {
    let w: Double = 28 * scale
    let h: Double = 21 * scale

    drawRectAt(at: Point(x: pos.x,              y: pos.y),               w: w,         h: h,         color: .red)
    drawRectAt(at: Point(x: pos.x,              y: pos.y + 8.5 * scale), w: w,         h: 4 * scale, color: .white)
    drawRectAt(at: Point(x: pos.x + 10 * scale, y: pos.y),               w: 4 * scale, h: h,         color: .white)
}

// --- Three flags side by side, centred around origin ---
drawFrance(     at: Point(x: -105, y: -20), scale: 2)
drawNetherlands(at: Point(x:  -35, y: -20), scale: 2)
drawDenmark(    at: Point(x:   35, y: -21), scale: 2)
```

### Step 3 — full self-contained file (copy this to test)

```swift
import Foundation
import UIKit

// --- Helper: filled rectangle at an absolute position ---
func drawRectAt(at pos: Point,
                w: Double, h: Double, color: UIColor) {
    var p = Pen()
    p.penColor = color
    p.fillColor = color
    p.goto(x: pos.x, y: pos.y)
    for _ in 1...2 {
        p.addLine(distance: w); p.turn(degrees: 90)
        p.addLine(distance: h); p.turn(degrees: 90)
    }
    addShape(pen: p)
}

func drawFrance(at pos: Point, scale: Double) {
    let w: Double = 30 * scale
    let h: Double = 20 * scale
    let stripe = w / 3
    drawRectAt(at: Point(x: pos.x,              y: pos.y), w: stripe, h: h, color: .blue)
    drawRectAt(at: Point(x: pos.x + stripe,     y: pos.y), w: stripe, h: h, color: .white)
    drawRectAt(at: Point(x: pos.x + 2 * stripe, y: pos.y), w: stripe, h: h, color: .red)
}

func drawNetherlands(at pos: Point, scale: Double) {
    let w: Double = 30 * scale
    let h: Double = 20 * scale
    let stripe = h / 3
    drawRectAt(at: Point(x: pos.x, y: pos.y + 2 * stripe), w: w, h: stripe, color: .red)
    drawRectAt(at: Point(x: pos.x, y: pos.y + stripe),     w: w, h: stripe, color: .white)
    drawRectAt(at: Point(x: pos.x, y: pos.y),              w: w, h: stripe, color: .blue)
}

func drawDenmark(at pos: Point, scale: Double) {
    let w: Double = 28 * scale
    let h: Double = 21 * scale
    drawRectAt(at: Point(x: pos.x,              y: pos.y),               w: w,         h: h,         color: .red)
    drawRectAt(at: Point(x: pos.x,              y: pos.y + 8.5 * scale), w: w,         h: 4 * scale, color: .white)
    drawRectAt(at: Point(x: pos.x + 10 * scale, y: pos.y),               w: 4 * scale, h: h,         color: .white)
}

drawFrance(     at: Point(x: -105, y: -20), scale: 2)
drawNetherlands(at: Point(x:  -35, y: -20), scale: 2)
drawDenmark(    at: Point(x:   35, y: -21), scale: 2)
```

### Why `Point` is better than `(x:, y:)`

| | `(x:, y:)` | `at: Point` |
|---|---|---|
| Matches existing `drawStar` API | ❌ | ✅ |
| Can store positions in collections | awkward | natural |
| Can pass positions through helpers | 2 params | 1 param |
| Conceptually clearer | "two numbers" | "a location" |

### The mechanical refactor

The change from "draw at origin" to "draw anywhere" is tiny — offset every `goto` by `(pos.x, pos.y)`:

```swift
// Before:                 // After:
p.goto(x: 10, y: 5)        p.goto(x: pos.x + 10, y: pos.y + 5)
```

Once `drawRectAt` takes a `Point`, each flag function becomes a list of positioned rectangles — no more inline pen setup.

**Avoid the template's `pen.move + pen.turn` approach** — it relies on a global pen state, accumulates side effects, and breaks the moment you draw two shapes in a row. Absolute positioning via `goto` is cleaner, stateless, and composable.

### Bonus — layout flags as data

```swift
let layout: [(name: String, origin: Point)] = [
    ("France",      Point(x: -105, y: -20)),
    ("Netherlands", Point(x:  -35, y: -20)),
    ("Denmark",     Point(x:   35, y: -21))
]
```

Once positions are first-class values you can compute them, transform them, and iterate over them. This is the payoff of using `Point` instead of paired `Double`s.

### What to keep for later exercises

After completing this section, your playground should contain:

1. **`drawRectAt`** at the top of the file (do not delete — every later flag needs it)
2. Updated positioned versions of `drawFrance`, `drawNetherlands`, `drawDenmark`

From Section 18 onward, you'll keep extending this helper library — adding `drawCrossInBox` in Switzerland/Tonga and `drawStarCentered` in Puerto Rico (which is then reused in Australia and the USA). Think of each exercise as adding **one new tool** to your toolbox, not just producing one drawing.

---

## Section 18 — Switzerland

**Design:** Red square with a centred white Greek cross.

**Proportions:** 1:1 square, cross arm thickness `size / 6`, cross arm length `size × 2 / 3`.

```swift
func drawSwitzerland(at pos: Point, scale: Double) {
    let size: Double = 30 * scale
    let arm  = size / 6
    let long = size * 2 / 3

    drawRectAt(at: pos, w: size, h: size, color: .red)
    drawCrossInBox(
        at: pos,
        boxW: size, boxH: size,
        arm: arm, long: long,
        color: .white
    )
}
```

**Key learnings:**
1. **Inclusion–exclusion for area** — the cross is two overlapping rectangles. Cross area = 2 × (arm × long) − arm². The `− arm²` subtracts the double-counted centre square.
2. **D₄ symmetry** — Switzerland is the first flag with full dihedral symmetry of order 8: four rotations (0°, 90°, 180°, 270°) **and** four reflections (horizontal, vertical, both diagonals). The square flag + centred cross combination is required — neither alone gives D₄.
3. **When the diagonals work** — reflecting across a diagonal swaps the horizontal and vertical bars of the cross. Because they're congruent, the shape is unchanged. If the bars had different widths you'd lose diagonal symmetry and drop to D₂.

---

## Section 19 — Tonga

**Design:** Red field with a white canton in the top-left containing a small red Greek cross.

**Proportions:** 48 × 24 (2:1). Canton ≈ 3/8 × 1/2 of the flag.

```swift
func drawTonga(at pos: Point, scale: Double) {
    let w: Double = 48 * scale
    let h: Double = 24 * scale

    let cantonW = w * 3 / 8
    let cantonH = h / 2
    let cantonPos = Point(x: pos.x, y: pos.y + h - cantonH)

    let arm  = cantonH / 5
    let long = cantonH * 4 / 5

    drawRectAt(at: pos,       w: w,       h: h,       color: .red)
    drawRectAt(at: cantonPos, w: cantonW, h: cantonH, color: .white)

    drawCrossInBox(
        at: cantonPos,
        boxW: cantonW, boxH: cantonH,
        arm: arm, long: long,
        color: .red
    )
}
```

**Key learnings:**
1. **Nested coordinate frames** — two "top-lefts" to reason about. First, the canton sits at the flag's top-left: `y = pos.y + h - cantonH` (because y increases upward). Second, the cross is centred inside the canton using `(boxDim − shapeDim) / 2`. This is **local vs. world coordinates** in its simplest form.
2. **Generalising `drawCrossInBox`** — Switzerland's square box was a special case. Tonga's rectangular canton proves the centring helper works for any `(boxW, boxH)`. After this exercise, Switzerland can be **retrofitted** to call `drawCrossInBox` too.
3. **Symmetry is fragile** — Switzerland had D₄; Tonga has **trivial symmetry** (only identity) because the canton in one corner breaks every rotation and reflection. Adding a feature to a symmetric shape usually destroys some symmetries.

---

## Section 20 — Puerto Rico

**Design:** 5 alternating red/white stripes + blue equilateral triangle at the hoist + white 5-point star in the triangle.

**Proportions:** 60 × 40 (3:2). Triangle base = flag height; apex extends `h × √3/2` to the right.

This section introduces **`drawStarCentered`** — the composition-ready star helper used by every flag with stars from here onward (Puerto Rico, Australia, USA). It replaces the vertex-positioned `drawStarNK` from Section 13 with a version that takes the **centre** of the star directly and orients it point-up.

### The `drawStarCentered` helper

```swift
import Foundation
import UIKit

// Draws a star polygon {n/k} centred at `center` with one vertex pointing
// straight up. Works for any valid {n/k} where gcd(n, k) = 1.
func drawStarCentered(at center: Point, n: Int, k: Int,
                      size: Double, color: UIColor) {
    // Circumradius: s = 2R·sin(πk/n) ⇒ R = s / (2·sin(πk/n))
    let R = size / (2 * sin(.pi * Double(k) / Double(n)))

    // Place V₀ at the top of the circumscribed circle (point-up), then
    // aim the pen at V₁. The atan2 of (V₁ − V₀) simplifies to this:
    let initialHeadingDeg = 180.0 + 180.0 * Double(k) / Double(n)
    let turnDeg = 360.0 * Double(k) / Double(n)

    var star = Pen()
    star.penColor = color
    star.fillColor = color

    star.goto(x: center.x, y: center.y + R)
    star.turn(degrees: initialHeadingDeg)

    for _ in 0..<n {
        star.addLine(distance: size)
        star.turn(degrees: turnDeg)
    }
    addShape(pen: star)
}
```

### The flag

```swift
import Foundation
import UIKit

func drawPuertoRico(at pos: Point, scale: Double) {
    let w: Double = 60 * scale
    let h: Double = 40 * scale
    let stripeH = h / 5

    // 1. Five stripes — red, white, red, white, red (bottom → top)
    let stripes: [UIColor] = [.red, .white, .red, .white, .red]
    for (i, color) in stripes.enumerated() {
        drawRectAt(
            at: Point(x: pos.x, y: pos.y + Double(i) * stripeH),
            w: w, h: stripeH, color: color
        )
    }

    // 2. Blue equilateral triangle, base on left edge, apex pointing right
    let apexX = pos.x + h * sqrt(3) / 2
    let tri = Triangle(
        a: Point(x: pos.x, y: pos.y + h),   // top-left
        b: Point(x: pos.x, y: pos.y),       // bottom-left
        c: Point(x: apexX, y: pos.y + h/2)  // apex
    )
    addFilledTriangle(tri, fillColor: .blue, borderColor: .blue, lineWidth: 1)

    // 3. White 5-point star at the triangle's centroid
    //    Centroid of equilateral triangle = (pos.x + h√3/6, pos.y + h/2)
    let centroidX = pos.x + h * sqrt(3) / 6
    let centroidY = pos.y + h / 2
    let starSize  = h / 3

    drawStarCentered(
        at: Point(x: centroidX, y: centroidY),
        n: 5, k: 2,
        size: starSize,
        color: .white
    )
}
```

### Deriving the `drawStarCentered` constants

For a star polygon `{n/k}` with chord length `s`, the outer circumradius `R` satisfies `s = 2R·sin(πk/n)`, so `R = s / (2·sin(πk/n))`.

To orient the star point-up, place the first vertex `V₀` at the top of the circle — at `(center.x, center.y + R)`. The next vertex `V₁` sits at angle `(90° + 360°k/n)` on the same circle. Computing `atan2(V₁.y − V₀.y, V₁.x − V₀.x)` and simplifying algebraically gives the elegant result:

```
initial heading = 180° + 180°·k/n
```

This works for any valid `{n/k}`. For `{5/2}` it's 252°; for `{7/2}` it's ≈231°; for `{7/3}` it's ≈257°. No magic constants — the formula is exact for every case.

### Key learnings

1. **`sin(60°) = √3/2`** — the constant appears everywhere (hexagonal tilings, 30-60-90 triangles, honeycombs). Derived from Pythagoras on a bisected equilateral triangle: `h² + (s/2)² = s²` ⟹ `h = s√3/2`.
2. **Triangle centroid formula** — the average of the three vertices is the centre of mass. For equilateral triangles, it's **also** the incenter, circumcenter, and orthocenter (all four triangle centres coincide). This is unique to equilateral triangles.
3. **Three rendering styles in one flag** — pen paths (`drawRectAt`), geometry objects (`Triangle`), and filled rendering (`addFilledTriangle`). Puerto Rico is the first flag that uses all three.
4. **`drawStarCentered` is introduced here because this is where you first need it.** Section 13 (Filled Star) introduced `drawStarNK` as the simplest turtle star construction — positioned by starting vertex, facing east. Puerto Rico is the first exercise where you need to place a star **at a specific geometric point** (the triangle's centroid), which is the motivation for wrapping `drawStarNK` into a centre-positioned, point-up version. Australia (Section 14) and the USA (Section 21) both reuse `drawStarCentered` verbatim.
5. **Common hint error** — "side = height × 2/√3" is only correct if "height" means the perpendicular from base to apex. For Puerto Rico, the base is the left edge (= flag height), so `apex offset = base × √3/2`, not the other way around.

---

## Section 21 — United States

**Design:** 13 alternating red/white stripes + blue canton with 50 stars in a staggered grid.

**Proportions:** 19:10 ratio. Canton = 0.4 × flag width × 7 stripes tall.

**Star layout:** 11 rows, alternating 5 / 4 stars (6 rows of 5 + 5 rows of 4 = 50).

```swift
import Foundation
import UIKit

func drawUSA(at pos: Point, scale: Double) {
    let w: Double = 38 * scale
    let h: Double = 20 * scale
    let stripeH = h / 13

    // 1. 13 stripes — both ends red (since 13 is odd)
    for i in 0..<13 {
        let color: UIColor = (i % 2 == 0) ? .red : .white
        drawRectAt(
            at: Point(x: pos.x, y: pos.y + Double(i) * stripeH),
            w: w, h: stripeH, color: color
        )
    }

    // 2. Blue canton, top 7 stripes, 0.4 × flag width
    let cantonW = w * 0.4
    let cantonH = 7 * stripeH
    let cantonPos = Point(x: pos.x, y: pos.y + h - cantonH)
    drawRectAt(at: cantonPos, w: cantonW, h: cantonH, color: .blue)

    // 3. 50 stars — 11 rows alternating 5/4
    let rows = 11
    let maxStars = 5
    let rowSpacing = cantonH / Double(rows)
    let colSpacing = cantonW / Double(maxStars)
    let starSize   = rowSpacing * 0.7    // slightly smaller so points don't touch

    for row in 0..<rows {
        let starsInRow = (row % 2 == 0) ? 5 : 4
        // 5-star rows: stars at column positions 0.5, 1.5, 2.5, 3.5, 4.5
        // 4-star rows: stars at column positions 1, 2, 3, 4
        let xOffset    = (row % 2 == 0) ? colSpacing / 2 : colSpacing

        // Row 0 = top of canton; y decreases as row increases
        let rowY = cantonPos.y + cantonH - (Double(row) + 0.5) * rowSpacing

        for col in 0..<starsInRow {
            let starX = cantonPos.x + xOffset + Double(col) * colSpacing

            // drawStarCentered takes the centre directly — no offsets needed.
            drawStarCentered(
                at: Point(x: starX, y: rowY),
                n: 5, k: 2,
                size: starSize,
                color: .white
            )
        }
    }
}
```

**Key learnings:**

1. **Parity determines endpoint colour.** With 13 stripes (odd), both the top stripe (i = 12) and bottom stripe (i = 0) are red. An even stripe count would give different end colours.
2. **Alternating pattern in two lines.** The entire staggered layout comes from two ternary expressions:
   ```swift
   let starsInRow = (row % 2 == 0) ? 5 : 4
   let xOffset    = (row % 2 == 0) ? colSpacing / 2 : colSpacing
   ```
3. **Odd rows centre between even rows.** Even row star positions are `c + 0.5` column widths; odd row positions are `c + 1` (= midpoint of two adjacent even stars). This is a **rhombic/brick-wall lattice** — the same lattice that appears in crystallography, brick walls, and hexagonal close-packing.
4. **Top-to-bottom row indexing in a bottom-up coordinate system.** The loop indexes row 0 as the top; converting to y requires `cantonPos.y + cantonH - (row + 0.5) × rowSpacing`.
5. **`drawStarCentered` eliminates the fudge factors.** An earlier version used `drawStarNK` (or the similar vertex-positioned `drawStar`) with compensation offsets `(−starSize × 0.5, −starSize × 0.3)` to approximate the star's centre. Since `drawStarCentered` was introduced in Puerto Rico, we can pass the cell's centre `(starX, rowY)` directly — no offsets, no approximation, point-up automatically.
6. **The real US flag has 9 rows, not 11.** The exercise explicitly asks for 11 rows of 5/4 (which gives 50), but the real flag uses 9 rows of 6/5 (also 50). To match the real flag: change `rows = 9` and `maxStars = 6` — the rest of the code is unchanged.

**The USA is the capstone** — it uses nearly every technique in the chapter: loops, nested loops, modular arithmetic, `drawRectAt`, `drawStarCentered`, nested coordinate frames, and parity-based alternation.

---

## Cross-cutting patterns

### 1. The abstraction ladder

Every flag builds on the helpers from earlier flags. Here's the dependency stack:

```
Rectangles → drawRectAt (Section 17 Positions)
               │
               ├── Denmark, Sweden, Norway, St George,
               │   France, Netherlands, stripes everywhere
               │
               ├── drawCrossInBox (Switzerland, Tonga)
               │
               └── Union Jack background, USA stripes & canton,
                   Australia background, Puerto Rico stripes

Saltires → hexagonal polygon technique (Section 09 St Andrew)
               │
               ├── St Patrick (same pattern, different colour)
               │
               └── Union Jack (two layered saltires)
                     │
                     └── Australia (Union Jack as canton)

Stars → drawStarNK (Section 13 Filled Star — vertex-positioned)
               │
               └── drawStarCentered (Section 20 Puerto Rico)
                     │         takes centre directly, orients point-up
                     │
                     ├── Australia ({7/3} + {5/2})
                     │
                     └── USA (50× {5/2} in staggered grid)

Triangles → Triangle + addFilledTriangle (Section 20 Puerto Rico)
```

**Rule of thumb:** don't extract a helper after seeing one instance. After two, consider it. After three, definitely extract.

The star pathway is a particularly clean example: `drawStarNK` is introduced as a standalone turtle construction in Section 13, then re-wrapped as `drawStarCentered` the moment Puerto Rico needs a star positioned at a specific geometric point. Australia and the USA then reuse `drawStarCentered` verbatim — no further wrappers needed.

### 2. Coordinate frames

Three frame layers appear in the chapter:

| Frame | Example | Math |
|---|---|---|
| **Canvas** | where the flag sits | `pos` parameter |
| **Flag** | where elements sit within the flag | `pos + (x, y)` offsets |
| **Canton** | where a cross sits within a canton | `cantonPos + centringOffsets` |

Tonga, Australia, and the USA all use 3 nested frames. Every `goto` call is really "start from my frame's origin, then offset".

### 3. Layered rendering (painter's algorithm)

Borders and fimbriation are **never** drawn as outlines. They're created by painting a wider shape first, then a narrower shape on top:

- Norway: white cross (thickness 4) → blue cross (thickness 2) = 1-unit white border
- Union Jack: white saltire (`h/5`) → red saltire (`h/15`) = `h/15` white fimbriation each side
- Union Jack: white plus (`h/3`) → red plus (`h/5`) = `h/15` white border each side

**Both Union Jack fimbriations come out to `h/15`** — that's what makes the white borders look visually consistent between the saltire and the centre cross. Spec-driven proportions aren't just aesthetics; they're what makes the painter's algorithm produce an even border everywhere.

This pattern is **everywhere** in vector graphics and is essentially the reason z-ordering matters.

### 3a. Polygons vs. strokes for thick shapes

A recurring pitfall in the chapter: reaching for `lineWidth` to draw thick diagonal lines. This fails at the saltire exercises because strokes have two properties you can't turn off:

1. **Line caps extend past endpoints.** A stroke of width `W` has a cap (rounded or squared) at each end that extends `W/2` beyond the endpoint. You can't clip it.
2. **Width is perpendicular to the direction.** The stroke sits symmetrically on both sides of the centreline, so even without caps, the corners of a diagonal thick stroke at a rectangle corner will poke outside the rectangle.

Both problems disappear if you use a **filled polygon** with vertices at exactly the positions you want. The polygon can't escape its own vertices — ever.

| Use case | Use `lineWidth` stroke? | Use filled polygon? |
|---|---|---|
| Outline of a shape | ✅ | — |
| Thin horizontal/vertical line | ✅ (no corners to spill past) | either |
| Thick diagonal bar | ❌ spills past corners | ✅ |
| Saltire on a flag | ❌ | ✅ — see Section 09 |
| Cross bars (horizontal/vertical) | ❌ bordering problems | ✅ — use `drawRectAt` |

**Rule of thumb:** if a filled region needs to exactly match a shape boundary, use a polygon. Save strokes for decorative outlines and true single-pixel lines.

### 4. Symmetry groups by flag

| Flag | Group | Order | Reflections |
|---|---|---|---|
| Denmark, Sweden, Norway | horizontal only | 2 | 1 (cross offset breaks vertical) |
| St George, St Andrew, St Patrick, Netherlands, France | D₂ | 4 | horizontal + vertical |
| **Switzerland** | **D₄** | **8** | horizontal, vertical, both diagonals |
| Union Jack | D₂ nominal | 4 | (trivial once counterchange added) |
| Tonga, Australia, USA, Puerto Rico | trivial | 1 | none (canton or off-centre element breaks everything) |

**Key observation:** Switzerland is the **only** D₄ flag in the chapter. You need both a square flag **and** a centred cross with equal-width arms. Every other centring or squaring alone is insufficient.

### 5. Inclusion–exclusion

Wherever two shapes overlap, total area = `|A| + |B| − |A ∩ B|`.

- Swiss cross area: `2 × (arm × long) − arm²`
- Union Jack fimbriation: intersections of red and white shapes

You never need to compute these for the renderer (painting on top just works), but they're essential for **reasoning about** the shape — and for curriculum connections to Venn diagrams and probability.

### 6. Fractional positioning vs. absolute positioning

**Absolute** (`x: 10 * scale`): good when the dimension is fixed by spec (Denmark cross at x = 10 out of 28).

**Fractional** (`x: w * 0.22`): good when elements should scale with the flag (Australia's Southern Cross stars).

**Rule of thumb:** if you'd describe the position as "one-third of the way across" use fractions. If you'd describe it as "10 units from the hoist" use absolutes × scale. Australia uses both: Union Jack position is fractional (`pos + (0, h/2)`), Union Jack internal dimensions are absolute-×-scale.

### 7. The `var` vs `let` reminder

Pens in this API are **value types with mutating methods**. `let p = Pen()` will fail to compile when you call `p.addLine(...)` or `p.goto(...)`. Always `var`.

### 8. The "integer division" trap

```swift
// ❌ wrong — 180/5 = 36, then Double(36) = 36.0, then × 2 = 72
let angle = Double(180 - 180 / points) * 2

// ✅ right — convert to Double *before* dividing
let angle = 720.0 / Double(points)
```

`180/5` is computed as integer division because both operands are Int, giving 36. Converting **after** the division loses precision. The fix is to use `Double` literals (`720.0`) or cast the operands first (`Double(points)`).

### 9. Refactoring signals

When to extract a helper:

| Signal | Example |
|---|---|
| Same rectangle pattern, 3+ times | `drawRectAt` |
| Same diagonal stroke, 2 flags | `drawSaltire` |
| Same centring math, Switzerland and Tonga | `drawCrossInBox` |
| Same flag nested inside another | Union Jack with `(ox, oy, width)` |
| Two flags differ only in colour | `drawSaltireFlag(bgColor:, crossColor:)` |

When **not** to extract:

- Three lines of code that appear once (France tricolour — just inline it)
- Shapes with different-enough structure (Puerto Rico triangle vs. any rectangle)
- Before you've seen the second example (premature abstraction)

---

## Appendix — full helper library

For copy-paste convenience, the complete set of reusable helpers needed for every exercise in the chapter. **Both imports are required** — `Foundation` for `sqrt`/`atan2`, `UIKit` for the `UIColor` parameter types.

```swift
import Foundation
import UIKit

// --- Filled rectangle at an absolute position ---
func drawRectAt(at pos: Point,
                w: Double, h: Double, color: UIColor) {
    var p = Pen()
    p.penColor = color
    p.fillColor = color
    p.goto(x: pos.x, y: pos.y)
    for _ in 1...2 {
        p.addLine(distance: w); p.turn(degrees: 90)
        p.addLine(distance: h); p.turn(degrees: 90)
    }
    addShape(pen: p)
}

// --- Hexagonal saltire — two filled 6-vertex polygons whose long edges ---
// are strictly parallel to the true flag diagonal (w, h). Two saltires of
// different thicknesses layered on the same flag stay perfectly parallel.
// T = perpendicular thickness of the bar.
func drawSaltireIn(pos: Point, w: Double, h: Double,
                   color: UIColor, perpendicular T: Double) {
    let diag = sqrt(w*w + h*h)
    let eh = T * diag / (2 * h)
    let ew = T * diag / (2 * w)

    let bar1 = Polygon(vertices: [
        Point(x: pos.x,          y: pos.y),
        Point(x: pos.x + eh,     y: pos.y),
        Point(x: pos.x + w,      y: pos.y + h - ew),
        Point(x: pos.x + w,      y: pos.y + h),
        Point(x: pos.x + w - eh, y: pos.y + h),
        Point(x: pos.x,          y: pos.y + ew)
    ])
    addFilledPolygon(bar1, fillColor: color, borderColor: color, lineWidth: 1)

    let bar2 = Polygon(vertices: [
        Point(x: pos.x,          y: pos.y + h),
        Point(x: pos.x,          y: pos.y + h - ew),
        Point(x: pos.x + w - eh, y: pos.y),
        Point(x: pos.x + w,      y: pos.y),
        Point(x: pos.x + w,      y: pos.y + ew),
        Point(x: pos.x + eh,     y: pos.y + h)
    ])
    addFilledPolygon(bar2, fillColor: color, borderColor: color, lineWidth: 1)
}

// --- Centred plus-cross inside any rectangular box ---
func drawCrossInBox(at pos: Point,
                    boxW: Double, boxH: Double,
                    arm: Double, long: Double,
                    color: UIColor) {
    drawRectAt(
        at: Point(x: pos.x + (boxW - long) / 2,
                  y: pos.y + (boxH - arm)  / 2),
        w: long, h: arm, color: color
    )
    drawRectAt(
        at: Point(x: pos.x + (boxW - arm)  / 2,
                  y: pos.y + (boxH - long) / 2),
        w: arm, h: long, color: color
    )
}

// --- {n/k} star polygon at a starting vertex (Section 13 intro version) ---
// Used by the standalone Filled Star demo. For flag composition use
// drawStarCentered instead.
func drawStarNK(at position: Point, n: Int, k: Int,
                size: Double, color: UIColor) {
    let angle = 360.0 * Double(k) / Double(n)
    var star = Pen()
    star.penColor = color
    star.fillColor = color
    star.goto(x: position.x, y: position.y)
    for _ in 0..<n {
        star.addLine(distance: size)
        star.turn(degrees: angle)
    }
    addShape(pen: star)
}

// --- {n/k} star polygon centred at a point, oriented point-up ---
// Introduced in Section 20 Puerto Rico. Used by Puerto Rico, Australia,
// and the USA. Takes the star's centre directly and orients it with one
// vertex pointing straight up — no compensation offsets needed.
func drawStarCentered(at center: Point, n: Int, k: Int,
                      size: Double, color: UIColor) {
    let R = size / (2 * sin(.pi * Double(k) / Double(n)))
    let initialHeadingDeg = 180.0 + 180.0 * Double(k) / Double(n)
    let turnDeg = 360.0 * Double(k) / Double(n)

    var star = Pen()
    star.penColor = color
    star.fillColor = color

    star.goto(x: center.x, y: center.y + R)
    star.turn(degrees: initialHeadingDeg)

    for _ in 0..<n {
        star.addLine(distance: size)
        star.turn(degrees: turnDeg)
    }
    addShape(pen: star)
}
```

With these five helpers — plus `drawUnionJack` for the flags that use it — every exercise in Chapter 5 collapses into a handful of function calls. The helpers are the curriculum's real teaching payload; the flags are just motivating problems.
