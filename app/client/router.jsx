import React from 'react';
import { FlowRouter } from 'meteor/kadira:flow-router';
import { mount } from 'react-mounter';

// import { Meteor } from 'meteor/meteor';
// import { render } from 'react-dom';

import App from '../imports/ui/App.jsx';
import CredorContainer from '../imports/ui/CredorContainer.jsx';

FlowRouter.route('/', {
    name: 'index',
    action() {
        mount(App, {
            main: <App/>,
        });
    }
});

FlowRouter.route('/credor/:_id', {
    name: 'credor',
    action() {
        mount(CredorContainer, {
            main: <CredorContainer/>,
        });
    }
});

FlowRouter.notFound = {
    // Subscriptions registered here don't have Fast Render support.
    subscriptions: function() {

    },
    action: function() {
        FlowRouter.go('/');
    }
};
