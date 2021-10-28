import React, { Component } from 'react';

import { isundef, isvalid, tickCount, setGlobalMessageHandle } from '../util/tool.js';

import { apiProxy } from '../util/apiProxy.js';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import Spinner from 'react-bootstrap/Spinner'
import Toast from 'react-bootstrap/Toast'

import { AppData } from '../app/AppData.js';
import { LogicResultView } from '../view/LogicResultView.js';
import { CompanyChartView } from '../view/CompanyChartView.js';
import { GuessBPView } from '../view/GuessBPView.js';
import { BusinessChartView } from '../view/BusinessChartView.js';
import { InterestingsView } from '../view/InterestingsView.js';

import './App.scss';


const _sessionKey_ = 'chartx.account';


class App extends Component {
  constructor (props) {
    super(props);

    const url = window.location.href;
    const pRoot = url.indexOf('/', 10);
    const urlComp = url.substring(pRoot + 1).split('/');

    // console.log('App URL', url, urlComp);

    this.menu = [
      { title: 'View a Company', viewID: 'year', style: 'outline-primary' },
      { title: 'View a Business', viewID: 'business', style: 'outline-info' },
      { title: 'Guess Buy/Sell Point', viewID: 'guessBP', style: 'outline-success' },
      { title: 'Interests', viewID: 'interest', style: 'outline-danger' },
      { title: 'Recommend by 4PXX', viewID: '4pxx', style: 'outline-warning' },
      { title: 'Sign Out', viewID: 'signin', style: 'outline-secondary' }
    ];

    const tmpStr = localStorage.getItem(_sessionKey_);

    let lastID = null;
    let code = '066570';
    const appData = new AppData(this);

    if( isvalid(tmpStr) ) {
      const ud = JSON.parse(tmpStr);
      lastID = ud.uid;
      appData.initialize(ud.uid, ud.data);
    }

    let viewType = '';

    if( isvalid(lastID) ) {
      if( 'year' === urlComp[0] ) {
        viewType = 'year';
        code = isundef(urlComp[1]) ? '066570' : urlComp[1];
      } else if( 'gbp' === urlComp[0] ) {
        viewType = 'guessBP';
      } else if( 'fav' === urlComp[0] ) {
        viewType = 'interest';
      } else {
        viewType = 'choice';
      }
    } else {
      viewType = 'signin';
    }
    

    this.state = {
      appData,
      processing: false,
      message: null,
      appTitle: 'GX',
      inputValue: { identifier: '', password: '' },
      userID: lastID,
      viewType,
      code,
    };

    this.handleUnload = this.handleUnload.bind(this);
  }

  componentDidMount () {
    document.title = this.state.appTitle;

    setGlobalMessageHandle(this.showInstanceMessage);
    window.addEventListener('beforeunload', this.handleUnload);
    apiProxy.setWaitHandle(this.enterWaiting, this.leaveWaiting);
  }

  // Application Close Event Handler
  handleUnload = (ev) => {
    const { appData } = this.state;

    console.log('handleUnload', ev);

    appData.unmount();

    /*
    const message = 'Are you sure you want to close?';

    ev.preventDefault();
    (ev || window.event).returnValue = message;

    return message;
    // */
  }

  pulseAlertMessage = (msg) => {
    this.setState({ message: msg, processing: false });
    setTimeout(() => this.setState({ message: '' }), 3000);
  }

  enterWaiting = () => {
    this.setState({ processing: true });
  }

  leaveWaiting = () => {
    this.setState({ processing: false });
  }

  showInstanceMessage = (msg) => {
    // console.log('showInstanceMessage', msg);
    this.setState({ processing: false, message: msg });
  }

  hideToastShow = () => {
    this.setState({ message: null });
  }


  procSignIn = (uid, data) => {
    const { appData } = this.state;

    appData.initialize(uid, data);
    localStorage.setItem(_sessionKey_, JSON.stringify({ uid, data, tick: tickCount() }));

    this.setState({ userID: uid, viewType: 'choice' });
  }

  handleChange = (type) => (ev) => {
    const { inputValue } = this.state;
    inputValue[type] = (ev.target.value || '').trim();
  }

  handleGo = () => {
    const { inputValue } = this.state;
    const u = inputValue['identifier'], p = inputValue['password'];

    if( isundef(u) || u === '' || isundef(p) || p === '' ) {
      this.pulseAlertMessage('missing Identifier or Passphrase');
      return;
    }

    apiProxy.plugIn(u, p,
      (res) => {
        if( res.returnCode === 0 && isvalid(res.response) ) {
          this.procSignIn(u, res.response);
        } else {
          this.pulseAlertMessage(res.returnMessage);
        }
      },
      (err) => {
        console.log('signIn error', err);
      }
    );
  }

  goTo = (page) => (param) => {
    // console.log('app goTo', page, param);
    if( 'signin' === page ) {
      this.state.appData.clear();
      localStorage.removeItem(_sessionKey_);
      this.setState({ userID: null, viewType: 'signin' });
    } else if( 'choice' === page ) {
      this.setState({ viewType: 'choice' });
    } else {
      this.setState({ viewType: page, code: (isundef(param) || typeof param === 'object' ? '066570' : param) }); // sample
    } 
  }

  renderLogInView = () => {
    const { appTitle, message } = this.state;

    return (
      <Container>
        <Row className="justify-content-md-center">
          <Col md="4">
            <h2>{appTitle}</h2>
            <div className="titleMargin" />
            <Form>
              <Form.Group className="mb-3" controlId="chartx.login.account">
                <Form.Label>Identifier</Form.Label>
                <Form.Control type="text" placeholder="something@like.this" defaultValue={''} onChange={this.handleChange('identifier')} />
              </Form.Group>
              <Form.Group className="mb-3" controlId="chartx.login.password">
                <Form.Label>Passphrase</Form.Label>
                <Form.Control type="password" onChange={this.handleChange('password')} />
              </Form.Group>
            </Form>
            <div className="d-grid gap-2 signInButton">
              <Button variant="primary" onClick={this.handleGo}>{'Go'}</Button>
            </div>
            { isvalid(message) && message !== '' && <div className="alertMessage">{message}</div> }
          </Col>
        </Row>
      </Container>
    );
  }

  renderChoice = () => {
    const { appTitle, message } = this.state;

    return (
      <Container>
        <Row className="justify-content-md-center">
          <Col md="4">
            <h2>{appTitle}</h2>
            <div className="titleMargin" />
            { this.menu.map((m, i) => {
              return (
                <div key={`choice-${i}`} className="d-grid gap-2 menuButton">
                  <Button variant={m.style} onClick={this.goTo(m.viewID)}>{m.title}</Button>
                </div>
              );}
            )}
            { isvalid(message) && message !== '' && <div className="alertMessage">{message}</div> }
          </Col>
        </Row>
      </Container>
    );
  }

  renderByType = (viewType) => {
    const { appTitle, appData, code } = this.state;
    
    // TODO 로그인 상태 체크

    let rptView = null;

    switch( viewType ) {
      case 'choice':
        rptView = this.renderChoice();
        break;

      case 'guessBP':
        rptView = ( <GuessBPView appTitle={appTitle} appData={appData} goBack={this.goTo('choice')} /> );
        break;

      case 'year':
        rptView = ( <CompanyChartView appTitle={appTitle} appData={appData} goBack={this.goTo('choice')} compCode={code} /> );
        break;

      case 'business':
        rptView = ( <BusinessChartView appTitle={appTitle} appData={appData} goBack={this.goTo('choice')} /> );
        break;

      case 'interest':
        rptView = ( <InterestingsView appTitle={appTitle} appData={appData} goBack={this.goTo('choice')} /> );
        break;

      case '4pxx':
        rptView = ( <LogicResultView appTitle={appTitle} appData={appData} goBack={this.goTo('choice')} /> );
        break;

      case 'signin':
      default:
        rptView = this.renderLogInView();
        break;
    }

    return rptView;
  }

  render () {
    const { viewType, processing, message } = this.state;
    const toastOn = isvalid(message);

    return (
      <div className="App">
        { this.renderByType(viewType) }
        { processing && <div className="blockedLayer"><Spinner className="spinnerBox" animation="border" variant="secondary" /></div> }

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
      </div>
    );
  }
}

export default App;
export { App };
