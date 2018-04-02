/*
Camilo Zambrano: I'm making this more organized again.
The idea is to have it in this order:

1. react imports
2. your react component imports
    2.1 first the ones that doesn't need {}
    2.2 the rest
3. other imports you have
*/
import React, { Component } from 'react';

import BasicNav from "./BasicNav.jsx";
import CategoryPage from "./CategoryPage.jsx";
import EventPage from "./EventPage.jsx";
import MyBets from "./MyBets.jsx";

import PropTypes from 'prop-types';

import { withHistory, Link } from 'react-router-dom';
import { withTracker } from "meteor/react-meteor-data";

import { Bets } from "../../api/Bets";
import { Categories } from "../../api/Categories";
import { Events } from "../../api/Events";
import { UserData } from "../../api/UserData";

import "../css/MainPage.css";

class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            state: "",
            username: '',
            actEventPage: "",
            betsToPay: [],
            lastEndedEvent: {},
            lastEventInfo: {},
            lasEventInfoId: null
        };

        this.AddBet = this.AddBet.bind(this);
        this.startEvent = this.startEvent.bind(this);
        this.endEvent = this.endEvent.bind(this);
        this.generateEventPage = this.generateEventPage.bind(this);
        this.loadCategoryPages = this.loadCategoryPages.bind(this);
    }

    startEvent(eId) {
        //console.log("Starting event | id: " + eId)
        let mUserType = this.props.userData.type;

        Meteor.call("Events.startEvent", eId,
            () => {
                this.setState({
                    actEventPage: <EventPage betsInfo={Bets.find({ eventId: eId }).fetch()} eventInfo={Events.find({ _id: eId }).fetch()} userType={mUserType} startEvent={(eID) => this.startEvent(eId)} endEvent={(eId) => this.endEvent(eId)} />
                });
            });
    }

    endEvent(eId) {
        //console.log("Ending event | id: " + eId);
        let mUserType = this.props.userData.type;

        Meteor.call("Events.endEvent", eId, Bets.find({ eventId: eId }).fetch(),
            () => {
                this.setState({
                    actEventPage: <EventPage betsInfo={Bets.find({ eventId: eId }).fetch()} eventInfo={Events.find({ _id: eId }).fetch()} userType={mUserType} startEvent={(eID) => this.startEvent(eId)} endEvent={(eId) => this.endEvent(eId)} />,
                    betsToPay: Bets.find({ eventId: eId }).fetch(),
                    lastEndedEvent: Events.find({ _id: eId }).fetch()
                }, () => {
                    this.payWinners(eId);
                })
            });

    }

    payWinners(eId) {
        //console.log("PayWinners");
        //console.log(this.state.betsToPay);
        let eInfo = this.state.lastEndedEvent;
        eInfo = eInfo[0];

        //console.log("Last ended even: ");     
        //console.log(eInfo);

        let winner = "NA";

        if (eInfo.Team1R > eInfo.Team2R) {
            winner = 1;
        } else if (eInfo.Team1R < eInfo.Team2R) {
            winner = 2;
        } else {
            winner = 0;
        }

        let bets = this.state.betsToPay;

        bets.forEach((e) => {
            let e1 = e.E1;
            let e2 = e.E2;
            let eT = e.ET;
            //let currentUserData = UserData.find({ userId: e.userId }).fetch();

            //console.log(currentUserData);

            //console.log("Earnings: " + e1 + "|" + eT + "|" + e2);
            //console.log("Winner: " + winner);
 
            Meteor.call("Bets.closeBet", e._id, e1, e2, eT, winner);
            
            Meteor.call("UserData.removeBetCoins", e.userId);
 
            //let total = parseFloat(currentUserData.coins);
            let earning = 0;
            if(e1 > 0 && winner == 1 ){
                earning = e1;
            }else if(e2 > 0 && winner == 2 ){
                earning = e2;
            }else if(eT > 0 && winner == 0 ){
                earning = eT;              
            }
 
            let newCoins = earning;
            console.log("Winner is: " + winner + "New coins: " + newCoins);
 
            Meteor.call("UserData.updateCoins", e.userId, earning);
        });
    }

    generateEventPage(eId) {
        //console.log("Main page | GenerateEventPage | EventId: " + eId);
        let mUserType = this.props.userData.type;

        /*this.setState({
            actEventPage: <EventPage betsInfo={Bets.find({ eventId: eId }).fetch()} eventInfo={Events.find({ _id: eId }).fetch()} userType={mUserType} startEvent={(eID) => this.startEvent(eId)} endEvent={(eId) => this.endEvent(eId)} />
        },
            () => {
                $('#EventModal').modal('show')
            }
        );*/

        this.setState({
            lasEventInfoId: eId
        },
            () => {
                $('#EventModal').modal('show')
            }
        );
    }

    AddBet(eventId, prob1, prob2, probT, bet1, bet2, betT, eR1, eR2, eRt) {
        //console.log("MainPage | AddBet: " + eventId + " - " + prob1 + " - " + prob2 + " - " + probT + " - " + bet1 + " - " + bet2 + " - " + betT + " - " + eR1 + " - " + eR2 + " - " + eRt);
        //alert("MainPage | Adding bet : " + bet1 + "|" + betT + "|" + bet2 + " | Earnings: " + eR);
        let totalCoins = parseFloat(bet1 + bet2 + betT);
        Meteor.call("Bets.addBet", eventId, prob1, prob2, probT, bet1, bet2, betT, eR1, eR2, eRt, (err, res) => {
            if (err) {
                alert(err);
            } else {
                alert("Bet created!");
                Meteor.call("UserData.removeNewBetCoins", totalCoins);
            }
        });
    }

    loadCategoriesList() {
        let actCategories = this.props.categories;
        let res = [];

        res.push(
            <li key="MyBetsOption" className="nav-item">
                <a href={"#MyBets"} className="nav-link" >
                    My Bets...
                </a>
            </li>
        );

        res.push(actCategories.map(e => (
            <li key={e.name} className="nav-item">
                <a href={"#" + e.name} className="nav-link" >
                    {e.name}
                </a>
            </li>
        )));

        return res;
    }

    loadCategoryPages() {
        let actCategories = this.props.categories;
        let res = [];

        //console.log(this.props.userData);        
        //console.log(this.props.userBets);

        res.push(<MyBets key="MyBetsPage" myBets={this.props.userBets} AddBet={(eI, p1, p2, pT, b1, b2, bT, eR1, eR2, eRt) => this.AddBet(eI, p1, p2, pT, b1, b2, bT, eR1, eR2, eRt)} GenerateEventPage={(eId) => this.generateEventPage(eId)} />);

        res.push(actCategories.map(e => (
            <CategoryPage key={e.name + "Page"} categoryInfo={e} events={Events.find({ Category: e.name }).fetch()} userData={this.props.userData} AddBet={(eI, p1, p2, pT, b1, b2, bT, eR1, eR2, eRt) => this.AddBet(eI, p1, p2, pT, b1, b2, bT, eR1, eR2, eRt)} GenerateEventPage={(eId) => this.generateEventPage(eId)} />
        )));

        return res;
    }

    render() {
        let currentUser = this.props.user;
        let currentUserAvailable = (currentUser !== undefined);

        let currentUserData = this.props.userData;
        let userDataAvailable = (currentUserData !== undefined);

        let loggedIn = (currentUser && currentUserAvailable && currentUserData && userDataAvailable);

        let numCoins = 0;
        let inBetCoins = 0;

        if (loggedIn) {
            /*console.log("Render | loggedIn | AllDta: ");
            console.log(currentUser);
            console.log(currentUserData);*/

            numCoins = currentUserData.coins;
            inBetCoins = currentUserData.InBet;

            let actCategories = this.props.categories;

            if (actCategories != null && actCategories != undefined && actCategories.length > 0) {
                //console.log(actCategories);
            }
        }

        let uData = this.props.userData;
        let mUserType = uData ? uData.type: "USER" ;
        //console.log(uData);

        let eId = this.state.lasEventInfoId;
        let actEventElement = eId ? <EventPage betsInfo={Bets.find({ eventId: eId }).fetch()} eventInfo={Events.find({ _id: eId }).fetch()} userType={mUserType} startEvent={(eID) => this.startEvent(eId)} endEvent={(eId) => this.endEvent(eId)} />: "";

        return (
            <div id="MainPage">
                {loggedIn ? <BasicNav logout={this.props.logout} userName={currentUser.username} coins={numCoins} InBet={inBetCoins} /> : "Error"}

                <div className="container-fluid">
                    <div className="row">

                        <nav className="col-md-2 bg-light sidebar">
                            <div className="sidebar-sticky">
                                <ul className="nav flex-column">
                                    {this.loadCategoriesList()}
                                </ul>
                            </div>
                        </nav>

                        <main role="main" className="col-md-10 categoryPageContainer">
                            {this.loadCategoryPages()}
                            {actEventElement}
                        </main>
                    </div>
                </div>
            </div>
        );
    }
}

MainPage.propTypes = {
    user: PropTypes.object.isRequired,
    userData: PropTypes.object.isRequired
}

/*
Camilo Zambrano: I see your are wrapping yourreact components to acces the database information
you need. DO NOT DO THAT.

The idea of the withTrackers is to wrap the high order component (the "Root" of the tree) with the props needed
for the aplication and then he sends them to his childs and those to the childs that also need the information. 
If you do it this way you are exposing your application to conflicts on the props and also some other problems related
to Meteor and React fighting for what to send to the child or how to render it.
*/
export default withTracker(
    () => {
        Meteor.subscribe("Bets");
        Meteor.subscribe("Categories");
        Meteor.subscribe("Events");
        Meteor.subscribe("UserData");

        return {
            categories: Categories.find({}, { sort: { name: 1 } }).fetch(),
            events: Events.find({}).fetch(),
            userBets: Bets.find({
                userId: Meteor.userId()
            }, {
                    fields: Bets.publicFields,
                    sort: { eventId: 1 }
                }).fetch()
        }
    }
)(MainPage);
