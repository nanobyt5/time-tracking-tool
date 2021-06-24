import React, { Component } from "react";

class UploadFile extends Component {
  render() {
    return (
      <li>
        <input
          type="file"
          name="uploadFile"
          onChange={this.props.handleOnUploadChange.bind(this)}
        />
        <button type="button" onClick={this.props.handleOnUpload.bind(this)}>
          Upload
        </button>
      </li>
    );
  }
}

export default UploadFile;
