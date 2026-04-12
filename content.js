const funcheapMap = {
  title: "#input_18_1",
  location_name: "#input_18_8",
  description: "#input_18_2"
}

const visitOaklandMap = {
  name: "#postname",
  email: "#postemail",
  title: "#title",
  location_name: "#location",
  description: "#description",
  start_datetime: "#startdate"
}

function formatDateForFuncheap(datetime) {
  const d = new Date(datetime);

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${mm}/${dd}/${yyyy}`;
}

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

// TinyMCE is WordPress fancy version of <textArea>
function waitAndSetTinyMCE(selector, value) {
  const interval = setInterval(() => {
    const iframe = document.querySelector(selector);

    if (iframe && iframe.contentDocument) {
      clearInterval(interval);
      setTinyMCE(selector, value);
    }
  }, 500);
}

function setInput(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return;

  el.value = value;

  // important for React-based forms
  el.dispatchEvent(new Event("input", { bubbles: true }));
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

      el.style.border = "2px solid red"; // debug
      console.log("Filled:", selector);
    }
  }, 500);
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
  if(event.start_datetime){
    const formattedDate = formatDateForFuncheap(event.start_datetime);
    waitAndSet("#input_18_12", formattedDate);
  }
}

function autofillVisitOakland(event) {
  console.log("Autofilling VisitOakland", event);

  autofillFromMap(event, visitOaklandMap);
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
