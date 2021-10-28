import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { makeid } from '../util/tool.js';

import { RiArrowGoBackFill } from 'react-icons/ri';

import { TableFrame} from './TableFrame.js';

import './viewStyle.scss';



class LogicResultView extends Component {
  static propTypes = {
    goBack: PropTypes.func,
    pageType: PropTypes.string,
    compCode: PropTypes.string
  };

  constructor (props) {
    super(props);

    const { appData } = props;

    this.state = {
      cw: 1130,
      ch: 760,
      appData,
      drawKey: makeid(6),
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

  fetchSampleData = () => {
    const { appData } = this.state;

    appData.makeSampleData();

    this.setState({ compCode: 'sample', dataList: appData.getDataList() });
  }

  refreshData = () => {
    // TODO implementaion
  }

  handleGoBack = () => {
    this.props.goBack();
  }

  render () {
    const { drawKey, cw, appData } = this.state;
    const hw = Math.min(1130, cw);

    return (
      <div ref={this._mainDiv} className="mainWrap">
        <div className="mainHeader">
          <div className="mainTitleBox" style={{ left: Math.max(0, (cw - hw) / 2), width: hw }}>
            <div className="mainTitle" onClick={this.handleGoBack}>{this.props.appTitle}</div>
            <div className="mainMiddle">
              { 'Logic View' }
            </div>
            <div className="mainMenuButton" onClick={this.handleGoBack}><RiArrowGoBackFill size="24" /></div>
          </div>
        </div>
        <div className="scrollLock">
          <TableFrame key={`table-${drawKey}`} appData={appData} />
        </div>
      </div>
    );
  }
}

export default LogicResultView;
export { LogicResultView };
