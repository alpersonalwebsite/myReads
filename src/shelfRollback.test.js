import React from 'react'
import ReactDOM from 'react-dom'
import { act } from 'react-dom/test-utils'
import { MemoryRouter } from 'react-router-dom'
import App from './App'
import * as BooksAPI from './BooksAPI'

// Two shelf changes can be in flight at once. Rolling back the whole books array on a
// failure would undo whichever one settled in between, so the rollback has to be per
// book. These tests drive App directly and assert on the state it ends up in.

jest.mock('./BooksAPI')

const BOOKS = [
  { id: 'a', title: 'Book A', shelf: 'currentlyReading' },
  { id: 'b', title: 'Book B', shelf: 'wantToRead' }
]

const mountApp = () => {
  const div = document.createElement('div')
  document.body.appendChild(div)
  let instance

  act(() => {
    ReactDOM.render(
      <MemoryRouter>
        <App ref={(r) => { instance = r }} />
      </MemoryRouter>,
      div
    )
  })

  return {
    div,
    instance,
    shelfOf: (id) => instance.state.books.find((b) => b.id === id).shelf,
    unmount: () => {
      ReactDOM.unmountComponentAtNode(div)
      document.body.removeChild(div)
    }
  }
}

beforeEach(() => {
  BooksAPI.getAll.mockResolvedValue(BOOKS.map((b) => ({ ...b })))
})

it('rolls back only the book whose update failed', async () => {
  // A fails, B succeeds.
  BooksAPI.update.mockImplementation((book) =>
    book.id === 'a' ? Promise.reject(new Error('nope')) : Promise.resolve({})
  )

  const h = mountApp()
  await act(async () => {})

  expect(h.shelfOf('a')).toBe('currentlyReading')
  expect(h.shelfOf('b')).toBe('wantToRead')

  await act(async () => {
    h.instance.changeShelf('read', { id: 'a' }, 'listingPage').catch(() => {})
    await h.instance.changeShelf('read', { id: 'b' }, 'listingPage')
  })

  // A reverts to where it was...
  expect(h.shelfOf('a')).toBe('currentlyReading')
  // ...and B keeps the move that succeeded. A whole-array rollback would have undone it.
  expect(h.shelfOf('b')).toBe('read')

  h.unmount()
})

it('surfaces the failure to the user', async () => {
  BooksAPI.update.mockRejectedValue(new Error('server said no'))

  const h = mountApp()
  await act(async () => {})

  await act(async () => {
    await h.instance.changeShelf('read', { id: 'a' }, 'listingPage').catch(() => {})
  })

  expect(h.instance.state.error).toContain('server said no')
  expect(h.shelfOf('a')).toBe('currentlyReading')

  h.unmount()
})

it('moves the book optimistically before the server answers', async () => {
  let settle
  BooksAPI.update.mockImplementation(() => new Promise((resolve) => { settle = resolve }))

  const h = mountApp()
  await act(async () => {})

  act(() => { h.instance.changeShelf('read', { id: 'a' }, 'listingPage') })
  expect(h.shelfOf('a')).toBe('read')

  await act(async () => { settle({}) })
  expect(h.shelfOf('a')).toBe('read')

  h.unmount()
})
