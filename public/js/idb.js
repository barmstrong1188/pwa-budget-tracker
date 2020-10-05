const indexedDB =
  window.indexedDB ||
  window.mozIndexedDB ||
  window.webkitIndexedDB ||
  window.msIndexedDB ||
  window.shimIndexedDB;
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
//check if app is online
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    console.log("Ruh Roh!" + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");

    store.add(record);
}

function checkDatabase() {
    //open transaction on db
    const transaction = db.transaction(["pending"], "readwrite");
    //access your object store
    const store = transaction.objectStore("pending");
    //get all records from store and set to a variable
    const getAll = store.getAll();

//upon a successfull .getAll() execution, run this function
getAll.onsuccess = function() {
    // if there was data in indexedDb's store, let's send it to the api server
    if (getAll.result.length > 0) {
        fetch("api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        })
        .then(response => {
            return response.json();
        })
        .then(() => {
            //delete records if successful
            const transaction = db.transaction(["pending"], "readwrite");
            const store = transaction.objectStore("pending");
            store.clear();
        });
     }
  };
}
//listen for app coming back online
window.addEventListener("online", checkDatabase);