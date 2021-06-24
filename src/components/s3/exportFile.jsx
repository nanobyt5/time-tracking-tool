import React, { Component } from "react";

class ExportFile extends Component {
  render() {
    return (
      <button type="button" onClick={this.props.handleOnExport.bind(this)}>
        Export
      </button>
    );
  }
}

export default ExportFile;
