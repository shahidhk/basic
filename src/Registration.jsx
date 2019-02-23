import React, { Component } from 'react';
import {
  Form,
  Button,
  Alert,
  Badge,
} from 'react-bootstrap';
import gql from 'graphql-tag';

const QUERY_GET_INFO_ON_MOBILE = gql`
  query getInfo($num: String!) {
    students(
      where:{_or:[
        {mobile: {_eq: $num}},
        {other_number: {_eq: $num}}
      ]}
    ) {
      mobile
      other_number
      name
      college
      course
      year
      source
      attended
    }
  }`;

const MUTATION_SAVE_STUDENT = gql`
mutation upsertStudent($data: students_insert_input!) {
  insert_students(
    objects:[$data],
    on_conflict: {
      constraint: students_pkey,
      update_columns: [
        attended
        college
        course
        name
        other_number
        source
        year
      ]
    }
  ) {
    affected_rows
    returning {
      mobile
      other_number
      name
      college
      course
      year
      attended
    }
  }
}`;

class Registration extends Component {
  constructor (props) {
    super(props);
    this.state = {
      alert: {
        variant: 'info',
        message: 'Enter 10 digit mobile number',
        show: true
      },
      student: {
        mobile: '',
        other_number: '',
        name: '',
        college: '',
        course: '',
        year: '',
        attended: false,
        source: ''
      },
      saveButtonText: 'Save'
    };
    this.handleInputChange = this.handleInputChange.bind(this);
    this.renderAlert= this.renderAlert.bind(this);
    this.search = this.search.bind(this);
    this.save = this.save.bind(this);
  }
  async save() {
    if (this.state.student.mobile.length !== 10) {
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
      saveButtonText: 'Saving...'
    })
    try {
      let cleanedVariables = JSON.parse(JSON.stringify(this.state.student))
      delete cleanedVariables['__typename'];
      cleanedVariables.attended = true;
      let response = await this.props.client.mutate({
        mutation: MUTATION_SAVE_STUDENT,
        variables: {
          data: cleanedVariables
        }
      });
      this.setState({
        alert: {
          show: true,
          variant: 'success',
          message: `Marked ${this.state.student.mobile} as present`
        },
        student: response.data.insert_students.returning[0],
        saveButtonText: 'Save'
      })
    } catch (err) {
      this.setState({
        alert: {
          show: true,
          variant: 'danger',
          message: 'An error occured: ' + err
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
      if (response.data.students.length === 0) {
        this.setState({
          alert: {
            show: true,
            variant: 'warning',
            message: 'No details found for ' + mobile + '. Add and save.'
          },
          student: {
            ...this.state.student,
          }
        })
        return;
      } else {
        let student = response.data.students[0];
        this.setState({
          alert: {
            show: true,
            variant: 'success',
            message:'Data for ' + mobile + ' loaded from database. Edit and save.'
          },
          student
        })
        return;
      }
    } catch (err) {
      this.setState({
        alert: {
          show: true,
          variant: 'danger',
          message: 'An error occured: ' + err
        }
      })
      console.error(err);
    }
    this.setState({
      alert: {
        show: true,
        variant: 'info',
        message: 'Loading details for ' + mobile
      }
    })
  }
  handleInputChange(event) {
    const target = event.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      student: {
        ...this.state.student,
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
          student:{
            ...this.state.student,
            [name]: value
          }
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
    const handleFocus = (event) => event.target.select();
    const attendanceBadge = () => {
      if (this.state.student.name) {
        if (!this.state.student.attended) {
          return <Badge variant="secondary">Save to mark present</Badge>
        }
        return <Badge variant="success">Present</Badge>
      }
    }
    return (
      <Form>
      {this.renderAlert()}
        <Form.Group controlId="formMobileNumber">
      <Form.Label>Mobile Number {
        attendanceBadge()
      }</Form.Label>
          <Form.Control
            type="number"
            placeholder="mobile - 10 digit"
            required
            min="6000000000"
            max="9999999999"
            name="mobile"
            value={this.state.student.mobile || ''}
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
            value={this.state.student.other_number || ''}
            onChange={this.handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="formName">
          <Form.Label>Name</Form.Label>
          <Form.Control
            type="text"
            placeholder="name"
            name="name"
            value={this.state.student.name || ''}
            onFocus={handleFocus}
            onChange={this.handleInputChange}
          />
        </Form.Group>
        <Form.Group controlId="formCollege">
          <Form.Label>College, course & year</Form.Label>
          <Form.Control
            type="text"
            placeholder="college"
            name="college"
            value={this.state.student.college || ''}
            onChange={this.handleInputChange}
            onFocus={handleFocus}
          />
        </Form.Group>
        <Form.Group controlId="formCourse">
          <Form.Control
            type="text"
            placeholder="course"
            name="course"
            value={this.state.student.course || ''}
            onChange={this.handleInputChange}
            onFocus={handleFocus}
          />
        </Form.Group>
        <Form.Group controlId="formYear">
          <Form.Control
            type="number"
            placeholder="year"
            name="year"
            value={this.state.student.year || ''}
            onChange={this.handleInputChange}
            onFocus={handleFocus}
          />
        </Form.Group>
        <Button
          variant="success" type="submit" block
          onClick={(e)=> {e.preventDefault(); this.save()}}
        >
          {this.state.saveButtonText}
        </Button>
      </Form>
    )
  }
}

export default Registration;
