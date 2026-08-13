# MyReads

[![License: MIT](https://img.shields.io/badge/License-MIT-brightgreen.svg)](https://opensource.org/licenses/MIT)

A bookshelf: search a catalogue of books and move them between **Currently Reading**,
**Want to Read** and **Read**. Built with Create React App 3 and React 16, against
Udacity's books backend.

The README used to be Udacity's starter-template one, unedited. It told you the React
code was missing and that your job was to add it, described a file tree that no longer
matched, and linked to a `CONTRIBUTING.md` that is not in this repository. The app has
been finished for years.

## The app

| File | Role |
| --- | --- |
| `src/App.js` | routes, holds the books, owns the shelf changes |
| `src/ListingBooks.js` | one shelf and its grid of books |
| `src/SearchingBooks.js` | the search page |
| `src/ModalWindow.js` | the book detail overlay |
| `src/BooksAPI.js` | the four calls to the backend |

## Running it

```shell
yarn install --frozen-lockfile
yarn start
yarn test
yarn build
```

`--frozen-lockfile` rather than a bare `yarn install`, so you get exactly what
`yarn.lock` pins and the install fails instead of quietly resolving something newer.

**On a current Node, set one environment variable.** This is `react-scripts` 3, which is
webpack 4, and webpack 4 uses an MD4 hash that OpenSSL 3 removed, so from Node 17 onwards a
bare build fails with `ERR_OSSL_EVP_UNSUPPORTED`. That is a build-tool problem, not a
reason to run an end-of-life runtime:

```shell
NODE_OPTIONS=--openssl-legacy-provider yarn build
```

Tested in this repository: `Compiled successfully` on **Node 20** and **Node 22** with that
flag, and `ERR_OSSL_EVP_UNSUPPORTED` on Node 22 without it. Node 10 also works with no flag
and is what the 2019 project targeted, but there is no need to install an unsupported
runtime to build this.

### The install used to fail before it built anything

A clean install could not build or test, on any machine, and had not been able to since
the lockfile was committed:

```text
The react-scripts package provided by Create React App requires a dependency:
  "babel-jest": "24.7.1"
However, a different version of babel-jest was detected higher up in the tree:
  /app/node_modules/babel-jest (version: 24.8.0)
```

`react-scripts@3.0.0` pins `babel-jest` at exactly **24.7.1**, while the `jest-config`
it pulls in asks for `^24.8.0`. Yarn hoists 24.8.0 to the top of `node_modules`, Create
React App's preflight check sees a version it did not expect, and refuses to run.

The fix is a `resolutions` entry pinning `babel-jest` to the 24.7.1 that
`react-scripts` asks for. Create React App's own suggestion is
`SKIP_PREFLIGHT_CHECK=true`, which does not fix the mismatch, it stops you being told
about it. Nothing was upgraded: the resolution moves a transitive dependency **to** the
version the pinned `react-scripts` declares.

## The backend

`https://reactnd-books-api.udacity.com`, and it is still up. `BooksAPI.js` sends an
`Authorization` header holding a random string kept in `localStorage`. That is not a
credential: it namespaces your shelves on a server everyone shares, and any unique
string works.

Search only matches a fixed set of cached terms, listed in
[SEARCH_TERMS.md](SEARCH_TERMS.md). A search for anything else legitimately returns
nothing, which is the backend, not the app.

## What was wrong

**Searching could crash the page.** The API answers either `{ "books": [...] }` or
`{ "error": "..." }`, and `BooksAPI.search` reached straight for `data.books`, so an
error response produced `undefined`. The caller then did `if (!books.error ...)`, a
check written against the raw response shape that the API module had already unwrapped.
So the guard could never work, and on the exact case it existed for it threw:

```text
TypeError: Cannot read properties of undefined (reading 'error')
```

Still reproducible against the live API today: an empty query returns
`{"error":"Please provide a query in the request body"}`. `BooksAPI` now checks
`response.ok`, turns an `error` payload into a thrown `Error`, and the search page
catches it and says so.

**The search box was gated on the cursor position.** The condition was `caret > 1`,
where `caret` was `event.target.selectionStart`. While you type forwards the caret does
sit past position 1, so it stood in for "the query is long enough", but they are not the
same thing: paste a query, or edit near the start of one, and the caret is 0 or 1 and a
perfectly good search silently returned nothing. It is `query.trim().length < 2` now.

**Fast typing could show the wrong results.** Several searches were in flight at once
with nothing to order them, so a slower earlier request could land last and overwrite
the results for the query you were actually looking at. The latest query is tracked and
stale responses are dropped.

**Render mutated state.** `books.sort(sortBy('title'))` sorts **in place** and returns
the same array, so rendering reordered `this.state.books` directly. Measured on a
three-book state: same array object before and after, different order. It copies first
now.

**Nothing was caught.** There was not one `.catch` in `src`. A dead network left an
unhandled rejection in the console and an empty shelf on screen, which looks exactly
like a library with no books in it. Moving a book was fire-and-forget too, so a failed
update showed a move that never happened and the next reload silently undid it; that one
rolls back now.

**Three `<h1>` elements on the home page.** The header markup lived inside
`ListingBooks`, which the home route renders three times, once per shelf. Nothing looked
wrong, because `.fixed-header` is `position: fixed` at `top: 0` so all three landed on
top of each other, but the document announced three top-level headings. The header is
rendered once now, by `App`.

**A deprecated lifecycle.** `componentWillReceiveProps` copied a prop into state, which
is both the derived-state antipattern and a method React renamed to
`UNSAFE_componentWillReceiveProps` in 16.9. The `^16.7` range here installs 16.14, so it
warned on every prop change. The component reads the prop directly.

**1.4 MB of vendored icons for two glyphs.** `src/resources/font-awesome-4.7.0/` held 37
committed files, including `.otf`, `.eot`, `.ttf`, `.woff` and `.woff2` fonts plus the
complete `less/` and `scss/` sources, and the app used exactly two icons from it: a
close × and a reviewer silhouette. Both are inline SVG now and the directory is gone.

**The test had never passed.** It rendered `<App />` bare, and `App` is built from
`<Route>` elements:

```text
Invariant failed: You should not use <Route> outside a <Router>
```

It wraps in `MemoryRouter` and mocks `BooksAPI` now, and there is a second test
asserting the three shelves render. Fixing it immediately surfaced a real leak, a
`setState` after unmount when the initial fetch resolved late, which is guarded.

## Not covered

- **Accessibility beyond the basics.** The close control is keyboard reachable now, but
  the modal does not trap focus or close on Escape, and the shelf `<select>` elements
  have no labels.
- **Pagination.** Search returns at most 20 results and the app shows what it gets.
