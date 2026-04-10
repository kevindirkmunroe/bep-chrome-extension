console.log("Autofill script loaded");

function setInput(selector, value) {
  const el = document.querySelector(selector);
  if (!el) return;

  el.value = value;

  // important for React-based forms
  el.dispatchEvent(new Event("input", { bubbles: true }));
}

function autofillFuncheap(event) {
  setInput('input[name="event_title"]', event.title);
  setInput('textarea[name="event_description"]', event.description);
}

function autofillDotheBay(event) {
  setInput('input[name="title"]', event.title);
}

// 1. Read from localStorage
const raw = localStorage.getItem("event_data");

if (!raw) {
  console.log("No event data found");
} else {
  const event = JSON.parse(raw);

  console.log("Event data:", event);

  // 2. Detect platform
  if (window.location.hostname.includes("funcheap")) {
    autofillFuncheap(event);
  }

  if (window.location.hostname.includes("dothebay")) {
    autofillDotheBay(event);
  }
}
