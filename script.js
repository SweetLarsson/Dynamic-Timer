// Select DOM elements
const resetButton = document.getElementById("resetButton");
const previewLabel = document.getElementById("previewLabel");
const activityList = document.getElementById("activityList");
const activityInput = document.getElementById("activityInput");
const activityHours = document.getElementById("activityHours");
const activitySelect = document.getElementById("activitySelect");
const activityMinutes = document.getElementById("activityMinutes");
const activitySeconds = document.getElementById("activitySeconds");
const previewCountdown = document.getElementById("previewCountdown");
const displayButton = document.getElementById("selected-item-display");
const addActivityButton = document.getElementById("addActivityButton");
const clearScheduleButton = document.getElementById("clearScheduleButton");
const startPauseResumeButton = document.getElementById("startPauseResumeButton");

let secondaryWindow = null;
let countdownInterval = null;
let lastEventName = "";
let remainingTime = 0;
let isPaused = false;


// FIRST COLUMN
// Format time dynamically (HH:MM:SS or MM:SS)
const formatTime = (time) => {
  const hrs = Math.floor(time / 3600);
  const mins = Math.floor((time % 3600) / 60);
  const secs = time % 60;

  if (hrs > 0) {
    return `${String(hrs).padStart(2, "0")}:${String(mins).padStart(
      2,
      "0"
    )}:${String(secs).padStart(2, "0")}`;
  } else {
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }
};

// Real-time on Board
function updateClock() {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  const timeString = `${hours}:${minutes}:${seconds}`;
  document.getElementById("current-time").textContent = timeString;
}

// Update the clock every second
setInterval(updateClock, 1000);

// Initialize the clock immediately
updateClock();

// Handle event item click for setting input field
const eventItems = document.querySelectorAll(".event-item");
eventItems.forEach((item) => {
  item.addEventListener("click", () => {
    activityInput.value = item.textContent;
  });
});

// Populate Wheels
const populateWheel = (id, max, buttonId) => {
  const wheel = document.getElementById(id);
  const button = document.getElementById(buttonId);
  for (let i = 0; i <= max; i++) {
    const item = document.createElement("div");
    item.textContent = i.toString().padStart(2, "0");
    wheel.appendChild(item);
  }
  wheel.addEventListener("scroll", () => highlightCenter(wheel, button));
};

const highlightCenter = (wheel, button) => {
  const scrollTop = wheel.scrollTop;
  const itemHeight = 40;
  const index = Math.round(scrollTop / itemHeight);
  const items = wheel.children;

  Array.from(items).forEach((item, i) => {
    item.classList.toggle("selected", i === index);
  });

  if (index >= 0 && index < items.length) {
    button.textContent = items[index].textContent;
  }
};

// Center Wheels
const centerWheel = (id) => {
  const wheel = document.getElementById(id);
  wheel.scrollTop = 0;
};

// Initialize Wheels
populateWheel("hour-wheel", 23, "select-hour");
populateWheel("minute-wheel", 59, "select-minute");
populateWheel("second-wheel", 59, "select-second");
centerWheel("hour-wheel");
centerWheel("minute-wheel");
centerWheel("second-wheel");

// THE TIME COUNTDOWN FUNCTIONALITY PROTOCOL

// // Validate Input and Add Event
document.getElementById("addActivityButton").addEventListener("click", () => {
  const hour = document.getElementById("select-hour").textContent || "00";
  const minute = document.getElementById("select-minute").textContent || "00";
  const second = document.getElementById("select-second").textContent || "00";
  const eventName = document.getElementById("activityInput").value.trim();

  if (hour === "00" && minute === "00" && second === "00") {
    alert("The minimum time for an event is at least 1sec");
    return;
  }

  if (!eventName) {
    alert("Please enter an event name.");
    return;
  }

  const activityList = document.getElementById("activityList");
  const totalTimeInSeconds =
    parseInt(hour) * 3600 + parseInt(minute) * 60 + parseInt(second);
  const formattedTime = formatTime(totalTimeInSeconds);

  // Create a new list item
  const listItem = document.createElement("li");
  listItem.classList.add("activity-item");
  listItem.style.cssText = `
    justify-content: space-between;
    border: 1px solid #444;
    align-items: center;
    border-radius: 5px;
    margin: 10px 0;
    padding: 10px;
    display: flex;
  `;

  // Create the event name and time text (span)
  const itemText = document.createElement("span");
  itemText.textContent = `${eventName} - ${formattedTime}`;

  // Create the delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "Delete";
  deleteButton.style.cssText = `
    background-color: #ff4d4d;
    color: white;
    border: none;
    border-radius: 5px;
    padding: 5px 10px;
    cursor: pointer;
  `;

  // Add delete functionality
  deleteButton.addEventListener("click", () => {
    if (confirm("Sure to delete")) {
      listItem.remove();
    }
  });

  // Append the text and delete button to the list item
  listItem.appendChild(itemText);
  listItem.appendChild(deleteButton);
  activityList.appendChild(listItem);

  // Reset input fields
  activityInput.value = "";
  activityHours.value = "";
  activityMinutes.value = "";
  activitySeconds.value = "";

  // Handle click on the activity list (preview display update)
  document.getElementById("activityList").addEventListener("click", (e) => {
    if (e.target.tagName === "LI" || e.target.parentNode.tagName === "LI") {
      const clickedItem =
        e.target.tagName === "LI" ? e.target : e.target.parentNode;
      const itemText = clickedItem.querySelector("span").textContent; // Only get the text from the `span`

      const [selectedEvent, selectedTime] = itemText.split(" - ");

      // Update the preview screen with the event name and time
      previewLabel.textContent = selectedEvent;
      previewCountdown.textContent = selectedTime;

      // Sync with the secondary screen
      syncSecondaryScreen({
        action: "update",
        eventName: selectedEvent,
        remainingTime: selectedTime,
      });
    }
  });

  // Add the event to the dropdown
  const option = document.createElement("option");
  option.value = totalTimeInSeconds; // Use total time in seconds
  option.textContent = `${eventName} (${formattedTime})`;
  activitySelect.appendChild(option);
});















// Convert seconds to mm:ss format
const convertToTimeString = (seconds) => {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
};

// Start Countdown (Primary Screen)
const startCountdownPrimary = () => {
  previewLabel.textContent = lastEventName;
  previewCountdown.textContent = convertToTimeString(remainingTime);

  if (countdownInterval) clearInterval(countdownInterval);

  countdownInterval = setInterval(() => {
    if (!isPaused) {
      remainingTime--;
      if (remainingTime <= 0) {
        clearInterval(countdownInterval);
        previewCountdown.textContent = "Time's up!";
        startPauseResumeButton.textContent = "Start";
      } else {
        previewCountdown.textContent = convertToTimeString(remainingTime);
      }
    }
  }, 1000);
};

// Start Countdown (Secondary Screen)
const startCountdownSecondary = () => {
  if (secondaryWindow && !secondaryWindow.closed) {
    secondaryWindow.postMessage(
      {
        action: "startTimer",
        eventName: lastEventName,
        remainingTime: remainingTime,
      },
      "*"
    );
  }
};

// Pause Timer (Primary Screen)
const pauseCountdownPrimary = () => {
  isPaused = true;
};

// Pause Timer (Secondary Screen)
const pauseCountdownSecondary = () => {
  if (secondaryWindow && !secondaryWindow.closed) {
    secondaryWindow.postMessage({ action: "pauseTimer" }, "*");
  }
};

// Resume Timer (Primary Screen)
const resumeCountdownPrimary = () => {
  isPaused = false;
};

// Resume Timer (Secondary Screen)
const resumeCountdownSecondary = () => {
  if (secondaryWindow && !secondaryWindow.closed) {
    secondaryWindow.postMessage({ action: "resumeTimer" }, "*");
  }
};

// Handle Start/Pause/Resume Button
startPauseResumeButton.addEventListener("click", () => {
  const buttonText = startPauseResumeButton.textContent;

  if (buttonText === "Start") {
    if (!lastEventName || remainingTime <= 0) {
      alert("No event selected or invalid time.");
      return;
    }

    startPauseResumeButton.textContent = "Pause";
    startCountdownPrimary();
    startCountdownSecondary();
  } else if (buttonText === "Pause") {
    startPauseResumeButton.textContent = "Resume";
    pauseCountdownPrimary();
    pauseCountdownSecondary();
  } else if (buttonText === "Resume") {
    startPauseResumeButton.textContent = "Pause";
    resumeCountdownPrimary();
    resumeCountdownSecondary();
  }
});

// Secondary Screen Logic
window.addEventListener("message", (event) => {
  if (event.data.action === "startTimer") {
    const { eventName, remainingTime: time } = event.data;
    document.getElementById("secondaryEventName").textContent = eventName;
    document.getElementById("secondaryTimer").textContent = convertToTimeString(time);
  } else if (event.data.action === "pauseTimer") {
    isPaused = true;
  } else if (event.data.action === "resumeTimer") {
    isPaused = false;
  }
});


// Function to handle activity list item selection
activityList.addEventListener("click", (e) => {
  let target = e.target;

  // Traverse up the DOM tree to find the closest `li` element
  while (target && target.tagName !== "LI") {
    target = target.parentElement;
  }

  // Ensure the target is a valid `li` element
  if (target) {
    // Remove 'selected' class from all items
    const allItems = activityList.querySelectorAll("li");
    allItems.forEach((item) => item.classList.remove("selected"));

    // Add 'selected' class to the clicked item
    target.classList.add("selected");

    // Locate `span` elements for event name and time
    const eventNameElement = target.querySelector(".event-name");
    const eventTimeElement = target.querySelector(".event-time");

    if (eventNameElement && eventTimeElement) {
      const eventName = eventNameElement.textContent.trim();
      const eventTime = eventTimeElement.textContent.trim();

      // Update the display button with selected event details
      displayButton.textContent = `${eventName} - ${eventTime}`;
      displayButton.dataset.eventName = eventName;
      displayButton.dataset.eventTime = eventTime;

      // Parse event time to seconds for countdown
      const [minutes, seconds] = eventTime.split(":").map(Number);
      lastEventName = eventName;
      remainingTime = minutes * 60 + seconds;
    }
  }
});

// Event listener for display button
displayButton.addEventListener("click", () => {
  const eventName = displayButton.dataset.eventName;
  const eventTime = displayButton.dataset.eventTime;

  const [minutes, seconds] = eventTime.split(":").map(Number);
  remainingTime = minutes * 60 + seconds;
  lastEventName = eventName;

  // Update the preview screen
  previewLabel.textContent = lastEventName;
  previewCountdown.textContent = convertToTimeString(remainingTime);

  // Reset the start button to "Start"
  startPauseResumeButton.textContent = "Start";
});



// // MIDDLE SECTION
// // This top part has a logic containing validation
// // of selected item from the activity-list(scheduleds event list)

// Function for the selected item display

// // Add click event to the parent activity list (event delegation)
activityList.addEventListener("click", (e) => {
  let target = e.target;

  // Traverse up the DOM tree to find the closest `li` element
  while (target && target.tagName !== "LI") {
    target = target.parentElement;
  }

  // Ensure the target is a valid `li` element
  if (target) {
    // Remove 'selected' class from all items
    const allItems = activityList.querySelectorAll("li");
    allItems.forEach((item) => item.classList.remove("selected"));

    // Add 'selected' class to the clicked item
    target.classList.add("selected");

    // Safely locate the `span` element containing the event name and time
    const itemTextElement = target.querySelector("span");
    if (itemTextElement) {
      const itemText = itemTextElement.textContent.trim(); // Get text content
      displayButton.textContent = itemText; // Update the display screen
    } else {
      console.error("No `span` element found within the selected item.");
    }
  }
});

// Fade out item on the display board
// Add event listener to the displayButton
displayButton.addEventListener("click", () => {
  // Add a fade-out class to the displayButton
  displayButton.classList.add("fade-out");

  // Reset the displayButton after the transition ends
  setTimeout(() => {
    displayButton.textContent = ""; // Clear the text content
    displayButton.classList.remove("fade-out"); // Remove the fade-out class
  }, 3000); // 3 seconds
});

// CSS for fade-out effect
const style = document.createElement("style");
style.textContent = `
  .fade-out {
    opacity: 0;
    transition: opacity 3s ease;
  }
`;
document.head.appendChild(style);













// Clear the entire scheduled list events
clearScheduleButton.addEventListener("click", () => {
  if (confirm("Sure to clear the entire schedule?")) {
    // Clear the activity list
    while (activityList.firstChild) {
      activityList.removeChild(activityList.firstChild);
    }
  }
});

// Shuffle List dynamics
// Drag and drop scheduled event list items
document.addEventListener("DOMContentLoaded", () => {
  const activityList = document.getElementById("activityList");

  // Initialize Sortable.js on the activity list
  new Sortable(activityList, {
    animation: 1200, // Smooth animation during drag-and-drop
    ghostClass: "sortable-ghost", // Class applied to the ghost element
  });
});

// Save and Load files from local storage
const loadScheduleButton = document.getElementById(
  "load-saved-scheduled-event"
);

const saveScheduleButton = document.getElementById("add-saved-scheduled-event");

// Save the schedule to a .txt file and localStorage
saveScheduleButton.addEventListener("click", () => {
  // Extract only the relevant event text and class
  const items = Array.from(activityList.children)
    .map((li) => {
      const spanElement = li.querySelector("span"); // Get the span element containing the event text
      if (spanElement) {
        return {
          text: spanElement.textContent.trim(),
          class: li.className,
        };
      }
      return null; // Skip invalid list items
    })
    .filter((item) => item !== null); // Remove any null entries from the array

  if (items.length === 0) {
    alert("Cannot save an empty list.");
    return;
  }

  // Prepare file content as JSON
  const fileContent = JSON.stringify(items, null, 2);
  const blob = new Blob([fileContent], { type: "application/json" });
  const fileName = `Schedule_${new Date()
    .toISOString()
    .replace(/[:.]/g, "-")}.txt`;

  // Create a download link and trigger download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  // Save the schedule to localStorage
  localStorage.setItem("eventSchedule", fileContent);

  alert("Schedule saved!");
  activityList.innerHTML = ""; // Clear the list after saving
});

// Load the schedule from the localStorage or a file
loadScheduleButton.addEventListener("click", () => {
  const savedSchedule = localStorage.getItem("eventSchedule");
  if (savedSchedule) {
    const items = JSON.parse(savedSchedule);
    activityList.innerHTML = ""; // Clear the current list

    items.forEach((item) => {
      const li = document.createElement("li");

      // Apply text and class from saved data
      li.className = item.class;
      li.style.cssText = `
        border: 1px solid #444;
        border-radius: 5px;
        padding: 10px;
        margin: 10px 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
      `;

      // Add text span for event details
      const itemText = document.createElement("span");
      itemText.textContent = item.text;
      li.appendChild(itemText);

      // Add delete button
      const deleteButton = document.createElement("button");
      deleteButton.textContent = "Delete";
      deleteButton.style.cssText = `
        background-color: #ff4d4d;
        color: white;
        border: none;
        border-radius: 5px;
        padding: 5px 10px;
        cursor: pointer;
      `;

      // Delete button functionality
      deleteButton.addEventListener("click", () => {
        // alert(`Delete: ${item.text}`);
        if (confirm("Sure to delete")) {
          // Clear the activity list
          while (li.remove()) {
            li.remove();
          }
        }
      });

      li.appendChild(deleteButton);

      // Append the styled list item to the activity list
      activityList.appendChild(li);
    });

    alert("Schedule loaded successfully!");
  } else {
    alert("No schedule found in local storage.");
  }
});

// Function to save the updated schedule after a deletion
function saveUpdatedSchedule() {
  const updatedItems = Array.from(activityList.children).map((li) => ({
    text: li.querySelector("span").textContent,
    class: li.className,
  }));
  localStorage.setItem("eventSchedule", JSON.stringify(updatedItems));
}

//THIRD COLUMN
// Start/Pause/Resume button logic
startPauseResumeButton.addEventListener("click", () => {
  const buttonText = startPauseResumeButton.textContent;

  if (buttonText === "Start") {
    const selectedOption = activitySelect.options[activitySelect.selectedIndex];
    if (selectedOption.value === "0") {
      alert("Please select an activity.");
      return;
    }

    remainingTime = parseInt(selectedOption.value);
    const label = selectedOption.textContent.split(" (")[0];
    lastEventName = label;
    isPaused = false;
    startPauseResumeButton.textContent = "Pause";
    startCountdown(label, remainingTime);
  } else if (buttonText === "Pause") {
    isPaused = true;
    startPauseResumeButton.textContent = "Resume";

    if (secondaryWindow && !secondaryWindow.closed) {
      secondaryWindow.postMessage("pause", "*");
    }
  } else if (buttonText === "Resume") {
    isPaused = false;
    startPauseResumeButton.textContent = "Pause";

    if (secondaryWindow && !secondaryWindow.closed) {
      secondaryWindow.postMessage("resume", "*");
    }
  }
});

// Ensure that the Start button appears after selecting an activity
activitySelect.addEventListener("change", () => {
  const selectedOption = activitySelect.options[activitySelect.selectedIndex];
  if (selectedOption && selectedOption.value !== "0") {
    startPauseResumeButton.textContent = "Start";
  }
});

// Countdown logic with secondary screen
const startCountdown = (label, totalTime) => {
  if (!secondaryWindow || secondaryWindow.closed) {
    secondaryWindow = window.open(
      `secondaryScreen.html?label=${encodeURIComponent(
        label
      )}&time=${totalTime}`,
      "_blank",
      "width=800,height=600,top=100,left=100"
    );
  }

  previewLabel.textContent = label;
  previewCountdown.textContent = formatTime(totalTime);

  if (countdownInterval) {
    clearInterval(countdownInterval);
  }

  countdownInterval = setInterval(() => {
    if (!isPaused) {
      totalTime--;
      remainingTime = totalTime;

      if (totalTime <= 0) {
        clearInterval(countdownInterval);
        previewCountdown.textContent = "Time's up!";
        startPauseResumeButton.textContent = "Start";
      } else {
        const formattedTime = formatTime(totalTime);
        previewCountdown.textContent = formattedTime;
      }
    }
  }, 1000);
};



















// Reset button logic
resetButton.addEventListener("click", () => {
  clearInterval(countdownInterval);
  isPaused = false;
  startPauseResumeButton.textContent = "Start";

  if (secondaryWindow && !secondaryWindow.closed) {
    const countdownDisplay =
      secondaryWindow.document.getElementById("countdown");
    const labelDisplay = secondaryWindow.document.getElementById("label");

    countdownDisplay.textContent = "";
    labelDisplay.textContent = lastEventName;
    secondaryWindow.document.body.style.backgroundColor = "black";
  }

  previewLabel.textContent = lastEventName;
  previewCountdown.textContent = "";
});

// Add listener for spacebar to start/pause/resume timer
document.addEventListener("keydown", (e) => {
  if (e.key === " ") {
    const selectedOption = activitySelect.options[activitySelect.selectedIndex];
    if (selectedOption) {
      startPauseResumeButton.click();
    }
  }
});

// Clear the timer to display only
// event name on screen on delete key press ('delete' on keyboard)
document.addEventListener("keyword", (e) => {
  if (e.key === "delete") {
    e.preventDefault();
    clearButton.click();
  }
});

// Keyboard shortcut for clearing the screen (Ctrl + C)
document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === "c") {
    e.preventDefault();
    clearButton.click();
  }
});
