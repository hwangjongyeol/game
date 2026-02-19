(function () {
  const sidebar = document.getElementById('sidebar');
  const treeEl = document.getElementById('tree');
  const contentEl = document.getElementById('docContent');
  const breadcrumbEl = document.getElementById('breadcrumb');
  const openBtn = document.getElementById('openSidebar');
  const closeBtn = document.getElementById('closeSidebar');
  const searchInput = document.getElementById('docSearch');
  const clearSearchBtn = document.getElementById('clearSearch');
  const searchMetaEl = document.getElementById('searchMeta');

  const rawData = window.DOCS_DATA || [];
  const docs = Array.isArray(rawData) ? rawData.slice() : (rawData.docs || []).slice();
  docs.sort((a, b) => a.path.localeCompare(b.path));

  if (!docs.length) {
    contentEl.innerHTML = '<h2>No docs found</h2>';
    return;
  }

  const docsByPath = new Map(docs.map((doc) => [doc.path, doc]));
  let currentPath = '';
  let currentSearchQuery = '';

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
  }

  function normalizeText(s) {
    return (s || '').toLowerCase().trim();
  }

  function extname(path) {
    const idx = path.lastIndexOf('.');
    return idx >= 0 ? path.slice(idx + 1).toLowerCase() : '';
  }

  function highlightText(text, query) {
    if (!query) return escapeHtml(text);
    const normalized = normalizeText(query);
    const target = text || '';
    const lower = target.toLowerCase();
    let from = 0;
    let result = '';

    while (from < target.length) {
      const found = lower.indexOf(normalized, from);
      if (found < 0) {
        result += escapeHtml(target.slice(from));
        break;
      }
      result += escapeHtml(target.slice(from, found));
      result += `<mark>${escapeHtml(target.slice(found, found + normalized.length))}</mark>`;
      from = found + normalized.length;
    }
    return result;
  }

  function resolveDocPath(basePath, href) {
    if (!href) return '';
    if (/^https?:\/\//i.test(href)) return href;

    const [pathOnly, hash = ''] = href.split('#');
    if (!pathOnly || pathOnly.startsWith('/')) return '';

    const lower = pathOnly.toLowerCase();
    const isDoc = lower.endsWith('.md') || lower.endsWith('.yaml') || lower.endsWith('.yml');
    if (!isDoc) return '';

    const baseParts = basePath.split('/');
    baseParts.pop();
    const parts = pathOnly.split('/');
    const resolved = [];
    for (const seg of [...baseParts, ...parts]) {
      if (!seg || seg === '.') continue;
      if (seg === '..') {
        resolved.pop();
      } else {
        resolved.push(seg);
      }
    }

    const normalized = resolved.join('/');
    if (!docsByPath.has(normalized)) return '';
    return hash ? `${normalized}#${hash}` : normalized;
  }

  function makeInlineLink(label, href) {
    const target = (href || '').trim();
    if (/^https?:\/\//i.test(target)) {
      return `<a href="${escapeHtml(target)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
    }
    const resolved = resolveDocPath(currentPath, target);
    if (!resolved) {
      return `<a href="${escapeHtml(target)}" target="_blank" rel="noreferrer">${escapeHtml(label)}</a>`;
    }
    return `<a href="#${encodeURIComponent(resolved)}" data-doc-link="${escapeHtml(resolved)}">${escapeHtml(label)}</a>`;
  }

  function inline(text) {
    return escapeHtml(text)
      .replace(/`([^`]+)`/g, '<code>$1</code>')
      .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_m, label, href) => makeInlineLink(label, href));
  }

  function highlightYaml(code) {
    return code.split('\n').map((line) => {
      let out = escapeHtml(line);
      out = out.replace(/^(\s*-?\s*)([A-Za-z0-9_.-]+)(\s*:)/, '$1<span class="tok-key">$2</span>$3');
      out = out.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '<span class="tok-str">$&</span>');
      out = out.replace(/\b(true|false|null)\b/gi, '<span class="tok-lit">$1</span>');
      out = out.replace(/\b\d+(\.\d+)?\b/g, '<span class="tok-num">$&</span>');
      out = out.replace(/(#.*)$/g, '<span class="tok-cmt">$1</span>');
      return out;
    }).join('\n');
  }

  function highlightSql(code) {
    const keywords = /\b(SELECT|FROM|WHERE|GROUP|BY|ORDER|LIMIT|INSERT|INTO|VALUES|UPDATE|SET|DELETE|JOIN|LEFT|RIGHT|INNER|OUTER|ON|AS|AND|OR|NOT|NULL|IS|IN|EXISTS|CREATE|ALTER|DROP|TABLE|INDEX|PRIMARY|KEY|UNIQUE|DEFAULT|CASE|WHEN|THEN|ELSE|END)\b/gi;
    return code.split('\n').map((line) => {
      let out = escapeHtml(line);
      out = out.replace(/'[^']*'/g, '<span class="tok-str">$&</span>');
      out = out.replace(/\b\d+(\.\d+)?\b/g, '<span class="tok-num">$&</span>');
      out = out.replace(keywords, '<span class="tok-kw">$1</span>');
      out = out.replace(/(--.*)$/g, '<span class="tok-cmt">$1</span>');
      return out;
    }).join('\n');
  }

  function highlightShell(code) {
    const cmds = /\b(curl|npm|node|python3|mysql|java|gradle|\.\/gradlew|git|ls|cat|cd|cp|mv|rm|echo|export)\b/g;
    return code.split('\n').map((line) => {
      let out = escapeHtml(line);
      out = out.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '<span class="tok-str">$&</span>');
      out = out.replace(/\$(\w+|{[^}]+})/g, '<span class="tok-var">$$$1</span>');
      out = out.replace(cmds, '<span class="tok-kw">$1</span>');
      out = out.replace(/(#.*)$/g, '<span class="tok-cmt">$1</span>');
      return out;
    }).join('\n');
  }

  function highlightJsJson(code) {
    return code.split('\n').map((line) => {
      let out = escapeHtml(line);
      out = out.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '<span class="tok-str">$&</span>');
      out = out.replace(/\b(true|false|null|undefined)\b/g, '<span class="tok-lit">$1</span>');
      out = out.replace(/\b\d+(\.\d+)?\b/g, '<span class="tok-num">$&</span>');
      out = out.replace(/\b(const|let|var|function|return|if|else|for|while|switch|case|break|continue|new|class|import|from|export|default|try|catch|throw)\b/g, '<span class="tok-kw">$1</span>');
      out = out.replace(/(\/\/.*)$/g, '<span class="tok-cmt">$1</span>');
      return out;
    }).join('\n');
  }

  function highlightCode(code, lang) {
    const lower = (lang || '').toLowerCase();
    if (lower === 'yaml' || lower === 'yml') return highlightYaml(code);
    if (lower === 'sql') return highlightSql(code);
    if (lower === 'bash' || lower === 'sh' || lower === 'zsh' || lower === 'shell') return highlightShell(code);
    if (lower === 'js' || lower === 'javascript' || lower === 'json' || lower === 'ts' || lower === 'typescript') {
      return highlightJsJson(code);
    }
    return escapeHtml(code);
  }

  function renderMarkdown(md) {
    const lines = md.replace(/\r\n/g, '\n').split('\n');
    let i = 0;
    let html = '';
    let inCode = false;
    let codeLang = '';
    let codeLines = [];
    const headingIdCount = new Map();

    function slugify(text) {
      const base = text
        .toLowerCase()
        .replace(/<[^>]+>/g, '')
        .replace(/[^\w가-힣\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
      const count = headingIdCount.get(base) || 0;
      headingIdCount.set(base, count + 1);
      return count === 0 ? base : `${base}-${count}`;
    }

    while (i < lines.length) {
      const line = lines[i];

      if (/^```/.test(line)) {
        if (!inCode) {
          inCode = true;
          codeLang = line.replace(/^```\s*/, '').trim();
          codeLines = [];
        } else {
          inCode = false;
          const raw = codeLines.join('\n');
          const rendered = highlightCode(raw, codeLang);
          html += `<pre><code class="lang-${escapeHtml(codeLang)}">${rendered}</code></pre>`;
        }
        i += 1;
        continue;
      }

      if (inCode) {
        codeLines.push(line);
        i += 1;
        continue;
      }

      if (/^\s*$/.test(line)) {
        i += 1;
        continue;
      }

      const image = line.match(/^!\[([^\]]*)\]\(([^)]+)\)$/);
      if (image) {
        html += `<p><img src="${escapeHtml(image[2])}" alt="${escapeHtml(image[1])}" /></p>`;
        i += 1;
        continue;
      }

      const heading = line.match(/^(#{1,6})\s+(.*)$/);
      if (heading) {
        const lvl = heading[1].length;
        const id = slugify(heading[2]);
        html += `<h${lvl} id="${escapeHtml(id)}">${inline(heading[2])}</h${lvl}>`;
        i += 1;
        continue;
      }

      if (/^>\s?/.test(line)) {
        html += `<blockquote>${inline(line.replace(/^>\s?/, ''))}</blockquote>`;
        i += 1;
        continue;
      }

      if (/^---+$/.test(line)) {
        html += '<hr />';
        i += 1;
        continue;
      }

      if (/^\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\|?\s*[-:]+/.test(lines[i + 1])) {
        const headerCells = line.split('|').slice(1, -1).map((s) => s.trim());
        i += 2;
        const rows = [];
        while (i < lines.length && /^\|.*\|\s*$/.test(lines[i])) {
          rows.push(lines[i].split('|').slice(1, -1).map((s) => s.trim()));
          i += 1;
        }
        html += '<table><thead><tr>' + headerCells.map((c) => `<th>${inline(c)}</th>`).join('') + '</tr></thead><tbody>';
        html += rows.map((r) => '<tr>' + r.map((c) => `<td>${inline(c)}</td>`).join('') + '</tr>').join('');
        html += '</tbody></table>';
        continue;
      }

      if (/^\s*[-*]\s+/.test(line)) {
        html += '<ul>';
        while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) {
          html += `<li>${inline(lines[i].replace(/^\s*[-*]\s+/, ''))}</li>`;
          i += 1;
        }
        html += '</ul>';
        continue;
      }

      if (/^\s*\d+\.\s+/.test(line)) {
        html += '<ol>';
        while (i < lines.length && /^\s*\d+\.\s+/.test(lines[i])) {
          html += `<li>${inline(lines[i].replace(/^\s*\d+\.\s+/, ''))}</li>`;
          i += 1;
        }
        html += '</ol>';
        continue;
      }

      let para = line;
      i += 1;
      while (i < lines.length && lines[i].trim() && !/^(#{1,6})\s+/.test(lines[i])) {
        if (/^```/.test(lines[i]) || /^\|.*\|\s*$/.test(lines[i])) break;
        if (/^\s*[-*]\s+/.test(lines[i]) || /^\s*\d+\.\s+/.test(lines[i])) break;
        para += ' ' + lines[i].trim();
        i += 1;
      }
      html += `<p>${inline(para)}</p>`;
    }

    return html;
  }

  function renderRawCodeDocument(content, lang) {
    return `<pre><code class="lang-${escapeHtml(lang)}">${highlightCode(content, lang)}</code></pre>`;
  }

  function buildTree(paths) {
    const root = {};
    for (const path of paths) {
      const parts = path.split('/');
      let node = root;
      for (let idx = 0; idx < parts.length; idx += 1) {
        const key = parts[idx];
        if (idx === parts.length - 1) {
          node[key] = path;
        } else {
          node[key] = node[key] || {};
          node = node[key];
        }
      }
    }
    return root;
  }

  function getSearchResults(query) {
    const q = normalizeText(query);
    if (!q) return docs.slice();
    return docs.filter((doc) => {
      const pathMatch = doc.path.toLowerCase().includes(q);
      const contentMatch = (doc.content || '').toLowerCase().includes(q);
      return pathMatch || contentMatch;
    });
  }

  function renderTree(query) {
    treeEl.innerHTML = '';
    const results = getSearchResults(query);
    searchMetaEl.textContent = query ? `${results.length}개 문서 일치` : `${docs.length}개 문서`;

    if (query) {
      const q = normalizeText(query);
      for (const doc of results) {
        const btn = document.createElement('button');
        btn.className = 'file';
        btn.dataset.path = doc.path;
        btn.innerHTML = highlightText(doc.path, q);
        btn.addEventListener('click', () => openDoc(doc.path));
        treeEl.appendChild(btn);
      }
      return;
    }

    const tree = buildTree(docs.map((d) => d.path));
    treeEl.appendChild(makeTree(tree));
  }

  function makeTree(node) {
    const frag = document.createDocumentFragment();
    const keys = Object.keys(node).sort((a, b) => {
      const av = typeof node[a] === 'string';
      const bv = typeof node[b] === 'string';
      if (av !== bv) return av ? 1 : -1;
      return a.localeCompare(b);
    });

    for (const key of keys) {
      const val = node[key];
      if (typeof val === 'string') {
        const btn = document.createElement('button');
        btn.className = 'file';
        btn.textContent = key;
        btn.dataset.path = val;
        btn.addEventListener('click', () => openDoc(val));
        frag.appendChild(btn);
      } else {
        const details = document.createElement('details');
        details.open = false;
        const summary = document.createElement('summary');
        summary.textContent = key;
        details.appendChild(summary);
        details.appendChild(makeTree(val));
        frag.appendChild(details);
      }
    }
    return frag;
  }

  function setActive(path) {
    treeEl.querySelectorAll('button.file').forEach((el) => {
      el.classList.toggle('active', el.dataset.path === path);
    });
  }

  function openDoc(path) {
    const [docPath, anchor] = path.split('#');
    const doc = docsByPath.get(docPath);
    if (!doc) return;

    currentPath = doc.path;
    const ext = extname(doc.path);

    if (ext === 'md') {
      contentEl.innerHTML = renderMarkdown(doc.content);
    } else if (ext === 'yaml' || ext === 'yml') {
      contentEl.innerHTML = renderRawCodeDocument(doc.content, 'yaml');
    } else {
      contentEl.innerHTML = renderRawCodeDocument(doc.content, ext || 'text');
    }

    breadcrumbEl.textContent = `docs/${docPath}`;
    setActive(docPath);
    location.hash = encodeURIComponent(path);
    sidebar.classList.remove('open');

    contentEl.querySelectorAll('a[data-doc-link]').forEach((link) => {
      link.addEventListener('click', (event) => {
        event.preventDefault();
        const next = link.getAttribute('data-doc-link');
        if (next) openDoc(next);
      });
    });

    if (anchor) {
      const target = contentEl.querySelector(`#${CSS.escape(anchor)}`);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'auto' });
    }
  }

  function runSearch(query) {
    currentSearchQuery = query || '';
    renderTree(currentSearchQuery);
    if (!currentSearchQuery) {
      setActive(currentPath);
      return;
    }
    const results = getSearchResults(currentSearchQuery);
    if (results.length === 1) {
      setActive(results[0].path);
    }
  }

  const firstPath = docs[0].path;
  const hashPath = location.hash ? decodeURIComponent(location.hash.replace(/^#/, '')) : '';
  const hashDocPath = hashPath.split('#')[0];

  renderTree('');
  openDoc(docsByPath.has(hashDocPath) ? hashPath : firstPath);

  searchInput.addEventListener('input', (event) => {
    runSearch(event.target.value);
  });
  searchInput.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter') return;
    const results = getSearchResults(searchInput.value);
    if (results.length > 0) {
      openDoc(results[0].path);
    }
  });
  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    runSearch('');
    searchInput.focus();
  });

  openBtn.addEventListener('click', () => sidebar.classList.add('open'));
  closeBtn.addEventListener('click', () => sidebar.classList.remove('open'));
})();
