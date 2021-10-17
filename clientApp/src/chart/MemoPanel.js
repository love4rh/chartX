import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { makeid, isvalid } from '../util/tool.js';

import { RiDeleteBin6Line, RiAddFill, RiCloseFill } from 'react-icons/ri';

import './MemoPanel.scss';



class MemoPanel extends Component {
  static propTypes = {
    compCode: PropTypes.string,
    appData: PropTypes.object,
    onApply: PropTypes.func
  };

  constructor (props) {
    super(props);

    const { compCode } = props;

    this.state = {
      initialized: false,
      drawId: makeid(8),
      compCode,
      memoText: '',
      newComment: '',
    };

    this._cmtRef = React.createRef();
    this._inputRef = React.createRef();
  }

  componentDidMount () {
    const { appData, compCode } = this.props;

    appData.getComment(compCode, (cmt) => {
      this.setState({ memoText: cmt });
      this._inputRef.current.focus();
    });

    this.componentDidUpdate();
  }

  componentDidUpdate() {
    this._cmtRef.current.scrollTop = this._cmtRef.current.scrollHeight;
  }

  handleChange = (ev) => {
    this.setState({ newComment: ev.target.value });
  }

  handleKeyDown = (ev) => {
    if( ev.keyCode === 13 ) { // enter
      this.doAction('add')();
    } else if( ev.keyCode === 27 ) { // ESC
      this.doAction('close')();
    }
  }

  doAction = (type) => () => {
    const { appData, compCode, onApply } = this.props;
    const { newComment } = this.state;

    if( 'add' === type ) {
      appData.addComment(compCode, newComment, (msg) => {
        this.setState({ memoText: msg, newComment: '' });
      });
    } else if( 'remove' === type ) {
      appData.removeComment(compCode, () => {
        if( onApply ) {
          onApply(type, newComment);
        }
      });
    } else if( onApply ) {
      onApply(type, newComment);
    }
  }

  render () {
    const { drawId, memoText, newComment } = this.state;

    return (
      <div key={`memoPanel-${drawId}`} className="memoPanel">
        <div className="memoButtons" style={{ marginTop: -7 }}>
          <div className="memoButton" onClick={this.doAction('remove')}><RiDeleteBin6Line size="20" /></div>
          <div className="memoButton" onClick={this.doAction('close')}><RiCloseFill size="20" /></div>
        </div>
        <div className="memoBox">
          <textarea ref={this._cmtRef} className="memoHistory" rows={6} readOnly value={isvalid(memoText) & memoText !== '' ? memoText: '코멘트가 없습니다.'} />
        </div>
        <div className="memoButtons" style={{ marginTop: 5 }}>
          <div className="memoNewBox">
            <input
              ref={this._inputRef}
              tabIndex="1"
              className="memoAddBox"
              type="text"
              placeholder="Comment..."
              value={newComment}
              onChange={this.handleChange}
              onKeyDown={this.handleKeyDown}
            />
          </div>
          <div className="memoButton" onClick={this.doAction('add')}><RiAddFill size="24" /></div>
        </div>
      </div>
    );
  }
}

export default MemoPanel;
export { MemoPanel };
