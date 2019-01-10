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
    modal: ''
  }

  componentDidMount() {
    this.grabAllBooks()
  }

  grabAllBooks = () => {
    BooksAPI.getAll().then((books) => {
      this.setState({ books })
    })
  }

  changeShelf = (selectedShelf, selectObject, page) => {

    this.setState({books: this.state.books.map(
      (book)=> book.id === selectObject.id ? Object.assign({}, book, {shelf: selectedShelf}) : book
    )})

    BooksAPI.update(selectObject, selectedShelf)

    if (page === 'searchPage') {
      this.grabAllBooks()
    }

  }

  showDescription = (bookDescription) => {
    this.setState({ modal: bookDescription })
  }

  closeModal = () => {
    this.setState({ modal: '' })
  }

  render() {
    const { books, modal } = this.state

    let filteringBooks
    filteringBooks= books.sort(sortBy('title'))

    return (
      <div className="app">
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
