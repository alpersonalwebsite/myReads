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
          <span className="close" onClick={() => onCloseModal()}>
            <i className="fa fa-times" aria-hidden="true" style={{fontSize: 20, cursor: 'pointer'}}></i>
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
