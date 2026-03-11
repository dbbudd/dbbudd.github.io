# Geometry Playground

A six-chapter Swift Playgrounds curriculum that teaches high school geometry through code. Students learn to draw shapes, classify figures, and build a complete suburban scene — all using Swift on iPad or Mac.

**Live site:** [dbbudd.github.io](https://dbbudd.github.io)

---

## About the Curriculum

Geometry Playground uses a visual, code-first approach to geometry — resembling Logo, the educational simulation designed by Seymour Papert at MIT. Each chapter introduces a new Swift programming concept alongside the geometry it makes possible, progressing from simple shapes to a fully composed scene.

The curriculum is aligned with the **Integrated Maths 1 (IM1)** course sequence, with conceptual foundations that extend into IM2 and IM3.

### Chapters

| # | Title | Key Concepts |
|---|-------|-------------|
| 01 | **Getting Started** | Pen API, coordinates, angles, area & perimeter |
| 02 | **Fancy Shapes** | Variables, multiple pens, symmetry, irregular polygons |
| 03 | **Doing Stuff Again** | Loops, regular polygons, interior angle formula, rotational symmetry |
| 04 | **Testing & Classifying** | Conditionals, Boolean logic, triangle & quadrilateral classification |
| 05 | **Tell It How** | Functions, parameters, similarity, geometric transformations |
| 06 | **Suburban Scene** | Composition, decomposition, composite figures, real-world modelling |

---

## Repository Structure

```
dbbudd.github.io/
├── index.html          # Curriculum home page
├── 01.html             # Chapter 1 — Getting Started
├── 02.html             # Chapter 2 — Fancy Shapes
├── 03.html             # Chapter 3 — Doing Stuff Again
├── 04.html             # Chapter 4 — Testing & Classifying
├── 05.html             # Chapter 5 — Tell It How
├── 06.html             # Chapter 6 — Suburban Scene
├── styles.css          # Shared stylesheet
├── feed.json           # Swift Playgrounds subscription feed
├── images/             # Site images (hero, chapter cards, profile)
└── Geometry/           # Playground book distribution files
```

This is a static site with no build step — plain HTML, CSS, and JavaScript, hosted on GitHub Pages.

---

## Swift Playgrounds Subscription

Students and teachers can subscribe to receive the playground directly in Swift Playgrounds on iPad or Mac:

**Subscribe link:**
```
https://developer.apple.com/ul/sp0?url=https://dbbudd.github.io/feed.json
```

The `feed.json` file at the root of this repository serves as the subscription feed. It follows the [Swift Playgrounds Feed Format](https://developer.apple.com/documentation/swift_playgrounds/creating_and_distributing_a_playground_book) and currently includes:

- **Geometry** (v6.0) — the full six-chapter playground book

When a new version of the playground book is published, update `contentVersion` and `lastUpdatedDate` in `feed.json` and replace the `.zip` file in the `Geometry/` folder.

---

## Adding Chapter Card Images

Each chapter card on the home page supports a thumbnail image at `images/ch0N-hero.png`. The recommended size is **1280 × 720px** (16:9). To activate an image, replace the placeholder `<div>` in `index.html` with:

```html
<img class="ch-card-img" src="images/ch0N-hero.png" alt="Chapter title">
```

---

## Documentation

Teaching notes, lesson guides, and curriculum documentation are published in the [GitHub Wiki](https://github.com/dbbudd/dbbudd.github.io/wiki).

---

## Author

**Daniel Budd**
Apple Distinguished Educator · Apple Professional Learning Specialist
School-Wide Technology Team Leader, Hong Kong International School

- [LinkedIn](https://www.linkedin.com/in/danielbudd/)
- [YouTube](https://www.youtube.com/@DanielBBudd)
- [GitHub](https://github.com/dbbudd)
