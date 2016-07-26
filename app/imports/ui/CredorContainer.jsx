import React, { Component } from 'react';

import CredorDetails from './credor/CredorDetails.jsx';

// App component - represents the whole app
export default CredorContainer = React.createClass({

    getInitialState() {
        return {
            detalhesCredor: null
        }
    },

    componentDidMount() {
        this.getDetalhesCredor();
    },

    getDetalhesCredor() {
        var self = this;

        this.setState({ detalhesCredor: null }, () => {
            Meteor.call('getDetalhesCredor', FlowRouter.getParam("_id"), function(error, result) {
                self.setState({ detalhesCredor: result });
            });
        });
    },

    renderCredores() {

        if (!this.state || !this.state.detalhesCredor) {
            return <li>Loading...</li>;
        }
        else {
            return <CredorDetails key={this.state.detalhesCredor._id} credor={this.state.detalhesCredor} />;
        }
    },

    render() {
        return (
            <div className="container">
                <header>
                    <a href="/" className="back">&#10094;</a>
                    <h2>Detalhes do Credor</h2>
                </header>

                {this.renderCredores()}                
            </div>
        );
    }
});
