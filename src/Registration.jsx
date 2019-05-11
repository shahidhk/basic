import React, { Component } from 'react';
import {
  Form,
  Button,
  Alert,
  Badge,
} from 'react-bootstrap';
import gql from 'graphql-tag';
import LoadingOverlay from 'react-loading-overlay';

const QUERY_GET_INFO_ON_MOBILE = gql`
  query getInfo($num: String!) {
    attendees(
      where:{_or:[
        {mobile: {_eq: $num}},
        {other_number: {_eq: $num}}
      ]}
    ) {
      mobile
      other_number
      name
      remarks 
      attended
    }
  }`;

const MUTATION_SAVE_DATA = gql`
mutation upsertData($data: attendees_insert_input!) {
  insert_attendees(
    objects:[$data],
    on_conflict: {
      constraint: attendees_pkey,
      update_columns: [
        attended
        name
        other_number
        remarks
      ]
    }
  ) {
    affected_rows
    returning {
      mobile
      other_number
      name
      remarks
      attended
    }
  }
}`;

const getDefaultData = () => {
  return {
    mobile: '', 
    name: null,
    attended: false,
    remarks: null,
  }
}

class Registration extends Component {
  constructor (props) {
    super(props);
    this.state = {
      showLoading: false,
      alert: {
        variant: 'info',
        message: 'Enter 10 digit mobile number',
        show: true
      },
      data: getDefaultData,
      saveButtonText: 'Save',
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.renderAlert= this.renderAlert.bind(this);
    this.search = this.search.bind(this);
    this.save = this.save.bind(this);
    this.mobileInput = React.createRef();
  }
  componentDidMount() {
    this.mobileInput.current.focus();
  }
  async save() {
    if (this.state.data.mobile.length !== 10) {
      this.setState({
        alert: {
          show: true,
          variant: 'danger',
          message: 'Mobile is not 10 digits'
        }
      })
      return;
    }
    this.setState({
      saveButtonText: 'Saving...',
      showLoading: true,
    })
    try {
      let cleanedVariables = JSON.parse(JSON.stringify(this.state.data))
      delete cleanedVariables['__typename'];
      cleanedVariables.attended = true;
      let response = await this.props.client.mutate({
        mutation: MUTATION_SAVE_DATA,
        variables: {
          data: cleanedVariables
        }
      });
      this.setState({
        alert: {
          show: true,
          variant: 'success',
          message: `Marked ${this.state.data.mobile} as present`
        },
        data: getDefaultData(),
        saveButtonText: 'Save',
        showLoading: false,
      });
      this.mobileInput.current.focus();
    } catch (err) {
      this.setState({
        alert: {
          show: true,
          variant: 'danger',
          message: 'An error occured: ' + err,
          showLoading: false,
        }
      })
      console.error(err);
    }
  }
  async search(mobile) {
    try {
      let response = await this.props.client.query({
        query: QUERY_GET_INFO_ON_MOBILE,
        variables: {
          num: mobile
        }
      })
      if (response.data.attendees.length === 0) {
        this.setState({
          alert: {
            show: true,
            variant: 'warning',
            message: 'No details found for ' + mobile + '. Add and save.'
          },
          data: {
            ...this.state.data,
          },
          showLoading: false,
        })
        return;
      } else {
        let data = response.data.attendees[0];
        this.setState({
          alert: {
            show: true,
            variant: 'success',
            message:'Data for ' + mobile + ' loaded from database. Edit and save.'
          },
          data,
          showLoading: false,
        })
        return;
      }
    } catch (err) {
      this.setState({
        alert: {
          show: true,
          variant: 'danger',
          message: 'An error occured: ' + err
        },
        showLoading: false,
      })
      console.error(err);
    }
    this.setState({
      alert: {
        show: true,
        variant: 'info',
        message: 'Loading details for ' + mobile
      },
      showLoading: false,
    })
  }
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      data: {
        ...this.state.data,
        [name]: value
      }
    });

    if (name === 'mobile') {
      if (value.length === 10) {
        this.setState({
          alert: {
            show: true,
            variant: 'info',
            message: 'Searching...'
          },
          data:{
            ...this.state.data,
            [name]: value
          },
          showLoading: true,
        })
        this.search(value);
      }
    }
  }

  renderAlert() {
    if (this.state.alert.show) {
      return (
        <Alert variant={this.state.alert.variant}>
          {this.state.alert.message}
        </Alert>
      )
    }
  }
  render() {
    // const handleFocus = (event) => event.target.select();
    const handleFocus = (event) => {};
    const attendanceBadge = () => {
      if (this.state.data.name) {
        if (!this.state.data.attended) {
          return <Badge variant="secondary">Save to mark present</Badge>
        }
        return <Badge variant="success">Present</Badge>
      }
    }
    return (
      <LoadingOverlay
        active={this.state.showLoading}
        spinner={true}
        fadeSpeed={100}
        text='Loading...'
      >
        <Form>
          <Button
            variant="success" type="submit" block
            onClick={(e)=> {e.preventDefault(); this.save()}}
          >
            {this.state.saveButtonText}
          </Button>
          <br/>
          {this.renderAlert()}
          <Form.Group controlId="formMobileNumber">
            <Form.Label>Mobile Number {
              attendanceBadge()
            }
            </Form.Label>
            <Form.Control
              ref={this.mobileInput}
              type="number"
              placeholder="mobile - 10 digit"
              required
              min="6000000000"
              max="9999999999"
              name="mobile"
              value={this.state.data.mobile || ''}
              onChange={this.handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId="formOtherNumber">
            <Form.Control
              type="number"
              placeholder="other number"
              min="6000000000"
              max="9999999999"
              name="other_number"
              value={this.state.data.other_number || ''}
              onChange={this.handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId="formName">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="name"
              name="name"
              value={this.state.data.name || ''}
              onFocus={handleFocus}
              onChange={this.handleInputChange}
            />
          </Form.Group>
          <Form.Group controlId="remarks">
            <Form.Label>Remarks</Form.Label>
            <Form.Control
              type="text"
              placeholder="remarks"
              name="remarks"
              value={this.state.data.remarks || ''}
              onChange={this.handleInputChange}
              onFocus={handleFocus}
            />
          </Form.Group>
        </Form>
      </LoadingOverlay>
    )
  }
}

export default Registration;
