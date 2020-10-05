//create a variable to hold db connection
let db;
//establish a connection to IndexedDB database called 'budget' and set it to version 1
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = ({ target }) => {
    db = target.result;
//check if app in online
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    console.log("Ruh Roh!" + event.target.errorCode);
};