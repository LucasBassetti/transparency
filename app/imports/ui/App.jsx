import React, { Component } from 'react';

import Credor from './credor/Credor.jsx';

// App component - represents the whole app
export default App = React.createClass({

    getInitialState() {
        return {
            credores: null
        }
    },

    componentDidMount() {
        this.getCredores();
    },

    getCredores() {
        var self = this;

        this.setState({ credores: null }, () => {
            Meteor.call('getCredorNumEmpenhos', function(error, result) {
                self.setState({ credores: result });
            });
        });
    },

    renderCredores() {

        if (!this.state || !this.state.credores) {
            return <li>Loading...</li>;
        }
        else {
            return this.state.credores.map((credor) => (
                <Credor key={credor._id} credor={credor} />
            ));
        }
    },

    render() {
        return (
            <div className="container">
                <header>
                    <h2>Empenhos por Credor</h2>
                </header>

                <ul>
                    {this.renderCredores()}
                </ul>
            </div>
        );
    }
});
