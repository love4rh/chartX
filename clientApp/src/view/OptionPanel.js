import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { makeid, isundef } from '../util/tool.js';
import { RiCheckboxBlankLine, RiCheckboxLine } from 'react-icons/ri';

import { RangeSlider, sliderSize } from '../component/RangeSlider.js';

import './MainFrame.scss';



class OptionPanel extends Component {
  static propTypes = {
    appData: PropTypes.object.isRequired
  };

  constructor (props) {
    super(props);

    const { appData } = props;

    this.state = {
      initialized: false,
      appData,
      drawId: makeid(8),
      commonUseFlag: appData.isUseCommonRange()
    };

    appData.addEventListener(this.handleDataChanged);
  }

  componentDidMount() {
    this.setState({ initialized: true });
  }

  handleDataChanged = (sender, event) => {
    if( sender !== 'appData' || !this.state.initialized ) {
      return;
    }

    const { appData } = this.props;

    this.setState({
      appData,
      drawId: makeid(8),
      commonUseFlag: appData.isUseCommonRange()
    });
  }

  handleCommonRange = () => {
    const { appData, commonUseFlag } = this.state;

    appData.setCommonRangeUsage( !commonUseFlag );
    this.setState({ commonUseFlag: !commonUseFlag });
  }

  handleSliderEvent = (idx) => (type, param) => {
    const { appData } = this.state;

    if( idx === 0 ) {
      appData.setUserExtentY(param);
    } else if( idx === 1 ) {
      appData.setUserExtentY(null, param);
    }
  }

  render () {
    const { drawId, appData, commonUseFlag } = this.state;

    const dataExtent = [appData.getDataExtentY(0), appData.getDataExtentY(1)];
    const userExtent = [appData.getUserExtentY(0), appData.getUserExtentY(1)];

    const yLabel = ['왼쪽 축 범위', '오른쪽 축 범위'];

    return (
      <div key={`optPanel-${drawId}`} className="optionPanel">
        <div className="optionItem" onClick={this.handleCommonRange}>
          { commonUseFlag ? <RiCheckboxLine size="20" /> : <RiCheckboxBlankLine size="20" /> }
          <span>&nbsp;Y축 범위 동일하게 적용</span>
        </div>
        { yLabel.map((t, i) => {
            if( isundef(dataExtent[i]) ) {
              return null;
            }

            return (
              <div key={`sliderTxt-${i}`}>
                <div className="optionLabel" style={{ marginTop:`${i === 0 ? 20 : 55}px` }}>{t}</div>
                <div
                  className="optionLabel"
                  style={{ height:`${sliderSize}px`, 'margin': `0 ${20}px`, 'padding': `0 ${10}px` }}
                >
                  <RangeSlider
                    valueRange={dataExtent[i]}
                    selectedRange={userExtent[i]}
                    onEvent={this.handleSliderEvent(i)}
                    alwaysShow={true}
                    dateTime={false}
                    tipTextPos={'bottom'}
                  />
                </div>
              </div>
            );
          })
        }
      </div>
    );
  }
}

export default OptionPanel;
export { OptionPanel };
