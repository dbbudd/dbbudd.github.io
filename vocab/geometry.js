/* ═══════════════════════════════════════════════════════════════
   vocab/geometry.js — Geometry Playground shared vocabulary
   -----------------------------------------------------------------
   A plain JavaScript dictionary of math + coding terms used across
   the Geometry Playground chapters. Included via a <script> tag
   BEFORE course-ui.js loads, so the library picks it up synchronously
   without needing fetch().

   Adding a term: drop a new entry into the array below. Every term
   is an object { term, def, aliases? }:
     term     — the canonical word or phrase shown in the article
     def      — the definition shown in the popover
     aliases  — [optional] other spellings/inflections that should pop
                the same definition (e.g. "congruence" → "congruent")

   Multiple dictionaries can be combined by loading several vocab/*.js
   files in order; later files win on duplicate keys.
   ═══════════════════════════════════════════════════════════════ */
(function (global) {
  'use strict';

  const terms = [
    /* ── Geometry ──────────────────────────────────────────── */
    {
      term: 'Pen',
      def: 'An object that draws lines on the canvas. A pen has a position (where it is) and a direction (which way it faces), and it leaves a trail whenever you step it forward.'
    },
    {
      term: 'origin',
      def: 'The point (0, 0) where the x- and y-axes meet. The pen starts here, facing right along the positive x-axis.'
    },
    {
      term: 'Cartesian coordinate system',
      def: 'A grid that locates points using (x, y) pairs. x measures horizontal distance from the origin; y measures vertical distance.',
      aliases: ['Cartesian plane', 'coordinate system']
    },
    {
      term: 'anti-clockwise',
      def: 'Rotating in the opposite direction to the hands of a clock. In maths, positive angles always turn anti-clockwise from the positive x-axis.',
      aliases: ['counter-clockwise']
    },
    {
      term: 'interior angle',
      def: 'The angle inside a polygon at a corner (vertex). For a square the interior angle is 90°; for an equilateral triangle it is 60°.'
    },
    {
      term: 'exterior angle',
      def: 'The supplement of the interior angle — the amount you turn to keep walking along the boundary of a polygon. Interior + exterior = 180°.'
    },
    {
      term: 'supplementary',
      def: 'Two angles are supplementary if they add up to exactly 180°.'
    },
    {
      term: 'convex polygon',
      def: 'A polygon where every interior angle is less than 180° and no side bends inwards.',
      aliases: ['convex']
    },
    {
      term: 'acute',
      def: "An angle less than 90°. 'Acute' means sharp — like the tip of a needle."
    },
    {
      term: 'obtuse',
      def: "An angle greater than 90° but less than 180°. 'Obtuse' means blunt."
    },
    {
      term: 'reflex',
      def: "An angle greater than 180° but less than 360° — a 'bent-backward' angle."
    },
    {
      term: 'equilateral',
      def: 'A triangle with three equal sides and three equal angles of 60°.',
      aliases: ['equilateral triangle']
    },
    {
      term: 'isosceles',
      def: 'A triangle with at least two equal sides, and two equal base angles opposite them.',
      aliases: ['isosceles triangle']
    },
    {
      term: 'scalene',
      def: 'A triangle with all three sides of different lengths and all three angles different.',
      aliases: ['scalene triangle']
    },
    {
      term: 'quadrilateral',
      def: 'A four-sided polygon. Squares, rectangles, rhombuses, parallelograms, and trapeziums are all quadrilaterals.'
    },
    {
      term: 'parallelogram',
      def: 'A quadrilateral with two pairs of parallel sides. Opposite sides are equal in length; opposite angles are equal.',
      aliases: ['parallelograms']
    },
    {
      term: 'similar figures',
      def: 'Shapes that have the same shape but (possibly) different sizes. Corresponding angles are equal and corresponding sides are in the same ratio.',
      aliases: ['similar', 'similarity']
    },
    {
      term: 'scale factor',
      def: 'The ratio by which every length in a shape is multiplied to produce a similar shape. A scale factor of 2 doubles every length — and quadruples the area.'
    },
    {
      term: 'congruent',
      def: 'Two shapes are congruent if they have the same size and shape — one can be mapped to the other by a rigid transformation (slide, flip, or rotation).',
      aliases: ['congruence']
    },
    {
      term: 'translation',
      def: 'A transformation that slides every point of a shape by the same distance in the same direction, without rotating or resizing.',
      aliases: ['translations', 'translate']
    },
    {
      term: 'rotation',
      def: 'A transformation that turns a shape around a fixed point (the centre of rotation) by a given angle.',
      aliases: ['rotations', 'rotate']
    },
    {
      term: 'rotational symmetry',
      def: 'A shape has rotational symmetry if it looks the same after being rotated by less than 360°. A square has order-4 rotational symmetry (90°, 180°, 270°).'
    },
    {
      term: 'star polygon',
      def: 'A polygon whose path winds around its centre more than once, creating a pointed star. Written {n/k} — for example, a pentagram is {5/2}.',
      aliases: ['pentagram', 'hexagram']
    },

    /* ── Angle classifications ─────────────────────────────── */
    {
      term: 'right angle',
      def: 'An angle of exactly 90° — the corner of a square. Also called a perpendicular angle.'
    },
    {
      term: 'straight angle',
      def: 'An angle of exactly 180° — a straight line, treated as the special case of an "angle" between two opposite rays.'
    },
    {
      term: 'clockwise',
      def: 'Rotating in the same direction as the hands of a clock. In maths, clockwise rotations are represented by NEGATIVE angles (because positive = anti-clockwise).'
    },

    /* ── Quadrilaterals ─────────────────────────────────────── */
    {
      term: 'rectangle',
      def: 'A quadrilateral with four right angles and two pairs of equal parallel sides. A square is a special rectangle where all four sides are equal.',
      aliases: ['rectangles']
    },
    {
      term: 'square',
      def: 'A regular quadrilateral — four equal sides and four right angles. A square is simultaneously a special rectangle, a special rhombus, and a special parallelogram.',
      aliases: ['squares']
    },
    {
      term: 'rhombus',
      def: 'A quadrilateral with four equal sides. Opposite sides are parallel; opposite angles are equal. A square is a rhombus where all the angles happen to be 90°.',
      aliases: ['rhombuses', 'rhombi']
    },
    {
      term: 'trapezoid',
      def: 'A quadrilateral with at least one pair of parallel sides. (In UK English this is called a "trapezium".)',
      aliases: ['trapezium']
    },
    {
      term: 'concave',
      def: 'A polygon where at least one interior angle is greater than 180° — i.e. the shape has a "dented-in" corner. The opposite of convex.'
    },

    /* ── Triangle types ─────────────────────────────────────── */
    {
      term: 'right triangle',
      def: 'A triangle with one angle of exactly 90°. The side opposite the right angle is the hypotenuse; the other two sides are the legs.',
      aliases: ['right-angled triangle']
    },
    {
      term: '45-45-90 triangle',
      def: 'A right triangle where the two non-right angles are both 45°. Its two legs are equal, and the hypotenuse is √2 times the leg length.'
    },
    {
      term: 'triangle inequality',
      def: "For any triangle, the sum of any two side lengths must be strictly greater than the third side. If it isn't, the three sides cannot close into a triangle."
    },
    {
      term: 'triangle angle sum theorem',
      def: 'In any triangle, the three interior angles always add up to exactly 180°. This is the foundational rule behind most triangle geometry.',
      aliases: ['angle sum theorem']
    },

    /* ── Measurement ────────────────────────────────────────── */
    {
      term: 'perimeter',
      def: 'The total distance around the boundary of a shape. For a rectangle: P = 2(width + height). For any polygon: add up every side length.'
    },
    {
      term: 'area',
      def: 'The amount of surface a 2D shape covers, measured in square units. Rectangle: width × height. Triangle: ½ × base × height. Doubling every length quadruples the area.'
    },
    {
      term: 'ratio',
      def: 'A comparison of two quantities, written as a:b or a/b. Similar shapes have corresponding sides in the same ratio — this ratio is the scale factor.'
    },

    /* ── Symmetry & transformations ─────────────────────────── */
    {
      term: 'line of symmetry',
      def: 'An imaginary line that divides a shape into two mirror-image halves. A square has 4 lines of symmetry; an equilateral triangle has 3; a circle has infinitely many.',
      aliases: ['lines of symmetry', 'axis of symmetry', 'line symmetry']
    },
    {
      term: 'rigid transformation',
      def: 'A transformation that preserves size and shape — translation, rotation, and reflection all qualify. Rigid transformations produce congruent images.',
      aliases: ['rigid motion']
    },
    {
      term: 'reflection',
      def: 'A transformation that flips a shape across a line (the line of reflection), producing a mirror image.',
      aliases: ['reflections', 'reflect']
    },

    /* ── Parallel lines & angle theorems ────────────────────── */
    {
      term: 'parallel',
      def: 'Two lines are parallel if they never meet, no matter how far they extend. Parallel lines stay exactly the same distance apart.',
      aliases: ['parallel lines']
    },
    {
      term: 'alternate interior angles',
      def: 'When a transversal crosses two parallel lines, the angles on opposite sides of the transversal and between the two parallel lines are equal. Also called "Z-angles" because of the shape they form.',
      aliases: ['Z-angles', 'Z angle', 'alternate angles']
    },

    /* ── Polygon formulas ───────────────────────────────────── */
    {
      term: 'regular polygon',
      def: 'A polygon where every side is the same length AND every angle is the same size. A regular triangle = equilateral triangle; a regular quadrilateral = square.',
      aliases: ['regular polygons']
    },
    {
      term: 'interior angle formula',
      def: 'For any polygon with n sides, the sum of interior angles is (n − 2) × 180°. For a regular polygon, each interior angle = (n − 2) × 180° / n.'
    },
    {
      term: 'exterior angle formula',
      def: 'For any convex polygon, the exterior angles sum to exactly 360° — one full rotation. For a regular n-gon, each exterior angle = 360° / n.'
    },

    /* ── Composition & centres ──────────────────────────────── */
    {
      term: 'composite figure',
      def: "A shape built by combining simpler shapes (squares, triangles, rectangles). Composite figures are the focus of Chapter 6 — building a house, a tree, a whole scene.",
      aliases: ['composite figures', 'composite shape', 'composite shapes']
    },
    {
      term: 'centroid',
      def: 'The "balance point" of a triangle — where its three medians meet. For an equilateral triangle of side s, the centroid sits at height s√3 / 6 above the base.',
      aliases: ['triangle centroid']
    },
    {
      term: 'inclusion–exclusion',
      def: 'A technique for counting or measuring when regions overlap: add the two parts, then subtract the overlap (counted twice). Useful for the area of a cross or a Venn diagram.',
      aliases: ['inclusion exclusion', 'inclusion-exclusion']
    },

    /* ══════════════════════════════════════════════════════════
       CODING
       ══════════════════════════════════════════════════════════ */

    {
      term: 'object',
      def: 'A bundle of data plus the methods (functions) that operate on it. A Pen is an object — it holds its position and direction, and methods like addLine and turn change those.'
    },
    {
      term: 'variable',
      def: "A named container that holds a value. In Swift, use 'var' if the value can change, or 'let' if it must stay constant.",
      aliases: ['variables']
    },
    {
      term: 'method',
      def: 'A function that belongs to an object. You call a method using dot notation, e.g. p.addLine(distance: 100).',
      aliases: ['methods']
    },
    {
      term: 'dot notation',
      def: 'The syntax for calling a method on an object: objectName.methodName(…). The dot connects the object to the method you want to run.'
    },

    /* ── Loops ──────────────────────────────────────────────── */
    {
      term: 'for loop',
      def: 'A loop that runs a block of code a fixed number of times. In Swift: `for i in 1...5 { … }` runs the body 5 times, with i taking values 1, 2, 3, 4, 5.',
      aliases: ['for-in loop', 'for-loop']
    },
    {
      term: 'closed range',
      def: 'A range that includes both endpoints. In Swift: `1...4` contains 1, 2, 3, 4. Written with three dots.'
    },
    {
      term: 'half-open range',
      def: 'A range that includes the start but excludes the end. In Swift: `0..<4` contains 0, 1, 2, 3 (but not 4). Written with two dots and a less-than.',
      aliases: ['half open range']
    },
    {
      term: 'nested loop',
      def: 'A loop inside another loop. The inner loop runs fully for each step of the outer loop. Total iterations multiply: outer × inner.',
      aliases: ['nested loops']
    },

    /* ── Conditionals ───────────────────────────────────────── */
    {
      term: 'if statement',
      def: 'A branch in the code: `if condition { … }` runs the block only when `condition` is true. Add `else` for a fallback branch, or `else if` for more options.',
      aliases: ['if-else statement', 'if-else']
    },
    {
      term: 'condition',
      def: 'A Boolean expression that evaluates to true or false. `sides == 3` and `length > 0` are conditions.',
      aliases: ['conditions']
    },
    {
      term: 'Boolean',
      def: 'A type with only two possible values: `true` or `false`. Used in conditions and comparisons. Named after the logician George Boole.',
      aliases: ['boolean', 'boolean expression', 'boolean expressions', 'booleans']
    },
    {
      term: 'logical operator',
      def: 'An operator that combines Boolean values. In Swift: `&&` (AND), `||` (OR), `!` (NOT). Used to build compound conditions.',
      aliases: ['logical operators']
    },
    {
      term: 'short-circuit evaluation',
      def: "When evaluating `a && b`, if `a` is false, `b` is never checked (the whole thing is already false). Same for `||` with `a` true. This saves work — and can prevent errors."
    },
    {
      term: "De Morgan's laws",
      def: 'Two rules for negating compound conditions: NOT (A AND B) = (NOT A) OR (NOT B); and NOT (A OR B) = (NOT A) AND (NOT B). Useful when rewriting complex checks.',
      aliases: ["De Morgan's law", 'De Morgan']
    },

    /* ── Functions ──────────────────────────────────────────── */
    {
      term: 'function',
      def: 'A named, reusable block of code that takes inputs (parameters) and may return an output. Functions are introduced in Chapter 5.',
      aliases: ['functions']
    },
    {
      term: 'parameter',
      def: "An input to a function. In `func square(side: Int)`, `side` is the parameter. When you call the function, you supply a matching argument.",
      aliases: ['parameters']
    },
    {
      term: 'argument label',
      def: 'The name shown before a parameter when calling a Swift function. In `addLine(distance: 100)`, `distance:` is the argument label.',
      aliases: ['argument labels']
    },
    {
      term: 'default value',
      def: 'A fallback value used when none is supplied. In Swift: `func draw(sides: Int = 4)` — calling `draw()` with no argument uses sides = 4.'
    },

    /* ── Types ──────────────────────────────────────────────── */
    {
      term: 'type casting',
      def: 'Converting a value from one type to another. In Swift: `Double(sides)` converts an Int to a Double so decimal division works correctly.',
      aliases: ['type cast']
    },
    {
      term: 'integer division',
      def: 'When you divide one Int by another Int in Swift, the result is an Int with the decimal part TRUNCATED. `360 / 7` gives `51`, not `51.43`. To get the exact answer, cast at least one operand to Double.'
    },
    {
      term: 'string interpolation',
      def: 'Inserting values into a string using `\\(…)`. Example: `"Sides: \\(sides)"` becomes `"Sides: 7"` at runtime.'
    },

    /* ── Patterns ───────────────────────────────────────────── */
    {
      term: 'accumulator pattern',
      def: 'A coding pattern where a variable starts at an initial value and gets updated each loop iteration, accumulating a running total or offset. Common in layout code.'
    },
    {
      term: "painter's algorithm",
      def: "A rendering strategy that draws things from back to front — so later shapes paint over earlier ones. Used in Chapter 6 to layer composite scenes (background first, foreground last).",
      aliases: ['z-order', 'layered rendering']
    }
  ];

  /* ── Install into the CourseUI config ─────────────────────── */
  const cu = (global.CourseUI = global.CourseUI || {});
  const v  = (cu.vocab      = cu.vocab      || {});

  // Flatten { term, def, aliases } → { "term": "def", "alias1": "def", ... }
  const dict = {};
  terms.forEach(e => {
    if (!e || !e.term || !e.def) return;
    dict[e.term] = e.def;
    if (Array.isArray(e.aliases)) {
      e.aliases.forEach(a => { if (a) dict[a] = e.def; });
    }
  });

  // Merge. If the site's inline config already set `terms`, let those
  // win on duplicate keys (they're the more specific, per-page overrides).
  v.terms = Object.assign(dict, v.terms || {});
})(window);
