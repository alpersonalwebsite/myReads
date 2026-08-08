import React, { Component } from 'react'
import PropTypes from 'prop-types'
import noBookImage from './images/noimage.png'

class ModalWindow extends Component {

  static propTypes = {
    modalPassing: PropTypes.object,
    onCloseModal: PropTypes.func
  }

  render() {
    const { modalPassing, onCloseModal } = this.props

    return (
      <div className="modal-container">
        <div className="modal"></div>
        <div className="modal-content">
          <span className="close" role="button" tabIndex={0} aria-label="Close"
            onClick={() => onCloseModal()}
            onKeyDown={(event) => (event.key === 'Enter' || event.key === ' ') && onCloseModal()}>
            <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden="true" focusable="false"
              style={{ cursor: 'pointer' }}>
              <path fill="currentColor"
                d="M19 6.4L17.6 5 12 10.6 6.4 5 5 6.4 10.6 12 5 17.6 6.4 19 12 13.4 17.6 19 19 17.6 13.4 12z" />
            </svg>
          </span>
          <h2 style={{marginTop: 0}}>{modalPassing.title ? modalPassing.title  : 'Ups... Title...?'}</h2>
          <p>
            <img src={modalPassing.imageLinks ? modalPassing.imageLinks.thumbnail : noBookImage} alt="" />
            {modalPassing.description ? modalPassing.description  : 'Ups... Someone forgot to ADD a description...'}
          </p>
        </div>
      </div>
    )
  }
}

export default ModalWindow
