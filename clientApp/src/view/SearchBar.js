import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isundef, makeid } from '../util/tool.js';

import './MainFrame.scss';



class SearchBar extends Component {
  static propTypes = {
    changeCode: PropTypes.func,
    onGetList: PropTypes.func,
    keyword: PropTypes.string,
  }

  constructor (props) {
    super(props);

    const { keyword } = this.props;

    this.state = {
      keyword,
      drawKey: makeid(6),
      clientWidth: 100,
      itemList: [],
      focused: false
    };

    this._mainBox = React.createRef();
  }

  componentDidMount() {
    const { clientWidth } = this._mainBox.current;
    this.setState({ clientWidth });
  }

  handleChange = (ev) => {
    const { onGetList } = this.props;

    if( isundef(onGetList) ) {
      return;
    }

    const keyword = ev.target.value;
    this.setState({ itemList: onGetList(keyword) });
  }

  handleFocus = (focused) => (ev) => {
    if( !focused ) {
      setTimeout(() => this.setState({ focused: false }), 200 );
    } else {
      ev.target.setSelectionRange(0, ev.target.value.length);
      this.setState({ focused });
    }
  }

  handleSelectItem = (idx) => () => {
    const { itemList } = this.state;

    const d = itemList[idx];
    const itemTitle = `${d.name} / ${d.code} / ${d.business}`;

    const { changeCode } = this.props;

    if( changeCode ) {
      changeCode(d.code, (isOk) => {
        if( isOk ) {
          this.setState({ focused: false, keyword: itemTitle, drawKey: makeid(6) });
        }
      });
    }
  }

  render () {
    const { drawKey, keyword, clientWidth, itemList, focused } = this.state;

    return (
      <div ref={this._mainBox} className="searchBarMain">
        <input key={`search-box-${drawKey}`}
          type="text"
          className="searchBarInput"
          placeholder="검색어를 입력하세요."
          defaultValue={keyword}
          onChange={this.handleChange}
          onFocus={this.handleFocus(true)}
          onBlur={this.handleFocus(false)}
        />
        { focused && itemList.length > 0 &&
          <div className="searchBarList" style={{ width: clientWidth }}>
            { itemList.map((d, i) => {
              return (
                <div key={`searched-item-${i}`} className="searchBarItem" onClick={this.handleSelectItem(i)}>
                  {`${d.name} / ${d.code} / ${d.business}`}
                </div>
              );
            })}
          </div>
        }
      </div>
    );
  }
}

export default SearchBar;
export { SearchBar };
