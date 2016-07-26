import React, { Component, PropTypes } from 'react';

// Task component - represents a single todo item
export default class Credor extends Component {
  render() {
    return (
      <li>
          <a href={ "credor/" + this.props.credor._id }>
              <span className="name">{this.props.credor.nome}</span>
              <span className="badge">{this.props.credor.nEmpenhos}</span>
          </a>
      </li>
    );
  }
}

Credor.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  credor: PropTypes.object.isRequired,
};
