import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isundef, makeid } from '../util/tool.js';

import './viewStyle.scss';



class SearchBar extends Component {
  static propTypes = {
    itemList: PropTypes.array,
    onChange: PropTypes.func,
    onGetList: PropTypes.func,
    selected: PropTypes.any,
    makeTitle: PropTypes.func,
  }

  constructor (props) {
    super(props);

    const { selected, makeTitle, itemList } = this.props;

    this.state = {
      keyword: makeTitle(selected),
      drawKey: makeid(6),
      clientWidth: 100,
      itemList: itemList,
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
    const { makeTitle, onChange, itemList } = this.props;
    const d = this.state.itemList[idx];

    if( onChange ) {
      onChange(typeof d === 'string' ? d : d.code, (isOk) => {
        if( isOk ) {
          this.setState({ focused: false, keyword: makeTitle(d), drawKey: makeid(6), itemList: itemList });
        }
      });
    }
  }

  render () {
    const { makeTitle } = this.props;
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
                  {makeTitle(d)}
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
