console.log("[LocalBuzz EXT] loaded from current build VERSION 2026-05-30-001");

function formatDateForFuncheap(datetime) {
  const d = new Date(datetime);

  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const yyyy = d.getFullYear();

  return `${mm}/${dd}/${yyyy}`;
}

function detectPlatform(){
  if (window.location.hostname.includes("funcheap")) {
    return "funcheapsf";
  }else if(window.location.hostname.includes("visitoakland")){
    return "visitoakland";
  }else if(window.location.hostname.includes("indybay")){
    return "indybay";
  }else if(window.location.hostname.includes("sfstation")){
    return "sfstation";
  }
}

const parseTime = (isoString) => {
  if (!isoString) return { hour: "", minute: "", ampm: "AM" };

  const date = new Date(isoString);
  const month = date.getMonth();
  const day = date.getDay();
  const year = date.getFullYear();

  let hours = date.getHours(); // 0–23
  const minutes = date.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";

  // convert to 12-hour format
  hours = hours % 12;
  if (hours === 0) hours = 12;

  return {
    month: String(month),
    day: String(day),
    year: String(year),
    hour: String(hours),                 // "8"
    minute: String(minutes).padStart(2, "0"), // "30"
    ampm                                 // "PM"
  };
};

// Helper for Region dropdown
function selectDropdownByText(selectEl, targetText) {
  const options = Array.from(selectEl.options);

  const match = options.find(
      (opt) => opt.text.trim().toLowerCase() === targetText.toLowerCase()
  );

  if (!match) {
    console.warn("❌ No matching option for:", targetText);
    return;
  }

  selectEl.value = match.value;

  // 🔥 trigger change for frameworks (Gravity Forms etc)
  selectEl.dispatchEvent(new Event("change", { bubbles: true }));
  selectEl.style.border = "5px solid #F89D86";
  selectEl.style.borderRadius = "5px";

  console.log(`✅ Selected ${match.text} (${match.value})`);
}

// Helper for setting value in form in case straightup element.value = "XYZ" doesn't work
const setSelectValue = (el, value) => {
  el.value = value;

  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
};

//
// Helper for sfstation select pulldown. It is not a
// <select> tag, it is an Angular UI Bootstrap typeahead.
//
// For these, the reliable automation pattern is usually:
//
// focus input
// set input value
// dispatch input/change/keydown
// wait for dropdown items
// click matching <a title="...">
//
async function selectSfStationCategory(categoryName) {
  const input = document.querySelector('input[name="category_0"]');

  if (!input) {
    console.warn("[SFStation] category input not found");
    return false;
  }

  input.focus();

  // Clear existing value
  input.value = "";
  input.dispatchEvent(new Event("input", { bubbles: true }));

  // Type category text
  input.value = categoryName;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.dispatchEvent(new KeyboardEvent("keydown", {
    bubbles: true,
    key: categoryName[0] || "A"
  }));

  // Wait for Angular typeahead results
  const option = await waitForElement(() => {
    const links = Array.from(
        document.querySelectorAll('ul[uib-typeahead-popup] li a')
    );

    return links.find(
        a => a.getAttribute("title")?.trim() === categoryName
    );
  }, 3000);

  if (!option) {
    console.warn("[SFStation] category option not found:", categoryName);
    return false;
  }

  option.click();

  input.dispatchEvent(new Event("change", { bubbles: true }));
  input.style.border = "5px solid #F89D86";
  input.style.borderRadius = "5px";
  input.blur();

  console.log("[SFStation] selected category:", categoryName);
  return true;
}

function waitForElement(getter, timeoutMs = 3000, intervalMs = 100) {
  return new Promise((resolve) => {
    const started = Date.now();

    const timer = setInterval(() => {
      const el = getter();

      if (el) {
        clearInterval(timer);
        resolve(el);
        return;
      }

      if (Date.now() - started > timeoutMs) {
        clearInterval(timer);
        resolve(null);
      }
    }, intervalMs);
  });
}

//
// Helper for Multi-select listbox (e.g. visitoakland categories
//
function selectMultiSelectOptionByText(selector, targetText) {
  try {
    const select = document.querySelector(selector);

    if (!select) {
      console.warn("Select not found:", selector);
      return;
    }

    const options = Array.from(select.options);

    const match = options.find(
        opt => opt.textContent.trim() === targetText
    );

    if (!match) {
      console.warn("No option found:", targetText);
      return;
    }

    match.selected = true;

    select.dispatchEvent(new Event("input", {bubbles: true}));
    select.dispatchEvent(new Event("change", {bubbles: true}));

    console.log("Selected:", targetText, match.value);
  }catch(err){
    console.error(`Error on selectMultiSelectOptionByText: ${err}`);
  }
}

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
// Helper for textarea
//
function setTextarea(selector, value) {
  const textarea = document.querySelector(selector);

  if (!textarea) {
    console.log("textarea not found");
    return;
  }
  textarea.focus();
  textarea.value = value;
  textarea.dispatchEvent(
      new Event("input", { bubbles: true })
  );
  textarea.dispatchEvent(
      new Event("change", { bubbles: true })
  );
  textarea.style.border = "5px solid #F89D86";
  textarea.style.borderRadius = "5px";
  textarea.blur();
}
//
// Helper for adding images in platform pages
//
const base64ToFile = async (base64, filename, mimeType) => {
  const res = await fetch(base64);
  const blob = await res.blob();
  return new File([blob], filename, { type: mimeType });
};

let imageInjected = false;
const injectImage = async (base64, filename, mimeType) => {
  if (imageInjected) return; // 🚫 stop loop
  imageInjected = true;

  const inputs = document.querySelectorAll('input[type="file"]');

  if (!inputs) {
    console.error("No file input found");
    return;
  }
  const fileInput = inputs[0];

  const file = await base64ToFile(base64, filename, mimeType);

  const dataTransfer = new DataTransfer();
  dataTransfer.items.add(file);

  fileInput.files = dataTransfer.files;
  // 🔥 trigger ALL relevant events
  fileInput.dispatchEvent(new Event("input", { bubbles: true }));
  fileInput.dispatchEvent(new Event("change", { bubbles: true }));
  console.log("✅ Image injected");
};

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
    }else{
      console.log("Selector not found: ", selector);
    }
  }, 1000);
}

function setupSender() {
  window.addEventListener("message", (event) => {
    if (!chrome?.runtime?.id) {
      console.warn("[LocalBuzz] extension context invalidated");
      return;
    }

    console.log(`LOCALBUZZ_AUTOFILL by key: final.`);
    if (event.source !== window) return;
    const eventDataType = event.data?.type;
    console.log(`event.data.type ${eventDataType}`);
    if (!eventDataType?.startsWith("LOCALBUZZ_AUTOFILL")) return;

    const job = {
      payload: event.data.payload,
      platform: event.data.platform,
      createdAt: Date.now()
    };

    console.log("[bridge] received from LocalBuzz React", job);

    try {
      console.log("[bridge] about to store job...");
      chrome.storage.local.set(
          { [eventDataType]: job },
          () => {
            if (chrome.runtime.lastError) {
              console.error("[bridge] storage error:", chrome.runtime.lastError);
              return;
            }

            console.log("[bridge] saved job");

            chrome.storage.local.get(key, (result) => {
              console.log("[bridge] read back:", result);
            });
          }
      );
      console.log("[bridge] done.");
    } catch (err) {
      console.error("[bridge] exception during storage set:", err);
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

  autofillFromMap(event, SELECTOR_MAPPINGS.funcheapsf);
  waitAndSetTinyMCE("#input_18_2_ifr", event.description);
  waitAndSet("#input_18_43_2", event.email);

  // translate canonical category to fc category...
  console.log(`event.category=${event.category}`);
  const fcCategory = CATEGORY_MAPPINGS.funcheapsf[event.category];
  console.log(`event.category=${event.category}, fcCategory=${fcCategory}`);
  // then get selector for fc category...
  const fcCategorySelector = SELECTOR_MAPPINGS.funcheapsfCategories[fcCategory];
  console.log(`event.category=${event.category}, fcCategory=${fcCategory}, fcCategorySelector=${fcCategorySelector}`);
  if (fcCategorySelector) {
    clickAndHighlight(fcCategorySelector); // Online or In-Person: In Person
  }

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

    const select = document.querySelector("#input_18_133");
    if (select && event.region) {
      selectDropdownByText(select, event.region);
    }
  }
}

function autofillVisitOakland(event) {
  console.log("Autofilling VisitOakland", event);

  autofillFromMap(event, SELECTOR_MAPPINGS.visitoakland);

  const  {hour, minute, ampm} =  parseTime(event.start_datetime);
  waitAndSet("#starttime", `${hour}:${minute} ${ampm}`);
  waitAndSet("#email", event.email);
  waitAndSet("#phone", event.phone);
  setSelectValue(document.querySelector("#state"), "CA");

  const voCategory = CATEGORY_MAPPINGS.visitoakland[event.category];
  selectMultiSelectOptionByText("#categories", voCategory);
  selectDropdownByText(document.querySelector("#udf_91"), event.region);
}

const indyBayDate = (hour, ampm) => {
  if(hour === '12'){
    if(ampm ==='am'){
      return 'Midnight';
    }else{
      return 'Noon';
    }
  }
  return `${hour} ${ampm}`;
}

function autofillIndyBay(event) {
  console.log("Autofilling IndyBay", event);

  autofillFromMap(event, SELECTOR_MAPPINGS.indybay);

  selectDropdownByText(document.querySelector("#topic_id"), "Arts + Action");
  selectDropdownByText(document.querySelector("#event_type_id"), "Other");
  // Date has 4 fields
  const  {month, day, year, hour, ampm} =  parseTime(event.start_datetime);
  selectDropdownByText(document.querySelector("#displayed_date_month"), month);
  selectDropdownByText(document.querySelector("#displayed_date_day"), day);
  selectDropdownByText(document.querySelector("#displayed_date_year"), year);
  selectDropdownByText(document.querySelector("#displayed_date_hour"), indyBayDate(hour, ampm));

  // SWAG number, user can change...
  selectDropdownByText(document.querySelector("#event_duration"), "3:00");
}

function autofillSFStation(event) {
  console.log("Autofilling SFStation", event);
  autofillFromMap(event, SELECTOR_MAPPINGS.sfstation);
  const sfstationCategory = CATEGORY_MAPPINGS.sfstation[event.category];
  selectSfStationCategory(sfstationCategory);
}

function runAutofill() {
  console.log(`Running autofill...`);
  const platform = detectPlatform();
  const key = `LOCALBUZZ_AUTOFILL_${platform}`;
  chrome.storage.local.get(key, (data) => {
    const event = data[key]?.payload;

    console.log("key:", key);
    console.log("raw data:", data);
    const job = data[key];
    console.log("job:", job);

    if (!event) return;

    if (platform === "funcheapsf") {
      autofillFuncheap(event);
    }else if(platform === "visitoakland"){
      autofillVisitOakland(event);
    }else if(platform === "indybay"){
      autofillIndyBay(event);
    }else if(platform === "sfstation"){
      autofillSFStation(event);
    }
  });
}

// Decide whether this content script is running on the LocalBuzz app
// or on a supported partner submission site.
const hostname = window.location.hostname;
if (hostname.includes("localhost") || hostname === "bep-ui.onrender.com"){
  setupSender();
} else {
  runAutofill();
}
