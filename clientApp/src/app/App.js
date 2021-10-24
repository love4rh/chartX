import React, { Component } from 'react';

import { isundef, isvalid, tickCount } from '../util/tool.js';

import { apiProxy } from '../util/apiProxy.js';

import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';

import Spinner from 'react-bootstrap/Spinner'

import { AppData } from '../app/AppData.js';
import { MainFrame } from '../view/MainFrame.js';

import './App.scss';


const _sessionKey_ = 'chartx.account';


class App extends Component {
  constructor (props) {
    super(props);

    const url = window.location.href;
    const pRoot = url.indexOf('/', 10);
    const urlComp = url.substring(pRoot + 1).split('/');

    // console.log('App URL', url, urlComp);

    const tmpStr = localStorage.getItem(_sessionKey_);

    let lastID = null;
    let code = null;
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
      } else {
        viewType = 'choice';
      }
    } else {
      viewType = 'signin';
    }
    

    this.state = {
      appData,
      processing: false,
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

    // setGlobalMessageHandle(this.showInstanceMessage);
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
    const menu = [
      { title: 'View a Company', viewID: 'year', style: 'outline-primary' },
      { title: 'View a Business', viewID: 'business', style: 'outline-info' },
      { title: 'Guess Buy/Sell Point', viewID: 'guessBP', style: 'outline-success' },
      { title: 'Interests', viewID: 'interest', style: 'outline-danger' },
      { title: 'Recommend by 4PXX', viewID: '4pxx', style: 'outline-warning' },
      { title: 'Sign Out', viewID: 'signin', style: 'outline-secondary' }
    ];

    return (
      <Container>
        <Row className="justify-content-md-center">
          <Col md="4">
            <h2>{appTitle}</h2>
            <div className="titleMargin" />
            { menu.map((m, i) => {
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

    if( 'signin' === viewType) {
      return this.renderLogInView();
    } else if( 'choice' === viewType ) {
      return this.renderChoice();
    }

    return (
      <MainFrame key={`main-view-${viewType}`}
        appTitle={appTitle} appData={appData}
        pageType={viewType} compCode={code}
        goBack={this.goTo('choice')}
      />
    );
  }

  render () {
    const { viewType, processing } = this.state;

    return (
      <div className="App">
        { this.renderByType(viewType) }
        { processing && <div className="blockedLayer"><Spinner className="spinnerBox" animation="border" variant="secondary" /></div> }
      </div>
    );
  }
}

export default App;
export { App };
