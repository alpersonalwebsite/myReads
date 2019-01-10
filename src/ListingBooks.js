import React, { Component } from 'react'
import PropTypes from 'prop-types'
import noBookImage from './images/noimage.png'

class ListingBooks extends Component {

  static propTypes = {
    books: PropTypes.array.isRequired,
    onSelectChange: PropTypes.func,
    onShowDescription: PropTypes.func
  }

  render() {
    const { books, onSelectChange, onShowDescription, shelf } = this.props

    return (
      <div>
        <div className="fixed-header-top">
          <div className="fixed-header">
            <div className="list-books-title">
              <h1>MyReads</h1>
            </div>
          </div>
        </div>
        <div className="list-books-content">
          <div>
            <div className="bookshelf">
              <h2 className="bookshelf-title">
                {shelf ? shelf : 'Something´s wrong'}
              </h2>
              <div className="bookshelf-books">
                <ol className="books-grid">
                  {books.map((book) => (
                    <li key={book.id}>
                      <div className="book">
                        <div className="book-top">
                          <div className="book-cover" style={{ width: 128, height: 193, backgroundImage: `url(${book.imageLinks ? book.imageLinks.thumbnail : noBookImage})` }}
                            onClick={() => onShowDescription(book)}></div>
                          <div className="book-shelf-changer">
                            <select onChange={(event) => onSelectChange(event.target.value, book, 'listingPage')} value={book.shelf}>
                              <option value="none" disabled>Move to...</option>
                              <option value="currentlyReading">Currently Reading</option>
                              <option value="wantToRead">Want to Read</option>
                              <option value="read">Read</option>
                              <option value="none">None</option>
                            </select>
                          </div>
                        </div>
                        <div className="book-title">{book.title ? book.title  : 'Ups... Title...?'}</div>
                        <div className="book-authors">{
                          book.hasOwnProperty('authors') &&
                          book.authors.map((bookAuthors) => (
                            <div key={bookAuthors}>{bookAuthors}</div>
                          ))}
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

  export default ListingBooks
