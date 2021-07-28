import React, { Component } from "react";

class ExportFile extends Component {
  render() {
    return (
      <button
        type="button"
        className="ant-btn fileButton"
        onClick={this.props.handleOnExport.bind(this)}
      >
        Export
      </button>
    );
  }
}

export default ExportFile;
