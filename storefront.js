// required npm's fs and ctable are there for future attempts to make the app more dynamic
var mysql = require('mysql');
var inquirer = require('inquirer');
var fs = require('fs');
const cTable = require('console.table');

// server and database info
var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "root",
    database: "bamazon_db"
});

// connection to server
connection.connect(function(err) {
    if (err) throw err;
    console.log("connected as id " + connection.threadId);
    // runs the displayInventory Funtion
    displayInventory();
});

// the displayInventory funtion
function displayInventory (){
    
    // connects to the dataabase and then creates an array from the database
    connection.query("SELECT * FROM products", function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            
            // displays to the user the list of products for sale in a more human readable fashion
            console.log(`Item Number: ${res[i].item_id} || Product: ${res[i].product_name} || 
              Department: ${res[i].department_name} || Price: ${res[i].price}  || Stock Quantity: ${res[i].stock_quantity}`);
        }
        // runs the productSearchFunk function and passes res as an argument
        productSearchFunk(res);
    });

   
}
// the productSearchFunk function
function productSearchFunk(resArg) {
    
    // prompts the user for input on which item they want to order based on the id #
    inquirer
      .prompt({
    
        name: "productSearch",
        type: "input",
        message: "Which product whould you like to order?, Must pick an item by its Id number",
        
        // validates that the user input a #
        validate: function(value) {
            if (isNaN(value) === false) {
            return true;
            }
            return false;
        }
      })
      .then(function(answer) {
        
        // if the number that the user input exists within the size of the database (not the array) then it runs the quntityCheckFunk function
        // if it fails the if statement it reruns the displayInventory funtion so the user can see the inventory list and is again prompted for an item #
        if(answer.productSearch <= resArg.length && answer.productSearch > 0){
        
            //  passes resArg (the array) and answer.productSearch (the users item # input) as arguments for quantityCheckFunk
            quantityCheckFunk(resArg, answer.productSearch);
        } else{
            displayInventory();
        }
      });
  }

// quanittyCheckFunk 
  function quantityCheckFunk(resArg, userSelection){
   
    // subtracts one from the users item # input so that the users input matches the corresponding place in the array
    // eg if the user selects 3 as an item number its array index is 2
    var userSelectToArrayIndex = userSelection - 1;
    
    // prompts the user to input the quantity of the item they want, it also validates that the input is a number
      inquirer
        .prompt({
            name: "quantityChecker",
            type: "input",
            message: `How many ${resArg[userSelectToArrayIndex].product_name}'s Would you like?`,
            validate: function(value) {
                if (isNaN(value) === false) {
                return true;
                }
                return false;
            }

        })
        .then(function(answer) {

            // if the users desired amount is less than or equal to inventory it runs customerInvoice and updateProduct funtion
            // passes answer.quantityChecker and resArg[userSelectToArrayIndex] as arguments for both functions
            if(answer.quantityChecker <= resArg[userSelectToArrayIndex].stock_quantity){
                customerInvoice(answer.quantityChecker, resArg[userSelectToArrayIndex]);
                updateProduct(answer.quantityChecker, resArg[userSelectToArrayIndex]);
               
            // if the users input is greater than stock_quantity of the item it informs the user and then reruns quantityCheckFunk (recursion)
            } else{
                console.log("So sorry we dont have enough in stock to fulfill your order!");
                quantityCheckFunk(resArg, userSelection);
            }            
        });
  }

//   updateProduct function
  function updateProduct(userQuantity, resArg) {
   
    // sets up a mysql query and lets both the stock_quantity and item_id be dynamic so the user's input dictate where and how much is changed
    var query = connection.query(
      "UPDATE products SET ? WHERE ?",
      [
        {
            // the stock_quantity is updated by subtractiong the users desired amount from inventory
            stock_quantity: resArg.stock_quantity - userQuantity
        },
        {
            // because the correct array item is passed into the function, the item_id just needs to be selected so the correct item in the database is updated
            item_id: resArg.item_id
        }
      ],
      function(err, res) {
       if (err) throw (err)
    //    console logs the results
    //    console.log(res);

    // is supposed to give the updated quantity back but its is giving back the inventory ammount b4 the update, maybe where the console log is placed, push it down the function
    // also try another sql query
       console.log(`There are now ${resArg.stock_quantity} ${resArg.product_name}('s) left`)
      }
    );
     // logs the actual query being run
        // console.log(query.sql);
  }

//   customerInvoice funtion
function customerInvoice(userQuantity, resArg){
   
    // query to the products table, selects price where the item_id aligns with the users selection
    var query = connection.query(
        "SELECT price FROM products WHERE ?",    
        [
            {
                item_id: resArg.item_id
            }
        ],
        // takes the price and multiplies it by the users desired quantity, then prints in the console what and how much and at what price the user wanted
        // then shows the user their total and finally thanks the user for using the app
        function(err, res){
            if (err) throw (err)
            var total = res[0].price * userQuantity;
            console.log(`You have Selected ${userQuantity} ${resArg.product_name}('s) at a price of ${res[0].price} each`)
            console.log(`For a total of ${total}`)
            console.log(`Thank you for using Bamazon for your shopping needs`)
        }        
    );
    // logs the query being run
    // console.log(query.sql);
}