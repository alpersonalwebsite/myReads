import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import ReactStars from 'react-stars'
//import escapeRegExp from 'escape-string-regexp'
//import sortBy from 'sort-by'
import PropTypes from 'prop-types'
import * as BooksAPI from './BooksAPI'
import noBookImage from './images/noimage.png'

class SearchingBooks extends Component {

  static propTypes = {
    onShowDescription: PropTypes.func
  }

  state = {
    search: '',
    books: [],
    booksShelf: []
  }

  componentDidMount() {
    this.setState({
      booksShelf: this.props.passingBooksOnState
    });
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      booksShelf: nextProps.passingBooksOnState
    });
  }

  resultBooks = (search, caret) => {

    if (search) {
      BooksAPI.search(search).then((books) => {

        if (!books.error && caret > 1) {

          let res  = books.map(o => {
            const {shelf} = this.state.booksShelf.find(({id}) => id === o.id) || {shelf: 'none'};
            return Object.assign({}, o, {shelf});
          });

          books = res

          this.setState({books});

        } else {
          this.setState({books: []});
        }
      })

    } else {
      this.setState({books: []});
    }
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

  updateSearchState = (search, caret) => {
    this.setState({ search })
    this.resultBooks(search,caret)
  }

  render() {
    const { onShowDescription } = this.props
    const { search, books } = this.state

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
                    onChange={(event) => this.updateSearchState(event.target.value,event.target.selectionStart)}
                    value={search}
                  />
                </div>
              </div>
              <div className="search-books-results">
                <ol className="books-grid"></ol>
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
                            <div onClick={() => alert('You are not updating states and/or rating. Just seeing the rate. Kudos to react-stars.')}>
                              <ReactStars
                                count={5}
                                value={book.averageRating}
                                size={20}
                                edit={false}
                              />
                            </div>
                          }
                          <div><i className="fa fa-user-circle" aria-hidden="true"></i>
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
