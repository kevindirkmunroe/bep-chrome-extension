const funcheapMap = {
  title: "#input_18_1",
  email: "#input_18_43",
  location_name: "#input_18_8",
  description: "#input_18_2",
  website: "#input_18_30",
  name: "#input_18_44",
  organization: "#input_18_42",
  phone: "#input_18_69"
}

const visitOaklandMap = {
  name: "#postname",
  email: "#postemail",
  title: "#title",
  location_name: "#location",
  description: "#description",
  start_datetime: "#startdate",
  phone: "#postphone",
  organization: "#contact",
  address: "#addr1",
  price: "#admission",
  website: "#linkurl"
}

function formatDateForFuncheap(datetime) {
  const d = new Date(datetime);

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${mm}/${dd}/${yyyy}`;
}

const parseTime = (isoString) => {
  if (!isoString) return { hour: "", minute: "", ampm: "AM" };

  const date = new Date(isoString);
  let hours = date.getHours(); // 0–23
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  // convert to 12-hour format
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return {
    hour: String(hours),                 // "8"
    minute: String(minutes).padStart(2, "0"), // "30"
    ampm                                 // "PM"
  };
};

// Helper for setting value in form in case straightup element.value = "XYZ" doesn't work
const setSelectValue = (el, value) => {
  el.value = value;

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
};

//
// Helpers for radio buttons and checkboxes
//
function clickAndHighlight(selector){
  const el = document.querySelector(selector);
  el.click();
  el.style.border = "5px solid #F89D86";
  el.style.borderRadius = "5px";
  console.log("Clicked:", selector);
}

//
// Helpers for Wordpress text areas: MCE
//
function setTinyMCE(selector, value) {
  const iframe = document.querySelector(selector);

  if (!iframe) {
    console.log("TinyMCE iframe not found");
    return;
  }
  const doc = iframe.contentDocument || iframe.contentWindow.document;
  if (!doc) {
    console.log("No iframe document");
    return;
  }
  const body = doc.querySelector("#tinymce");

  if (!body) {
    console.log("TinyMCE body not found");
    return;
  }
  body.innerHTML = `<p>${value}</p>`;
  console.log("TinyMCE content set");
}

function waitAndSetTinyMCE(selector, value) {
  const interval = setInterval(() => {
    const iframe = document.querySelector(selector);

    if (iframe && iframe.contentDocument) {
      clearInterval(interval);
      setTinyMCE(selector, value);
    }
  }, 500);
}

// FunCheap is using Gravity Forms (WordPress)
// → forms load after page load
// Use waitAndSet to wait for element to load
function waitAndSet(selector, value) {
  const interval = setInterval(() => {
    const el = document.querySelector(selector);

    if (el) {
      clearInterval(interval);

      el.value = value;
      el.dispatchEvent(new Event("input", { bubbles: true }));
      el.dispatchEvent(new Event("change", { bubbles: true }));

      el.style.border = "5px solid #F89D86";
      el.style.borderRadius = "5px";
      console.log("Filled:", selector);
    }
  }, 1000);
}

function setupSender() {
  window.addEventListener("message", (event) => {
    if (event.data.type === "SET_EVENT") {
      chrome.storage.local.set({
        event_data: event.data.payload
      });
      console.log("Stored event data");
    }
  });
}

//
// Helper that pulls key/values from a map and sets fields
// key=form element id, value=form content
//
function autofillFromMap(event, map) {
  Object.entries(map).forEach(([key, selector]) => {
    const value = event[key];

    if (!value) return;

    waitAndSet(selector, value);
  });
}

function autofillFuncheap(event) {
  console.log("Autofilling FuncheapSF", event);

  autofillFromMap(event, funcheapMap);
  waitAndSetTinyMCE("#input_18_2_ifr", event.description);
  waitAndSet("#input_18_43_2", event.email);

  if(event.start_datetime){
    // start date...
    const formattedDate = formatDateForFuncheap(event.start_datetime);
    waitAndSet("#input_18_12", formattedDate);
    // start time...
    const  {hour, minute, ampm} =  parseTime(event.start_datetime);
    waitAndSet("#input_18_5_1", Number(hour));
    waitAndSet("#input_18_5_2", Number(minute));
    waitAndSet("#input_18_5_3", ampm?.toLowerCase());

    // checkboxes and radio buttons. Pick most common options...
    clickAndHighlight('#label_18_128_0'); // Frequency: Single Day Event
    clickAndHighlight('#label_18_106_1'); // Online or In-Person: In Person
    clickAndHighlight('#label_18_107_0'); // Free or Paid: Free
  }
}

function autofillVisitOakland(event) {
  console.log("Autofilling VisitOakland", event);

  autofillFromMap(event, visitOaklandMap);

  const  {hour, minute, ampm} =  parseTime(event.start_datetime);
  waitAndSet("#starttime", `${hour}:${minute} ${ampm}`);
  waitAndSet("#email", event.email);
  waitAndSet("#phone", event.phone);

  setSelectValue(document.querySelector("#state"), "CA");
}

function runAutofill() {
  chrome.storage.local.get("event_data", (data) => {
    const event = data.event_data;

    console.log("EVENT DATA:", event);

    if (!event) return;

    if (window.location.hostname.includes("funcheap")) {
      autofillFuncheap(event);
    }else if(window.location.hostname.includes("visitoakland")){
      autofillVisitOakland(event);
    }
  });
}

// 1. Read from localStorage
const hostname = window.location.hostname;

if (hostname.includes("localhost")) {
  setupSender();
} else {
  runAutofill();
}
