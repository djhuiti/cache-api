import CACHE from "./cache.js";

//All the DOM functionality and control of the application happens in this file
//All the code dealing with the Cache is in the cache.js file.
const APP = {
  itemList: [],
  activeLI: "",
  init() {
    CACHE.init("filecache-pete0398-1");

    //page loaded -- add event listeners
    document.getElementById("itemForm").addEventListener("submit", APP.addItem);
    document.getElementById("btnItem").addEventListener("click", APP.addItem);
    document
      .getElementById("btnList")
      .addEventListener("click", APP.saveListAsFile);
    document
      .getElementById("file_list")
      .addEventListener("click", APP.handleFileContents);

    // display files from cache
    APP.displayFiles();
  },
  addItem(ev) {
    //add an item to the list
    ev.preventDefault();
    let item = document.getElementById("gItem").value;
    item = item.trim();
    if (!item) return;
    APP.itemList.push(item);
    APP.displayList();
  },
  displayList() {
    //populate the list of items
    let list = document.getElementById("item_list");
    if (APP.itemList.length === 0) {
      list.innerHTML = "No Items currently.";
    } else {
      list.innerHTML = APP.itemList
        .map((txt) => {
          return `<li>${txt}</li>`;
        })
        .join("");
    }
    document.getElementById("gItem").value = "";
  },
  saveListAsFile(ev) {
    ev.preventDefault();
    // if there are no items in the list, then don't run code
    if (APP.itemList.length === 0) return;
    //turn the data from the list into the contents for a json file
    let json = JSON.stringify(APP.itemList);
    //and then create a file with the json
    let file = new File([json], "list.json", { type: "application/json" });
    //and then create a response object to hold the file
    const response = new Response(file, {
      status: 200,
      statusText: "OK",
      headers: {
        "X-file": file.name,
      },
    });
    //and then save the response in the cache
    CACHE.put(response)
      //after response is saved in cache, clear out the current list and display the new file in the file list
      .then(() => {
        APP.itemList = [];
        APP.displayList();
        APP.displayFiles();
      })
      .catch(console.warn);
  },
  displayFiles() {
    let list = document.getElementById("file_list");
    // get list of all keys in the cache
    CACHE.keys()
      .then((keys) => {
        // if nothing is in the cache
        if (keys.length === 0) {
          list.innerHTML = "No Items currently.";
        } else {
          // something is in the cache, so list it as a <li>
          list.innerHTML = keys
            .map((txt) => {
              return `
              <li>
                <span>${txt.url}</span>
                <button data-ref="${txt.url}" class="delete">Delete File</button>
              </li>`;
            })
            .join("");
        }
      })
      .catch(console.warn);
  },
  handleFileContents(ev) {
    let code = document.querySelector("code");
    let h2 = document.querySelector("h2 span");

    // if a span is clicked
    if (ev.target.tagName === "SPAN") {
      //get the cache file equal to the span that was clicked
      CACHE.match(ev.target.textContent)
        .then((response) => {
          if (!response.ok) throw new Error(response.statusText);
          return response.text();
        })
        .then((obj) => {
          // if there is an active li, remove it and add it to the li that was just clicked
          if (document.querySelector("li.active")) {
            document.querySelector("li.active").classList.remove("active");
          }
          ev.target.closest("li").classList.add("active");
          // set the span in h2 to the name of the file
          h2.textContent = ev.target.textContent;
          // parse the string to remove square brackets and quotes
          code.textContent = JSON.parse(obj);
        })
        .catch(console.warn);
    }
    // if a button is clicked
    else if (ev.target.tagName === "BUTTON") {
      // get the text of the span next to the button, and delete that URL in the cache
      let spanText = ev.target.previousElementSibling.textContent;
      CACHE.delete(spanText)
        .then(() => {
          // after deletion, update the current files list
          APP.displayFiles();
          // if the button that was deleted was active in the "File Contents", then reset the "File Contents"
          if (spanText === h2.textContent) {
            h2.textContent = "";
            code.textContent = "Empty";
          }
        })
        .catch(console.warn);
    }
  },
};

document.addEventListener("DOMContentLoaded", APP.init);
