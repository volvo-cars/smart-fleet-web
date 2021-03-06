import React, { Component } from 'react'
import { loginUser } from "../api";
import "./index.css";
//============================================================================//


class Login extends Component {
  constructor() {
    super();
    this.state = {
      email: "",
      password: "",
      errMsg: ""
    }
  }

  onChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }

  onSubmit = () => {
    loginUser(this.state.email, this.state.password)
      .then(res => { res.json()
        .then(data => {
          this.props.receiveAccountInfo(data);
        })
      })
      .catch(err => {
        this.setState({ errMsg: JSON.stringify(err)})
      })
  };

  render() {
    return (
      <div style={{width:"400px", margin: "0 auto", textAlign: "center"}}>
        <br/>
        <h2>Volvo Employee Pool Car</h2>
        <h3>reservation system</h3>
        <br/>
        <label
          style={{width: "120px", textAlign:"left"}}
          htmlFor="email">Volvo Email:</label>
        <input
          style={{width: "250px"}}
          type="text" id="email" name="email" onChange={(e) => this.onChange(e)} required/>
        <br/>
        <br/>
        <label
          style={{width: "120px", textAlign:"left"}}
          htmlFor="password">Password:</label>
        <input
          style={{width: "250px"}}
          type="password" id="password" name="password" onChange={(e) => this.onChange(e)} required/>
        <br/>
        <button
          className="ctaButton"
          onClick={this.onSubmit}>Login</button>
        <div style={{marginTop: "50px"}}>
          {this.state.errMsg ? "Error occurred while logging in" : ""}
        </div>
      </div>
    )
  }
}

export default Login;
