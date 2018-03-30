import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTracker } from "meteor/react-meteor-data";

import EventBetCard from "./EventBetCard.jsx";
import { Events } from "../../api/Events";
import "../css/MyBets.css";

class MyBets extends Component {

    constructor(props){
        super(props);

        this.AddBet = this.AddBet.bind(this);
        this.loadBetsList = this.loadBetsList.bind(this);
    }

    AddBet(eI, p1, p2, pT, b1, b2, bT, eR1, eR2, eRt){
        
        console.log(eI + " - " + p1 + " - " + p2 + " - " + pT + " - " + b1 + " - " + b2 + " - " + bT + " - " + eR1 + " - " + eR2 + " - " + eRt);
        
        this.props.AddBet(eI, p1, p2, pT, b1, b2, bT, eR1, eR2, eRt);
    }

    componentDidMount() {
        //console.log(this.props.myBets);
    }

    loadBetsList() {
        let actBets = this.props.myBets;
        //console.log(actBets);

        if (actBets) {

            if (actBets.length > 0) {
                let res = []

                //console.log(this.props.categoryInfo);

                /*res = actBets.map(e => (
                    //console.log("MyBets | loadBetsList | Bet: " + e),
                    //console.log(e),
                    <EventBetCard key={e.Name + "BetCard"} eventBetsInfo={e} eventInfo={Events.find({ _id: e.EventId }, { limit: 1 }).fetch()} AddBet={(b1, b2, bT, eR) => this.AddBet(b1, b2, bT, eR)} />
                ));*/

                res = []

                let sup = [];
                let lastEventId = actBets[0].eventId;
                sup.push(actBets[0]);

                let numEvents = 1;
                let i = 1;
                for (i = 1; i < actBets.length; i++) {
                    let e = actBets[i];

                    if (e.eventId == lastEventId) {
                        sup.push(e);
                    } else {
                        res.push(
                            <EventBetCard key={"BetCard#" + (numEvents)} eventBetsInfo={sup} eventInfo={Events.find({ _id: lastEventId }, { limit: 1 }).fetch()} AddBet={(eI, p1, p2, pT, b1, b2, bT, eR1, eR2, eRt) => this.AddBet(eI, p1, p2, pT, b1, b2, bT, eR1, eR2, eRt)} />
                        );

                        numEvents++;
                        sup = [];
                        lastEventId = e.eventId;
                    }
                }

                sup.push(actBets[i - 1]);
                res.push(
                    <EventBetCard key={"BetCard#" + (numEvents)} eventBetsInfo={sup} eventInfo={Events.find({ _id: lastEventId }, { limit: 1 }).fetch()} AddBet={(eI, p1, p2, pT, b1, b2, bT, eR1, eR2, eRt) => this.AddBet(eI, p1, p2, pT, b1, b2, bT, eR1, eR2, eRt)} />
                );

                //console.log(res);
                return res;
            }else{
                return (<h5>You don't have bets</h5>);
            }

        } else {
            return "Loading bets.."
        }
    }

    render() {
        return (
            <div id="MyBets" className="container myEvents">
                <h1>My Bets</h1>

                <hr className="my-4" />

                <div className="row">
                    {this.loadBetsList()}
                </div>
            </div>
        );
    }
}

MyBets.propTypes = {
    myBets: PropTypes.array.isRequired
}


export default withTracker(
    () => {
        Meteor.subscribe("Events");

        return {
            events: Events.find({}).fetch()
        }
    }
)(MyBets);