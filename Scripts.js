//Budget Controller
var budgetController = (function () {

    var Expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function (totalInc) {

        if (totalInc > 0) {
            this.percentage = Math.round((this.value / totalInc) * 100);
        } else {
            this.percentage = -1;
        }

    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    var data = {
        allItems: {
            inc: [],
            exp: []
        },

        totals: {
            exp: 0,
            inc: 0
        },

        budget: 0,
        percentage: -1
    };

    return {
        addItem: function (type, des, val) {

            var newItem, ID;

            //Creating new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            } else {
                ID = 0;
            }

            //Creating new item according to 'inc' or 'exp'
            if (type === 'exp') {
                newItem = new Expense(ID, des, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, des, val);
            }

            //Pushing the item into our data structure
            data.allItems[type].push(newItem);

            //Returning the new element
            return newItem;

        },


        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (current) {
                return current.id;
            });
            index = ids.indexOf(id);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },


        calculateBudget: function () {

            //Calculate the total income and expense
            calculateTotal('inc');
            calculateTotal('exp');

            //Calculate the budget: income - expense
            data.budget = data.totals.inc - data.totals.exp;

            //Calculate the income percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }

        },


        calculatePercentage: function () {

            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
            });
        },


        getPercentages: function () {
            var allPercentages = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPercentages;
        },


        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },


        testing: function () {
            console.log(data);
        }
    };

})();


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
//----------------------------------------------------------------------------------------------------------------------------//
//User Interface Controller
var UIController = (function () {

    var DOM_Strings = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLable: '.budget__value',
        incomeLable: '.budget__income--value',
        expensesLable: '.budget__expenses--value',
        percentageLable: '.budget__expenses--percentage',
        conatiner: '.container',
        expensesPerLable: '.item__percentage',
        dateLable: '.budget__title--month'
    };

    var formatNumber = function (num, type) {

        var numSplit, int, dec;
        num = Math.abs(num);

        // 1. Two decimal places after the number
        num = num.toFixed(2);

        // 2. Comma separator after every thousands place
        numSplit = num.split('.');

        int = numSplit[0];
        if (int.length > 3) {
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];

        // 3. + for income and - for expenses
        //sign = type === 'exp' ? '-' : '+';
        //type === 'exp' ? sign = '-' : sign = '+';

        // 2513.2548 --> + 2,513.25
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    };

    var nodeListForEach = function (list, callback) {
        for (var i = 0; i < list.length; i++) {
            callback(list[i], i);
        }
    };


    return {
        getInput: function () {
            return {
                type: document.querySelector(DOM_Strings.inputType).value,
                description: document.querySelector(DOM_Strings.inputDescription).value,
                value: parseFloat(document.querySelector(DOM_Strings.inputValue).value)
            };
        },


        addListItem: function (obj, type) {

            var html, newHtml, element;

            //Creating HTML string with text placeholders
            if (type === 'inc') {
                element = DOM_Strings.incomeContainer;

                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button </div> </div> </div>';
            } else if (type === 'exp') {
                element = DOM_Strings.expenseContainer;

                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            }

            //Replacing the strings with input data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert the HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },


        deleteListItem: function (selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },


        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOM_Strings.inputDescription + ', ' + DOM_Strings.inputValue);

            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });

            fieldsArr[0].focus();

        },


        displayBudget: function (obj) {

            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOM_Strings.budgetLable).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOM_Strings.incomeLable).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOM_Strings.expensesLable).textContent = formatNumber(obj.totalExp, 'exp');
            if (obj.percentage > 0) {
                document.querySelector(DOM_Strings.percentageLable).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOM_Strings.percentageLable).textContent = '--';
            }

        },


        displayPercentage: function (percentages) {

            var field = document.querySelectorAll(DOM_Strings.expensesPerLable);

            nodeListForEach(field, function (current, index) {

                if (percentages[index] > 0) {
                    current.textContent = percentages[index] + '%';
                } else {
                    current.textContent = '--';
                }

            });

        },


        displayMonth: function () {
            var now, year, month, months;

            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = months[now.getMonth()];
            year = now.getFullYear();

            document.querySelector(DOM_Strings.dateLable).textContent = month + ' ' + year;
        },


        changeType: function () {

            var fields = document.querySelectorAll(
                DOM_Strings.inputType + ', ' +
                DOM_Strings.inputDescription + ', ' +
                DOM_Strings.inputValue);

            nodeListForEach(fields, function (cur) {
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOM_Strings.inputBtn).classList.toggle('red');

        },


        getDOM_Strings: function () {
            return DOM_Strings;
        }

    };

})();


//:::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::://
//----------------------------------------------------------------------------------------------------------------------------//
//Global App Controller
var controller = (function (budgetCtrl, UICtrl) {

    var setupEventListeners = function () {

        var DOM = UICtrl.getDOM_Strings();


        //Event if 'Button' was clicked
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);


        //Event if 'Enter' key is pressed
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });

        document.querySelector(DOM.conatiner).addEventListener('click', ctrlDeleteItem);

        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changeType);
    };


    var updateBudget = function () {

        // 1. Calculate the budget
        budgetCtrl.calculateBudget();

        // 2. Return the budget
        var budget = budgetCtrl.getBudget();

        // 3. Update the budget on UI
        UICtrl.displayBudget(budget);
        //console.log(budget);

    };


    var updatePercentage = function () {

        // 1. Calculate the percentage
        budgetCtrl.calculatePercentage();

        // 2. Read percentage from the budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update the percentage in UI
        UICtrl.displayPercentage(percentages);

    };


    var ctrlAddItem = function () {

        var input, newItem;

        // 1. Get the input data
        input = UICtrl.getInput();
        //console.log(input);

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            // 2. Add the items on the budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);

            // 3. Add the items on the UI
            UICtrl.addListItem(newItem, input.type);

            // 4. Clear the fields
            UICtrl.clearFields();

            // 5. Calculate and update budget
            updateBudget();

            // 6. Calculate and update the percentage
            updatePercentage();

        }
    };


    var ctrlDeleteItem = function (event) {
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;

        if (itemID) {
            //Since id is inc-0 or 1 || exp-0 or 1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            // 1. Delete the item from data structure
            budgetCtrl.deleteItem(type, ID);

            // 2. Delete the item from UI
            UICtrl.deleteListItem(itemID);

            // 3. Update and show the new budget
            updateBudget();

            // 4. Calculate and update the percentage
            updatePercentage();
        }

    };


    return {
        inti: function () {
            console.log('Application has started!!');
            UICtrl.displayMonth();
            UICtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setupEventListeners();
        }
    };

})(budgetController, UIController);
controller.inti();
