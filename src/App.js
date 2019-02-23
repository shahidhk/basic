import React, { Component } from 'react';
import getNewClient from './apollo';
import { ApolloProvider, withApollo } from 'react-apollo';
import Registration from './Registration.jsx';
import {
  Container,
  Row,
  Col,
  Jumbotron,
  Modal,
  Button,
  ButtonGroup,
  Form,
} from 'react-bootstrap';
import './App.css';

const RegistrationWithApollo = withApollo(Registration);

class App extends Component {
  constructor (props) {
    super(props);
    this.state = {accessKey: '', showAccessKeyModal: false};
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
    this.handleAccessKeyInput= this.handleAccessKeyInput.bind(this);
  }

  componentWillMount() {
    const accessKey = localStorage.getItem('accessKey')
    console.log('accessKey: ', accessKey)
    if (accessKey === null || accessKey === '' || accessKey === 'null') {
      console.log('show modal');
      this.setState({showAccessKeyModal: true});
    }
    console.log('dont show modal');
    this.setState({accessKey});
  }

  handleOpen() {
    this.setState({showAccessKeyModal: true})
  }

  handleClose() {
    if (this.state.accessKey) {
      localStorage.setItem('accessKey', this.state.accessKey);
      this.setState({ showAccessKeyModal: false});
    }
  }

  handleAccessKeyInput(event) {
    this.setState({
      accessKey: event.target.value
    });
  }

  handleLogout() {
    localStorage.clear();
    this.setState({accessKey: ''});
    this.handleOpen();
  }

  render() {
    return (
      <ApolloProvider client={getNewClient(this.state.accessKey)}>
        <Modal show={this.state.showAccessKeyModal} onHide={this.handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>BASIC 2019 - Registrations</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group controlId="formAccessKey">
              <Form.Control
                type="password"
                placeholder="password"
                name="password"
                value={this.state.accessKey || ''}
                onChange={this.handleAccessKeyInput}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={this.handleClose}>
              Login
            </Button>
          </Modal.Footer>
        </Modal>

        <Jumbotron>
          <h3>BASIC 2019 - Registration</h3>
        </Jumbotron>
        <Container>
          <Row>
            <Col>
              <RegistrationWithApollo />
            </Col>
          </Row>
          <Row><Col>
            <br />
            <ButtonGroup aria-label="Basic example">
              <Button variant="secondary" onClick={this.handleOpen}>Login</Button>
              <Button variant="secondary" onClick={this.handleLogout}>Logout</Button>
            </ButtonGroup>
          </Col></Row>
        </Container>
      </ApolloProvider>
    );
  }
}

export default App;
