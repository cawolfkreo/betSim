import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import { check } from "meteor/check";

export const Categories = new Mongo.Collection("Categories");

if (Meteor.isServer) {
    // This code only runs on the server
    Meteor.publish('Categories', function CategoriesPublication() {
        return Categories.find();
/*
        if (!this.userId) {
            return this.ready();
          }
        
          return UserData.find({
            userId: this.userId
          }, {
            fields: UserData.publicFields
          });*/
    });
}

Meteor.methods({
  "Categories.getAll"(){
      /*
      Camilo Zambrano: I guess more or less all in your API has some security breaches. Here you don't need a check
      but atleast add see if the user is logged in before giving him all the data you have.
      */
    let res = Categories.find({}).fetch();
    console.log(res);
  }

});
