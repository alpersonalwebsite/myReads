import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import ReactStars from 'react-stars'
import PropTypes from 'prop-types'
import * as BooksAPI from './BooksAPI'
import noBookImage from './images/noimage.png'

class SearchingBooks extends Component {

  static propTypes = {
    passingBooksOnState: PropTypes.array.isRequired,
    onSelectChange: PropTypes.func.isRequired,
    onShowDescription: PropTypes.func
  }

  // The shelves are read from props where they are used. They used to be copied into
  // state in componentDidMount and re-copied in componentWillReceiveProps, which is
  // both the derived-state antipattern and a deprecated lifecycle: React renamed it
  // UNSAFE_componentWillReceiveProps in 16.9, and this project's ^16.7 range installs
  // 16.14, so every prop change logged a warning.
  state = {
    search: '',
    books: [],
    error: null,
    searching: false
  }

  // Guards against an out-of-order response. Type quickly and several searches are in
  // flight at once; without this, a slower earlier request can land last and overwrite
  // the results for the query the user is actually looking at.
  latestQuery = ''

  componentWillUnmount() {
    // Nothing may call setState after this point.
    this.latestQuery = null
  }

  resultBooks = (search) => {
    const query = search.trim()

    // Two characters, measured on the query itself. This used to be `caret > 1`, where
    // caret was event.target.selectionStart: the caret happens to sit past position 1
    // while you type forwards, so it stood in for "long enough", but it is not the same
    // thing. Pasting a query, or editing near the start of one, put the caret at 0 or 1
    // and silently returned no results for a perfectly good search.
    if (query.length < 2) {
      this.latestQuery = query
      this.setState({ books: [], error: null, searching: false })
      return
    }

    this.latestQuery = query
    this.setState({ searching: true, error: null })

    BooksAPI.search(query)
      .then((books) => {
        if (this.latestQuery !== query) {
          return
        }

        const shelves = this.props.passingBooksOnState

        this.setState({
          books: books.map((book) => {
            const { shelf } = shelves.find(({ id }) => id === book.id) || { shelf: 'none' }
            return Object.assign({}, book, { shelf })
          }),
          searching: false
        })
      })
      .catch((error) => {
        // There was no .catch at all, so a dead network or an error response from the
        // API left an unhandled rejection in the console and the previous results on
        // screen, which reads as "your search matched the same books again".
        if (this.latestQuery !== query) {
          return
        }

        this.setState({ books: [], error: error.message, searching: false })
      })
  }

  updateBookStateShelf = (selShelf, selBook) => {
    this.setState({books: this.state.books.map(
      (book)=> book.id === selBook.id ? Object.assign({}, book, {shelf: selShelf}) : book
    )})
  }

  onChangeHandle(selShelf, selBook, selPage) {
    this.updateBookStateShelf(selShelf, selBook)
    this.props.onSelectChange(selShelf, selBook, selPage)

  }

  updateSearchState = (search) => {
    this.setState({ search })
    this.resultBooks(search)
  }

  render() {
    const { onShowDescription } = this.props
    const { search, books, error, searching } = this.state

    return (
      <div>
        <div style={{marginTop: 180}}>
          <div className="fixed-header">
            <div className="list-books-title">
              <h1>MyReads</h1>
            </div>
            <div className="search-books">
              <div className="search-books-bar">
                <Link to="/" className="close-search">Close</Link>
                <div className="search-books-input-wrapper">
                  <input
                    type="text" placeholder="Search by title or author"
                    onChange={(event) => this.updateSearchState(event.target.value)}
                    value={search}
                  />
                </div>
              </div>
              <div className="search-books-results">
                {searching && <div>Searching...</div>}
                {error && (
                  <div role="alert" style={{ color: '#b00' }}>
                    Could not search: {error}
                  </div>
                )}
                {!searching && !error && search.trim().length >= 2 && books.length === 0 && (
                  <div>No books matched "{search.trim()}".</div>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="list-books-content">
          <div>
            <div className="bookshelf">
              <div className="bookshelf-books">
                <ol className="books-grid">
                  {books.map((book) => (
                    <li key={book.id}>
                      <div className="book">
                        <div className="book-top">
                          <div className="book-cover"
                            style={{ width: 128, height: 193, backgroundImage: `url(${book.imageLinks ? book.imageLinks.thumbnail : noBookImage})` }}
                            onClick={() => onShowDescription(book)}></div>
                          <div className="book-shelf-changer">
                            <select onChange={(event) => this.onChangeHandle(event.target.value, book, 'searchPage')} value={book.shelf}>
                              <option value="none" disabled>Move to...</option>
                              <option value="currentlyReading">Currently Reading</option>
                              <option value="wantToRead">Want to Read</option>
                              <option value="read">Read</option>
                              <option value="none">None</option>
                            </select>
                          </div>
                        </div>
                        <div className="book-title">{book.title ? book.title  : 'Ups... Title...?'}</div>
                        <div className="book-authors">
                          {book.hasOwnProperty('authors') &&
                            book.authors.map((bookAuthors) => (
                              <div key={bookAuthors}>{bookAuthors}</div>
                            ))}
                        </div>
                        <div>
                          <div>{book.publishedDate ? book.publishedDate : ''} {book.pageCount ? ' - ' + book.pageCount : ''} pages</div>
                          {book.hasOwnProperty('averageRating') &&
                            <div title="Ratings come from the API and are read-only here">
                              <ReactStars
                                count={5}
                                value={book.averageRating}
                                size={20}
                                edit={false}
                              />
                            </div>
                          }
                          <div>
                            <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden="true"
                              focusable="false" style={{ verticalAlign: 'middle' }}>
                              <path fill="currentColor" d="M12 12a5 5 0 100-10 5 5 0 000 10zm0 2c-4 0-8 2-8 5v3h16v-3c0-3-4-5-8-5z" />
                            </svg>
                            {book.ratingsCount ? ' ' + book.ratingsCount : ' '}
                            {book.ratingsCount === 1 ? ' review'
                            : book.ratingsCount > 1 ? ' reviews'
                            : ' Not yet reviewed'}
                          </div>
                          <div>
                            {book.hasOwnProperty('industryIdentifiers') &&
                              book.industryIdentifiers.map((bookIds) => (
                                <div key={bookIds.identifier}> {bookIds.type}: {bookIds.identifier}</div>
                              ))}
                          </div>
                          <div style={{fontWeight: 'bold'}}>Shelf: {book.shelf ? book.shelf : ''}</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </div>
)
}
}

export default SearchingBooks
