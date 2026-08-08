import React from 'react'
import ReactDOM from 'react-dom'
import { MemoryRouter } from 'react-router-dom'
import App from './App'

// This test had never passed. It rendered <App /> bare, and App is built out of
// <Route> elements, so it died on:
//
//   Invariant failed: You should not use <Route> outside a <Router>
//
// index.js wraps the app in <BrowserRouter>, and the test has to supply a router of
// its own. MemoryRouter is the one meant for tests: no browser history involved.
//
// BooksAPI is mocked because App fetches on mount and there is no fetch in the test
// environment, so the real module would fail for a reason that has nothing to do with
// what is being tested.
jest.mock('./BooksAPI', () => ({
  getAll: () => Promise.resolve([]),
  update: () => Promise.resolve({}),
  search: () => Promise.resolve([]),
  get: () => Promise.resolve({})
}))

it('renders without crashing', () => {
  const div = document.createElement('div')

  ReactDOM.render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
    div
  )

  expect(div.querySelectorAll('h1').length).toBe(1)
  expect(div.textContent).toContain('MyReads')

  ReactDOM.unmountComponentAtNode(div)
})

it('renders the three shelves', () => {
  const div = document.createElement('div')

  ReactDOM.render(
    <MemoryRouter>
      <App />
    </MemoryRouter>,
    div
  )

  const shelfTitles = Array.from(div.querySelectorAll('.bookshelf-title')).map(
    (node) => node.textContent
  )

  expect(shelfTitles).toEqual(['Currently reading', 'Want to Read', 'Read'])

  ReactDOM.unmountComponentAtNode(div)
})
