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



class App extends Component {
  constructor (props) {
    super(props);

    const nowTick = tickCount();
    const tmpStr = sessionStorage.getItem('chartx.account');

    let lastID = null;

    if( isvalid(tmpStr) ) {
      const session = JSON.parse(tmpStr);

      if( nowTick < session.timeout ) {
        lastID = session.lastID;
      }
    }

    this.state = {
      appData: new AppData(),
      processing: false,
      appTitle: 'Capitalism',
      inputValue: { identifier: '', password: '' },
      userID: lastID,
      viewType: isvalid(lastID) ? 'choice' : 'signin',
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
    console.log('handleUnload', ev);

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
    console.log('app enterWaiting called');
    this.setState({ processing: true });
  }

  leaveWaiting = () => {
    console.log('app leaveWaiting called');
    this.setState({ processing: false });
  }

  procSignIn = (uid) => {
    const ss = {
      timeout: tickCount() + 30 * 60000, // 30분
      lastID: uid
    };

    sessionStorage.setItem('chartx.account', JSON.stringify(ss));
    this.setState({ userID: uid, viewType: 'choice' });
  }

  handleChange = (type) => (ev) => {
    const { inputValue } = this.state;
    inputValue[type] = (ev.target.value || '').trim();
  }

  handleGo = () => {
    const { inputValue, appData } = this.state;
    const u = inputValue['identifier'], p = inputValue['password'];

    if( isundef(u) || u === '' || isundef(p) || p === '' ) {
      this.pulseAlertMessage('missing Identifier or Passphrase');
      return;
    }

    apiProxy.signIn(u, p,
      (res) => {
        if( res.returnCode === 0 && isvalid(res.response) ) {
          appData.setCodeList(res.response.codes);
          this.procSignIn(u);
        } else {
          this.pulseAlertMessage(res.returnMessage);
        }
      },
      (err) => {
        console.log('signIn error', err);
      }
    );
  }

  goTo = (page) => () => {
    if( 'signin' === page ) {
      sessionStorage.removeItem('chartx.account');
      this.setState({ userID: null, viewType: 'signin' });
    } else if( 'choice' === page ) {
      this.setState({ viewType: 'choice' });
    } else {
      this.setState({ viewType: page, code: 'sample' }); // 066570
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
      { title: 'View a Business', viewID: 'year', style: 'outline-info' },
      { title: 'Guess Buy/Sell Point', viewID: 'guessBP', style: 'outline-success' },
      { title: 'Recommend by 4PXX', viewID: 'recommend', style: 'outline-warning' },
      { title: 'My Codes (implementing)', viewID: 'interest', style: 'outline-danger' },
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

  renderByType = () => {
    const { appTitle, viewType, appData, code } = this.state;

    console.log('render', viewType);

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
    const { processing, } = this.state;

    return (
      <div className="App">
        { this.renderByType() }
        { processing && <div className="blockedLayer"><Spinner className="spinnerBox" animation="border" variant="secondary" /></div> }
      </div>
    );
  }
}

export default App;
export { App };
