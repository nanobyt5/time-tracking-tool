import React, { Component } from "react";

class ReadData extends Component {
  constructor() {
    super();
    this.readHero = this.readHero.bind(this);
    this.state = {
      status: null,
    };
  }

  // Main
  render() {
    return (
      <div style={this.center}>
        <button
          onClick={this.readHero}
          className="btn btn-secondary btn-sm m-4"
        >
          Get Heroes
        </button>
        <span className={this.getBadgesClasses()}>{this.displayStatus()}</span>
      </div>
    );
  }

  // Functions
  readHero = () => {
    const requestOptions = {
      method: "GET",
    };

    fetch(
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
        console.log("Data Retrieved: " + data);
      })
      .then((json) => console.log(json))
      .catch((err) => {
        this.setState({ status: err.message });
        console.log("Catch: ", err);
      });
  };

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

export default ReadData;
