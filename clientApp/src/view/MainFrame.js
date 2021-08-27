import React, { Component } from 'react';
import PropTypes from 'prop-types';

import { isvalid, setGlobalMessageHandle } from '../util/tool.js';
import { apiProxy } from '../util/apiProxy.js';
// import { Log } from '../util/Logging.js';

import { BsList } from 'react-icons/bs';
import Spinner from 'react-bootstrap/Spinner'
import Toast from 'react-bootstrap/Toast'

import { AppData } from '../app/AppData.js';
import { AppFrame } from '../view/AppFrame.js';
import { OptionPanel } from '../view/OptionPanel.js';

import './MainFrame.scss';



class MainFrame extends Component {
  static propTypes = {
    compCode: PropTypes.string
  };

  constructor (props) {
    super(props);

    const { compCode } = props;

    this.state = {
      pageType: 'main', // entry, main,
      message: null,
      waiting: false,
      menuShown: false,
      redrawCount: 0,
      appData: new AppData({ compCode })
    };

    this.handleUnload = this.handleUnload.bind(this);
  }

  componentDidMount() {
    document.title = this.props.appTitle;

    setGlobalMessageHandle(this.showInstanceMessage);

    window.addEventListener('beforeunload', this.handleUnload);
    apiProxy.setWaitHandle(this.enterWaiting, this.leaveWaiting);
  }


  // Application Close Event Handler
  handleUnload = (ev) => {
    console.log('handleUnload', ev);

    /*
    const message = 'Are you sure you want to close?';

    ev.preventDefault();
    (ev || window.event).returnValue = message;

    return message;
    // */

    // apiProxy.signOut();
  }

  showInstanceMessage = (msg) => {
    // console.log('showInstanceMessage', msg);
    this.setState({ waiting: false, message: msg });
  }

  enterWaiting = () => {
    this.setState({ waiting: true });
  }

  leaveWaiting = () => {
    this.setState({ waiting: false });
  }

  handleMenu = () => {
    const { menuShown } = this.state;
    this.setState({ menuShown: !menuShown });
  }

  handleClickMenu = (type) => () => {
    if( 'close' === type ) {
      this.setState({ menuShown: false });
    }
  }

  hideToastShow = () => {
    this.setState({ message: null });
  }

  render () {
    const { waiting, pageType, message, menuShown, appData } = this.state;
    const toastOn = isvalid(message);

    const optionWidth = 300;

    return (
      <div className="mainWrap">
        <div className="mainHeader">
          { <div className="mainMenuButton" onClick={this.handleMenu}><BsList size="28" color="#ffffff" /></div> }
          <div className="mainTitle">{this.props.appTitle}</div>
        </div>
        <div className="scrollLock">
          { pageType === 'entry' && <div>Hello World!</div> }
          { pageType === 'main' && <AppFrame appData={appData} /> }
        </div>
        { waiting &&
          <div className="blockedLayer">
            <Spinner className="spinnerBox" animation="border" variant="primary" />
          </div>
        }
        { toastOn &&
          <div className="blockedLayer" onClick={this.hideToastShow}>
            <Toast className="toastBox" onClose={this.hideToastShow} show={toastOn} delay={3000} autohide animation>
              <Toast.Header>
                <strong className="mr-auto">Message</strong>
              </Toast.Header>
              <Toast.Body>{message}</Toast.Body>
            </Toast>
          </div>
        }
        { menuShown &&
          <div className="overlayLayer" onClick={this.handleClickMenu('close')}>&nbsp;</div>
        }
        { /* option panel */ }
        <div
          className="sideMenuWrap"
          style={{ width:`${optionWidth}px`, left:`${menuShown ? 0 : - optionWidth - 10}px` }}
        >
          <OptionPanel appData={appData} />
        </div>
      </div>
    );
  }
}

export default MainFrame;
export { MainFrame };
