const fs = require('fs');


exports.writeTofile = (filepath, content) => {
    fs.writeFile(filepath, JSON.stringify(content), (err) => {
        if (err) {
            return err;
        }
    });
}

exports.findBook = (arr, obj) =>{
    return new Promise((resolve, reject) => {
        resolve(arr.find((arrObj) => arrObj.id === obj));
    });
}

exports.fillter = (arr, obj) =>{
    return new Promise((resolve, reject) => {
        resolve(arr.filter((arrObj) => arrObj.id != obj));
    });
}


exports.dueDate = () => {
    Date.prototype.addDays = function (days) {
        var date = new Date(this.valueOf());
        date.setDate(date.getDate() + days);
        return date;
    };
    var date = new Date();

    var nextWeek = date.addDays(7).toLocaleString();
    return nextWeek;
}

exports.AuthenticateUser = (arr, obj) => {
    return new Promise((resolve, reject) => {
        resolve(
            arr.find((arrObj) => {
                return (
                    arrObj.email === obj.email &&
                    arrObj.password === obj.password
                );
            })
        );
    });
}

exports.findUser = (arr, obj) => {
    return new Promise((resolve, reject) => {
        resolve(arr.find((arrObj) => arrObj.id === obj));
    });
}

exports.validateUser = (arr, obj) => {
  return new Promise((resolve, reject) => {
    resolve(arr.find((arrObj) => arrObj.email === obj));
  });
}

//