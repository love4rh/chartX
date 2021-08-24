import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { convertToChartData } from '../chart/chartTool.js';
import { RunTooltipChart } from '../chart/RunTooltipChart.js';

import { makeid } from '../grid/common.js';

import BasicDataSource from '../grid/BasicDataSource.js';

import './AppFrame.scss';



class AppFrame extends Component {
  static propTypes = {
    appData: PropTypes.object.isRequired  // Application 전반에 걸쳐 사용되는 데이터 객체. redux 컨셉으로 사용할 객체임
  };

  constructor (props) {
    super(props);

    const { appData } = this.props;
    const ds = new BasicDataSource(appData.getSampleData());

    ds.setEventHandler(this.handleDataEvent);

    this.state = {
      drawKey: makeid(8),
      clientWidth: 800,
      clientHeight: 400,
      ds
    };

    this._mainDiv = React.createRef();
  }

  componentDidMount() {
    const { appData } = this.props;

    this.onResize();
    appData.addEventListener(this.handleDataEvent);
    window.addEventListener('resize', this.onResize);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this.onResize);
  }

  onResize = () => {
    const { clientWidth, clientHeight } = this._mainDiv.current;

    // console.log('SQLFrame onResize', clientWidth, clientHeight);
    this.setState({ clientWidth, clientHeight });
  }

  // DataSource에 변경이 있을 경우 발생하는 이벤트 처리
  handleDataEvent = (sender, evt) => {
    const { appData } = this.props;

    if( sender === 'appData' ) {
      this.setState({
        drawKey: makeid(8),
        ds: new BasicDataSource(appData.getLatestData())
      });
    } else {
      this.setState({ drawKey: makeid(8) });
    }
  }

  handleLayoutChanged = (type) => (from, to) => {
    const { bottomHeight, leftWidth, controlPaneHeight } = this.state;

    if( 'topBottom' === type ) {
      // console.log('layout top-bottom', bottomHeight, to - from);
      this.setState({ bottomHeight: bottomHeight + to - from });
    } else if( 'leftRight' === type ) {
      // console.log('layout left-right', leftWidth, to - from);
      this.setState({ leftWidth: leftWidth + to - from });
    } else if( 'leftTopBottom' === type ) {
      this.setState({ controlPaneHeight: controlPaneHeight + to - from });
    }
  }

  render() {
    const { appData } = this.props;
    const { drawKey, clientWidth, clientHeight, ds } = this.state;

    const mainWidth = clientWidth; // - leftWidth - dividerSize;
    const mainHeight = clientHeight - 54; // - bottomHeight; // - dividerSize;

    const { X, Y1, Y2 } = appData.getLatestChart();

    const chartData = convertToChartData({ ds, time: X, y1: Y1, y2: Y2 });

    return (
      <div ref={this._mainDiv} className="appFrame">
        <div key={`chart-${drawKey}`} style={{ flexBasis:`${mainWidth}px` }}>
          <RunTooltipChart
            data={chartData}
            showingRangeX={[0, Math.min(300, ds.getRowCount())]}
            withLegend={true} withSlider={true} withYSlider={false}
            width={mainWidth} height={mainHeight}
          />
        </div>
      </div>
    );
  }
}

export default AppFrame;
export { AppFrame };
