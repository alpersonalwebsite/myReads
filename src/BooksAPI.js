const api = 'https://reactnd-books-api.udacity.com'

// The token namespaces your bookshelf on the shared backend. It is not a
// credential: anything unique works, and the server uses it purely as a key. It is
// read lazily rather than at module scope so that importing this file does not
// require a browser (a Jest run with --env=node used to throw "localStorage is not
// defined" before a single test executed).
const getToken = () => {
  if (typeof localStorage === 'undefined') {
    return 'no-storage'
  }

  if (!localStorage.token) {
    // Math.random().toString(36).slice(-8), not .substr(-8): substr is Annex B
    // legacy and flagged deprecated by MDN. Same result.
    localStorage.token = Math.random().toString(36).slice(-8)
  }

  return localStorage.token
}

const headers = () => ({
  Accept: 'application/json',
  Authorization: getToken()
})

// fetch only rejects on a network-level failure. A 404 or a 500 is a perfectly
// successful promise with ok: false, so without this check an error page was parsed
// as JSON and the caller got a confusing shape instead of a status.
const jsonOrThrow = (response) => {
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} from ${response.url}`)
  }

  return response.json()
}

// The API answers either { books: [...] } or { error: "..." }. Every caller here used
// to reach straight for data.books, so an error response produced undefined and the
// failure surfaced somewhere else entirely, as a TypeError on a later line.
const booksOrThrow = (data) => {
  if (data && data.error) {
    throw new Error(data.error)
  }

  // Absent is fine and means "no results". Present but not an array is not: callers
  // .sort() and .map() the return value, so handing back an object or a string moves
  // the failure into a component, several frames from the thing that caused it.
  if (!data || data.books === undefined || data.books === null) {
    return []
  }

  if (!Array.isArray(data.books)) {
    throw new TypeError(`Expected books to be an array, received ${typeof data.books}`)
  }

  return data.books
}

export const get = (bookId) =>
  fetch(`${api}/books/${bookId}`, { headers: headers() })
    .then(jsonOrThrow)
    .then((data) => {
      if (data && data.error) {
        throw new Error(data.error)
      }

      return data.book
    })

export const getAll = () =>
  fetch(`${api}/books`, { headers: headers() })
    .then(jsonOrThrow)
    .then(booksOrThrow)

export const update = (book, shelf) =>
  fetch(`${api}/books/${book.id}`, {
    method: 'PUT',
    headers: {
      ...headers(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ shelf })
  }).then(jsonOrThrow)

export const search = (query) =>
  fetch(`${api}/search`, {
    method: 'POST',
    headers: {
      ...headers(),
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ query })
  })
    .then(jsonOrThrow)
    .then(booksOrThrow)
