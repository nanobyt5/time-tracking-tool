import React, { Component } from "react";

class DeleteFile extends Component {
  render() {
    return (
      <button
        type="button"
        className="ant-btn fileButton"
        onClick={this.props.handleOnDelete.bind(this)}
      >
        Delete
      </button>
    );
  }
}

export default DeleteFile;
