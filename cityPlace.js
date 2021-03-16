"use strict";
(function() {
  const URL = "https://ptx.transportdata.tw/MOTC/v2/Tourism/ScenicSpot";
  const timer = 1000; // This constant is for the delay of requesting new data from the API.

  window.addEventListener("load", init);

  /**
   * This function is to initialize all the function inside.
   */
  function init() {
    const citySearchBtn = id("search-city-btn");
    citySearchBtn.addEventListener("click", makeCityRequest);
  }

  /**
   * This function is to make a request to the API to get the top 30 places.
   */
  function makeCityRequest() {
    let output = id("output");
    while (output.firstChild) {
      output.removeChild(output.firstChild);
    }

    let moreDataText = id("more-data");
    moreDataText.textContent = "往下滑 更多景點...";
    moreDataText.classList.add("hidden");

    window.addEventListener("scroll", scrollDown);

    let requestString = URL + "/" + id("select-city").value + "?$top=30";
    fetch(requestString)
      .then(checkStatus)
      .then((resp) => resp.json())
      .then(processData)
      .catch(handleError);
  }

  /**
   * Check the status of the response from the API.
   * @param {basic} response - the response from the API.
   * @return {error} returns the response if there is no error;
   *                 otherwise, shows the text of the error.
   */
  function checkStatus(response) {
    if (!response.ok) {
      throw Error("Error in request: " + response.statusText);
    }
    return response;
  }

  /**
   * This function is to add the response from the API to the web page.
   * @param {basic} response - the response from the API.
   */
  function processData(response) {
    let output = id("output");
    for (let i = 0; i < response.length; i++) {
      let name = response[i].Name;
      let description = response[i].Description;
      let place = document.createElement("section");
      let namePara = document.createElement("p");
      let desPara = document.createElement("p");

      namePara.textContent = name;
      desPara.textContent = description;
      if (desPara.textContent === "") {
        desPara.textContent = response[i].DescriptionDetail;
      }

      place.appendChild(namePara);
      place.appendChild(desPara);

      output.appendChild(place);
    }

    let showMoreText = id("more-data");
    showMoreText.classList.remove("hidden");
    showMoreText.addEventListener("click", showMore);
  }

  /**
   * This function requests more data from API using the url
   * with the count of the places that are on the web page.
   */
  function showMore() {
    let output = id("output");
    let numOfPlaces = output.childNodes.length;
    let requestString = URL + "/" + id("select-city").value + "?$top=30&$skip=" + numOfPlaces;
    fetch(requestString)
      .then(checkStatus)
      .then((resp) => resp.json())
      .then(showMoreData)
      .catch(handleError);
  }

  /**
   * This function is to process the reponse from API.
   * If the respsonse includes places, this function will add the response into the web page,
   * else, the bottom of the page will say there is no more places to load.
   * @param {basic} response - the response about the list of places from the API.
   */
  function showMoreData(response) {
    let output = id("output");
    if (response.length > 0) {
      for (let i = 0; i < response.length; i++) {
        let place = document.createElement("section");

        let namePara = document.createElement("p");
        namePara.textContent = response[i].Name;
        let desPara = document.createElement("p");
        desPara.textContent = response[i].Description;

        place.appendChild(namePara);
        place.appendChild(desPara);
        output.appendChild(place);
      }
    } else {
      window.removeEventListener("scroll", scrollDown);
      let showMoreText = id("more-data");
      showMoreText.textContent = "沒有更多景點了";
    }
  }

  /**
   * This function is to call the function makeCityRequest
   * when the user scrolls to the bottom of the page.
   */
  function scrollDown() {
    if ((window.innerHeight + window.pageYOffset) >= document.body.offsetHeight) {
      setTimeout(showMore, timer);
    }
  }

  /**
   * Handles the error from the API
   * @param {error} err -error of fetching the data from API
   */
  function handleError(err) {
    let input = id("input");
    let errorMS = document.createElement("p");
    errorMS.textContent = err.message;
    input.appendChild(errorMS);
  }

  /**
   * This function is to get the element in the DOM tree by its id.
   * @param {string} idName - element ID.
   * @returns {object} - DOM object associated with id.
   */
  function id(idName) {
    return document.getElementById(idName);
  }

})();
