import React, { Component } from 'react';
import { Route, Link } from 'react-router-dom'
import sortBy from 'sort-by'
import ListingBooks from './ListingBooks'
import SearchingBooks from './SearchingBooks'
import ModalWindow from './ModalWindow'
import * as BooksAPI from './BooksAPI'
import './App.css'
import iconHome from './icons/home.png'
import iconSearch from './icons/search.png'

class BooksApp extends Component {

  state = {
    books: [],
    modal: '',
    error: null
  }

  // Every async path checks this before touching state. Without it React warns
  // "Can't perform a React state update on an unmounted component", which the test
  // suite reproduces reliably: navigate away (or unmount) before the books load and
  // the resolved fetch calls setState on a component that is gone.
  mounted = false

  componentDidMount() {
    this.mounted = true
    this.grabAllBooks()
  }

  componentWillUnmount() {
    this.mounted = false
  }

  grabAllBooks = () => {
    BooksAPI.getAll()
      .then((books) => {
        if (!this.mounted) return
        this.setState({ books, error: null })
      })
      .catch((error) => {
        if (!this.mounted) return
        // There was no .catch anywhere in this project, so a failed load left an
        // unhandled rejection in the console and an empty shelf on screen, which
        // looks exactly like a library with no books in it.
        this.setState({ error: error.message })
      })
  }

  changeShelf = (selectedShelf, selectObject, page) => {
    const previous = this.state.books

    // Optimistic: move the book immediately so the select feels instant.
    this.setState({books: this.state.books.map(
      (book)=> book.id === selectObject.id ? Object.assign({}, book, {shelf: selectedShelf}) : book
    )})

    BooksAPI.update(selectObject, selectedShelf)
      .then(() => {
        if (!this.mounted) return
        if (page === 'searchPage') {
          this.grabAllBooks()
        }
      })
      .catch((error) => {
        if (!this.mounted) return
        // ...and roll back if the server disagreed. Without this the UI claimed a
        // move that never happened, and the next reload silently undid it.
        this.setState({ books: previous, error: `Could not move that book: ${error.message}` })
      })
  }

  showDescription = (bookDescription) => {
    this.setState({ modal: bookDescription })
  }

  closeModal = () => {
    this.setState({ modal: '' })
  }

  render() {
    const { books, modal, error } = this.state

    // [...books], not books.sort(...). Array.prototype.sort sorts IN PLACE and returns
    // the same array, so the old line reordered this.state.books during render, which
    // is a mutation of component state from inside render. Measured on a three-book
    // state: the array object was identical before and after, with its order changed.
    const filteringBooks = [...books].sort(sortBy('title'))

    return (
      <div className="app">
        {/* One header for the page. It used to live inside ListingBooks, which the
            home route renders three times, so the document carried three identical
            <h1>MyReads</h1> elements. They overlapped exactly because .fixed-header is
            position: fixed at top 0, so nothing looked wrong while the page announced
            three top-level headings. */}
        <Route exact path='/' render={() => (
          <div className="fixed-header-top">
            <div className="fixed-header">
              <div className="list-books-title">
                <h1>MyReads</h1>
              </div>
            </div>
          </div>
        )}/>

        {error && (
          <div role="alert" style={{ margin: '150px 20px 0', color: '#b00' }}>
            {error}
          </div>
        )}

        <div className="list-books" style={{marginTop: 140}}>
          <Route exact path='/' render={() => (
            <ListingBooks shelf={'Currently reading'}
              books={filteringBooks.filter((book) => book.shelf === 'currentlyReading')}
              onSelectChange={this.changeShelf}
              onShowDescription={this.showDescription}
            />
          )}/>
          <Route exact path='/' render={() => (
            <ListingBooks shelf={'Want to Read'}
              books={filteringBooks.filter((book) => book.shelf === 'wantToRead')}
              onSelectChange={this.changeShelf}
              onShowDescription={this.showDescription}
            />
          )}/>
          <Route exact path='/' render={() => (
            <ListingBooks shelf="Read"
              books={filteringBooks.filter((book) => book.shelf === 'read')}
              onSelectChange={this.changeShelf}
              onShowDescription={this.showDescription}
            />
          )}/>
          <Route exact path='/search' render={() => (
            <SearchingBooks
              passingBooksOnState={filteringBooks}
              onSelectChange={this.changeShelf}
              onShowDescription={this.showDescription}
            />
          )}/>
          <Route exact path='/' render={() => (
            <div className="go-to">
              <Link to="/search" style={{ backgroundImage: `url(${iconSearch})` }}>Search</Link>
            </div>
          )}/>
          <Route exact path='/search' render={() => (
            <div className="go-to">
              <Link to="/" style={{ backgroundImage: `url(${iconHome})` }}>Go Home</Link>
            </div>
          )}/>
        </div>

        {modal !== ''  && (
          <ModalWindow
            modalPassing={modal}
            onCloseModal={this.closeModal}
          />
        )}
      </div>
    )
  }
}

export default BooksApp
