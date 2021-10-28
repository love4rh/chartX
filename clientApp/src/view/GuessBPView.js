import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { makeid } from '../util/tool.js';

import { RiArrowGoBackFill, RiMenuAddLine, RiMenuLine } from 'react-icons/ri';
import { GoTriangleLeft, GoTriangleRight } from 'react-icons/go';

import { ChartFrame } from './ChartFrame.js';

import './viewStyle.scss';



class GuessBPView extends Component {
  static propTypes = {
    appTitle: PropTypes.string.isRequired,
    appData: PropTypes.object.isRequired,
    goBack: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);

    const { appData } = props;

    this.state = {
      drawKey: makeid(6),
      pageNo: 0,
      totalPage: 1,
      cw: 1130,
      ch: 760,
      appData,
      dataList: [],
      guessAll: false,
    };

    this._mainDiv = React.createRef();
  }

  componentDidMount() {
    this.onResize();
    window.addEventListener('resize', this.onResize);

    this.refreshData();
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    const { clientWidth, clientHeight } = this._mainDiv.current;
    this.setState({ cw: clientWidth, ch: clientHeight });
  }

  refreshData = () => {
    this.fetchGuessBP(0, this.state.guessAll);
  }

  fetchGuessBP = (page, isTotal, cb) => {
    const { appData } = this.state;

    appData.fetchBuyPointData(isTotal, page, (isOk) => {
      const pageInfo = appData.getPageInfo();
      const newState = { drawKey: makeid(6), pageNo: page, totalPage: pageInfo[1], dataList: appData.getDataList() };

      if( cb ) {
        cb(isOk, newState);
      } else if( isOk ) {
        this.setState(newState);
      }
    });
  }

  handleGoBack = () => {
    this.props.goBack();
  }

  handlePageTextFocus = (focused) => (ev) => {
    const { pageNo, totalPage } = this.state;

    if( !focused ) {
      const pNo = parseInt(ev.target.value);
      if( !isNaN(pNo) ) {
        if( !this._movePage(pNo - 1) ) {
          ev.target.value = '' + (pageNo + 1) + ' / ' + totalPage;
        }
      }
    } else {
      ev.target.value = '' + (pageNo + 1);
      ev.target.setSelectionRange(0, ev.target.value.length);
    }
  }

  handlePageTextKeyDown = (ev) => {
    if( ev.keyCode === 13 ) {
      this.handlePageTextFocus(false)(ev);
    }
  }

  _movePage = (pNo) => {
    const { pageNo, totalPage, guessAll } = this.state;

    if( pageNo === pNo || pNo < 0 || pNo >= totalPage ) {
      return false;
    }

    this.fetchGuessBP(pNo, guessAll);
    return true;
  }

  movePage = (gap) => () => {
    this._movePage( this.state.pageNo + gap );
  }

  toggleGuessAll = () => {
    const { guessAll } = this.state;
    const flag = !guessAll;

    this.fetchGuessBP(0, flag, (isOk, newState) => {
      if( isOk ) {
        newState.guessAll = flag;
        this.setState(newState);
      }
    });
  }

  render () {
    const { drawKey, cw, appData, dataList, pageNo, totalPage, guessAll } = this.state;

    const hw = Math.min(1130, cw);
    const hasNaviBox = totalPage >= 2;
    const dwOn = hasNaviBox && pageNo > 0;
    const upOn = hasNaviBox && pageNo < totalPage - 1;

    return (
      <div ref={this._mainDiv} className="mainWrap">
        <div className="mainHeader">
          <div className="mainTitleBox" style={{ left: Math.max(0, (cw - hw) / 2), width: hw }}>
            <div className="mainTitle" onClick={this.handleGoBack}>{this.props.appTitle}</div>
            <div className="mainMiddle"> </div>
            { hasNaviBox &&
              <div className="mainNaviBox">
                <div className={dwOn ? "mainMenuButton" : "mainMenuButtonDisabled"} onClick={dwOn ? this.movePage(-1) : null}>
                  <GoTriangleLeft size="24" />
                </div>
                <input key={`pageNo-box-${drawKey}`}
                  className="mainNaviPosition"
                  type="text" defaultValue={(pageNo + 1) + ' / ' + totalPage}
                  onFocus={this.handlePageTextFocus(true)}
                  onBlur={this.handlePageTextFocus(false)}
                  onKeyDown={this.handlePageTextKeyDown}
                />
                <div className={upOn ? "mainMenuButton" : "mainMenuButtonDisabled"} onClick={upOn ? this.movePage(1) : null}>
                  <GoTriangleRight size="24" />
                </div>
                <div className="mainMenuSeparator" />
              </div>
            }

            <div className="mainMenuButton" onClick={this.toggleGuessAll}>
              { guessAll ? <RiMenuLine size="24" /> : <RiMenuAddLine size="24" /> }
            </div>

            <div className="mainMenuButton" onClick={this.handleGoBack}><RiArrowGoBackFill size="24" /></div>
          </div>
        </div>
        <div className="scrollLock">
          <ChartFrame key={`chart-${drawKey}`} appData={appData} dataList={dataList} showDetail={true} />
        </div>
      </div>
    );
  }
}

export default GuessBPView;
export { GuessBPView };
