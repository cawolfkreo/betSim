/*
Camilo Zambrano: This is a small refactor. I'm changing the order of imports so it's more readable 
and easier to mantain
*/
import React, { Component } from 'react';

import AddCoinsModal from './AddCoinsModal.jsx';
import MainPage from './MainPage.jsx';

import { withHistory } from 'react-router-dom';
import { withTracker } from "meteor/react-meteor-data";
import { UserData } from "../../api/UserData";

import "../css/App.css";


class App extends Component {
    constructor(props) {
        super(props);

        this.state = ({
            userData: {}
        });

        this.state = this.getMeteorData();
        this.logout = this.logout.bind(this);
        this.addCoins = this.addCoins.bind(this);
    }

    getMeteorData() {
        return { isAuthenticated: Meteor.userId() !== null };
    }

    componentWillMount() {
        if (!this.state.isAuthenticated) {
            this.props.history.push('/login');
        }
    }

    componentDidUpdate(prevProps, prevState) {
        if (!this.state.isAuthenticated) {
            this.props.history.push('/login');
        }
    }

    logout(e) {
        e.preventDefault();
        Meteor.logout((err) => {
            if (err) {
                console.log(err.reason);
            } else {
                this.props.history.push('/login');
            }
        });
    }

    addCoins(numCoins){
        console.log("Adding coins from App | # coins: " + numCoins);
        
        Meteor.call("UserData.addCoins", this.props.user._id, numCoins);
    }

    render() {

        return (
            <div id="App">
                {this.props.user && this.props.userData ? <MainPage logout={this.logout} user={this.props.user} userData={this.props.userData[0]} /> : "Loading user settings..."}
                <AddCoinsModal addCoins={(numC) => this.addCoins(numC)}/>
            </div>
        );
    }
}

App.propTypes = {

};

export default withTracker(
    () => {
        Meteor.subscribe('users');
        Meteor.subscribe('UserData');

        const currentUser = Meteor.user();
        let currentUserData = null;

        if (currentUser != null) {
            //console.log("Searching for data of " + currentUser._id);
            currentUserData = UserData.find(
                { userId: currentUser._id }
            ).fetch();

            //console.log("App | WithTracker | currentUserData: ");
            //console.log(currentUserData);
        }

        return {
            user: currentUser,
            userData: currentUserData
        }
    }
)(App);
