/* ═══════════════════════════════════════════════════════════════
   course-ui.js — reusable accessibility & reading library
   -----------------------------------------------------------------
   Configuration via window.CourseUI BEFORE this script loads:

     window.CourseUI = {
       brand:   { name: 'Geometry Playground', accent: '#F2B13E' },
       reading: { readingLine: true, readingPos: true, focusMode: true },
       theme:   { rememberPrefs: true, defaultFont: 'sans' },
       search:  {
         enabled: true,
         scope:   'page' | 'site',          // default 'page'
         pages:   [ 'index.html', '01.html', ... ],   // for 'site'
         sectionSelector: 'main.content > section[id]',
         pageTitleFallback: (doc) => doc.title
       },
       vocab: {
         enabled:  true,
         autoWrap: true,                  // scan text, wrap first occurrence per section
         contentSelector: '.article p, .article li',
         // Option A — inline dictionary
         terms: {
           'congruent': 'Two shapes are congruent when...',
           ...
         },
         // Option B — load from external file(s). Accepts .json, .yaml,
         // .yml, or .md. Later files override earlier ones; any inline
         // `terms` above are merged in last and win ties.
         src: 'vocab/geometry.json'
         // or src: ['vocab/core.json', 'vocab/chapter-01.json']
       },
       selectors: {
         toolbar:          '.topbar, header.site-header',   // where to mount buttons
         toolbarInsertBefore: '.topbar-progress, .overall-progress',
         mainContent:      'main.content, main',
         sections:         'main.content > section[id]',
         sidebar:          '.sidebar'
       }
     };

   Then:
     <link rel="stylesheet" href="course-ui/course-ui.css" />
     <script src="course-ui/course-ui.js" defer></script>
   ═══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ═════════════════════ 0. CONFIG + HELPERS ═════════════════════ */
  const CFG = Object.assign({
    brand:   {},
    reading: {},
    theme:   {},
    search:  {},
    vocab:   {},
    selectors: {}
  }, window.CourseUI || {});

  CFG.brand   = Object.assign({ accent: '#F2B13E' }, CFG.brand);
  CFG.theme   = Object.assign({ rememberPrefs: true, defaultFont: 'sans' }, CFG.theme);
  CFG.reading = Object.assign({ readingLine: true, readingPos: true, focusMode: true }, CFG.reading);
  CFG.search  = Object.assign({ enabled: false, scope: 'page', pages: [] }, CFG.search);
  CFG.vocab   = Object.assign({ enabled: false, autoWrap: true, terms: {} }, CFG.vocab);
  CFG.selectors = Object.assign({
    toolbar: '.topbar, header.site-header, header.topbar, .cu-toolbar-mount',
    toolbarInsertBefore: '.topbar-progress, .overall-progress',
    mainContent: 'main.content, main',
    sections: 'main.content > section[id], main > section[id]',
    sidebar: '.sidebar'
  }, CFG.selectors);

  if (CFG.brand.accent) {
    document.documentElement.style.setProperty('--cu-accent', CFG.brand.accent);
  }

  /* localStorage helper — namespace via site brand to avoid collisions
     when the same library is used on multiple course sites on the same
     domain (e.g. dbbudd.github.io/handbook, /geometry-playground). */
  const STORAGE_NS = 'cu_' + (CFG.brand.name || 'site').replace(/\W+/g, '_').toLowerCase() + '_';
  const P = {
    get(k, d) { try { return localStorage.getItem(STORAGE_NS + k) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(STORAGE_NS + k, v); } catch { /* ignore */ } }
  };

  const qs  = (sel, root) => (root || document).querySelector(sel);
  const qsa = (sel, root) => Array.from((root || document).querySelectorAll(sel));
  const escapeHTML = s => String(s).replace(/[&<>"']/g,
    c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));

  /* ═════════════════════ 1. THEME ════════════════════════════════ */
  function initTheme() {
    const saved = P.get('theme', null);
    if (saved === 'light' || saved === 'sepia' || saved === 'dark') {
      setThemeDOM(saved);
    } else if (window.matchMedia && matchMedia('(prefers-color-scheme: dark)').matches) {
      setThemeDOM('dark');
    } else {
      setThemeDOM('light');
    }
  }
  function setThemeDOM(t) {
    document.documentElement.setAttribute('data-theme', t);
    qsa('.cu-swatch').forEach(s => s.classList.remove('cu-active'));
    const sw = document.getElementById('cu-sw-' + t);
    if (sw) sw.classList.add('cu-active');
  }
  window.cuSetTheme = function (t) { setThemeDOM(t); P.set('theme', t); };

  /* ═════════════════════ 2. FONT FAMILY ══════════════════════════ */
  const FONTS = {
    sans:     '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", Helvetica, Arial, sans-serif',
    serif:    'Georgia, "Iowan Old Style", "Palatino Linotype", "Times New Roman", serif',
    dyslexic: '"OpenDyslexic", "Comic Sans MS", "Segoe UI", sans-serif'
  };
  function initFont() { setFontDOM(P.get('font', CFG.theme.defaultFont || 'sans')); }
  function setFontDOM(t) {
    const stack = FONTS[t] || FONTS.sans;
    document.documentElement.style.setProperty('--cu-body-font', stack);
    document.documentElement.style.setProperty('--cu-heading-font', stack);
    qsa('[id^="cu-btn-font-"]').forEach(b => b.classList.remove('cu-active'));
    const btn = document.getElementById('cu-btn-font-' + t);
    if (btn) btn.classList.add('cu-active');
  }
  window.cuSetFont = function (t) { setFontDOM(t); P.set('font', t); };

  /* ═════════════════════ 3. FONT SIZE ════════════════════════════ */
  let scale = parseFloat(P.get('fontScale', '1')) || 1;
  function applyScale() {
    document.documentElement.style.setProperty('--cu-font-scale', scale);
    P.set('fontScale', String(scale));
    const lbl = document.getElementById('cu-size-label');
    if (lbl) lbl.textContent = Math.round(scale * 100) + '%';
  }
  window.cuAdjustFontSize = function (dir) {
    if (dir === 0) scale = 1;
    else scale = Math.max(0.75, Math.min(1.5, +(scale + dir * 0.1).toFixed(2)));
    applyScale();
  };

  /* ═════════════════════ 4. FOCUS MODE ═══════════════════════════ */
  function initFocus() {
    if (!CFG.reading.focusMode) return;
    if (P.get('focus', 'false') === 'true') {
      document.body.classList.add('cu-focus-mode');
    }
    updateFocusBtn();
  }
  function updateFocusBtn() {
    const btn = document.getElementById('cu-btn-focus');
    if (btn) {
      const on = document.body.classList.contains('cu-focus-mode');
      btn.classList.toggle('cu-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    }
  }
  window.cuToggleFocus = function () {
    document.body.classList.toggle('cu-focus-mode');
    P.set('focus', document.body.classList.contains('cu-focus-mode') ? 'true' : 'false');
    updateFocusBtn();
  };

  /* ═════════════════════ 5. Aa POPOVER ═══════════════════════════ */
  window.cuToggleAa = function () {
    const pop = document.getElementById('cu-aa-popover');
    if (!pop) return;
    const open = !pop.classList.contains('cu-open');
    pop.classList.toggle('cu-open', open);
    const btn = document.getElementById('cu-btn-aa');
    if (btn) btn.setAttribute('aria-expanded', open ? 'true' : 'false');
    if (open) closeSearch();
  };
  function closeAa() {
    const pop = document.getElementById('cu-aa-popover');
    if (pop) pop.classList.remove('cu-open');
    const btn = document.getElementById('cu-btn-aa');
    if (btn) btn.setAttribute('aria-expanded', 'false');
  }

  /* ═════════════════════ 6. SEARCH ═══════════════════════════════ */
  /* Bump INDEX_VERSION whenever the index schema or build logic
     changes — all cached indices under the old version become
     unreadable and get rebuilt. */
  const INDEX_VERSION = 2;

  let searchIndex = null;
  let searchLoading = false;

  /* Normalize the "current page" URL to the filename form used in
     CFG.search.pages. Handles the root-page case where pathname is '/'
     and the filename would otherwise come out as ''. */
  function normalizeCurrentPage() {
    const pathParts = location.pathname.split('/');
    const last = pathParts[pathParts.length - 1];
    if (last && last.length) return last;
    // On '/' we're almost certainly looking at the site index
    return 'index.html';
  }

  window.cuToggleSearch = function () {
    if (!CFG.search.enabled) return;
    const input = document.getElementById('cu-search-input');
    const results = document.getElementById('cu-search-results');
    if (!input) return;
    const opening = !input.classList.contains('cu-open');
    if (opening) {
      input.classList.add('cu-open');
      setTimeout(() => input.focus(), 220);
      ensureSearchIndex();
      closeAa();
    } else {
      closeSearch();
    }
  };
  function closeSearch() {
    const input = document.getElementById('cu-search-input');
    const results = document.getElementById('cu-search-results');
    if (input) { input.classList.remove('cu-open'); input.value = ''; }
    if (results) { results.classList.remove('cu-open'); results.innerHTML = ''; }
    clearSearchHighlights();
  }

  /* Build index: page-scoped sync, site-scoped async via fetch.
     We wait for `vocabReady` before building so that any terms loaded
     from external JSON/YAML/MD are already wrapped in .cu-term and
     therefore picked up by the index walk.

     Cache rules:
       • Keyed by INDEX_VERSION so bumping it invalidates stale entries
       • ONLY written if every listed page loaded successfully
       • Reads are validated (complete flag, array shape) before use  */
  function ensureSearchIndex() {
    if (searchIndex || searchLoading) return;
    searchLoading = true;

    const rerunIfTyping = () => {
      const input = document.getElementById('cu-search-input');
      if (input && input.value.trim().length >= 2) runSearch(input.value);
    };

    vocabReady.then(() => {
      const siteScope =
        CFG.search.scope === 'site' &&
        Array.isArray(CFG.search.pages) &&
        CFG.search.pages.length > 0;

      if (!siteScope) {
        // Page-scoped
        searchIndex = buildPageIndex(document, normalizeCurrentPage());
        searchLoading = false;
        console.info('[course-ui] search index built (page scope):',
                     searchIndex.length, 'entries');
        rerunIfTyping();
        return;
      }

      // Site-scoped — check the cache first
      const cacheKey = 'searchIndex_v' + INDEX_VERSION;
      const cached = sessionStorage.getItem(STORAGE_NS + cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed && parsed.complete === true && Array.isArray(parsed.entries)) {
            searchIndex = parsed.entries;
            searchLoading = false;
            console.info('[course-ui] search index loaded from cache:',
                         parsed.entries.length, 'entries across', parsed.pageCount, 'pages');
            rerunIfTyping();
            return;
          }
        } catch {}
      }

      // No valid cache — build fresh
      return buildSiteIndex().then(result => {
        searchIndex = result.entries;
        searchLoading = false;

        if (result.complete) {
          try {
            sessionStorage.setItem(STORAGE_NS + cacheKey, JSON.stringify({
              complete:  true,
              pageCount: result.pageCount,
              entries:   result.entries
            }));
          } catch (e) {
            console.warn('[course-ui] failed to cache search index:', e);
          }
          console.info('[course-ui] search index built:',
                       result.entries.length, 'entries across',
                       result.pageCount, 'pages');
        } else {
          console.warn('[course-ui] search index INCOMPLETE — not caching.',
                       result.entries.length, 'entries from',
                       result.pageCount, 'of', CFG.search.pages.length, 'pages.',
                       'Failed:', result.failed);
          if (location.protocol === 'file:') {
            console.warn('[course-ui] You appear to be on file:// — cross-file fetch is blocked by CORS. Serve the site over HTTP (GitHub Pages, npx serve, etc.) to index the whole site.');
          }
        }
        rerunIfTyping();
      });
    });
  }

  function buildPageIndex(doc, pageUrl) {
    const out = [];
    const sectionSel = CFG.search.sectionSelector || CFG.selectors.sections;
    qsa(sectionSel, doc).forEach(section => {
      if (section.classList && section.classList.contains('chapter-banner')) return;
      const h = section.querySelector('h1, h2');
      if (!h) return;
      const paras = [];
      // Widened: include IM table cells so terms defined only there are
      // still searchable.
      section.querySelectorAll('p, li, blockquote, .lead, td').forEach(p => {
        const t = p.textContent.trim();
        if (t.length) paras.push(t);
      });
      out.push({
        title: h.textContent.trim(),
        text:  paras.join(' ').replace(/\s+/g, ' '),
        url:   pageUrl + '#' + section.id,
        type:  'section'
      });
    });
    // Vocabulary terms (either <dfn data-def="…"> or <span class="cu-term" data-def="…">)
    qsa('[data-def]', doc).forEach(el => {
      const term = (el.textContent || '').trim();
      const def  = el.getAttribute('data-def') || '';
      if (term && def) {
        out.push({
          title: term,
          text:  def,
          url:   pageUrl + (el.id ? '#' + el.id : ''),
          type:  'vocab',
          // Keep a reference to the element so in-page navigation can highlight it
          _el:   el
        });
      }
    });
    return out;
  }

  /* Site-wide index builder.
     Returns { entries, pageCount, failed, complete } so ensureSearchIndex
     can decide whether to cache the result and report accurate diagnostics
     to the console. */
  async function buildSiteIndex() {
    const pages = CFG.search.pages.slice();
    const here = normalizeCurrentPage();
    const entries = [];
    const failed = [];
    let pageCount = 0;

    // Index the current page synchronously — no fetch required.
    entries.push(...buildPageIndex(document, here));
    pageCount++;

    // Fetch every OTHER listed page in parallel.
    const others = pages.filter(p => p !== here);
    const results = await Promise.all(others.map(async page => {
      try {
        const res = await fetch(page, { credentials: 'same-origin' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const html = await res.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        return { page, entries: buildPageIndex(doc, page) };
      } catch (err) {
        return { page, error: (err && err.message) || String(err) };
      }
    }));
    results.forEach(r => {
      if (r.error) {
        failed.push(r.page + ' (' + r.error + ')');
        return;
      }
      entries.push(...r.entries);
      pageCount++;
    });

    return {
      entries,
      pageCount,
      failed,
      complete: failed.length === 0
    };
  }

  function runSearch(raw) {
    const input = document.getElementById('cu-search-input');
    const results = document.getElementById('cu-search-results');
    if (!results) return;
    const q = raw.trim().toLowerCase();
    clearSearchHighlights();
    if (q.length < 2) { results.classList.remove('cu-open'); return; }
    if (!searchIndex) {
      results.innerHTML = '<div class="cu-search-empty">Building index…</div>';
      results.classList.add('cu-open');
      return;
    }
    const matches = [];
    searchIndex.forEach(item => {
      const t = item.title.toLowerCase();
      const x = item.text.toLowerCase();
      let score = 0;
      if (t === q) score += 40;
      if (t.includes(q)) score += 10;
      if (x.includes(q)) score += 1;
      if (score > 0) matches.push(Object.assign({ _score: score }, item));
    });
    matches.sort((a, b) => b._score - a._score);
    if (!matches.length) {
      results.innerHTML = '<div class="cu-search-empty">No results for "' + escapeHTML(q) + '"</div>';
      results.classList.add('cu-open');
      return;
    }
    const shown = matches.slice(0, 10);
    let html = '<div class="cu-search-header">' + matches.length + ' result' + (matches.length !== 1 ? 's' : '') + '</div>';
    shown.forEach((m, i) => {
      // Snippet with highlight
      const textLow = m.text.toLowerCase();
      const idx = textLow.indexOf(q);
      let snippet = '';
      if (idx >= 0) {
        const start = Math.max(0, idx - 45);
        const end   = Math.min(m.text.length, idx + q.length + 75);
        snippet = (start > 0 ? '…' : '') +
          escapeHTML(m.text.substring(start, idx)) +
          '<mark>' + escapeHTML(m.text.substring(idx, idx + q.length)) + '</mark>' +
          escapeHTML(m.text.substring(idx + q.length, end)) +
          (end < m.text.length ? '…' : '');
      } else {
        snippet = escapeHTML(m.text.substring(0, 120) + (m.text.length > 120 ? '…' : ''));
      }
      const icon = m.type === 'vocab' ? '📖 ' : '📄 ';
      const source = m.url && m.url.split('#')[0]
        ? '<span class="cu-search-source">' + escapeHTML(m.url.split('#')[0] || 'this page') + '</span>'
        : '';
      html += '<a class="cu-search-result" href="' + escapeHTML(m.url) + '" data-idx="' + i + '">' +
              '<div class="cu-search-title">' + icon + escapeHTML(m.title) + source + '</div>' +
              '<div class="cu-search-snippet">' + snippet + '</div>' +
              '</a>';
    });
    results.innerHTML = html;
    results.classList.add('cu-open');

    // Attach click handlers
    qsa('.cu-search-result', results).forEach((el, i) => {
      el.addEventListener('click', function (e) {
        const m = shown[i];
        const [pagePart, hashPart] = (m.url || '').split('#');
        const samePage = !pagePart || pagePart === (location.pathname.split('/').pop() || '');
        if (samePage && hashPart) {
          e.preventDefault();
          const target = document.getElementById(hashPart);
          if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            flashHighlight(target);
          }
          closeSearch();
        }
        // Cross-page: allow default navigation (the href opens the other page with its hash)
      });
    });
  }

  function flashHighlight(el) {
    el.classList.add('cu-search-hit');
    setTimeout(() => el.classList.remove('cu-search-hit'), 1800);
  }
  function clearSearchHighlights() {
    qsa('.cu-search-hit').forEach(el => el.classList.remove('cu-search-hit'));
  }

  /* ═════════════════════ 7. VOCABULARY ═══════════════════════════ */
  let vocabReady = Promise.resolve();

  async function initVocab() {
    if (!CFG.vocab.enabled) return;

    // Ensure the global popover element exists
    if (!document.getElementById('cu-term-popover')) {
      const pop = document.createElement('div');
      pop.id = 'cu-term-popover';
      document.body.appendChild(pop);
    }

    // Build the merged dictionary in this priority order (later wins):
    //   1. External source(s) in CFG.vocab.src (loaded in order)
    //   2. Inline CFG.vocab.terms
    let merged = {};
    const srcs = CFG.vocab.src
      ? (Array.isArray(CFG.vocab.src) ? CFG.vocab.src : [CFG.vocab.src])
      : [];
    if (srcs.length) {
      const results = await Promise.all(srcs.map(async src => {
        try { return await loadVocabDict(src); }
        catch (err) {
          console.warn('[course-ui] Failed to load vocab source:', src, err);
          return {};
        }
      }));
      results.forEach(dict => { Object.assign(merged, dict); });
    }
    if (CFG.vocab.terms && typeof CFG.vocab.terms === 'object') {
      Object.assign(merged, CFG.vocab.terms);
    }

    // 1) Explicit markup: any element with [data-def] → apply .cu-term styling
    qsa('[data-def]').forEach(el => {
      el.classList.add('cu-term');
      if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
    });

    // 2) Dictionary mode: auto-wrap first occurrence of each term per page
    //    in regular prose, then ALSO decorate every <strong> element
    //    whose text matches a vocab key (even after the first pass). This
    //    gives authors a simple rule: "if you bold a vocab term, it gets
    //    a popover — everywhere."
    if (Object.keys(merged).length) {
      if (CFG.vocab.autoWrap) {
        autoWrapTerms(merged);
      }
      decorateBoldTerms(merged);
    }

    // Attach popover event delegation
    attachTermPopovers();
  }

  /* Second pass: decorate every <strong>/<b> whose whole text matches a
     vocab term (case-insensitive, trimmed, with trailing punctuation
     stripped). Safe to run after autoWrapTerms — it never wraps a
     <strong> that's already inside a .cu-term, and it never wraps
     inside code/pre/a/script/style. */
  function decorateBoldTerms(dict) {
    // Build a case-insensitive lookup
    const lookup = {};
    Object.keys(dict).forEach(k => {
      lookup[k.toLowerCase().trim()] = dict[k];
    });
    // Scan all <strong> and <b> inside main content
    const bolds = qsa('main strong, main b, .article strong, .article b');
    bolds.forEach(el => {
      if (el.classList.contains('cu-term')) return;
      if (el.closest('.cu-term')) return;
      if (el.closest('code, pre, a, script, style')) return;
      // Only decorate if the ENTIRE textContent is a known term (no
      // partial matches — avoids decorating bolded sub-phrases).
      const text = (el.textContent || '')
        .replace(/[.,;:!?]+$/, '')
        .trim()
        .toLowerCase();
      if (!text) return;
      const def = lookup[text];
      if (def) {
        el.classList.add('cu-term');
        el.setAttribute('data-def', def);
        if (!el.hasAttribute('tabindex')) el.setAttribute('tabindex', '0');
      }
    });
  }

  /* ── Vocab file loaders ────────────────────────────────────── */
  async function loadVocabDict(src) {
    const res = await fetch(src, { credentials: 'same-origin' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const text = await res.text();
    const ext = (src.split('.').pop() || '').toLowerCase();
    if (ext === 'json') return parseVocabJSON(text);
    if (ext === 'yaml' || ext === 'yml') return parseVocabYAML(text);
    if (ext === 'md' || ext === 'markdown') return parseVocabMarkdown(text);
    // Unknown extension — assume JSON
    return parseVocabJSON(text);
  }

  /* JSON: supports two shapes.
     A. Object form — { "term": "definition", ... }
     B. Array form  — [{ "term": "...", "def": "...", "aliases": ["..."] }, ...] */
  function parseVocabJSON(text) {
    const data = JSON.parse(text);
    const out = {};
    if (Array.isArray(data)) {
      data.forEach(e => {
        if (!e || !e.term || !e.def) return;
        out[e.term] = e.def;
        if (Array.isArray(e.aliases)) {
          e.aliases.forEach(a => { if (a) out[a] = e.def; });
        }
      });
    } else if (data && typeof data === 'object') {
      Object.assign(out, data);
    }
    return out;
  }

  /* Markdown: one term per H2, definition is the paragraph(s) underneath.

       ## congruent
       Two shapes are congruent when they have the same size and shape.

       ## translation
       A transformation that slides every point...

     Keeps it simple and writer-friendly. Inline markdown markup (**bold**,
     *italics*, `code`) is preserved as plain text in the popover — we
     don't run a full Markdown renderer. */
  function parseVocabMarkdown(text) {
    const out = {};
    const re = /(^|\n)##\s+([^\n]+)\n([\s\S]*?)(?=\n##\s|$)/g;
    let m;
    while ((m = re.exec(text))) {
      const term = m[2].trim();
      const def = m[3]
        .replace(/^\s+|\s+$/g, '')
        .replace(/\n{2,}/g, '  ')   // paragraph break -> double space
        .replace(/\s+/g, ' ')
        .trim();
      if (term && def) out[term] = def;
    }
    return out;
  }

  /* YAML: if js-yaml is loaded (window.jsyaml), defer to it. Otherwise
     use a minimal subset parser that handles:
        key: value
        key: |
          multi
          line
     It does NOT handle anchors, references, nested objects, flow style,
     or quoted complex values. For richer docs, load js-yaml from a CDN:
        <script src="https://cdn.jsdelivr.net/npm/js-yaml@4/dist/js-yaml.min.js"></script>  */
  function parseVocabYAML(text) {
    if (window.jsyaml && typeof window.jsyaml.load === 'function') {
      try {
        const parsed = window.jsyaml.load(text) || {};
        return typeof parsed === 'object' ? parsed : {};
      } catch (e) {
        console.warn('[course-ui] js-yaml parse error:', e);
      }
    }
    const out = {};
    const lines = text.split('\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim() || line.trim().startsWith('#')) continue;
      if (/^[ \t]/.test(line)) continue; // indented — belongs to a block above
      const m = line.match(/^([^:]+):\s*(.*)$/);
      if (!m) continue;
      const key = m[1].trim();
      let val = m[2];
      const trimmedVal = val.trim();
      if (trimmedVal === '|' || trimmedVal === '>' || trimmedVal === '') {
        const block = [];
        while (i + 1 < lines.length && /^([ \t]{2,}|\t)/.test(lines[i+1])) {
          i++;
          block.push(lines[i].replace(/^[ \t]+/, ''));
        }
        val = block.join(trimmedVal === '>' ? ' ' : '\n').trim();
      } else {
        val = trimmedVal.replace(/^["'](.*)["']$/, '$1');
      }
      if (key) out[key] = val;
    }
    return out;
  }

  function autoWrapTerms(terms) {
    // Sort by length descending so "interior angle" wins over "angle"
    const entries = Object.entries(terms).sort((a, b) => b[0].length - a[0].length);
    const contentSel =
      CFG.vocab.contentSelector ||
      '.section-hero .lead, .article p, .article li, main p, main li';
    const roots = qsa(contentSel);
    // "already wrapped on this page" set — we wrap only the FIRST occurrence per term per page
    const wrappedOnce = new Set();
    entries.forEach(([term, def]) => {
      const key = term.toLowerCase();
      if (wrappedOnce.has(key)) return;
      const re = new RegExp('\\b(' + escapeRegex(term) + ')\\b', 'i');
      for (const root of roots) {
        if (wrapTextInElement(root, re, def)) {
          wrappedOnce.add(key);
          break;
        }
      }
    });
  }
  function escapeRegex(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  function wrapTextInElement(root, re, def) {
    // Walk text nodes, skip if inside existing .cu-term, <a>, <code>, <pre>, etc.
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (!node.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        let p = node.parentNode;
        while (p && p !== root) {
          const tag = (p.tagName || '').toLowerCase();
          if (tag === 'a' || tag === 'code' || tag === 'pre' || tag === 'script' || tag === 'style') return NodeFilter.FILTER_REJECT;
          if (p.classList && p.classList.contains('cu-term')) return NodeFilter.FILTER_REJECT;
          p = p.parentNode;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });
    let node;
    while ((node = walker.nextNode())) {
      const m = re.exec(node.nodeValue);
      if (!m) continue;
      const before = node.nodeValue.slice(0, m.index);
      const hit    = m[0];
      const after  = node.nodeValue.slice(m.index + hit.length);
      const span = document.createElement('span');
      span.className = 'cu-term';
      span.setAttribute('data-def', def);
      span.setAttribute('tabindex', '0');
      span.textContent = hit;
      const frag = document.createDocumentFragment();
      if (before) frag.appendChild(document.createTextNode(before));
      frag.appendChild(span);
      if (after)  frag.appendChild(document.createTextNode(after));
      node.parentNode.replaceChild(frag, node);
      return true; // first occurrence only
    }
    return false;
  }

  function attachTermPopovers() {
    const pop = document.getElementById('cu-term-popover');
    if (!pop) return;
    let hideTimer = null;
    function showFor(el) {
      const def = el.getAttribute('data-def');
      if (!def) return;
      clearTimeout(hideTimer);
      pop.innerHTML = '<strong>' + escapeHTML((el.textContent || '').trim()) + '</strong><br>' + escapeHTML(def);
      pop.className = 'cu-visible';
      // Position above the term if possible
      const r = el.getBoundingClientRect();
      const pw = pop.offsetWidth;
      const ph = pop.offsetHeight;
      let left = r.left + r.width / 2 - pw / 2;
      left = Math.max(8, Math.min(left, window.innerWidth - pw - 8));
      let top;
      if (r.top - ph - 14 > 0) {
        top = r.top - ph - 12;
        pop.classList.add('cu-arrow-bottom');
      } else {
        top = r.bottom + 12;
        pop.classList.add('cu-arrow-top');
      }
      pop.style.left = left + 'px';
      pop.style.top  = top + 'px';
    }
    function hide() {
      pop.className = '';
      pop.style.left = '-9999px';
    }
    // Hover
    document.addEventListener('mouseover', function (e) {
      const el = e.target.closest && e.target.closest('.cu-term');
      if (el) { clearTimeout(hideTimer); showFor(el); }
    });
    document.addEventListener('mouseout', function (e) {
      const el = e.target.closest && e.target.closest('.cu-term');
      if (el) { hideTimer = setTimeout(hide, 120); }
    });
    // Keyboard focus
    document.addEventListener('focusin', function (e) {
      const el = e.target.closest && e.target.closest('.cu-term');
      if (el) { clearTimeout(hideTimer); showFor(el); }
    });
    document.addEventListener('focusout', function (e) {
      const el = e.target.closest && e.target.closest('.cu-term');
      if (el) { hideTimer = setTimeout(hide, 120); }
    });
    // Touch
    document.addEventListener('click', function (e) {
      const el = e.target.closest && e.target.closest('.cu-term');
      if (el) {
        if (pop.classList.contains('cu-visible')) hide(); else showFor(el);
        e.stopPropagation();
      } else if (!pop.contains(e.target)) {
        hide();
      }
    });
  }

  /* ═════════════════════ 8. INJECT TOOLBAR UI ════════════════════ */
  function injectToolbarUI() {
    const toolbar = qs(CFG.selectors.toolbar);
    if (!toolbar) return;

    const cluster = document.createElement('div');
    cluster.className = 'cu-cluster';

    const searchHTML = CFG.search.enabled ? `
      <div class="cu-search-wrap">
        <button class="cu-btn" id="cu-btn-search" type="button"
                onclick="cuToggleSearch()"
                aria-label="Search" title="Search (Ctrl/⌘+K)">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        </button>
        <input type="text" id="cu-search-input" class="cu-search-input" placeholder="Search…" aria-label="Search" autocomplete="off" />
        <div id="cu-search-results" class="cu-search-results" role="listbox"></div>
      </div>
    ` : '';

    cluster.innerHTML = searchHTML + `
      <div class="cu-aa-wrap">
        <button class="cu-btn" id="cu-btn-aa" type="button"
                onclick="cuToggleAa()"
                aria-haspopup="dialog"
                aria-expanded="false"
                aria-label="Reading settings"
                title="Reading settings">Aa</button>
        <div class="cu-popover" id="cu-aa-popover" role="dialog" aria-label="Reading settings">
          <div class="cu-aa-section">
            <div class="cu-aa-label">Text size</div>
            <div class="cu-aa-size-row">
              <button class="cu-tb" type="button" onclick="cuAdjustFontSize(-1)" aria-label="Smaller text">A&minus;</button>
              <span class="cu-aa-size-label" id="cu-size-label">100%</span>
              <button class="cu-tb" type="button" onclick="cuAdjustFontSize(1)" aria-label="Larger text">A+</button>
            </div>
          </div>
          <div class="cu-aa-section">
            <div class="cu-aa-label">Font</div>
            <div class="cu-aa-row">
              <button class="cu-tb" id="cu-btn-font-sans" type="button" onclick="cuSetFont('sans')">Sans</button>
              <button class="cu-tb" id="cu-btn-font-serif" type="button" onclick="cuSetFont('serif')">Serif</button>
              <button class="cu-tb" id="cu-btn-font-dyslexic" type="button" onclick="cuSetFont('dyslexic')">Dyslexic</button>
            </div>
          </div>
          <div class="cu-aa-section">
            <div class="cu-aa-label">Theme</div>
            <div class="cu-themes">
              <div class="cu-theme-opt">
                <button class="cu-swatch cu-swatch-light" id="cu-sw-light" type="button" onclick="cuSetTheme('light')" aria-label="Light theme"></button>
                <span>Light</span>
              </div>
              <div class="cu-theme-opt">
                <button class="cu-swatch cu-swatch-sepia" id="cu-sw-sepia" type="button" onclick="cuSetTheme('sepia')" aria-label="Sepia theme"></button>
                <span>Sepia</span>
              </div>
              <div class="cu-theme-opt">
                <button class="cu-swatch cu-swatch-dark" id="cu-sw-dark" type="button" onclick="cuSetTheme('dark')" aria-label="Dark theme"></button>
                <span>Dark</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      ${CFG.reading.focusMode ? `
      <button class="cu-btn" id="cu-btn-focus" type="button"
              onclick="cuToggleFocus()"
              aria-pressed="false"
              title="Focus mode — hide sidebar">Focus</button>` : ''}
    `;

    // Place BEFORE any existing completion progress element the site has.
    let before = null;
    const insertBeforeSelector = CFG.selectors.toolbarInsertBefore;
    if (insertBeforeSelector) {
      before = qs(insertBeforeSelector, toolbar);
    }
    if (before) toolbar.insertBefore(cluster, before);
    else toolbar.appendChild(cluster);

    // Wire search input
    if (CFG.search.enabled) {
      const input = document.getElementById('cu-search-input');
      input.addEventListener('input', function () { runSearch(this.value); });
    }

    // Outside-click + Escape handlers
    document.addEventListener('click', function (e) {
      if (!e.target.closest('.cu-aa-wrap')) closeAa();
      if (!e.target.closest('.cu-search-wrap')) {
        const r = document.getElementById('cu-search-results');
        if (r) r.classList.remove('cu-open');
      }
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') { closeAa(); closeSearch(); }
      if (CFG.search.enabled && (e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        cuToggleSearch();
      }
    });
  }

  /* ═════════════════════ 9. PROGRESS BARS ═══════════════════════ */
  function injectProgressBars() {
    if (CFG.reading.readingLine && !document.querySelector('.cu-reading-line')) {
      const line = document.createElement('div');
      line.className = 'cu-reading-line';
      line.innerHTML = '<div class="cu-reading-line-fill" id="cu-reading-line-fill"></div>';
      document.body.appendChild(line);
    }
    if (CFG.reading.readingPos && !document.getElementById('cu-reading-pos')) {
      const pos = document.createElement('div');
      pos.className = 'cu-reading-pos';
      pos.id = 'cu-reading-pos';
      pos.innerHTML =
        '<span class="cu-rp-label">' +
          '<span class="cu-rp-section" id="cu-rp-section"></span>' +
          '<span class="cu-rp-counter"> &middot; Section <span id="cu-rp-num"></span> of <span id="cu-rp-total"></span></span>' +
        '</span>' +
        '<div class="cu-rp-progress">' +
          '<div class="cu-rp-bar"><div class="cu-rp-bar-fill" id="cu-rp-bar-fill"></div></div>' +
          '<span class="cu-rp-pct" id="cu-rp-pct">0%</span>' +
        '</div>';
      document.body.appendChild(pos);
    }
  }

  let sections = [];
  let sectionNames = [];
  function captureSections() {
    sections = qsa(CFG.selectors.sections).filter(s => !s.classList.contains('chapter-banner') && s.id !== 'chapter-top');
    sectionNames = sections.map(s => {
      const h = s.querySelector('h1, h2');
      return h ? h.textContent.trim() : (s.id || '');
    });
    const tot = document.getElementById('cu-rp-total');
    if (tot) tot.textContent = String(sections.length);
  }

  let rafPending = false;
  function updateReadingProgress() {
    if (rafPending) return;
    rafPending = true;
    requestAnimationFrame(() => {
      rafPending = false;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const pct = docH > 0 ? Math.min(100, Math.max(0, (window.scrollY / docH) * 100)) : 0;
      const lineFill = document.getElementById('cu-reading-line-fill');
      if (lineFill) lineFill.style.width = pct.toFixed(1) + '%';

      if (sections.length) {
        let current = 0;
        const threshold = window.innerHeight * 0.35;
        for (let i = 0; i < sections.length; i++) {
          if (sections[i].getBoundingClientRect().top < threshold) current = i;
        }
        const pctRound = Math.round(pct);
        const sn = document.getElementById('cu-rp-section');
        const nn = document.getElementById('cu-rp-num');
        const pf = document.getElementById('cu-rp-bar-fill');
        const pp = document.getElementById('cu-rp-pct');
        if (sn) sn.textContent = sectionNames[current] || '';
        if (nn) nn.textContent = String(current + 1);
        if (pf) pf.style.width = pctRound + '%';
        if (pp) pp.textContent = pctRound + '%';
      }
    });
  }

  /* ═════════════════════ 10. BOOT ═══════════════════════════════ */
  function boot() {
    // Mark html/body for course-ui scoped styles
    document.documentElement.classList.add('cu-root');
    document.body.classList.add('cu-body');

    injectToolbarUI();
    injectProgressBars();
    initTheme();
    initFont();
    initFocus();
    applyScale();
    captureSections();
    updateReadingProgress();
    // initVocab() is async (it may fetch external files); expose the
    // promise so other features (search index build) can await it.
    vocabReady = initVocab().catch(err => {
      console.warn('[course-ui] initVocab failed:', err);
    });
    window.addEventListener('scroll', updateReadingProgress, { passive: true });
    window.addEventListener('resize', updateReadingProgress, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* Publicly expose the API in a namespace so sites can script against it */
  window.CourseUI = Object.assign(window.CourseUI || {}, {
    setTheme: window.cuSetTheme,
    setFont: window.cuSetFont,
    adjustFontSize: window.cuAdjustFontSize,
    toggleFocus: window.cuToggleFocus,
    toggleAa: window.cuToggleAa,
    toggleSearch: window.cuToggleSearch,
    /* Vocab API — load more dictionaries at runtime (e.g. for a
       per-chapter terms file loaded after an AJAX navigation). */
    loadVocab: async function (src) {
      try {
        const dict = await loadVocabDict(src);
        if (CFG.vocab.autoWrap) autoWrapTerms(dict);
        return dict;
      } catch (err) {
        console.warn('[course-ui] loadVocab failed:', src, err);
        return {};
      }
    },
    get vocabReady() { return vocabReady; }
  });
})();
