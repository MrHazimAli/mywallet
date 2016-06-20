BudgetList = new Mongo.Collection('budgets');

if(Meteor.isClient){

	Template.mainboard.helpers({
		'budget': function(){
			var currentUserId = Meteor.userId();
			//alert(currentUserId);
			return BudgetList.find({createdBy: currentUserId}).fetch();
			//Session.set('currentUser', currentUserId);
		},

		'tprice': function(){
			var sum=0;
			var cursor=BudgetList.find().fetch();
			for (var res in cursor){
				// console.log(cursor[res].price);
				var temp = parseFloat(cursor[res].price);
				sum = sum + temp;
			}
			return sum;
		}

	});

	Template.body.events({
		'submit .new-item'(event){

			event.preventDefault();
			var itemName = event.target.item.value;
			var itemPrice = parseFloat(event.target.price.value);
			//var currentUserId = Session.get('currentUser');

			var day = new Date();
			var currentDate = moment(day).format("Do MMM YY");
			Meteor.call('createBudget',itemName,itemPrice,currentDate);
			event.target.item.value="";
			event.target.price.value="";
		},

		'click .delete'(){
			var budgetId=this._id;
			//var currentUserId=Session.get('currentUser');
			//alert(currentUserId);
			Meteor.call('removeBudget',budgetId);
		},

		'click .edit'(){
			//var currentUserId=Session.get('currentUser');
			var idbaru = this._id;

			swal({
			  title: "Edit Expenses!",
			  text: 'Enter Item:',
			  type: 'input',
			  showCancelButton: true,
			  closeOnConfirm: false,
			  animation: "slide-from-top"
			}, function(inputValue){

			  if (inputValue === false) return false;

			  if (inputValue === "") {     swal.showInputError("You need to write Item Name!");     return false   }

			  var newitem = inputValue;

				swal({
				  title: "Edit Expenses!",
				  text: 'Enter price:',
				  type: 'input',
				  showCancelButton: true,
				  closeOnConfirm: true,
				  animation: "slide-from-top"
				}, function(inputValue){

					if (inputValue === false) return false;

					if (inputValue === "") {     swal.showInputError("You need to write Item Name!");     return false   }

					Meteor.call('editBudget',idbaru,inputValue,newitem);

				  //console.log("You wrote", inputValue, newitem, this._id, this.item, idbaru);
				});
			});
		}


	});

	Meteor.subscribe('theBudgets');
}

if(Meteor.isServer){
	Meteor.publish('theBudgets', function(){
		var currentUserId = this.userId;
		return BudgetList.find({ createdBy: currentUserId });
	});
}

Meteor.methods({
	'createBudget': function(itemName,itemPrice,currentDate){
		check(itemName, String);
		check(itemPrice, Number);
		check(moment(currentDate).isValid(), Boolean);
		var realUserId=Meteor.userId();

		BudgetList.insert({
				item : itemName,
				price : itemPrice,
				date : currentDate,
				createdBy: realUserId
		});
	},

	'removeBudget': function(budgetId){
		
		var realUserId=Meteor.userId();
		if(realUserId){
			BudgetList.remove({ _id: budgetId, createdBy: realUserId });
		}
	},

	'editBudget': function(idbaru,inputValue,newitem){
		var realUserId=Meteor.userId();
		if(realUserId){
			BudgetList.update({ _id: idbaru, createdBy: realUserId }, 
								{ $set: { price: inputValue ,item: newitem} ,
			});
		}
	}

});