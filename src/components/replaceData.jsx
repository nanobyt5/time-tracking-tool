import React, { Component } from "react";

class ReplaceData extends Component {
  constructor() {
    super();

    this.replaceHero = this.replaceHero.bind(this);
    this.handleChange = this.handleChange.bind(this);

    this.state = {
      status: null,
      newData: "",
    };
  }

  // Main
  render() {
    return (
      <div style={this.center}>
        <form onSubmit={this.replaceHero}>
          <textarea
            rows="10"
            cols="30"
            value={this.state.newData}
            onChange={this.handleChange}
          ></textarea>
          <input
            type="submit"
            value="Replace Heroes"
            className="btn btn-secondary btn-sm m-4"
          />
        </form>
        <br />
        <span className={this.getBadgesClasses()}>{this.displayStatus()}</span>
      </div>
    );
  }

  // Functions
  replaceHero = (event) => {
    const encodeFormData = (data) => {
      return Object.keys(data)
        .map(
          (key) => encodeURIComponent(key) + "=" + encodeURIComponent(data[key])
        )
        .join("&");
    };

    const requestOptions = {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
      },
      body: encodeFormData({
        text: this.state.newData,
        command: "/replace",
      }),
    };

    fetch(
      // "http://127.0.0.1:3000/hello",
      "https://4cate66olg.execute-api.ap-southeast-1.amazonaws.com/default/time-tracking-server",
      requestOptions
    )
      .then((response) => {
        if (!response.ok) {
          return response.json().then((json) => {
            throw json;
          });
        }
        return response.json();
      })
      .then((data) => {
        this.setState({ status: JSON.stringify(data, null, 4) });
        console.log("Data Replaced: " + data);
      })
      .then((json) => console.log(json))
      .catch((err) => {
        this.setState({ status: err.message });
        console.log("Catch: ", err);
      });

    event.preventDefault();
  };

  handleChange(event) {
    this.setState({ newData: event.target.value });
  }

  displayStatus() {
    const { status } = this.state;
    return status === null ? "No status" : status;
  }

  // CSS
  center = {
    textAlign: "center",
    fontWeight: "bold",
  };

  // Bootstrap
  getBadgesClasses() {
    let classes = "badge bg-";
    if (this.state.status === null) {
      classes += "warning";
    } else if (this.state.status === "Failed to fetch") {
      classes += "danger";
    } else {
      classes += "primary";
    }
    return classes;
  }
}

export default ReplaceData;
