import React, { Component, PropTypes } from 'react';

// Task component - represents a single todo item
export default class CredorDetails extends Component {
  render() {
    return (
      <ul>
          <li> {this.props.credor.nome} </li>
          <li>
              <span className="name">Número de Empenhos</span>
              <span className="badge">{this.props.credor.nEmpenhos}</span>
          </li>
          <li>
              <span className="name">Total Empenhado</span>
              <span className="badge">R$ {this.props.credor.valorEmpenhado}</span>
          </li>
          <li>
              <span className="name">Número de Pagamentos</span>
              <span className="badge">{this.props.credor.nPagamentos}</span>
          </li>
          <li>
              <span className="name">Total Pago</span>
              <span className="badge">R$ {this.props.credor.valorPago}</span>
          </li>
      </ul>
    );
  }
}

CredorDetails.propTypes = {
  // This component gets the task to display through a React prop.
  // We can use propTypes to indicate it is required
  credor: PropTypes.object.isRequired,
};
