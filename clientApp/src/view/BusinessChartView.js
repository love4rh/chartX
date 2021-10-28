import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isundef, makeid } from '../util/tool.js';

import { RiArrowGoBackFill } from 'react-icons/ri';

import { SearchBar } from './SearchBar.js';
import { ChartFrame } from './ChartFrame.js';

import './viewStyle.scss';



class BusinessChartView extends Component {
  static propTypes = {
    appTitle: PropTypes.string.isRequired,
    appData: PropTypes.object.isRequired,
    goBack: PropTypes.func.isRequired,
  };

  constructor (props) {
    super(props);

    const { appData } = props;

    this.state = {
      compType: '',
      cw: 1130,
      ch: 760,
      appData,
      drawKey: makeid(6),
      dataList: [],
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
    const { compType } = this.state;
    this.fetchBusinessData(compType);
  }

  fetchBusinessData = (bType, cb) => {
    const { appData } = this.state;
    const codes = appData.getCodeInBusiness(bType);

    if( isundef(codes) || codes.length <= 0 ) {
      if( cb ) { cb(false); }
    } else {
      appData.fetchCountedDataByCodes(codes, (isOk) => {
        if( cb ) { cb(isOk); }
  
        if( isOk ) {
          this.setState({ drawKey: makeid(6), compType: bType, dataList: appData.getDataList() });
        }
      });
    }
  }

  handleGoBack = () => {
    this.props.goBack();

  }

  handleFilter = (keyword) => {
    return this.state.appData.getFilteredBusinessList(keyword);
  }

  makeBarTitle = (d) => {
    return isundef(d) ? '' : d;
  }

  onBarChanged = (bType, cb) => {
    this.fetchBusinessData(bType, cb);
  }

  render () {
    const { drawKey, cw, appData, compType, dataList } = this.state;
    const hw = Math.min(1130, cw);

    return (
      <div ref={this._mainDiv} className="mainWrap">
        <div className="mainHeader">
          <div className="mainTitleBox" style={{ left: Math.max(0, (cw - hw) / 2), width: hw }}>
            <div className="mainTitle" onClick={this.handleGoBack}>{this.props.appTitle}</div>
            <div className="mainMiddle">
              <SearchBar
                itemList={appData.getBusinessList()}
                onGetList={this.handleFilter}
                selected={compType}
                onChange={this.onBarChanged}
                makeTitle={this.makeBarTitle}
              />
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

export default BusinessChartView;
export { BusinessChartView };
