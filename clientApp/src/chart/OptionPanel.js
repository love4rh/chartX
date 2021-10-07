import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { makeid, cp } from '../util/tool.js';
import { RiCheckDoubleFill, RiCheckFill, RiCloseFill } from 'react-icons/ri';

import { RangeSlider, sliderSize } from '../component/RangeSlider.js';

import './OptionPanel.scss';



class OptionPanel extends Component {
  static propTypes = {
    extentData: PropTypes.array, // { title, extent(설정 가능 범위), value(현재 설정 범위) }
    onApply: PropTypes.func
  };

  constructor (props) {
    super(props);

    const { extentData } = props;

    this.state = {
      initialized: false,
      drawId: makeid(8),
      extentData: cp(extentData)
    };
  }

  componentDidMount() {
    //
  }

  handleSliderEvent = (idx) => (type, param) => {
    const { extentData } = this.state;
    extentData[idx].value = param; 

    this.setState({ extentData: extentData });
  }

  render () {
    const { drawId, extentData } = this.state;

    return (
      <div key={`optPanel-${drawId}`} className="optionPanel">
        { extentData.map((d, i) => {
            return (
              <div key={`sliderTxt-${drawId}-${i}`}>
                <div className="optionLabel" style={{ marginTop:`${i === 0 ? 20 : 55}px` }}>{d.title}</div>
                <div
                  className="optionLabel"
                  style={{ height:`${sliderSize}px`, 'margin': `0 ${20}px`, 'padding': `0 ${10}px` }}
                >
                  <RangeSlider
                    valueRange={d.extent}
                    selectedRange={d.value}
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
